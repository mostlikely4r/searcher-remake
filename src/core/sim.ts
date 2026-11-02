// The game rules: one call to tick() is one pass of the original main loop.
// Numbers and ordering follow SCEARCH.BAS. docs/PARITY.md lists every deliberate fix.

import { emit } from './events';
import { updateComms } from './comms';
import {
  BAY, DOCK, EARTH, MOON, WALL,
  type Enemy, type EnemyId, type GameState, randomInt,
} from './state';
import { updateEnemies } from './enemies';
import { checkPlayerDeath, explodeRocket, killPlayer } from './combat';

export const TICK_RATE = 30;

export type Command =
  | { c: 'thrust'; dx: number; dy: number }
  | { c: 'stop' }
  | { c: 'speedUp' }
  | { c: 'speedDown' }
  | { c: 'laser' }
  | { c: 'launcher' }
  | { c: 'extraShield' }
  | { c: 'solar' }
  | { c: 'fuelTank' }
  | { c: 'dock' }
  | { c: 'clearTarget' }
  | { c: 'cycleTarget' }
  | { c: 'comms' }
  | { c: 'viewHome' }
  | { c: 'viewNormal' }
  | { c: 'tuneLaser'; delta: number }
  | { c: 'tuneShield'; delta: number };

export function tick(s: GameState, commands: readonly Command[]): void {
  if (s.gameOver) return;
  s.tick++;

  updateAutopilot(s);
  updateComms(s);
  updateClockAndFinance(s);
  if (s.gameOver) return;

  const p = s.player;
  let enginePenalty = 4 / p.shipLevel; // enpro

  collectCrate(s);
  updateAutoFrequency(s);

  p.hyperCharge = Math.min(100, p.hyperCharge + 0.05 * (p.shipLevel / 2));
  if (p.solar === 1 && p.energy === p.maxEnergy) {
    // Sitting in the sun with a full tank slowly produces supplies (lines 216-217).
    p.rockets += 0.001 + p.shipLevel * 0.0001;
    p.fuelTanks += 0.0005 + p.shipLevel * 0.0001;
    p.maxShield += 0.0005 + p.shipLevel * 0.00005;
    p.maxEnergy += 0.0005 + p.shipLevel * 0.00005;
  }
  s.keel = s.keel + 1 >= 6000 ? 1 : s.keel + 1;

  const speedSum = Math.abs(p.vx) + Math.abs(p.vy);
  if (speedSum > 0) p.energy -= p.maxSpeed * 0.01 + 0.05 * speedSum * enginePenalty;
  p.credits += 0.05;

  if (p.solar === 1) {
    p.energy += 2.5;
    p.maxSpeed = 1;
    enginePenalty = 0.001;
    if (p.shield > 45) p.shield = 45;
  }
  updateSolarCycle(s);
  if (speedSum === 0) p.energy -= p.maxSpeed * 0.01 * enginePenalty;

  updateShieldsAndSupplies(s);
  if (s.gameOver) return;

  for (const cmd of commands) applyCommand(s, cmd);
  updateLaser(s);
  updateLauncher(s);
  movePlayer(s);

  updateWorldHazards(s);
  if (s.gameOver) return;
  updateRocket(s);
  if (s.gameOver) return;
  updateBeam(s);
  updateBase(s);
  if (s.gameOver) return;
  updateEnemies(s);
  checkPlayerDeath(s);
  if (s.gameOver) return;
  updateRefit(s);
  updateDock(s);
  updateMiner(s);
  updateTargetValidity(s);
  if (!s.enemyBaseFound && near(s.enemies.enemyBase, p, 1500)) {
    s.enemyBaseFound = true;
    emit({ t: 'comms', text: 'Enemy base located! Destroy it.', urgent: true });
  }
}

export function near(a: { x: number; y: number }, b: { x: number; y: number }, range: number): boolean {
  return Math.abs(a.x - b.x) < range && Math.abs(a.y - b.y) < range;
}

/** Moves a coordinate toward a goal without overshooting (the original jittered around it). */
export function approach(from: number, to: number, speed: number): number {
  const d = to - from;
  return Math.abs(d) <= speed ? to : from + Math.sign(d) * speed;
}

function updateAutopilot(s: GameState): void {
  const p = s.player;
  const a = p.autopilot;
  if (!a) return;
  p.vx = Math.max(-a.speed, Math.min(a.speed, a.x - p.x));
  p.vy = Math.max(-a.speed, Math.min(a.speed, a.y - p.y));
  if (Math.abs(a.x - p.x) < 0.5 && Math.abs(a.y - p.y) < 0.5) {
    p.autopilot = null;
    p.vx = 0;
    p.vy = 0;
    emit({ t: 'comms', text: 'Autopilot: destination reached.' });
  }
}

function updateClockAndFinance(s: GameState): void {
  const c = s.clock;
  const p = s.player;
  const b = s.bank;
  c.minute++;
  if (c.minute === 24) c.day++;
  if (c.minute > 24) c.minute = 0;
  if (c.day > 30) {
    c.day = 1;
    c.month++;
  }
  if (c.month === 13) {
    c.month = 1;
    c.year++;
  }
  if (b.loan > 0 && c.minute === 0) {
    // Lines 164-167: 5% a day, and the collectors shoot at your shields when you can't pay.
    b.loan *= 1.05;
    p.credits -= b.loan * 0.05;
    b.loan -= b.loan * 0.05;
    if (p.credits < 1) p.shield -= p.maxShield * 0.5;
  }
  if (b.hasAccount && c.day === 3 && c.minute === 0) {
    if (b.accountType === 1) b.savings *= 1.05;
    if (b.accountType === 2) b.savings += 200;
    if (b.accountType === 3) b.savings *= 1.1;
    if (b.accountType === 4) b.savings *= 1.15;
    if (b.accountType === 5) b.savings *= 1.3;
  }
}

function collectCrate(s: GameState): void {
  const p = s.player;
  if (s.tick === 1 || (Math.abs(p.x - s.crate.x) < 20 && Math.abs(p.y - s.crate.y) < 20)) {
    if (s.tick !== 1) {
      const amount = 200 * s.clock.day;
      p.credits += amount;
      emit({ t: 'pickup', x: s.crate.x, y: s.crate.y, amount });
    }
    s.crate.x = randomInt(s, -5000, 4999);
    s.crate.y = randomInt(s, -5000, 4999);
  }
}

export function maxFrequency(s: GameState): number {
  return s.player.shipLevel * 2 + 2;
}

function updateAutoFrequency(s: GameState): void {
  const p = s.player;
  if (p.autoFreq) {
    if (s.target) {
      p.laserFreq = s.enemies[s.target].freq;
      p.beamFreq = s.enemies[s.target].freq;
    }
    p.shieldFreq = Math.floor(maxFrequency(s));
  }
}

function updateSolarCycle(s: GameState): void {
  const p = s.player;
  const cap = p.shipLevel * 2 + 10;
  if (p.solar === 2 && p.shield > 76) {
    p.solar = 3;
    p.solarRamp = true;
  }
  if (p.solar === 3 && s.target && p.maxSpeed < cap) p.solar = 0;
  if ((p.solar === 2 || p.solar === 3) && p.maxSpeed < cap) p.maxSpeed += 1;
  if (p.solar === 3 && p.maxSpeed >= cap) {
    p.solar = 0;
    p.solarRamp = false;
  }
  if (p.solar === 1) p.hyperCharge = 0;
  if (p.solar === 0) p.solarRamp = false;
  if (p.solar === 2) p.hyperCharge = Math.min(100, p.hyperCharge + 0.2 * (p.shipLevel / 2));
  if (p.solar === 1) {
    if (!p.extraShieldOn && p.extraShields > 0.999) {
      p.extraShieldOn = true;
      p.extraShields -= 1;
      p.extraShieldHold = 100 * p.extraShieldLevel;
    }
    p.extraShields += 0.005 + 0.001 * p.shipLevel;
  }
}

function updateShieldsAndSupplies(s: GameState): void {
  const p = s.player;
  p.shield += p.shipLevel / 2 + 2.5;
  if (p.shield > p.maxShield) p.shield = p.maxShield;
  if (p.shield < 1) {
    p.damage += -p.shield * (4 / p.shipLevel);
    p.shield = 10;
  }
  if (p.damage > 99) return killPlayer(s, 'Your ship took too much damage.');
  if (p.energy < 0) return killPlayer(s, 'You ran out of energy.');

  p.energy = Math.min(p.energy, p.maxEnergy);
  p.maxEnergy = Math.min(p.maxEnergy, 8000);
  p.maxShield = Math.min(p.maxShield, 8000);
  p.maxSpeed = Math.min(p.maxSpeed, 50);

  if (p.energy < 10 && p.fuelTanks > 0.99 && p.autoRefuel) {
    p.fuelTanks -= 1;
    p.energy += 300;
  }
  if (p.solar === 0 && p.shield < 76 && p.fuelTanks > 0.99) {
    p.fuelTanks -= 1;
    p.shield += 100;
  }
  if (p.damage > 10 && p.autoRepair) {
    p.damage -= 0.5 * p.shipLevel;
    p.energy -= 10;
  }
  p.fuelTanks = Math.min(p.fuelTanks, 120);
  p.extraShields = Math.min(p.extraShields, 120);
  p.rockets = Math.min(p.rockets, 80);

  if (p.extraShieldOn) {
    const strain = Math.max(0, p.maxShield - p.shield - p.extraShieldLevel);
    if (p.solar === 1 ? p.shield < 45 : p.shield < p.maxShield) p.extraShieldHold -= strain;
    if (p.extraShieldHold < 1) {
      p.extraShieldOn = false;
      emit({ t: 'comms', text: 'Extra shield has collapsed.', urgent: true });
    } else if (p.solar !== 1 && p.shield < p.maxShield) {
      p.shield = p.maxShield;
      p.energy -= Math.max(0, 15 - p.extraShieldLevel);
    }
  }
  p.fuelTanks = Math.max(0, p.fuelTanks);

  // Emergency tether: the home base feeds you when you are nearly empty (line 323).
  if (Math.abs(p.x) < 5000 && Math.abs(p.y) < 5000 && p.energy < 50) {
    p.energy += 50;
    s.base.energy -= 5;
  }
}

function applyCommand(s: GameState, cmd: Command): void {
  const p = s.player;
  switch (cmd.c) {
    case 'thrust':
      p.autopilot = null;
      p.vx += cmd.dx;
      p.vy += cmd.dy;
      break;
    case 'stop':
      p.autopilot = null;
      p.vx = 0;
      p.vy = 0;
      break;
    case 'speedUp':
      p.maxSpeed = Math.min(p.maxSpeed + 1, p.shipLevel * 2 + 10, 50);
      break;
    case 'speedDown':
      p.maxSpeed = Math.max(p.maxSpeed - 1, 0);
      break;
    case 'laser':
      p.laserOn = !p.laserOn;
      p.laserRefire = false;
      break;
    case 'launcher':
      p.launcherArmed = !p.launcherArmed;
      break;
    case 'extraShield':
      if (p.extraShieldOn) {
        p.extraShieldOn = false; // Original charged a whole extra shield just to switch it off.
      } else if (p.extraShields > 0.999) {
        p.extraShields -= 1;
        p.extraShieldOn = true;
        p.energy -= 25 * p.extraShieldLevel;
        p.extraShieldHold = 100 * p.extraShieldLevel;
      }
      break;
    case 'solar':
      if (p.solar === 3 || (p.solar === 2 && !p.solarRamp)) p.solar = 0;
      else p.solar = (p.solar + 1) as 1 | 2;
      break;
    case 'fuelTank':
      if (p.fuelTanks > 0.99) {
        p.fuelTanks -= 1;
        if (p.energy < p.maxEnergy) p.energy += 300;
        else p.shield += 100;
      }
      break;
    case 'dock':
      toggleDock(s);
      break;
    case 'clearTarget':
      s.target = null;
      s.manualLock = false;
      break;
    case 'cycleTarget':
      cycleTarget(s);
      break;
    case 'comms':
      s.comms.enabled = !s.comms.enabled;
      break;
    case 'viewHome':
      s.viewHome = true;
      break;
    case 'viewNormal':
      s.viewHome = false;
      break;
    case 'tuneLaser':
      p.laserFreq = Math.max(1, Math.min(Math.floor(maxFrequency(s)), p.laserFreq + cmd.delta));
      break;
    case 'tuneShield':
      p.shieldFreq = Math.max(1, Math.min(Math.floor(maxFrequency(s)), p.shieldFreq + cmd.delta));
      break;
  }
}

const TARGET_ORDER: EnemyId[] = ['enemyBase', 'fighter1', 'fighter2', 'cruiser'];

function cycleTarget(s: GameState): void {
  const inRange = TARGET_ORDER.filter((id) => near(s.enemies[id], s.player, 1500));
  if (inRange.length === 0) return;
  const index = s.target ? inRange.indexOf(s.target) : -1;
  s.target = inRange[(index + 1) % inRange.length];
  s.manualLock = true;
}

function toggleDock(s: GameState): void {
  const p = s.player;
  if (p.refit) return cancelRefit(s);
  if (p.docked) {
    p.docked = false;
    emit({ t: 'undocked' });
    return;
  }
  if (p.vx !== 0 || p.vy !== 0) return;
  if (s.target) return emit({ t: 'comms', text: 'Cannot dock: danger nearby.', urgent: true });
  if (!(p.x > DOCK.minX && p.x < DOCK.maxX && Math.abs(p.y) < DOCK.halfY)) {
    return emit({ t: 'comms', text: 'Too far from the docking ring.' });
  }
  p.docked = true;
  p.dockCycle = 0;
  emit({ t: 'docked' });
  emit({ t: 'comms', text: 'Docking complete.' });
}

export function cancelRefit(s: GameState): void {
  const p = s.player;
  if (!p.refit) return;
  // Original refunded the full price however far along it was; this returns only what is unused.
  p.credits += p.refit.remaining * 1000;
  p.refit = null;
  emit({ t: 'comms', text: 'Refit stopped. Unused cycles refunded.' });
}

function updateLaser(s: GameState): void {
  const p = s.player;
  if (p.autoLaser) p.laserOn = s.target !== null && p.laserCharge >= 100;
  if (p.solar === 0) p.laserCharge += p.shipLevel / 2 + 2.5;
  p.laserCharge = Math.min(p.laserCharge, 400, 25 * p.shipLevel);
  if (p.laserOn && p.laserCharge > 99 && s.target) {
    p.laserCharge -= 100;
    fireLaser(s, s.target);
  }
  if (!p.laserOn && p.laserRefire && p.laserCharge > 99) {
    p.laserOn = true;
    p.laserRefire = false;
  }
}

function fireLaser(s: GameState, id: EnemyId): void {
  const p = s.player;
  const e = s.enemies[id];
  if (p.laserFreq !== e.freq) return emit({ t: 'laserMiss' });
  let hitX = e.x;
  let hitY = e.y;
  if (id === 'cruiser') hitY += randomInt(s, -400, 399);
  if (id === 'enemyBase') {
    hitX += randomInt(s, -250, 249);
    hitY += randomInt(s, -250, 249);
  }
  const power = (id === 'enemyBase' ? 25 : 50) * p.laserLevel;
  if (e.shield > 0) e.shield -= power;
  if (e.shield < 1) e.damage += power;
  emit({ t: 'beam', kind: 'player', x1: p.x, y1: p.y, x2: hitX, y2: hitY });
  p.energy -= 5;
  p.laserOn = false;
  p.laserRefire = true;
}

function updateLauncher(s: GameState): void {
  const p = s.player;
  if (p.autoRocket) p.launcherArmed = s.target !== null;
  if (!p.launcherArmed) return;
  if (p.rockets < 1 || s.rocket) return;
  if (Math.abs(p.vx) > 10 || Math.abs(p.vy) > 10) return;
  if (!s.target) {
    p.launcherArmed = false;
    emit({ t: 'rocketFormNeeded' });
    return;
  }
  const e = s.enemies[s.target];
  p.rockets -= 1;
  s.rocket = {
    x: p.x, y: p.y, destX: e.x, destY: e.y, age: 0, fuse: 20000, power: 2,
    timeBomb: false, free: false, startDist: Math.hypot(e.x - p.x, e.y - p.y),
  };
  emit({ t: 'rocketLaunch' });
}

function movePlayer(s: GameState): void {
  const p = s.player;
  p.vx = Math.max(-p.maxSpeed, Math.min(p.maxSpeed, p.vx));
  p.vy = Math.max(-p.maxSpeed, Math.min(p.maxSpeed, p.vy));
  if (s.viewHome) {
    p.vx = 0;
    p.vy = 0;
  }
  p.x += p.vx;
  p.y += p.vy;
}

export function isInWall(s: GameState, x: number, y: number): boolean {
  const { inner, outer } = WALL;
  const leftBand = x < -inner && x > -outer;
  if (leftBand && y < s.gate.bottom + 30 && y > -outer) return true;
  if (leftBand && y > s.gate.top - 30 && y < outer) return true;
  if (x > inner && x < outer && y > -outer && y < outer) return true;
  if (x > -inner && x < outer && y < -inner && y > -outer) return true;
  if (x > -inner && x < outer && y > inner && y < outer) return true;
  return false;
}

function updateWorldHazards(s: GameState): void {
  const p = s.player;
  const g = s.gate;
  // The gate in the left wall breathes open and shut (lines 427-432).
  if (g.opening) {
    g.top += 10;
    g.bottom -= 10;
  } else {
    g.top -= 5;
    g.bottom += 5;
  }
  if (g.top <= 0) g.opening = true;
  if (g.top >= 400) g.opening = false;

  if (s.moonAlive && Math.hypot(p.x - MOON.x, p.y - MOON.y) < MOON.hazard) p.shield -= 50;

  if (isInWall(s, p.x, p.y) && !p.extraShieldOn) {
    return killPlayer(s, 'You hit the force wall without an extra shield.');
  }

  if (s.earthAlive) {
    const d = Math.hypot(p.x - EARTH.x, p.y - EARTH.y);
    if (d < EARTH.gravityRange) {
      // Earth's gravity overrides your velocity outright (lines 489-493). It is a death trap.
      s.gravity = Math.min(20, s.gravity + 1.1);
      p.vx = approachVelocity(p.x, EARTH.x, s.gravity);
      p.vy = approachVelocity(p.y, EARTH.y, s.gravity);
      if (d < EARTH.hazard) p.shield -= 50;
      if (d < 40) return killPlayer(s, 'You crashed into Earth.');
    } else {
      s.gravity = 0;
    }
  }
}

function approachVelocity(from: number, to: number, speed: number): number {
  return Math.max(-speed, Math.min(speed, to - from));
}

function updateRocket(s: GameState): void {
  const r = s.rocket;
  if (!r) return;
  r.age++;
  if (!r.free && s.target) {
    r.destX = s.enemies[s.target].x;
    r.destY = s.enemies[s.target].y;
  }
  const atDest = () => r.x === r.destX && r.y === r.destY;
  const close = Math.abs(r.x - r.destX) < 10 && Math.abs(r.y - r.destY) < 10;
  const speed = close ? 1 : 10;
  r.x = approach(r.x, r.destX, speed);
  r.y = approach(r.y, r.destY, speed);

  if (atDest() && !r.free && s.target) {
    const e = s.enemies[s.target];
    const power = s.player.rocketLevel * 100;
    if (e.shield > 0) e.shield -= power;
    else e.damage += power;
    return explodeRocket(s);
  }
  if (r.age > r.fuse) return explodeRocket(s);
  if (atDest() && !r.timeBomb) explodeRocket(s);
}

function updateBeam(s: GameState): void {
  const p = s.player;
  if (!p.beam) return;
  if (!s.target) {
    p.beam = null;
    return;
  }
  const e = s.enemies[s.target];
  if (p.beamFreq < e.freq) {
    p.beam = null;
    emit({ t: 'comms', text: 'Tractor beam lost: frequency too low.' });
    return;
  }
  e.x += p.beam.dx * 0.01;
  e.y += p.beam.dy * 0.01;
  emit({ t: 'beam', kind: 'tractor', x1: p.x, y1: p.y, x2: e.x, y2: e.y });
}

function updateBase(s: GameState): void {
  const b = s.base;
  const inDanger = s.target !== null || b.underAttack;
  b.battleStations = inDanger;
  b.energy += inDanger ? 2.5 : 7.5;
  b.reserve += inDanger ? 1 : 5;
  b.shield += 5 * (b.energy / 1200);
  if (b.energy < 10 && b.reserve > 100) {
    b.reserve -= 100;
    b.energy += 200;
  }
  if (s.keel === 22) b.shield = 200;
  b.shield = Math.min(b.shield, inDanger ? 1200 : 200);
  if (b.damage > 99 || b.energy < 1 || b.shield < 1) {
    emit({ t: 'explosion', x: 0, y: 0, size: 400 });
    return killPlayer(s, 'Your home base was destroyed.');
  }
  b.energy = Math.min(b.energy, s.player.maxEnergy, 1200);
}

function updateRefit(s: GameState): void {
  const p = s.player;
  const r = p.refit;
  if (!r) return;
  if (p.vx !== 0 || p.vy !== 0 || s.target || p.docked || p.extraShieldOn) return cancelRefit(s);
  if (!isInBay(s)) return cancelRefit(s);
  r.remaining--;
  p.shipLevel += 0.05;
  p.laserLevel += 0.05;
  p.rocketLevel += 0.05;
  p.extraShieldLevel += 0.05;
  p.maxShield += 1;
  p.maxEnergy += 1.5;
  if (r.remaining <= 0) {
    p.refit = null;
    emit({ t: 'comms', text: 'Refit complete. Ship upgraded.' });
  }
}

export function isInBay(s: GameState): boolean {
  const p = s.player;
  return p.x > BAY.minX && p.x < BAY.maxX && Math.abs(p.y) < BAY.halfY;
}

function updateDock(s: GameState): void {
  const p = s.player;
  const b = s.base;
  if (!p.docked) return;
  if (p.vx !== 0 || p.vy !== 0 || p.extraShieldOn) {
    p.docked = false;
    emit({ t: 'undocked' });
    return;
  }
  p.dockCycle = p.dockCycle >= 5 ? 1 : p.dockCycle + 1;
  if (p.dockCycle > 1) return;
  if (b.energy < 10) return emit({ t: 'comms', text: 'Base energy low: service paused.' });
  let services = 0;
  if (p.energy < p.maxEnergy) { p.energy += 20; services++; }
  if (p.shield < p.maxShield) { p.shield += 20; services++; }
  if (p.damage > 1) { p.damage -= 0.5; services++; }
  if (p.hyperCharge < 90) { p.hyperCharge = Math.min(90, p.hyperCharge + 5); services++; }
  if (p.rockets < 10) { p.rockets += 1; services++; }
  if (p.fuelTanks < 5) { p.fuelTanks += 1; services++; }
  if (p.extraShields < 2) { p.extraShields += 1; services++; }
  if (services > 1) b.energy -= services * 0.5;
}

function updateMiner(s: GameState): void {
  const m = s.miner;
  if (!s.moonAlive && m.leg === 0) return;
  const goalX = m.leg === 0 ? MOON.x + 400 : 0;
  const goalY = m.leg === 0 ? MOON.y : 0;
  m.x = approach(m.x, goalX, 20);
  m.y = approach(m.y, goalY, 20);
  if (m.x === goalX && m.y === goalY) {
    if (m.leg === 1) {
      s.base.energy += 600;
      if (s.base.energy > 1200) {
        s.base.reserve += 50;
        s.base.energy = 1200;
      }
      emit({ t: 'delivery', x: m.x, y: m.y });
      m.leg = 0;
    } else {
      m.leg = 1;
    }
  }
}

function updateTargetValidity(s: GameState): void {
  if (s.target && !near(s.enemies[s.target], s.player, 2000)) {
    s.target = null;
    s.manualLock = false;
  }
}

/** Claim the player's target lock; an enemy keeps it until a later one takes it (variable `en`). */
export function acquireTarget(s: GameState, id: EnemyId): void {
  if (!s.manualLock) s.target = id;
}

export function clearTargetIf(s: GameState, id: EnemyId): void {
  if (s.target === id) {
    s.target = null;
    s.manualLock = false;
  }
}

export type { Enemy };

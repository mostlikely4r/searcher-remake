// Enemy behaviour: enemy base, raider (fiter1), hunter (fiter2) and cruiser.
// They update in the original order, so the last enemy to claim the target lock wins.

import { emit } from './events';
import { acquireTarget, approach, clearTargetIf, near } from './sim';
import { type Enemy, type GameState, random, randomInt } from './state';

const ENEMY_SPEED = 20;

export function updateEnemies(s: GameState): void {
  updateBaseDefence(s);
  updateEnemyBase(s);
  updateRaider(s);
  updateHunter(s);
  updateCruiser(s);
}

function hitPlayerShield(s: GameState, amount: number): void {
  s.player.shield -= amount;
  emit({ t: 'playerHit', amount });
}

/** Moves a frequency one step toward the player's shield frequency, as lines 814-815 do. */
function nudgeFrequency(s: GameState, e: Enemy): void {
  const shield = s.player.shieldFreq;
  if (e.freq < shield) e.freq++;
  else if (e.freq > shield) e.freq--;
  if (e.freq > e.maxFreq) e.freq = e.maxFreq;
}

function updateBaseDefence(s: GameState): void {
  if (!s.base.underAttack) return;
  const f = s.enemies.fighter1;
  // Four turrets plus the main gun, every tick (lines 638-665).
  for (let i = 0; i < 4; i++) {
    if (f.shield > 0) f.shield -= 5;
    else f.damage += 2.5;
  }
  if (f.shield > 0) f.shield -= 25;
  else f.damage += 25;
  if (s.tick % 4 === 0) {
    const turrets = [[0, 400], [325, 0], [0, -400], [-325, 0]];
    const [x, y] = turrets[(s.tick / 4) % 4];
    emit({ t: 'beam', kind: 'base', x1: x, y1: y, x2: f.x, y2: f.y });
  }
}

function updateEnemyBase(s: GameState): void {
  const e = s.enemies.enemyBase;
  const p = s.player;
  e.shield = Math.max(0, e.shield + 0.5 * e.level);
  if (e.damage > 99) return destroyEnemyBase(s);
  e.shield = Math.min(e.shield, e.shieldCap);
  if (!near(e, p, 600)) return;
  acquireTarget(s, 'enemyBase');
  e.freq = randomInt(s, 0, e.maxFreq - 1);
  nudgeFrequency(s, e);
  const turrets = [[0, 400], [0, -400], [400, 0], [-400, 0]];
  for (const [ox, oy] of turrets) {
    if (!p.extraShieldOn && e.freq === p.shieldFreq) {
      if (p.shield > 0) hitPlayerShield(s, 0.5 + e.level);
      else p.damage += 2.5 + e.level;
    }
    if (s.tick % 6 === 0) emit({ t: 'beam', kind: 'enemyBase', x1: e.x + ox, y1: e.y + oy, x2: p.x, y2: p.y });
  }
}

function destroyEnemyBase(s: GameState): void {
  const e = s.enemies.enemyBase;
  const reward = 200 * 90; // +200 for each of the 90 blasts in lines 1175-1187.
  s.player.credits += reward;
  s.player.laserOn = false;
  s.basesDestroyed++;
  s.enemyBaseFound = false;
  emit({ t: 'enemyDestroyed', x: e.x, y: e.y, id: 'enemyBase', reward });
  emit({ t: 'explosion', x: e.x, y: e.y, size: 500 });
  emit({ t: 'comms', text: 'Enemy base destroyed! A new one is being built somewhere else.', urgent: true });
  clearTargetIf(s, 'enemyBase');
  e.level = Math.min(10, e.level + 1);
  e.freq += 10;
  e.maxFreq += 5;
  // Lines 1192-1193 typed "+" for "*", which always put the new base at 24000,24000.
  do {
    e.x = randomInt(s, -24000, 23999);
    e.y = randomInt(s, -24000, 23999);
  } while (Math.hypot(e.x, e.y) < 8000);
  e.shieldCap += 500;
  e.shield = e.shieldCap;
  e.damage = 0;
}

function updateRaider(s: GameState): void {
  const f = s.enemies.fighter1;
  const p = s.player;
  f.shield = Math.min(f.shield + f.shieldCap / 200 + f.level, f.shieldCap);
  if (f.damage > 200) return destroyRaider(s);

  f.x = approach(f.x, Math.max(-300, Math.min(300, f.x)), ENEMY_SPEED);
  f.y = approach(f.y, Math.max(-300, Math.min(300, f.y)), ENEMY_SPEED);
  if (Math.abs(f.x) < 500 && Math.abs(f.y) < 500) {
    s.base.underAttack = true;
    f.attacking = true;
  }
  if (!f.attacking) return;

  // It shoots you if you are in its view, otherwise the base (line 739, whose view test could never pass).
  const seesPlayer = near(f, p, 500);
  if (seesPlayer) acquireTarget(s, 'fighter1');
  f.cycle++;
  if (f.cycle > 21 - f.level) f.cycle = 0;
  if (f.cycle !== 0) return;
  const power = 15 + f.level;
  if (seesPlayer) {
    if (p.shield > 0) hitPlayerShield(s, power);
    else p.damage += power;
    emit({ t: 'beam', kind: 'raider', x1: f.x, y1: f.y, x2: p.x, y2: p.y });
  } else {
    if (s.base.shield > 0) s.base.shield -= power;
    else s.base.damage += power;
    emit({ t: 'beam', kind: 'raider', x1: f.x, y1: f.y, x2: 0, y2: 0 });
  }
}

function destroyRaider(s: GameState): void {
  const f = s.enemies.fighter1;
  const home = s.enemies.enemyBase;
  s.player.credits += 200;
  emit({ t: 'enemyDestroyed', x: f.x, y: f.y, id: 'fighter1', reward: 200 });
  emit({ t: 'explosion', x: f.x, y: f.y, size: 200 });
  clearTargetIf(s, 'fighter1');
  s.base.underAttack = false;
  f.x = home.x;
  f.y = home.y;
  f.shieldCap += 100;
  f.shield = f.shieldCap;
  f.damage = 0;
  f.attacking = false;
  f.level = Math.min(10, f.level + 1);
  f.freq += 2;
  f.maxFreq = f.freq;
}

function updateHunter(s: GameState): void {
  const f = s.enemies.fighter2;
  const p = s.player;
  const raiderCap = s.enemies.fighter1.shieldCap;
  // Regen uses the raider's cap as written (line 758); its own cap would make it unkillable early on.
  f.shield = Math.min(f.shield + raiderCap / 200 + f.level, f.shieldCap);
  if (f.damage > 600) return destroyHunter(s);

  if (f.x > p.x + 150) f.x = approach(f.x, p.x + 150, ENEMY_SPEED);
  else if (f.x < p.x) f.x = approach(f.x, p.x, ENEMY_SPEED);
  f.y = approach(f.y, p.y, ENEMY_SPEED);

  if (near(f, p, 200)) f.attacking = true;
  const inRange = near(f, p, 500);
  if (inRange) acquireTarget(s, 'fighter2');
  if (!f.attacking || !inRange) {
    f.freq = randomInt(s, 1, f.maxFreq);
    return;
  }
  f.cycle++;
  if (f.cycle > 15 - f.level) f.cycle = 0;
  if (f.cycle !== 0) {
    f.freq = randomInt(s, 1, f.maxFreq);
    return;
  }
  // The hunter locks onto your shield frequency unless you tune above what it can reach (line 777).
  f.freq = Math.min(p.shieldFreq, f.maxFreq);
  const power = 75 + f.level;
  if (!p.extraShieldOn && f.freq === p.shieldFreq) hitPlayerShield(s, power);
  else if (p.extraShieldOn) p.extraShieldHold -= 25;
  emit({ t: 'beam', kind: 'hunter', x1: f.x, y1: f.y, x2: p.x, y2: p.y });
}

function destroyHunter(s: GameState): void {
  const f = s.enemies.fighter2;
  const home = s.enemies.enemyBase;
  s.player.credits += 800;
  emit({ t: 'enemyDestroyed', x: f.x, y: f.y, id: 'fighter2', reward: 800 });
  emit({ t: 'explosion', x: f.x, y: f.y, size: 200 });
  clearTargetIf(s, 'fighter2');
  f.x = home.x;
  f.y = home.y;
  f.shieldCap += 100;
  f.shield = f.shieldCap;
  f.damage = 0;
  f.attacking = false;
  f.level = Math.min(10, f.level + 1);
  f.maxFreq += 1; // The source adds +4 to a value clamped at 11, so it never escalated.
}

function updateCruiser(s: GameState): void {
  const c = s.enemies.cruiser;
  const p = s.player;
  const close = near(c, p, 500);
  if (close) s.cruiserMode = 1;
  else if (c.damage < 50) s.cruiserMode = 0;
  if (c.damage > 10) s.cruiserMode = 2;

  if (s.cruiserMode === 1) acquireTarget(s, 'cruiser');
  const home = s.enemies.enemyBase;
  const goalX = s.cruiserMode === 2 ? home.x : p.x + 200;
  const goalY = s.cruiserMode === 2 ? home.y : s.cruiserMode === 0 ? p.y + 200 : p.y;
  c.x = approach(c.x, goalX, ENEMY_SPEED);
  c.y = approach(c.y, goalY, ENEMY_SPEED);

  c.shield = Math.min(c.shield + c.shieldCap / 200 + c.level, c.shieldCap);
  c.damage = Math.max(0, c.damage - (0.5 + c.level));
  if (c.damage > 100) return destroyCruiser(s);
  if (s.cruiserMode === 0) return;

  c.cycle++;
  nudgeFrequency(s, c);
  // Line 817 compared against a fraction, so the volley almost never looped. Rounding fixes that.
  const period = Math.round(27 - c.level / 4);
  if (c.cycle >= period) c.cycle = 0;

  if (c.cycle === period - 1) return cruiserHeavyShot(s);
  const fired =
    c.cycle % 9 === 0 ? 300 :
    c.cycle % 9 === 3 ? 0 :
    c.cycle % 9 === 6 ? -300 : null;
  if (fired !== null) return cruiserShot(s, fired);
  c.freq = Math.floor(random(s) * c.maxFreq) + 1;
}

function cruiserShot(s: GameState, offsetY: number): void {
  const c = s.enemies.cruiser;
  const p = s.player;
  if (!p.extraShieldOn && c.freq === p.shieldFreq) hitPlayerShield(s, 15 + c.level);
  if (p.extraShieldOn) p.extraShieldHold -= 5 * c.level;
  emit({ t: 'beam', kind: 'cruiser', x1: c.x, y1: c.y + offsetY, x2: p.x, y2: p.y });
}

function cruiserHeavyShot(s: GameState): void {
  const c = s.enemies.cruiser;
  const p = s.player;
  if (p.extraShieldOn) p.extraShieldHold -= 50 * c.level;
  else hitPlayerShield(s, 75 + c.level);
  emit({ t: 'beam', kind: 'cruiserHeavy', x1: c.x, y1: c.y, x2: p.x, y2: p.y });
}

function destroyCruiser(s: GameState): void {
  const c = s.enemies.cruiser;
  const home = s.enemies.enemyBase;
  s.player.credits += 2600;
  emit({ t: 'enemyDestroyed', x: c.x, y: c.y, id: 'cruiser', reward: 2600 });
  emit({ t: 'explosion', x: c.x, y: c.y, size: 300 });
  clearTargetIf(s, 'cruiser');
  c.x = home.x; // Line 1119 typed "cruisx", so the wreck only ever moved in y.
  c.y = home.y;
  c.shieldCap += 200;
  c.shield = c.shieldCap;
  c.damage = 0;
  c.level = Math.min(10, c.level + 1);
  c.maxFreq += 1;
  c.cycle = 0;
  s.keel = 0;
}

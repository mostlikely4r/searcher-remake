// The commander on the radio. Same triggers as lines 116-147, on per-topic cooldowns so the
// messages can actually be read (the original showed each one for about four frames).

import { emit } from './events';
import { EARTH, type GameState, WALL } from './state';

const COOLDOWN = 450; // 15 seconds at 30 ticks a second.

const INTRO: Array<[number, string]> = [
  [20, 'This is your commander speaking.'],
  [95, 'Your orders are to wait until your tank is full.'],
  [170, 'There are no enemies spotted near you.'],
  [245, 'Press O to dock, then I for the station menu. H shows all controls.'],
];

function say(s: GameState, key: string, text: string, urgent = false): void {
  const until = s.comms.cooldowns[key] ?? 0;
  if (s.tick < until) return;
  s.comms.cooldowns[key] = s.tick + COOLDOWN;
  emit({ t: 'comms', text, urgent });
}

export function updateComms(s: GameState): void {
  if (!s.comms.enabled) return;
  const p = s.player;
  for (const [at, text] of INTRO) if (s.tick === at) emit({ t: 'comms', text });
  if (s.tick < 320) return;

  const home = Math.abs(p.x) < 900 && Math.abs(p.y) < 900;
  if (!home && !s.comms.ready && p.energy < p.maxEnergy - 10) {
    say(s, 'notReady', 'You are not ready to go! Return to base.');
  }
  if (home && !s.comms.ready && p.energy > p.maxEnergy - 10) {
    s.comms.ready = true;
    emit({ t: 'comms', text: 'You are ready to go. Lift off at will.' });
  }
  if (s.comms.ready && !s.comms.missionGiven) {
    s.comms.missionGiven = true;
    emit({ t: 'comms', text: 'Your first mission is to locate the enemy base!' });
  }

  if (p.energy < p.maxEnergy / 4 && s.comms.ready) say(s, 'energy', 'Your energy is low! Refuel at once!', true);
  if (p.shield < p.maxShield / 4 && p.solar === 0) say(s, 'shield', 'Your shield is low!', true);

  const c = s.enemies.cruiser;
  const f1 = s.enemies.fighter1;
  const f2 = s.enemies.fighter2;
  if (Math.abs(c.x - p.x) < 1500 && Math.abs(c.y - p.y) < 1500) say(s, 'cruiser', 'There is an enemy cruiser near you.', true);
  if (Math.abs(f2.x - p.x) < 1500 && Math.abs(f2.y - p.y) < 1500) say(s, 'fighter2', 'There is an enemy fighter near you.', true);
  if (Math.abs(f1.x - p.x) < 1500 && Math.abs(f1.y - p.y) < 1500) say(s, 'fighter1', 'There is an enemy fighter near you.', true);

  if (p.rockets > 1 && p.rockets < 3) say(s, 'rocketsLow', 'You are running out of photon torpedoes.');
  if (p.rockets < 1) say(s, 'rocketsOut', 'You are out of photon torpedoes.');
  if (p.fuelTanks > 1 && p.fuelTanks < 3) say(s, 'tanksLow', 'You are running out of fuel tanks.');
  if (p.fuelTanks < 1) say(s, 'tanksOut', 'You are out of fuel tanks.');

  // New warnings. These two hazards kill without notice otherwise, and nothing on screen explains them.
  const nearWall =
    Math.abs(p.x) > WALL.inner - 1200 && Math.abs(p.x) < WALL.outer ||
    Math.abs(p.y) > WALL.inner - 1200 && Math.abs(p.y) < WALL.outer;
  if (nearWall && !p.extraShieldOn) say(s, 'wall', 'Force wall ahead! You need an extra shield up (U) to survive it.', true);
  if (s.earthAlive && Math.hypot(p.x - EARTH.x, p.y - EARTH.y) < 3000) {
    say(s, 'earth', "Stay clear of Earth! Nothing escapes its gravity once it has you.", true);
  }
}

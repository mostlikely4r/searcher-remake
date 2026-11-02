// A bot plays the real game loop using only player commands and shop actions.
// If rule changes make the game unwinnable or trivially lethal, this is what catches it.

import { describe, expect, it } from 'vitest';
import { buy, EQUIPMENT, setAutopilot, UPGRADES } from '../src/core/economy';
import { drainEvents } from '../src/core/events';
import { type Command, tick } from '../src/core/sim';
import { createInitialState, type GameState } from '../src/core/state';

const item = (id: string) => [...UPGRADES, ...EQUIPMENT].find((i) => i.id === id)!;

function buyMany(s: GameState, id: string, count: number): void {
  for (let i = 0; i < count; i++) buy(s, item(id));
}

/** The opening a player learns: dock straight away, spend the starting money, switch on the autos. */
function outfit(s: GameState): void {
  tick(s, [{ c: 'dock' }]);
  buyMany(s, 'shipLevel', 12);
  buyMany(s, 'laserLevel', 24);
  buyMany(s, 'rocketLevel', 8);
  buyMany(s, 'shieldLevel', 24);
  buyMany(s, 'maxEnergy', 8);
  buyMany(s, 'maxShield', 8);
  buyMany(s, 'tank', 25);
  buyMany(s, 'extraShield', 10);
  s.player.autoFreq = true;
  s.player.autoLaser = true;
  s.player.autoRefuel = true;
}

interface Outcome {
  won: boolean;
  seconds: number;
  cause: string | null;
  credits: number;
  hunterKills: number;
  cruiserKills: number;
}

function playToFirstBaseKill(seed: number): Outcome {
  const s = createInitialState(seed);
  drainEvents();
  outfit(s);
  let phase: 'fuel' | 'hunt' | 'travel' | 'attack' = 'fuel';
  const limit = 30 * 60 * 20;
  let ticks = 0;
  while (!s.gameOver && s.basesDestroyed === 0 && ticks < limit) {
    ticks++;
    const p = s.player;
    const cmds: Command[] = [];
    if (phase === 'fuel' && p.energy >= p.maxEnergy - 25) {
      cmds.push({ c: 'dock' });
      phase = 'hunt';
    }
    if (phase === 'hunt') {
      // Stand and fight the hunter, which arrives on its own, so it does not follow us through the wall.
      if (s.enemies.fighter2.level > 1 || ticks > 30 * 90) {
        for (let i = 0; i < 20; i++) cmds.push({ c: 'speedUp' });
        setAutopilot(s, 17000, -18000, 18);
        phase = 'travel';
      }
    }
    if (phase === 'travel') {
      if (p.x >= 17000 && p.autopilot === null) setAutopilot(s, 23500, -18000, 18);
      if (p.x >= 17000 && !p.extraShieldOn) cmds.push({ c: 'extraShield' });
      if (p.x >= 23400) phase = 'attack';
    }
    if (phase === 'attack') {
      if (!p.extraShieldOn && p.extraShields >= 1) cmds.push({ c: 'extraShield' });
      // Fighters grab the automatic lock, so a player has to Tab onto the base itself.
      if (s.target !== 'enemyBase') cmds.push({ c: 'cycleTarget' });
    }
    if (p.energy < p.maxEnergy * 0.4 && p.fuelTanks >= 1 && phase !== 'fuel') cmds.push({ c: 'fuelTank' });
    tick(s, cmds);
    drainEvents();
  }
  return {
    won: s.basesDestroyed > 0,
    seconds: Math.round(ticks / 30),
    cause: s.gameOver?.cause ?? null,
    credits: Math.floor(s.player.credits),
    hunterKills: s.enemies.fighter2.level - 1,
    cruiserKills: s.enemies.cruiser.level - 1,
  };
}

describe('full playthrough', () => {
  it('a prepared player can reach and destroy the enemy base', () => {
    const results = [1, 2, 3, 4, 5, 6, 7, 8].map(playToFirstBaseKill);
    console.table(results);
    const wins = results.filter((r) => r.won).length;
    expect(wins).toBeGreaterThanOrEqual(6);
  });
});

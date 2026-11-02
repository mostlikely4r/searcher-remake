// Shared combat outcomes: rocket blasts and the end of the game.

import { emit } from './events';
import { EARTH, MOON, type GameState } from './state';

export function killPlayer(s: GameState, cause: string): void {
  if (s.gameOver) return;
  s.gameOver = { cause };
  emit({ t: 'explosion', x: s.player.x, y: s.player.y, size: 200 });
  emit({ t: 'gameOver', cause });
}

export function checkPlayerDeath(s: GameState): void {
  const p = s.player;
  if (p.damage > 99) killPlayer(s, 'Your ship took too much damage.');
}

/** Blast damage from lines 565-570, extended to the raider and enemy base the original forgot. */
export function explodeRocket(s: GameState): void {
  const r = s.rocket;
  if (!r) return;
  s.rocket = null;
  const reach = 100 * r.power;
  const hit = (x: number, y: number, range = reach) =>
    Math.abs(r.x - x) < range && Math.abs(r.y - y) < range;

  if (hit(0, 0)) s.base.shield -= reach;
  const p = s.player;
  if (!p.extraShieldOn && hit(p.x, p.y)) {
    p.shield -= reach;
    emit({ t: 'playerHit', amount: reach });
  }
  for (const e of Object.values(s.enemies)) {
    if (hit(e.x, e.y)) e.shield -= reach;
  }
  if (s.moonAlive && hit(MOON.x, MOON.y, 400 * r.power)) {
    s.moonAlive = false;
    emit({ t: 'explosion', x: MOON.x, y: MOON.y, size: 500 });
    emit({ t: 'comms', text: 'The moon has been destroyed!', urgent: true });
  }
  if (s.earthAlive && hit(EARTH.x, EARTH.y, 1000 * r.power)) {
    s.earthAlive = false;
    emit({ t: 'explosion', x: EARTH.x, y: EARTH.y, size: 600 });
    emit({ t: 'comms', text: 'Earth has been destroyed. What have you done?', urgent: true });
  }
  emit({ t: 'explosion', x: r.x, y: r.y, size: 50 * r.power });
}

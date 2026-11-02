// One-way notifications from the simulation to rendering, audio and UI.
// Kept out of GameState so they are never saved and the rules never depend on them.

export type BeamKind = 'player' | 'cruiser' | 'cruiserHeavy' | 'raider' | 'hunter' | 'enemyBase' | 'base' | 'tractor';

export type GameEvent =
  | { t: 'comms'; text: string; urgent?: boolean }
  | { t: 'beam'; kind: BeamKind; x1: number; y1: number; x2: number; y2: number }
  | { t: 'laserMiss' }
  | { t: 'playerHit'; amount: number }
  | { t: 'explosion'; x: number; y: number; size: number }
  | { t: 'rocketLaunch' }
  | { t: 'pickup'; x: number; y: number; amount: number }
  | { t: 'docked' }
  | { t: 'undocked' }
  | { t: 'hyper' }
  | { t: 'delivery'; x: number; y: number }
  | { t: 'enemyDestroyed'; x: number; y: number; id: string; reward: number }
  | { t: 'rocketFormNeeded' }
  | { t: 'gameOver'; cause: string };

const queue: GameEvent[] = [];

export function emit(e: GameEvent): void {
  queue.push(e);
  // A headless run with nobody draining must not grow without bound.
  if (queue.length > 5000) queue.splice(0, 1000);
}

export function drainEvents(): GameEvent[] {
  return queue.splice(0, queue.length);
}

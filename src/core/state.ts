// Complete, JSON-serialisable game state. Starting numbers come from SCEARCH.BAS lines 3-105.

export type EnemyId = 'cruiser' | 'fighter1' | 'fighter2' | 'enemyBase';

export interface Enemy {
  x: number;
  y: number;
  shield: number;
  shieldCap: number;
  damage: number;
  level: number;
  freq: number;
  maxFreq: number;
  /** Fire-cycle counter (lssp / lssp2 / spls / lspe). */
  cycle: number;
  /** Has reached its attack zone (fiterat / fiterat2). */
  attacking: boolean;
}

export interface Rocket {
  x: number;
  y: number;
  destX: number;
  destY: number;
  age: number;
  fuse: number;
  power: number;
  /** Time bomb: sits at its launch point until the fuse runs out (rkstp). */
  timeBomb: boolean;
  /** Manually aimed: does not retarget onto enemies (selmv). */
  free: boolean;
  startDist: number;
}

export interface Refit {
  total: number;
  remaining: number;
}

export type SolarMode = 0 | 1 | 2 | 3;

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  maxSpeed: number;
  energy: number;
  maxEnergy: number;
  shield: number;
  maxShield: number;
  damage: number;
  shipLevel: number;
  laserLevel: number;
  rocketLevel: number;
  extraShieldLevel: number;
  rockets: number;
  fuelTanks: number;
  extraShields: number;
  extraShieldOn: boolean;
  extraShieldHold: number;
  hyperCharge: number;
  laserCharge: number;
  laserOn: boolean;
  laserRefire: boolean;
  launcherArmed: boolean;
  /** zus: 0 normal, 1 solar panels open, 2 closing, 3 re-accelerating. */
  solar: SolarMode;
  solarRamp: boolean;
  laserFreq: number;
  beamFreq: number;
  shieldFreq: number;
  credits: number;
  hasBeam: boolean;
  hasMulticom: boolean;
  hasTracer: boolean;
  autoLaser: boolean;
  autoFreq: boolean;
  autoRocket: boolean;
  autoRefuel: boolean;
  autoRepair: boolean;
  autopilot: { x: number; y: number; speed: number } | null;
  docked: boolean;
  dockCycle: number;
  refit: Refit | null;
  beam: { dx: number; dy: number } | null;
}

export interface Bank {
  /** Outstanding debt (lenbed + geleend merged into one number). */
  loan: number;
  hasAccount: boolean;
  accountType: number;
  savings: number;
  pin: number;
  wrongPins: number;
}

export interface CommsState {
  enabled: boolean;
  ready: boolean;
  missionGiven: boolean;
  cooldowns: Record<string, number>;
}

export interface GameState {
  version: number;
  rng: number;
  tick: number;
  keel: number;
  clock: { minute: number; day: number; month: number; year: number };
  player: Player;
  base: {
    energy: number;
    shield: number;
    damage: number;
    reserve: number;
    battleStations: boolean;
    underAttack: boolean;
  };
  enemies: Record<EnemyId, Enemy>;
  cruiserMode: 0 | 1 | 2;
  target: EnemyId | null;
  manualLock: boolean;
  rocket: Rocket | null;
  crate: { x: number; y: number };
  miner: { x: number; y: number; leg: 0 | 1 };
  moonAlive: boolean;
  earthAlive: boolean;
  gravity: number;
  gate: { top: number; bottom: number; opening: boolean };
  viewHome: boolean;
  bank: Bank;
  comms: CommsState;
  secretReport: boolean;
  enemyBaseFound: boolean;
  basesDestroyed: number;
  gameOver: { cause: string } | null;
}

export const SAVE_VERSION = 1;

export function createInitialState(seed = Date.now() >>> 0): GameState {
  const enemy = (x: number, y: number, shield: number, shieldCap: number, freq: number, maxFreq: number): Enemy => ({
    x, y, shield, shieldCap, damage: 0, level: 1, freq, maxFreq, cycle: 0, attacking: false,
  });
  return {
    version: SAVE_VERSION,
    rng: seed,
    tick: 0,
    keel: 0,
    clock: { minute: 0, day: 2, month: 6, year: 2022 },
    player: {
      x: 430, y: 0, vx: 0, vy: 0, maxSpeed: 10,
      energy: 400, maxEnergy: 600, shield: 200, maxShield: 200, damage: 0,
      shipLevel: 4, laserLevel: 1, rocketLevel: 1, extraShieldLevel: 1,
      rockets: 5, fuelTanks: 3, extraShields: 1, extraShieldOn: false, extraShieldHold: 0,
      hyperCharge: 0, laserCharge: 0, laserOn: false, laserRefire: false, launcherArmed: false,
      solar: 0, solarRamp: false,
      laserFreq: 1, beamFreq: 1, shieldFreq: 1,
      credits: 200000,
      hasBeam: false, hasMulticom: false, hasTracer: false,
      autoLaser: false, autoFreq: false, autoRocket: false, autoRefuel: false, autoRepair: false,
      autopilot: null, docked: false, dockCycle: 0, refit: null, beam: null,
    },
    base: { energy: 400, shield: 200, damage: 0, reserve: 0, battleStations: false, underAttack: false },
    enemies: {
      cruiser: enemy(-90000, 80000, 600, 600, 5, 11),
      fighter1: enemy(-6000, 3532, 200, 200, 10, 10),
      fighter2: enemy(6000, -5532, 200, 800, 9, 11),
      enemyBase: enemy(24121, -18000, 600, 600, 20, 25),
    },
    cruiserMode: 1,
    target: null,
    manualLock: false,
    rocket: null,
    crate: { x: 0, y: 0 },
    miner: { x: 0, y: 0, leg: 0 },
    moonAlive: true,
    earthAlive: true,
    gravity: 0,
    gate: { top: 0, bottom: 0, opening: false },
    viewHome: false,
    bank: { loan: 0, hasAccount: false, accountType: 0, savings: 0, pin: 0, wrongPins: 0 },
    comms: { enabled: true, ready: false, missionGiven: false, cooldowns: {} },
    secretReport: false,
    enemyBaseFound: false,
    basesDestroyed: 0,
    gameOver: null,
  };
}

// World constants.
export const MOON = { x: -5000, y: 6000, radius: 400, hazard: 600 };
export const EARTH = { x: 10000, y: -2000, radius: 500, gravityRange: 1500, hazard: 1000 };
export const DOCK = { x: 325, y: 0, minX: 0, maxX: 725, halfY: 500 };
export const BAY = { minX: 350, maxX: 500, halfY: 100 };
export const WALL = { inner: 19000, outer: 24000 };

export const ENEMY_NAMES: Record<EnemyId, string> = {
  cruiser: 'CRUISER',
  fighter1: 'RAIDER',
  fighter2: 'HUNTER',
  enemyBase: 'ENEMY BASE',
};

/** Mulberry32 step: deterministic, and the whole generator state survives a save. */
export function random(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max], like INT(RND * n + min). */
export function randomInt(s: GameState, min: number, max: number): number {
  return Math.floor(random(s) * (max - min + 1)) + min;
}

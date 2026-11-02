import { beforeEach, describe, expect, it } from 'vitest';
import { type Command, isInWall, tick } from '../src/core/sim';
import { createInitialState, type GameState } from '../src/core/state';
import {
  borrow, buy, checkPin, deposit, EQUIPMENT, hyperjump, launchAimed, openAccount, repay, startRefit, UPGRADES, withdraw,
} from '../src/core/economy';
import { drainEvents } from '../src/core/events';

function run(s: GameState, ticks: number, commands: Command[] = []): void {
  for (let i = 0; i < ticks && !s.gameOver; i++) tick(s, i === 0 ? commands : []);
}

/** Parks every enemy far away so a rule can be tested on its own. */
function clearEnemies(s: GameState): void {
  for (const e of Object.values(s.enemies)) {
    e.x = 90000;
    e.y = 90000;
  }
}

function parkEnemy(s: GameState, id: keyof GameState['enemies'], dx = 100, dy = 0): void {
  s.enemies[id].x = s.player.x + dx;
  s.enemies[id].y = s.player.y + dy;
}

let s: GameState;
beforeEach(() => {
  s = createInitialState(12345);
  drainEvents();
});

describe('starting values from SCEARCH.BAS', () => {
  it('matches the original loadout', () => {
    const p = s.player;
    expect([p.x, p.y, p.energy, p.maxEnergy, p.shield, p.credits]).toEqual([430, 0, 400, 600, 200, 200000]);
    expect([p.rockets, p.fuelTanks, p.extraShields, p.shipLevel, p.maxSpeed]).toEqual([5, 3, 1, 4, 10]);
    expect(s.enemies.enemyBase.x).toBe(24121);
  });
});

describe('flight and energy', () => {
  it('holds velocity with no drag until stopped', () => {
    clearEnemies(s);
    run(s, 1, [{ c: 'thrust', dx: 5, dy: 0 }]);
    const x = s.player.x;
    run(s, 10);
    expect(s.player.x).toBe(x + 50);
    run(s, 1, [{ c: 'stop' }]);
    expect(s.player.vx).toBe(0);
  });

  it('clamps velocity to max speed', () => {
    clearEnemies(s);
    run(s, 1, [{ c: 'thrust', dx: 99, dy: -99 }]);
    expect(s.player.vx).toBe(10);
    expect(s.player.vy).toBe(-10);
  });

  it('charges max speed only up to the ship-level limit', () => {
    clearEnemies(s);
    for (let i = 0; i < 30; i++) run(s, 1, [{ c: 'speedUp' }]);
    expect(s.player.maxSpeed).toBe(18);
  });

  it('burns energy according to the original formula', () => {
    clearEnemies(s);
    run(s, 1, [{ c: 'thrust', dx: 10, dy: 0 }]);
    const before = s.player.energy;
    run(s, 1);
    expect(before - s.player.energy).toBeCloseTo(10 * 0.01 + 0.05 * 10 * 1, 5);
  });

  it('dies when energy runs out beyond the home tether', () => {
    clearEnemies(s);
    s.player.x = 12000;
    s.player.y = 12000;
    s.player.energy = 0.05;
    s.player.fuelTanks = 0;
    run(s, 3);
    expect(s.gameOver?.cause).toMatch(/energy/);
  });

  it('feeds emergency energy from the base when close to home', () => {
    clearEnemies(s);
    s.player.energy = 40;
    const baseEnergy = s.base.energy;
    run(s, 1);
    expect(s.player.energy).toBeGreaterThan(80);
    expect(s.base.energy).toBeLessThan(baseEnergy + 7.5);
  });
});

describe('solar panels', () => {
  it('charges, slows the ship, caps shields, and ramps speed back after closing', () => {
    clearEnemies(s);
    s.player.extraShields = 0;
    run(s, 1, [{ c: 'solar' }]);
    expect(s.player.solar).toBe(1);
    const e = s.player.energy;
    run(s, 10);
    expect(s.player.energy).toBeGreaterThan(e);
    expect(s.player.maxSpeed).toBe(1);
    expect(s.player.shield).toBeLessThanOrEqual(45 + 4.5);
    run(s, 1, [{ c: 'solar' }]);
    run(s, 40);
    expect(s.player.solar).toBe(0);
    expect(s.player.maxSpeed).toBe(18);
  });

  it('deploys a spare extra shield automatically', () => {
    clearEnemies(s);
    run(s, 2, [{ c: 'solar' }]);
    expect(s.player.extraShieldOn).toBe(true);
  });
});

describe('docking and refit', () => {
  it('refuses to dock while moving, far away, or with a target', () => {
    clearEnemies(s);
    s.player.x = 5000;
    run(s, 1, [{ c: 'dock' }]);
    expect(s.player.docked).toBe(false);
    s.player.x = 430;
    s.target = 'fighter2';
    s.manualLock = true;
    parkEnemy(s, 'fighter2');
    run(s, 1, [{ c: 'dock' }]);
    expect(s.player.docked).toBe(false);
  });

  it('refills when docked and undocks on thrust', () => {
    clearEnemies(s);
    run(s, 1, [{ c: 'dock' }]);
    expect(s.player.docked).toBe(true);
    run(s, 60);
    expect(s.player.energy).toBeGreaterThan(500);
    expect(s.player.rockets).toBe(10);
    expect(s.player.fuelTanks).toBe(5);
    run(s, 1, [{ c: 'thrust', dx: 1, dy: 0 }]);
    expect(s.player.docked).toBe(false);
  });

  it('applies upgrades each refit cycle and refunds only unused cycles', () => {
    clearEnemies(s);
    run(s, 1);
    const credits = s.player.credits;
    expect(startRefit(s, 10).ok).toBe(true);
    expect(s.player.credits).toBeCloseTo(credits - 10000);
    run(s, 4);
    expect(s.player.shipLevel).toBeCloseTo(4.2);
    const beforeCancel = s.player.credits;
    run(s, 1, [{ c: 'dock' }]);
    expect(s.player.refit).toBeNull();
    expect(s.player.credits).toBeCloseTo(beforeCancel + 6000, 0);
  });

  it('refuses a refit outside the bay', () => {
    clearEnemies(s);
    s.player.x = 1000;
    expect(startRefit(s, 1).ok).toBe(false);
  });
});

describe('frequencies and combat', () => {
  beforeEach(() => clearEnemies(s));

  it('laser only damages on a matching frequency', () => {
    s.manualLock = true;
    s.target = 'fighter1';
    parkEnemy(s, 'fighter1', 800, 0);
    const f1 = s.enemies.fighter1;
    s.player.laserCharge = 100;
    s.player.laserFreq = f1.freq - 1;
    run(s, 1, [{ c: 'laser' }]);
    expect(f1.shield).toBe(200);

    s.player.laserCharge = 100;
    s.player.laserFreq = f1.freq;
    run(s, 1);
    expect(f1.shield).toBeLessThan(200);
  });

  it('accumulates laser damage on the raider once its shields are down (typo fix)', () => {
    s.manualLock = true;
    s.target = 'fighter1';
    parkEnemy(s, 'fighter1', 800, 0);
    const f = s.enemies.fighter1;
    f.shield = 0;
    s.player.laserFreq = f.freq;
    s.player.laserCharge = 100;
    run(s, 1, [{ c: 'laser' }]);
    expect(f.damage).toBeGreaterThanOrEqual(50);
    f.shield = 0;
    s.player.laserCharge = 100;
    const before = f.damage;
    run(s, 2);
    expect(f.damage).toBeGreaterThan(before);
  });

  it('auto-frequency always matches the target', () => {
    s.player.autoFreq = true;
    s.manualLock = true;
    s.target = 'cruiser';
    parkEnemy(s, 'cruiser', 400, 0);
    run(s, 2);
    expect(s.player.laserFreq).toBeGreaterThanOrEqual(1);
    const hit = s.enemies.cruiser.shield;
    s.player.laserCharge = 100;
    run(s, 1, [{ c: 'laser' }]);
    expect(s.enemies.cruiser.shield).toBeLessThan(hit);
  });

  it('hunter hits unless the shield is tuned above its reach', () => {
    const p = s.player;
    p.shipLevel = 5;
    p.shieldFreq = 11;
    parkEnemy(s, 'fighter2', 100, 0);
    s.enemies.fighter2.attacking = true;
    drainEvents();
    run(s, 40);
    const hits = drainEvents().filter((e) => e.t === 'playerHit');
    expect(hits.length).toBeGreaterThan(0);

    s.player.shieldFreq = 12;
    drainEvents();
    run(s, 40);
    expect(drainEvents().filter((e) => e.t === 'playerHit').length).toBe(0);
  });

  it('cruiser keeps firing in a loop (volley-period fix)', () => {
    parkEnemy(s, 'cruiser', 100, 0);
    drainEvents();
    run(s, 120);
    const shots = drainEvents().filter((e) => e.t === 'beam' && e.kind.startsWith('cruiser'));
    expect(shots.length).toBeGreaterThan(30);
  });

  it('extra shield protects from hits and drains under fire', () => {
    s.player.extraShieldOn = true;
    s.player.extraShieldHold = 100000;
    parkEnemy(s, 'fighter2', 100, 0);
    s.enemies.fighter2.attacking = true;
    run(s, 40);
    expect(s.player.extraShieldHold).toBeLessThan(100000);
    expect(s.player.shield).toBe(s.player.maxShield);
  });

  it('respawns the enemy somewhere new when the base dies, away from home', () => {
    const b = s.enemies.enemyBase;
    b.damage = 200;
    const reward = s.player.credits;
    run(s, 1);
    expect(s.player.credits).toBeGreaterThan(reward + 17000);
    expect(b.level).toBe(2);
    expect(b.shieldCap).toBe(1100);
    expect(Math.hypot(b.x, b.y)).toBeGreaterThanOrEqual(8000);
    expect(s.basesDestroyed).toBe(1);
  });

  it('cruiser wreck respawns at the enemy base on both axes (typo fix)', () => {
    const c = s.enemies.cruiser;
    c.damage = 500;
    c.x = 1000;
    c.y = 1000;
    run(s, 1);
    // One tick of pursuit after respawn: no more than one 20-unit step from the base.
    expect(Math.abs(c.x - s.enemies.enemyBase.x)).toBeLessThanOrEqual(20);
    expect(Math.abs(c.y - s.enemies.enemyBase.y)).toBeLessThanOrEqual(20);
  });

  it('home base turrets kill a raider that comes for it', () => {
    const f = s.enemies.fighter1;
    f.x = 200;
    f.y = 200;
    const credits = s.player.credits;
    run(s, 30);
    expect(f.level).toBe(2);
    expect(s.player.credits).toBeGreaterThan(credits + 150);
  });
});

describe('rockets', () => {
  beforeEach(() => clearEnemies(s));

  it('locks onto a target, hits it, and splashes the player when too close', () => {
    s.manualLock = true;
    s.target = 'fighter1';
    parkEnemy(s, 'fighter1', 100, 0);
    run(s, 1, [{ c: 'launcher' }]);
    expect(s.rocket).not.toBeNull();
    expect(s.player.rockets).toBe(4);
    drainEvents();
    run(s, 30);
    const events = drainEvents();
    expect(events.some((e) => e.t === 'explosion')).toBe(true);
    expect(events.some((e) => e.t === 'playerHit')).toBe(true);
  });

  it('asks for a detonation point when nothing is targeted', () => {
    drainEvents();
    run(s, 1, [{ c: 'launcher' }]);
    expect(drainEvents().some((e) => e.t === 'rocketFormNeeded')).toBe(true);
  });

  it('will not launch above speed 10', () => {
    s.player.maxSpeed = 18;
    s.player.x = 3000;
    s.player.vx = 15;
    s.manualLock = true;
    s.target = 'fighter1';
    parkEnemy(s, 'fighter1', 400, 0);
    run(s, 1, [{ c: 'launcher' }]);
    expect(s.rocket).toBeNull();
  });

  it('aimed blast destroys the moon', () => {
    s.player.x = -5000;
    s.player.y = 7000;
    launchAimed(s, { x: -5000, y: 6900, fuse: 0, powerPercent: 300, timeBomb: false });
    run(s, 40);
    expect(s.moonAlive).toBe(false);
  });

  it('time bomb waits for its fuse', () => {
    s.player.x = 2000;
    launchAimed(s, { x: 0, y: 0, fuse: 30, powerPercent: 100, timeBomb: true });
    run(s, 20);
    expect(s.rocket).not.toBeNull();
    run(s, 15);
    expect(s.rocket).toBeNull();
  });
});

describe('world hazards', () => {
  beforeEach(() => clearEnemies(s));

  it('force wall kills without an extra shield and passes with one', () => {
    s.player.x = 20000;
    s.player.y = 0;
    run(s, 1);
    expect(s.gameOver?.cause).toMatch(/wall/);

    s = createInitialState(1);
    clearEnemies(s);
    s.player.x = 20000;
    s.player.extraShieldOn = true;
    s.player.extraShieldHold = 100;
    run(s, 5);
    expect(s.gameOver).toBeNull();
  });

  it('left wall has a gate at its centre that opens and closes', () => {
    s.gate.top = 300;
    s.gate.bottom = -300;
    expect(isInWall(s, -20000, 0)).toBe(false);
    expect(isInWall(s, -20000, 300)).toBe(true);
    s.gate.top = 0;
    s.gate.bottom = 0;
    expect(isInWall(s, -20000, 0)).toBe(true);
  });

  it('places the first enemy base out of reach, beyond the wall', () => {
    const b = s.enemies.enemyBase;
    expect(isInWall(s, b.x, b.y)).toBe(false);
    expect(b.x).toBeGreaterThan(24000);
  });

  it('earth drags you in and burns your shields', () => {
    s.player.x = 11000;
    s.player.y = -2000;
    s.player.maxSpeed = 18;
    const startX = s.player.x;
    run(s, 20);
    expect(s.player.x).toBeLessThan(startX);
    expect(s.player.shield).toBeLessThan(200);
  });

  it('destroying the moon stops the miner deliveries', () => {
    s.moonAlive = false;
    s.miner.leg = 0;
    s.miner.x = 0;
    run(s, 10);
    expect(s.miner.x).toBe(0);
  });

  it('pays for collected crates by the current day', () => {
    run(s, 1);
    s.player.x = s.crate.x;
    s.player.y = s.crate.y;
    const credits = s.player.credits;
    run(s, 1);
    expect(s.player.credits).toBeCloseTo(credits + 400 + 0.05, 1);
  });
});

describe('economy', () => {
  it('sells at the listed price, not the original +$50 surprise', () => {
    const rocket = EQUIPMENT.find((i) => i.id === 'rocket')!;
    buy(s, rocket);
    expect(s.player.credits).toBe(200000 - 200);
    expect(s.player.rockets).toBe(6);
  });

  it('refuses purchases you cannot afford', () => {
    s.player.credits = 100;
    const ship = UPGRADES.find((i) => i.id === 'shipLevel')!;
    expect(buy(s, ship).ok).toBe(false);
    expect(s.player.shipLevel).toBe(4);
  });

  it('caps total loans at the limit across repeated borrowing', () => {
    borrow(s, 15000);
    borrow(s, 15000);
    expect(s.bank.loan).toBe(20000);
    expect(s.player.credits).toBe(220000);
  });

  it('charges 5% a day and hits shields when broke', () => {
    clearEnemies(s);
    borrow(s, 20000);
    s.player.credits = 0;
    s.player.shield = 200;
    for (let i = 0; i < 26; i++) tick(s, []);
    expect(s.player.credits).toBeLessThan(0);
    expect(s.player.shield).toBeLessThan(200);
  });

  it('repaying clears the debt for good', () => {
    clearEnemies(s);
    borrow(s, 1000);
    expect(repay(s, 1000).message).toMatch(/repaid/);
    expect(s.bank.loan).toBe(0);
    const credits = s.player.credits;
    run(s, 30);
    expect(s.player.credits).toBeCloseTo(credits + 1.5, 1);
  });

  it('runs the account flow: PIN, deposit, withdraw-all closes it', () => {
    expect(openAccount(s, 5, 50000).ok).toBe(false);
    const opened = openAccount(s, 5, 100000);
    expect(opened.ok).toBe(true);
    expect(s.player.credits).toBe(100000);
    expect(checkPin(s, s.bank.pin).ok).toBe(true);
    deposit(s, 1000);
    expect(s.bank.savings).toBe(101000);
    withdraw(s, 123123);
    expect(s.player.credits).toBeCloseTo(99000 + 101000 * 0.975);
    expect(s.bank.hasAccount).toBe(false);
  });

  it('blocks a savings account while in debt', () => {
    borrow(s, 100);
    expect(openAccount(s, 1, 10).ok).toBe(false);
  });

  it('loses the account on the third wrong PIN, and keeps the 1221 backdoor', () => {
    openAccount(s, 1, 1000);
    expect(checkPin(s, 1221).message).toMatch(/Backdoor/);
    expect(s.bank.savings).toBe(2000);
    const wrong = s.bank.pin === 1111 ? 2222 : 1111;
    checkPin(s, wrong);
    checkPin(s, wrong);
    expect(s.bank.hasAccount).toBe(true);
    checkPin(s, wrong);
    expect(s.bank.hasAccount).toBe(false);
    expect(s.bank.savings).toBe(0);
  });

  it('pays savings interest on day 3 of each month', () => {
    clearEnemies(s);
    openAccount(s, 1, 1000);
    s.clock.day = 3;
    s.clock.minute = 24;
    run(s, 1);
    expect(s.bank.savings).toBeCloseTo(1050);
  });
});

describe('hyperjump', () => {
  it('jumps within range and costs energy', () => {
    clearEnemies(s);
    s.player.hyperCharge = 100;
    expect(hyperjump(s, 1, 99999, -99999).ok).toBe(true);
    expect(s.player.x).toBe(430 + 600);
    expect(s.player.y).toBe(-600);
    expect(s.player.energy).toBe(400 - 150);
    expect(s.player.hyperCharge).toBe(0);
  });

  it('secret code unlocks the second report page', () => {
    hyperjump(s, 1, 123123, 321321);
    expect(s.secretReport).toBe(true);
  });
});

describe('whole-game balance', () => {
  it('an idle player is eventually killed by the enemies that hunt them', () => {
    let ticks = 0;
    while (!s.gameOver && ticks < 30 * 60 * 5) {
      tick(s, []);
      ticks++;
    }
    expect(s.gameOver).not.toBeNull();
    // Long enough to read the opening radio messages and get to the station menu.
    expect(ticks).toBeGreaterThan(30 * 25);
  });

  it('a player who tunes shields above the hunter survives its attack', () => {
    s.player.shipLevel = 5;
    s.player.shieldFreq = 12;
    // Keep the cruiser out of this test: it arrives minutes later, and that is a separate fight.
    s.enemies.cruiser.x = -900000;
    s.enemies.cruiser.y = 900000;
    run(s, 1, [{ c: 'dock' }]);
    run(s, 30 * 60);
    expect(s.gameOver).toBeNull();
    expect(s.player.damage).toBe(0);
  });

  it('is deterministic for a given seed', () => {
    const a = createInitialState(7);
    const b = createInitialState(7);
    for (let i = 0; i < 2000; i++) {
      tick(a, []);
      tick(b, []);
    }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('survives a JSON save and load mid-game', () => {
    run(s, 200);
    const copy = JSON.parse(JSON.stringify(s)) as GameState;
    run(s, 100);
    run(copy, 100);
    expect(JSON.stringify(copy)).toBe(JSON.stringify(s));
  });
});

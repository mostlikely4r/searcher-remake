// Everything the station menu can do. Menus pause the simulation, as INPUT did in the original.

import { cancelRefit, isInBay, maxFrequency } from './sim';
import { emit } from './events';
import { type GameState, randomInt } from './state';

export interface Result {
  ok: boolean;
  message: string;
}
const ok = (message: string): Result => ({ ok: true, message });
const no = (message: string): Result => ({ ok: false, message });

export interface ShopItem {
  id: string;
  label: string;
  price: number;
  /** Shows the current value in the menu. */
  value: (s: GameState) => string;
  /** Applies the purchase; returning a string refuses it with that reason. */
  apply: (s: GameState) => string | void;
}

const fixed = (n: number) => n.toFixed(2);

export const UPGRADES: ShopItem[] = [
  { id: 'rocketLevel', label: 'Better rockets (+0.25)', price: 400, value: (s) => fixed(s.player.rocketLevel), apply: (s) => { s.player.rocketLevel += 0.25; } },
  { id: 'laserLevel', label: 'Better lasers (+0.25)', price: 600, value: (s) => fixed(s.player.laserLevel), apply: (s) => { s.player.laserLevel += 0.25; } },
  { id: 'shieldLevel', label: 'Better extra shields (+0.25)', price: 750, value: (s) => fixed(s.player.extraShieldLevel), apply: (s) => { s.player.extraShieldLevel += 0.25; } },
  { id: 'shipLevel', label: 'Better ship (+0.25)', price: 1000, value: (s) => fixed(s.player.shipLevel), apply: (s) => { s.player.shipLevel += 0.25; } },
  { id: 'maxShield', label: 'Stronger shield (+25)', price: 1500, value: (s) => Math.floor(s.player.maxShield).toString(), apply: (s) => { s.player.maxShield = Math.min(8000, s.player.maxShield + 25); } },
  { id: 'maxEnergy', label: 'Bigger energy store (+50)', price: 2000, value: (s) => Math.floor(s.player.maxEnergy).toString(), apply: (s) => { s.player.maxEnergy = Math.min(8000, s.player.maxEnergy + 50); } },
];

const owned = (has: boolean) => (has ? 'OWNED' : '-');

export const EQUIPMENT: ShopItem[] = [
  { id: 'rocket', label: 'Rocket', price: 200, value: (s) => Math.floor(s.player.rockets).toString(), apply: (s) => { if (s.player.rockets >= 80) return 'Rocket racks are full.'; s.player.rockets += 1; } },
  { id: 'tank', label: 'Energy tank', price: 800, value: (s) => Math.floor(s.player.fuelTanks).toString(), apply: (s) => { if (s.player.fuelTanks >= 120) return 'Tank bay is full.'; s.player.fuelTanks += 1; } },
  { id: 'extraShield', label: 'Extra shield', price: 500, value: (s) => Math.floor(s.player.extraShields).toString(), apply: (s) => { if (s.player.extraShields >= 120) return 'Shield store is full.'; s.player.extraShields += 1; } },
  { id: 'beam', label: 'Tractor beam', price: 3000, value: (s) => owned(s.player.hasBeam), apply: (s) => { if (s.player.hasBeam) return 'You already own one.'; s.player.hasBeam = true; } },
  { id: 'multicom', label: 'Multicom (menu anywhere)', price: 5000, value: (s) => owned(s.player.hasMulticom), apply: (s) => { if (s.player.hasMulticom) return 'You already own one.'; s.player.hasMulticom = true; } },
  { id: 'tracer', label: 'Tracer (tracks enemies)', price: 10000, value: (s) => owned(s.player.hasTracer), apply: (s) => { if (s.player.hasTracer) return 'You already own one.'; s.player.hasTracer = true; } },
];

export function buy(s: GameState, item: ShopItem): Result {
  if (s.player.credits < item.price) return no(`You need $${item.price}.`);
  const refused = item.apply(s);
  if (refused) return no(refused);
  s.player.credits -= item.price;
  return ok(`Bought: ${item.label}.`);
}

export function canOpenStation(s: GameState): boolean {
  return s.player.docked || s.player.hasMulticom;
}

export function setFrequency(s: GameState, which: 'laser' | 'beam' | 'shield', value: number): void {
  const v = Math.max(1, Math.min(Math.floor(maxFrequency(s)), Math.floor(value)));
  if (which === 'laser') s.player.laserFreq = v;
  if (which === 'beam') s.player.beamFreq = v;
  if (which === 'shield') s.player.shieldFreq = v;
}

export function startRefit(s: GameState, cycles: number): Result {
  const p = s.player;
  const n = Math.floor(cycles);
  if (!isInBay(s)) return no('Too far: park inside the refit bay first.');
  if (n <= 0) return no('Refit cancelled.');
  if (n * 1000 > p.credits) return no('You cannot afford that many cycles.');
  if (p.extraShieldOn) return no('Lower the extra shield first.');
  if (p.refit) cancelRefit(s);
  p.credits -= n * 1000;
  p.docked = false;
  p.vx = 0;
  p.vy = 0;
  p.refit = { total: n, remaining: n };
  emit({ t: 'comms', text: 'Refit started. Do not move. O cancels.' });
  return ok(`Refit started: ${n} cycles.`);
}

// --- Bank -----------------------------------------------------------------

export const LOAN_LIMIT = 20000;

export const ACCOUNTS = [
  { type: 1, label: '+5% every month', min: 0 },
  { type: 2, label: '+$200 every month', min: 0 },
  { type: 3, label: 'min $10,000: +10% every month', min: 10000 },
  { type: 4, label: 'min $50,000: +15% every month', min: 50000 },
  { type: 5, label: 'min $100,000: +30% every month, -2.5% on withdrawal', min: 100000 },
];

export function borrow(s: GameState, amount: number): Result {
  const room = LOAN_LIMIT - s.bank.loan;
  const take = Math.min(amount, room);
  if (take <= 0) return no(room <= 0 ? 'You have reached your loan limit.' : 'Nothing borrowed.');
  s.bank.loan += take;
  s.player.credits += take;
  return ok(`You borrowed $${Math.floor(take)}. Interest is 5% a day.`);
}

export function repay(s: GameState, amount: number): Result {
  const b = s.bank;
  if (amount <= 0) return no('Nothing repaid.');
  if (b.loan < 1) return no('You have no debt.');
  if (amount > s.player.credits) return no('You do not have that much.');
  const paid = Math.min(amount, b.loan);
  b.loan -= paid;
  s.player.credits -= paid;
  if (b.loan < 1) {
    b.loan = 0;
    return ok('Your loan is fully repaid.');
  }
  return ok(`You still owe $${Math.floor(b.loan)}.`);
}

export function openAccount(s: GameState, type: number, deposit: number): Result {
  const b = s.bank;
  if (b.hasAccount) return no('You already have an account.');
  if (b.loan >= 1) return no('You must repay your loan first.');
  const account = ACCOUNTS.find((a) => a.type === type);
  if (!account) return no('No such account.');
  if (deposit < account.min || deposit <= 0) return no('That is too little for this account.');
  if (deposit > s.player.credits) return no('You do not have that much.');
  s.player.credits -= deposit;
  b.savings = deposit;
  b.accountType = type;
  b.hasAccount = true;
  b.wrongPins = 0;
  const digit = () => randomInt(s, 1, 8);
  b.pin = digit() * 1000 + digit() * 100 + digit() * 10 + digit();
  return ok(`Your PIN is ${b.pin}. Remember it well!`);
}

/** The original's quirky rules: two wrong tries are forgiven, the third loses the lot. 1221 is the backdoor. */
export function checkPin(s: GameState, pin: number): Result {
  const b = s.bank;
  if (!b.hasAccount) return no('You have no account.');
  if (pin === 1221) {
    b.savings += 1000;
    return no(`Backdoor! +$1000. The PIN is ${b.pin}.`);
  }
  if (pin !== b.pin) {
    if (b.wrongPins >= 2) {
      b.hasAccount = false;
      b.savings = 0;
      b.wrongPins = 0;
      return no('Too many wrong PINs. You lost your account and your money!');
    }
    b.wrongPins++;
    return no('That PIN is wrong.');
  }
  b.wrongPins = 0;
  return ok('PIN accepted.');
}

/** 123123 meant "everything" in the original and still does. */
export const ALL_MONEY = 123123;

export function deposit(s: GameState, amount: number): Result {
  const b = s.bank;
  const p = s.player;
  const value = amount === ALL_MONEY ? p.credits : amount;
  if (value <= 0) return no('Nothing deposited.');
  if (value > p.credits) return no('You do not have that much.');
  p.credits -= value;
  b.savings += value;
  return ok(`Deposited $${Math.floor(value)}.`);
}

export function withdraw(s: GameState, amount: number): Result {
  const b = s.bank;
  const closing = amount === ALL_MONEY;
  const value = closing ? b.savings : amount;
  if (value <= 0) return no('Nothing withdrawn.');
  if (value > b.savings) return no('You do not have that much saved.');
  b.savings -= value;
  const payout = b.accountType === 5 ? value * 0.975 : value;
  s.player.credits += payout;
  if (closing) {
    b.hasAccount = false;
    b.accountType = 0;
    return ok(`Withdrew $${Math.floor(payout)}. Account closed.`);
  }
  return ok(`Withdrew $${Math.floor(payout)}.`);
}

// --- Flight-computer actions that take typed values -------------------------

export function hyperjump(s: GameState, what: 1 | 2, dx: number, dy: number): Result {
  const p = s.player;
  if (dx === 123123 && dy === 321321) {
    s.secretReport = true; // The original's secret code unlocks the second report page.
    return ok('...access granted.');
  }
  if (p.hyperCharge < 100) return no('Hyperdrive is still charging.');
  const reach = p.shipLevel * 100 + 200;
  const x = Math.max(-reach, Math.min(reach, dx));
  const y = Math.max(-reach, Math.min(reach, dy));
  if (what === 2 && !s.rocket) return no('You have no rocket in flight.');
  p.energy -= 0.25 * p.maxEnergy;
  if (what === 1) {
    p.x += x;
    p.y += y;
  } else if (s.rocket) {
    s.rocket.x += x;
    s.rocket.y += y;
  }
  p.hyperCharge = 0;
  emit({ t: 'hyper' });
  return ok('Jump complete.');
}

export function setAutopilot(s: GameState, x: number, y: number, speed: number): Result {
  if (speed <= 0) {
    s.player.autopilot = null;
    return ok('Autopilot off.');
  }
  s.player.autopilot = { x, y, speed };
  return ok('Autopilot engaged.');
}

export function launchAimed(
  s: GameState,
  opts: { x: number; y: number; fuse: number; powerPercent: number; timeBomb: boolean },
): Result {
  const p = s.player;
  if (p.rockets < 1) return no('You have no rockets.');
  if (s.rocket) return no('A rocket is already in flight.');
  const power = Math.max(0.01, opts.powerPercent / 100);
  const destX = opts.timeBomb ? p.x : opts.x;
  const destY = opts.timeBomb ? p.y : opts.y;
  p.energy -= power * 10;
  p.rockets -= 1;
  s.rocket = {
    x: p.x, y: p.y, destX, destY, age: 0,
    fuse: opts.fuse > 0 ? opts.fuse : 10000,
    power, timeBomb: opts.timeBomb, free: true,
    startDist: Math.hypot(destX - p.x, destY - p.y),
  };
  emit({ t: 'rocketLaunch' });
  return ok('Rocket away.');
}

export function startBeam(s: GameState, dx: number, dy: number): Result {
  const p = s.player;
  if (!p.hasBeam) return no('You do not own a tractor beam.');
  if (!s.target) return no('You need a target for the beam.');
  if (p.extraShieldOn) return no('The beam cannot fire through the extra shield.');
  p.energy -= 20;
  p.beam = { dx, dy };
  return ok('Tractor beam on.');
}

/** The cheat prompt behind the secret report (label 86). */
export function applyCheat(
  s: GameState,
  v: { savings: number; ship: number; laser: number; rocket: number; rockets: number; tanks: number; shield: number; energy: number },
): void {
  const p = s.player;
  s.bank.savings = v.savings;
  p.shipLevel = v.ship;
  p.laserLevel = v.laser;
  p.rocketLevel = v.rocket;
  p.rockets = v.rockets;
  p.fuelTanks = v.tanks;
  p.maxShield = v.shield;
  p.maxEnergy = v.energy;
}

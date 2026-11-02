// The station menu and in-flight computer screens. Text is the original's Dutch prompts in English.

import {
  ACCOUNTS, ALL_MONEY, applyCheat, borrow, buy, checkPin, deposit, EQUIPMENT, hyperjump, launchAimed,
  openAccount, repay, setAutopilot, setFrequency, startBeam, startRefit, UPGRADES, withdraw, type Result,
  type ShopItem,
} from '../core/economy';
import { isInBay, maxFrequency } from '../core/sim';
import type { GameState } from '../core/state';
import { money } from '../render/hud';
import { FormModal, MenuModal, type MenuRow, type ModalHost, TextModal } from './modals';

export function openStationMenu(host: ModalHost, s: GameState): void {
  host.push(new MenuModal(host, 'STATION', () => [
    { label: 'Bank', run: () => openBank(host, s) },
    { label: 'Upgrades', run: () => openShop(host, s, 'UPGRADES', UPGRADES) },
    { label: 'Equipment', run: () => openShop(host, s, 'EQUIPMENT', EQUIPMENT) },
    { label: 'Frequencies', run: () => openFrequencies(host, s) },
    { label: 'Auto systems', run: () => openAutos(host, s) },
    { label: 'Refit in the bay', value: isInBay(s) ? '' : 'park in the bay', run: () => openRefit(host, s) },
    { label: 'Back', run: () => host.pop() },
  ], () => `Credits: ${money(s.player.credits)}`));
}

function openShop(host: ModalHost, s: GameState, title: string, items: ShopItem[]): void {
  host.push(new MenuModal(host, title, () => {
    const rows: MenuRow[] = items.map((item) => ({
      label: `${item.label}  $${item.price}`,
      value: item.value(s),
      disabled: s.player.credits < item.price,
      run: () => buy(s, item),
    }));
    rows.push({ label: 'Back', run: () => host.pop() });
    return rows;
  }, () => `Credits: ${money(s.player.credits)}.  Max frequency rises with ship level: now ${Math.floor(maxFrequency(s))}.`));
}

function openFrequencies(host: ModalHost, s: GameState): void {
  const p = s.player;
  const edit = (label: string, which: 'laser' | 'beam' | 'shield', current: number): MenuRow => ({
    label,
    value: String(current),
    run: () => {
      host.push(new FormModal(host, `SET ${label.toUpperCase()}`,
        `Enter 1 to ${Math.floor(maxFrequency(s))}.`,
        [{ label: 'Frequency', initial: String(current) }],
        ([v]) => setFrequency(s, which, v)));
    },
  });
  host.push(new MenuModal(host, 'FREQUENCIES', () => [
    edit('Laser', 'laser', p.laserFreq),
    edit('Tractor beam', 'beam', p.beamFreq),
    edit('Shield', 'shield', p.shieldFreq),
    { label: 'Back', run: () => host.pop() },
  ], () =>
    'Your laser only hits when it matches the enemy frequency. Enemy guns only hit when they can reach your shield frequency, so tune your shield above what they can reach.'));
}

function openAutos(host: ModalHost, s: GameState): void {
  const p = s.player;
  const toggle = (label: string, get: () => boolean, set: (v: boolean) => void): MenuRow => ({
    label,
    value: get() ? 'ON' : 'off',
    run: () => set(!get()),
  });
  host.push(new MenuModal(host, 'AUTO SYSTEMS', () => [
    toggle('Auto laser', () => p.autoLaser, (v) => { p.autoLaser = v; }),
    toggle('Auto frequency', () => p.autoFreq, (v) => { p.autoFreq = v; }),
    toggle('Auto rockets', () => p.autoRocket, (v) => { p.autoRocket = v; }),
    toggle('Auto refuel', () => p.autoRefuel, (v) => { p.autoRefuel = v; }),
    toggle('Auto repair (costs energy)', () => p.autoRepair, (v) => { p.autoRepair = v; }),
    {
      label: 'All on / off',
      run: () => {
        const on = !(p.autoLaser && p.autoFreq && p.autoRocket && p.autoRefuel);
        p.autoLaser = on;
        p.autoFreq = on;
        p.autoRocket = on;
        p.autoRefuel = on;
      },
    },
    { label: 'Back', run: () => host.pop() },
  ]));
}

function openRefit(host: ModalHost, s: GameState): Result | void {
  if (!isInBay(s)) return { ok: false, message: 'Too far: park inside the refit bay first.' };
  const p = s.player;
  host.push(new FormModal(host, 'REFIT',
    `Each cycle costs $1000 and adds +0.05 to ship, laser, rocket and extra shield levels, +1 shield and +1.5 energy. You have ${money(p.credits)}. The refit stops if you move or an enemy locks on.`,
    [{ label: 'Cycles', initial: '10' }],
    ([cycles]) => {
      const result = startRefit(s, cycles);
      if (!result.ok) return result.message;
      host.pop(); // Back out of the station so the refit can run.
      host.pop();
    }));
}

// --- Bank -------------------------------------------------------------------

function openBank(host: ModalHost, s: GameState): void {
  const b = s.bank;
  const report = (r: Result) => r;
  host.push(new MenuModal(host, 'BANK', () => [
    {
      label: 'Borrow',
      value: b.loan > 0 ? `debt ${money(b.loan)}` : 'max $20,000',
      run: () => {
        host.push(new FormModal(host, 'BORROW', 'How much? The maximum debt is $20,000. Interest is 5% every day, and if you cannot pay, collectors hit your shield.',
          [{ label: 'Amount' }], ([v]) => reportNote(host, borrow(s, v))));
      },
    },
    {
      label: 'Open savings account',
      disabled: b.hasAccount,
      value: b.hasAccount ? 'open' : '',
      run: () => openAccounts(host, s),
    },
    {
      label: 'Deposit / withdraw',
      disabled: !b.hasAccount,
      run: () => {
        host.push(new FormModal(host, 'ENTER PIN', 'What is your PIN? Three wrong tries lose your account and all the money in it.',
          [{ label: 'PIN' }], ([pin]) => {
            const check = checkPin(s, pin);
            if (check.ok) {
              openAccountActions(host, s);
              return;
            }
            reportNote(host, check);
          }));
      },
    },
    {
      label: 'Repay loan',
      disabled: b.loan < 1,
      value: b.loan > 0 ? money(b.loan) : '',
      run: () => {
        host.push(new FormModal(host, 'REPAY', `You owe ${money(b.loan)} and have ${money(s.player.credits)}.`,
          [{ label: 'Amount', initial: String(Math.floor(Math.min(b.loan, s.player.credits))) }],
          ([v]) => reportNote(host, report(repay(s, v)))));
      },
    },
    { label: 'Balance', value: b.hasAccount ? money(b.savings) : 'no account', run: () => {} },
    { label: 'Back', run: () => host.pop() },
  ], () => `You have ${money(s.player.credits)}.`));
}

/** Shows a one-off result on its own page, because a bank form has closed by this point. */
function reportNote(host: ModalHost, result: Result): void {
  host.push(new TextModal(host, result.ok ? 'BANK' : 'BANK: REFUSED', () => [result.message, ''], undefined, 400));
}

function openAccounts(host: ModalHost, s: GameState): void {
  host.push(new MenuModal(host, 'SAVINGS ACCOUNTS', () => [
    ...ACCOUNTS.map((a): MenuRow => ({
      label: a.label,
      run: () => {
        host.push(new FormModal(host, 'DEPOSIT', `How much do you want to deposit? You have ${money(s.player.credits)}.`,
          [{ label: 'Amount', initial: String(a.min || 1000) }],
          ([v]) => {
            const result = openAccount(s, a.type, v);
            if (result.ok) host.pop();
            reportNote(host, result);
          }));
      },
    })),
    { label: 'Back', run: () => host.pop() },
  ], undefined, 440));
}

function openAccountActions(host: ModalHost, s: GameState): void {
  const b = s.bank;
  host.push(new MenuModal(host, 'YOUR ACCOUNT', () => [
    {
      label: 'Deposit',
      run: () => {
        host.push(new FormModal(host, 'DEPOSIT', `You have ${money(s.player.credits)}. Type ${ALL_MONEY} for all of it.`,
          [{ label: 'Amount' }], ([v]) => reportNote(host, deposit(s, v))));
      },
    },
    {
      label: 'Withdraw',
      run: () => {
        host.push(new FormModal(host, 'WITHDRAW',
          `${money(b.savings)} is saved. Type ${ALL_MONEY} to take everything and close the account.`,
          [{ label: 'Amount' }], ([v]) => {
            const result = withdraw(s, v);
            if (!b.hasAccount) host.pop();
            reportNote(host, result);
          }));
      },
    },
    { label: 'Back', run: () => host.pop() },
  ], () => `Balance ${money(b.savings)}. Credits ${money(s.player.credits)}.`));
}

// --- Flight computer --------------------------------------------------------

export function openAutopilot(host: ModalHost, s: GameState): void {
  const a = s.player.autopilot;
  host.push(new FormModal(host, 'AUTOPILOT', 'Enter a destination. Speed 0 switches the autopilot off. Your speed limit still applies.',
    [
      { label: 'X', initial: String(a?.x ?? '') },
      { label: 'Y', initial: String(a?.y ?? '') },
      { label: 'Speed', initial: String(a?.speed ?? Math.floor(s.player.maxSpeed)) },
    ],
    ([x, y, speed]) => {
      setAutopilot(s, x, y, speed);
    }));
}

export function openHyperjump(host: ModalHost, s: GameState): void {
  const reach = s.player.shipLevel * 100 + 200;
  host.push(new FormModal(host, 'HYPERDRIVE',
    `Jump relative to your current position, up to ${reach} on each axis. It uses a quarter of your max energy. Target 1 moves your ship, 2 moves your rocket.`,
    [
      { label: 'Target (1/2)', initial: '1' },
      { label: 'X offset' },
      { label: 'Y offset' },
    ],
    ([what, x, y]) => {
      const result = hyperjump(s, what === 2 ? 2 : 1, x, y);
      if (!result.ok) return result.message;
    }));
}

export function openRocketForm(host: ModalHost, s: GameState): void {
  host.push(new FormModal(host, 'AIM ROCKET',
    'No target is locked, so aim by hand. It explodes at X,Y or when the fuse runs out. Power 200 is a normal blast and costs energy. Time bomb 1 leaves it here until the fuse ends.',
    [
      { label: 'X', initial: String(Math.round(s.player.x + 1000)) },
      { label: 'Y', initial: String(Math.round(s.player.y)) },
      { label: 'Fuse (ticks)', initial: '10000' },
      { label: 'Power %', initial: '200' },
      { label: 'Time bomb', initial: '0' },
    ],
    ([x, y, fuse, powerPercent, bomb]) => {
      const result = launchAimed(s, { x, y, fuse, powerPercent, timeBomb: bomb === 1 });
      if (!result.ok) return result.message;
    }));
}

export function openBeamForm(host: ModalHost, s: GameState): string | void {
  const p = s.player;
  if (p.beam) {
    p.beam = null;
    return;
  }
  if (!p.hasBeam) return 'You do not own a tractor beam. Buy one at the station.';
  if (!s.target) return 'The tractor beam needs a target.';
  if (p.extraShieldOn) return 'The beam cannot fire through the extra shield.';
  host.push(new FormModal(host, 'TRACTOR BEAM',
    `Sets which way to drag the target: it moves by 1% of X,Y each tick. Beam frequency must be at or above the target's, and yours is ${p.beamFreq}. Costs 20 energy.`,
    [
      { label: 'X', initial: '0' },
      { label: 'Y', initial: '0' },
    ],
    ([x, y]) => {
      const result = startBeam(s, x, y);
      if (!result.ok) return result.message;
    }));
}

const n = (v: number, digits = 0) => v.toFixed(digits);

export function openReport(host: ModalHost, s: GameState): void {
  const p = s.player;
  const b = s.base;
  const c = s.clock;
  const lines = [
    `The time is ${c.minute}:00, the date is ${c.day}-${c.month}-${c.year}.`,
    `You are at ${n(p.x)} x, ${n(p.y)} y. Hyperdrive ready in ${n(100 - p.hyperCharge)} sec.`,
    '',
    `Energy ${n(p.energy)} of ${n(p.maxEnergy)}.   Shield ${n(p.shield)} of ${n(p.maxShield)}.`,
    `Damage ${n(p.damage, 1)}.   Speed limit ${n(p.maxSpeed)}.`,
    `Ship level ${n(p.shipLevel, 2)}.  Rocket level ${n(p.rocketLevel, 2)}.  Laser level ${n(p.laserLevel, 2)}.`,
    '',
    `You have ${money(p.credits)}, and ${money(s.bank.savings)} in savings.`,
    `Debt: ${money(s.bank.loan)}.`,
    `You have ${n(Math.floor(p.rockets))} rockets and ${n(Math.floor(p.fuelTanks))} energy tanks.`,
    `Extra shields ${n(Math.floor(p.extraShields))}, level ${n(p.extraShieldLevel, 2)}, holding ${n(p.extraShieldOn ? p.extraShieldHold : 0)}.`,
    '',
    `Base energy ${n(b.energy)}.  Base shield ${n(b.shield)}.  Base damage ${n(b.damage)}.`,
    `Enemy bases destroyed: ${s.basesDestroyed}.`,
    '',
  ];
  host.push(new TextModal(host, 'REPORT', () => lines, (key) => {
    if (!s.secretReport) return false;
    host.pop();
    openSecretReport(host, s);
    return key === '' ? false : true;
  }));
}

function openSecretReport(host: ModalHost, s: GameState): void {
  const e = s.enemies;
  const row = (name: string, x: typeof e.cruiser) =>
    `${name.padEnd(10)} ${n(x.x).padStart(7)},${n(x.y).padStart(7)}  lv${n(x.level)}  sh ${n(x.shield)}  dm ${n(x.damage)}  fr ${x.freq}`;
  const lines = [
    `PIN: ${s.bank.pin}`,
    '',
    row('Cruiser', e.cruiser),
    row('Raider', e.fighter1),
    row('Hunter', e.fighter2),
    row('Enemy base', e.enemyBase),
    '',
    `Crate at ${s.crate.x}, ${s.crate.y}`,
    '',
    'Press ` to change your stats.',
    '',
  ];
  host.push(new TextModal(host, 'SECRET REPORT', () => lines, (key) => {
    if (key !== '`') return false;
    host.pop();
    const p = s.player;
    host.push(new FormModal(host, 'CHEAT', 'You found the cheat menu.', [
      { label: 'Savings', initial: n(s.bank.savings) },
      { label: 'Ship level', initial: n(p.shipLevel, 2) },
      { label: 'Laser level', initial: n(p.laserLevel, 2) },
      { label: 'Rocket level', initial: n(p.rocketLevel, 2) },
      { label: 'Rockets', initial: n(p.rockets) },
      { label: 'Tanks', initial: n(p.fuelTanks) },
      { label: 'Max shield', initial: n(p.maxShield) },
      { label: 'Max energy', initial: n(p.maxEnergy) },
    ], ([savings, ship, laser, rocket, rockets, tanks, shield, energy]) => {
      applyCheat(s, { savings, ship, laser, rocket, rockets, tanks, shield, energy });
    }));
    return true;
  }));
}

export const HELP_LINES = [
  '# FLIGHT',
  'W A D X   thrust up, left, right, down    Q E Z C   thrust diagonally',
  'Arrows    thrust as well                  S / Space stop dead',
  'L / K     raise / lower speed limit       ]         autopilot',
  'T         hyperdrive jump                 1 / 2     view home / view ship',
  '',
  '# COMBAT',
  'J         lasers on / off                 P         arm rocket launcher',
  'U         extra shield on / off           Tab / Y   lock next target / clear lock',
  'N M       tune laser frequency            V B       tune shield frequency',
  'F         tractor beam (once bought)',
  '',
  '# SHIP',
  'O         dock (stopped, by the ring) or undock; also cancels a refit',
  'I         station menu (when docked, or anywhere with a multicom)',
  '9         open / close solar panels (charge up, but slow and exposed)',
  '[         use an energy tank              5         status report',
  '6         radio on / off                  4 / Esc   pause',
  '',
  '# HINTS',
  'Lasers only hit on the enemy frequency, and enemies only hit you if',
  'they can reach your shield frequency. Tune it above them, or buy auto',
  'frequency. The force walls kill without an extra shield. Avoid Earth.',
  '',
];

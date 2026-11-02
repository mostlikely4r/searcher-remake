// Cockpit display: gauges, radio, target readout and sector map.
// Replaces the original's unlabelled bars while showing the same values.

import { CHAR_W, drawText, drawTextCentered, drawTextRight, wrapText } from './font';
import { EARTH, ENEMY_NAMES, type GameState, MOON, WALL } from '../core/state';
import { maxFrequency } from '../core/sim';
import { SCREEN_H, SCREEN_W } from './renderer';

const PANEL = 'rgba(6, 9, 22, 0.86)';
const EDGE = '#2a3a5c';
const LABEL = '#7f93bd';
const VALUE = '#d8e4ff';
const GOOD = '#4adf8a';
const WARN = '#ffc93c';
const BAD = '#ff5a48';

export function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill = PANEL, edge = EDGE): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = edge;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

function gauge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  label: string, fraction: number, color: string, readout: string,
): void {
  drawText(ctx, label, x, y, LABEL);
  drawTextRight(ctx, readout, x + w, y, VALUE);
  const by = y + 9;
  ctx.fillStyle = '#121a30';
  ctx.fillRect(x, by, w, 4);
  const f = Math.max(0, Math.min(1, fraction));
  ctx.fillStyle = color;
  ctx.fillRect(x, by, Math.round(w * f), 4);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x, by, Math.round(w * f), 1);
}

const levelColor = (fraction: number) => (fraction > 0.5 ? GOOD : fraction > 0.25 ? WARN : BAD);

export const money = (n: number): string => {
  const whole = Math.floor(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}$${whole}`;
};

export interface CommsLine {
  text: string;
  urgent: boolean;
  /** Frames left on screen. */
  life: number;
}

export function drawHud(ctx: CanvasRenderingContext2D, s: GameState, comms: readonly CommsLine[], time: number): void {
  drawCockpit(ctx, s, time);
  drawComms(ctx, comms, time);
  drawSectorMap(ctx, s, time);
  drawTargetPanel(ctx, s);
  drawTracer(ctx, s, time);
  drawStatusTags(ctx, s, time);
}

function drawCockpit(ctx: CanvasRenderingContext2D, s: GameState, time: number): void {
  const p = s.player;
  const y = SCREEN_H - 50;
  panel(ctx, 0, y, SCREEN_W, 50);

  const col1 = 6;
  const w1 = 128;
  const eF = p.energy / p.maxEnergy;
  gauge(ctx, col1, y + 3, w1, 'ENERGY', eF, levelColor(eF), `${Math.floor(p.energy)}/${Math.floor(p.maxEnergy)}`);
  const sF = p.shield / p.maxShield;
  gauge(ctx, col1, y + 18, w1, 'SHIELD', sF, levelColor(sF), `${Math.floor(p.shield)}/${Math.floor(p.maxShield)}`);
  const hullColor = p.damage > 66 ? BAD : p.damage > 33 ? WARN : GOOD;
  gauge(ctx, col1, y + 33, w1, 'HULL', 1 - p.damage / 100, hullColor, `${Math.max(0, Math.floor(100 - p.damage))}%`);

  const col2 = 146;
  const w2 = 106;
  const speed = Math.max(Math.abs(p.vx), Math.abs(p.vy));
  gauge(ctx, col2, y + 3, w2, 'SPEED', p.maxSpeed > 0 ? speed / p.maxSpeed : 0, '#5aa0ff', `${Math.round(speed)}/${Math.round(p.maxSpeed)}`);
  const ready = p.laserCharge > 99;
  gauge(ctx, col2, y + 18, w2, 'LASER', p.laserCharge / Math.max(100, 25 * p.shipLevel), ready ? GOOD : WARN, ready ? 'READY' : '...');
  const hyperReady = p.hyperCharge >= 100;
  gauge(ctx, col2, y + 33, w2, 'HYPER', p.hyperCharge / 100, hyperReady ? GOOD : '#c77bff', hyperReady ? 'READY' : `${Math.floor(p.hyperCharge)}%`);

  const col3 = 264;
  const items: Array<[string, number, string]> = [
    ['ROCKET', Math.floor(p.rockets), p.rockets < 1 ? BAD : VALUE],
    ['TANK', Math.floor(p.fuelTanks), p.fuelTanks < 1 ? BAD : VALUE],
    ['XSHLD', Math.floor(p.extraShields), p.extraShields < 1 ? BAD : VALUE],
  ];
  items.forEach(([label, count, color], i) => {
    drawText(ctx, label, col3, y + 5 + i * 15, LABEL);
    drawTextRight(ctx, String(count), col3 + 60, y + 5 + i * 15, color);
  });

  const col4 = 336;
  const mx = Math.floor(maxFrequency(s));
  drawText(ctx, `LASER FR ${pad2(p.laserFreq)}`, col4, y + 5, LABEL);
  drawText(ctx, `SHIELD FR ${pad2(p.shieldFreq)}`, col4, y + 20, LABEL);
  drawText(ctx, `MAX FR ${pad2(mx)}`, col4, y + 35, LABEL);

  const col5 = 442;
  drawText(ctx, money(p.credits), col5, y + 5, WARN);
  const c = s.clock;
  drawText(ctx, `${c.day}-${c.month}-${c.year}`, col5, y + 20, LABEL);
  drawText(ctx, `X ${Math.round(p.x)}  Y ${Math.round(p.y)}`, col5, y + 35, VALUE);

  if (s.player.shield < p.maxShield / 4 && time % 20 < 10) {
    ctx.fillStyle = 'rgba(255,60,50,0.14)';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function drawComms(ctx: CanvasRenderingContext2D, comms: readonly CommsLine[], time: number): void {
  if (comms.length === 0) return;
  const w = 340;
  const lines: Array<{ text: string; urgent: boolean }> = [];
  for (const m of comms) for (const text of wrapText(m.text, w - 14)) lines.push({ text, urgent: m.urgent });
  const h = lines.length * 10 + 7;
  panel(ctx, 4, 4, w, h);
  lines.forEach((line, i) => {
    const color = line.urgent ? (time % 20 < 12 ? BAD : '#ffb0a0') : '#a8e8c0';
    drawText(ctx, line.text, 10, 8 + i * 10, color);
  });
}

function drawSectorMap(ctx: CanvasRenderingContext2D, s: GameState, time: number): void {
  const size = 76;
  const x0 = SCREEN_W - size - 4;
  const y0 = 4;
  panel(ctx, x0, y0, size, size);
  const range = WALL.outer * 1.1;
  const mx = (x: number) => Math.round(x0 + size / 2 + (x / range) * (size / 2));
  const my = (y: number) => Math.round(y0 + size / 2 - (y / range) * (size / 2));

  // Force walls as an outline, with the gate gap on the left.
  ctx.fillStyle = '#2d8a55';
  const l = mx(-WALL.inner);
  const r = mx(WALL.inner);
  const t = my(WALL.inner);
  const b = my(-WALL.inner);
  ctx.fillRect(l, t, r - l + 1, 1);
  ctx.fillRect(l, b, r - l + 1, 1);
  ctx.fillRect(r, t, 1, b - t + 1);
  const mid = my(0);
  ctx.fillRect(l, t, 1, mid - t - 1);
  ctx.fillRect(l, mid + 2, 1, b - mid - 1);

  const dot = (x: number, y: number, color: string, n = 2) => {
    ctx.fillStyle = color;
    ctx.fillRect(mx(x) - (n >> 1), my(y) - (n >> 1), n, n);
  };
  dot(0, 0, '#4adf8a', 3);
  if (s.moonAlive) dot(MOON.x, MOON.y, '#a4a9b8');
  if (s.earthAlive) dot(EARTH.x, EARTH.y, '#3c8cf0', 3);
  dot(s.crate.x, s.crate.y, '#ffc93c', 1);
  if (s.enemyBaseFound || s.player.hasTracer) {
    const e = s.enemies.enemyBase;
    dot(Math.max(-range, Math.min(range, e.x)), Math.max(-range, Math.min(range, e.y)), BAD, 3);
  }
  if (s.player.hasTracer) {
    for (const id of ['cruiser', 'fighter1', 'fighter2'] as const) {
      const e = s.enemies[id];
      if (Math.abs(e.x) < range && Math.abs(e.y) < range) dot(e.x, e.y, '#ff8a70', 1);
    }
  }
  if (time % 16 < 12) {
    dot(Math.max(-range, Math.min(range, s.player.x)), Math.max(-range, Math.min(range, s.player.y)), '#ffffff', 2);
  }
}

function drawTargetPanel(ctx: CanvasRenderingContext2D, s: GameState): void {
  if (!s.target) return;
  const e = s.enemies[s.target];
  const w = 120;
  const x = SCREEN_W - w - 4;
  const y = 84;
  panel(ctx, x, y, w, 66, PANEL, '#6e2028');
  drawText(ctx, ENEMY_NAMES[s.target], x + 5, y + 4, BAD);
  drawTextRight(ctx, `L${e.level}`, x + w - 5, y + 4, LABEL);
  if (s.manualLock) drawTextRight(ctx, 'LOCK', x + w - 22, y + 4, WARN);
  const maxDamage = s.target === 'fighter2' ? 600 : s.target === 'fighter1' ? 200 : 100;
  gauge(ctx, x + 5, y + 14, w - 10, 'SHIELD', e.shield / e.shieldCap, '#5aa0ff', String(Math.max(0, Math.floor(e.shield))));
  gauge(ctx, x + 5, y + 29, w - 10, 'DAMAGE', e.damage / maxDamage, BAD, `${Math.floor((e.damage / maxDamage) * 100)}%`);
  const match = s.player.laserFreq === e.freq;
  drawText(ctx, `FREQ ${pad2(e.freq)}`, x + 5, y + 46, LABEL);
  drawText(ctx, match ? 'MATCH' : `YOU ${pad2(s.player.laserFreq)}`, x + 5, y + 55, match ? GOOD : WARN);
}

/** Finishes the "not in work" tracer: arrows on the screen edge toward enemies out of view. */
function drawTracer(ctx: CanvasRenderingContext2D, s: GameState, time: number): void {
  if (!s.player.hasTracer || time % 20 > 14) return;
  const p = s.player;
  const cx = SCREEN_W / 2;
  const cy = (SCREEN_H - 50) / 2;
  const ids = ['enemyBase', 'cruiser', 'fighter1', 'fighter2'] as const;
  for (const id of ids) {
    const e = s.enemies[id];
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    if (Math.abs(dx) < 800 && Math.abs(dy) < 450) continue;
    const dist = Math.hypot(dx, dy);
    if (dist > 60000) continue;
    const a = Math.atan2(-dy, dx);
    const ax = Math.round(cx + Math.cos(a) * 150);
    const ay = Math.round(cy + Math.sin(a) * 110);
    ctx.fillStyle = id === 'enemyBase' ? BAD : '#ff8a70';
    ctx.fillRect(ax - 1, ay - 1, 3, 3);
    ctx.fillRect(Math.round(ax + Math.cos(a) * 3), Math.round(ay + Math.sin(a) * 3), 2, 2);
    const label = `${ENEMY_NAMES[id]} ${Math.round(dist / 100) / 10}k`;
    drawTextCentered(ctx, label, ax, ay + 5, '#ffb0a0');
  }
}

function drawStatusTags(ctx: CanvasRenderingContext2D, s: GameState, time: number): void {
  const p = s.player;
  const tags: Array<[string, string]> = [];
  if (p.docked) tags.push(['DOCKED', GOOD]);
  if (p.refit) tags.push([`REFIT ${p.refit.total - p.refit.remaining}/${p.refit.total}`, GOOD]);
  if (p.autopilot) tags.push([`AUTO ${Math.round(p.autopilot.x)},${Math.round(p.autopilot.y)}`, '#5aa0ff']);
  if (p.solar === 1) tags.push(['SOLAR OPEN', WARN]);
  if (p.solar > 1) tags.push(['SOLAR CLOSING', LABEL]);
  if (p.extraShieldOn) tags.push([`XSHIELD ${Math.max(0, Math.floor(p.extraShieldHold))}`, WARN]);
  if (p.laserOn || p.laserRefire) tags.push(['LASERS ON', WARN]);
  if (p.launcherArmed) tags.push(['LAUNCHER ARMED', BAD]);
  if (p.beam) tags.push(['TRACTOR', '#ff70b0']);
  if (s.rocket) {
    const r = s.rocket;
    if (r.timeBomb) {
      tags.push([`BOMB ${Math.max(0, r.fuse - r.age)}`, BAD]);
    } else {
      const d = Math.hypot(r.x - r.destX, r.y - r.destY);
      tags.push([`ROCKET ${r.startDist > 0 ? Math.round((d / r.startDist) * 100) : 0}%`, BAD]);
    }
  }
  if (s.gravity > 0 && time % 16 < 10) tags.push(['GRAVITY WELL', BAD]);
  if (s.viewHome) tags.push(['VIEW: HOME (2 = back)', LABEL]);
  if (!s.comms.enabled) tags.push(['RADIO OFF', LABEL]);

  let x = 4;
  const y = SCREEN_H - 62;
  for (const [text, color] of tags) {
    const w = text.length * CHAR_W + 6;
    ctx.fillStyle = PANEL;
    ctx.fillRect(x, y, w, 11);
    drawText(ctx, text, x + 3, y + 2, color);
    x += w + 3;
  }
}

// Draws the game world at 640x360. World coordinates are y-up with 1000 units per screen height,
// the same scale as the original's WINDOW, so every distance in the rules looks as it did.

import { drawText, drawTextCentered } from './font';
import type { BeamKind, GameEvent } from '../core/events';
import { BAY, DOCK, EARTH, type GameState, MOON, WALL } from '../core/state';
import {
  ball, buildCruiser, buildEarth, buildFighters, buildGlow, buildMoon, buildNebula, buildStarLayer,
  buildStation, buildWallPattern, ENEMY_PALETTE, fillDisc, HEADINGS, HOME_PALETTE, makeCanvas,
} from './sprites';

export const SCREEN_W = 640;
export const SCREEN_H = 360;
export const WORLD_SCALE = 0.36;

const BEAM_STYLE: Record<BeamKind, { core: string; glow: string; life: number; width: number }> = {
  player: { core: '#fff2a0', glow: '#ffc93c', life: 4, width: 1 },
  cruiser: { core: '#ffb0a0', glow: '#ff4a3c', life: 2, width: 1 },
  cruiserHeavy: { core: '#ffffff', glow: '#ff3030', life: 6, width: 2 },
  raider: { core: '#ffb0a0', glow: '#ff4a3c', life: 3, width: 1 },
  hunter: { core: '#c8ffd0', glow: '#2dd468', life: 4, width: 1 },
  enemyBase: { core: '#ffc9a0', glow: '#ff7a30', life: 2, width: 1 },
  base: { core: '#c0e4ff', glow: '#3c9cff', life: 3, width: 1 },
  tractor: { core: '#ffc0e0', glow: '#ff3090', life: 2, width: 1 },
};

interface Beam { kind: BeamKind; x1: number; y1: number; x2: number; y2: number; life: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; ramp: string[] }
interface Ring { x: number; y: number; radius: number; maxRadius: number; color: string }
interface FloatText { x: number; y: number; text: string; life: number; color: string }
interface Snapshot { x: number; y: number }

/** The ship is 35% larger than true scale, so the shape-shifting can be seen at this resolution. */
const SHIP_ZOOM = 1.35;
const HUB_RAMP = ['#1a3a8a', '#3c8cf0', '#c8e4ff'] as const;
const POD_RAMP = ['#1c6e4a', '#4adf8a', '#d0ffe0'] as const;

const FIRE = ['#ffffff','#ffe27a', '#ffa13c', '#e8483c', '#7b1f2c', '#2a0f1c'];
const SPARK = ['#ffffff', '#c8e4ff', '#5aa0ff', '#2a4a9a'];
const EXHAUST = ['#ffffff', '#a8e8ff', '#3c9cff', '#1a3a8a'];

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  private readonly nebula = buildNebula(SCREEN_W, SCREEN_H);
  private readonly stars = [
    { canvas: buildStarLayer(SCREEN_W, SCREEN_H, 200, ['#3a4464', '#2c3550', '#4c4a6a'], 1), parallax: 0.015 },
    { canvas: buildStarLayer(SCREEN_W, SCREEN_H, 80, ['#7c88ae', '#a48cb0', '#6e9ab8'], 2), parallax: 0.035 },
    { canvas: buildStarLayer(SCREEN_W, SCREEN_H, 28, ['#ffffff', '#d4e4ff', '#ffe6c8'], 3, true), parallax: 0.07 },
  ];
  private readonly moon = buildMoon(Math.round(MOON.radius * WORLD_SCALE));
  private readonly earth = buildEarth(Math.round(EARTH.radius * WORLD_SCALE));
  private readonly home = buildStation(WORLD_SCALE, HOME_PALETTE, false);
  private readonly homeAlert = buildStation(WORLD_SCALE, HOME_PALETTE, true);
  private readonly enemyBase = buildStation(WORLD_SCALE, ENEMY_PALETTE, true);
  private readonly cruiser = buildCruiser(WORLD_SCALE);
  private readonly fighters = buildFighters();
  private readonly glows = {
    white: buildGlow(24, [190, 225, 255]),
    blue: buildGlow(24, [70, 150, 255]),
    red: buildGlow(24, [255, 80, 50]),
    amber: buildGlow(24, [255, 180, 60]),
    green: buildGlow(24, [70, 240, 130]),
    atmosphere: buildGlow(250, [60, 130, 255], 0.5),
  };
  private readonly wallPattern: CanvasPattern;

  cameraX = 430;
  cameraY = 0;
  private shake = 0;
  private time = 0;
  private shipAngle = -Math.PI / 2;
  private shipStretch = 0;

  private beams: Beam[] = [];
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private floats: FloatText[] = [];
  private headings = { raider: 0, hunter: 0 };
  private prev: Record<string, Snapshot> = {};

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    const pattern = ctx.createPattern(buildWallPattern(), 'repeat');
    if (!pattern) throw new Error('Could not create wall pattern');
    this.wallPattern = pattern;
  }

  /** Call before a simulation tick so drawing can interpolate between two states. */
  snapshot(s: GameState): void {
    const save = (key: string, o: { x: number; y: number }) => {
      const p = this.prev[key];
      if (p) {
        p.x = o.x;
        p.y = o.y;
      } else {
        this.prev[key] = { x: o.x, y: o.y };
      }
    };
    save('player', s.player);
    for (const [id, e] of Object.entries(s.enemies)) save(id, e);
    save('miner', s.miner);
    if (s.rocket) save('rocket', s.rocket);
    else delete this.prev.rocket;
  }

  /** Jumps the camera straight to the player (new game, load, hyperjump). */
  snapCamera(s: GameState): void {
    this.cameraX = s.player.x;
    this.cameraY = s.player.y;
    this.prev = {};
  }

  consume(events: readonly GameEvent[]): void {
    for (const e of events) {
      switch (e.t) {
        case 'beam':
          this.beams.push({ ...e, life: BEAM_STYLE[e.kind].life });
          break;
        case 'explosion':
          this.explode(e.x, e.y, e.size);
          break;
        case 'playerHit':
          this.shake = Math.min(6, this.shake + e.amount / 30);
          break;
        case 'pickup':
          this.floats.push({ x: e.x, y: e.y, text: `+$${e.amount}`, life: 45, color: '#ffe27a' });
          this.burst(e.x, e.y, 12, 3, FIRE);
          break;
        case 'enemyDestroyed':
          this.floats.push({ x: e.x, y: e.y, text: `+$${e.reward}`, life: 60, color: '#a2f0b0' });
          break;
        case 'delivery':
          this.burst(e.x, e.y, 8, 2, SPARK);
          break;
        case 'hyper':
          this.shake = 3;
          break;
        default:
          break;
      }
    }
  }

  private explode(x: number, y: number, size: number): void {
    const count = Math.min(140, 20 + size * 0.5);
    this.burst(x, y, count, Math.max(3, size * 0.05), FIRE);
    this.rings.push({ x, y, radius: 0, maxRadius: size, color: '#ffe27a' });
    if (size > 150) {
      this.rings.push({ x, y, radius: 0, maxRadius: size * 1.5, color: '#e8483c' });
      this.shake = Math.min(8, this.shake + size / 60);
    }
  }

  private burst(x: number, y: number, count: number, speed: number, ramp: string[]): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (0.2 + Math.random()) * speed * 2.5;
      const life = 12 + Math.floor(Math.random() * 22);
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, maxLife: life, ramp });
    }
  }

  /** Advances visual-only effects once per simulation tick. */
  stepEffects(s: GameState): void {
    this.time++;
    this.shake = Math.max(0, this.shake - 0.4);
    for (const b of this.beams) b.life--;
    this.beams = this.beams.filter((b) => b.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.rings) r.radius += Math.max(6, r.maxRadius / 14);
    this.rings = this.rings.filter((r) => r.radius < r.maxRadius);
    for (const f of this.floats) {
      f.life--;
      f.y += 2;
    }
    this.floats = this.floats.filter((f) => f.life > 0);

    const p = s.player;
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0 && !s.gameOver) {
      const count = speed > 12 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const spread = 8;
        this.particles.push({
          x: p.x - (p.vx / speed) * 24 + (Math.random() - 0.5) * spread,
          y: p.y - (p.vy / speed) * 24 + (Math.random() - 0.5) * spread,
          vx: -p.vx * 0.3 + (Math.random() - 0.5) * 2,
          vy: -p.vy * 0.3 + (Math.random() - 0.5) * 2,
          life: 10, maxLife: 10, ramp: EXHAUST,
        });
      }
    }
    if (s.rocket) {
      this.particles.push({
        x: s.rocket.x, y: s.rocket.y,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        life: 14, maxLife: 14, ramp: FIRE,
      });
    }
  }

  private sx(x: number): number {
    return Math.round(SCREEN_W / 2 + (x - this.cameraX) * WORLD_SCALE);
  }

  private sy(y: number): number {
    return Math.round(SCREEN_H / 2 - (y - this.cameraY) * WORLD_SCALE);
  }

  private lerp(key: string, o: { x: number; y: number }, alpha: number): Snapshot {
    const p = this.prev[key];
    if (!p || Math.abs(p.x - o.x) > 400 || Math.abs(p.y - o.y) > 400) return o;
    return { x: p.x + (o.x - p.x) * alpha, y: p.y + (o.y - p.y) * alpha };
  }

  /** Draws everything in world space. `alpha` is how far we are between the last two ticks. */
  draw(s: GameState, alpha: number, frameSeconds: number): void {
    const ctx = this.ctx;
    const player = this.lerp('player', s.player, alpha);
    const camX = s.viewHome ? 0 : player.x;
    const camY = s.viewHome ? 0 : player.y;
    const follow = Math.min(1, frameSeconds * 12);
    this.cameraX += (camX - this.cameraX) * follow;
    this.cameraY += (camY - this.cameraY) * follow;
    if (Math.abs(camX - this.cameraX) > 1500 || Math.abs(camY - this.cameraY) > 1500) {
      this.cameraX = camX;
      this.cameraY = camY;
    }

    ctx.save();
    if (this.shake > 0) {
      ctx.translate(Math.round((Math.random() - 0.5) * this.shake), Math.round((Math.random() - 0.5) * this.shake));
    }
    this.drawBackdrop();
    this.drawWalls(s);
    this.drawPlanets(s);
    this.drawHomeBase(s);
    this.drawEnemyBase(s);
    this.drawCrate(s);
    this.drawMiner(s, alpha);
    this.drawCruiser(s, alpha);
    this.drawFighter(s, 'fighter1', this.fighters.raider, 'raider', alpha);
    this.drawFighter(s, 'fighter2', this.fighters.hunter, 'hunter', alpha);
    this.drawRocket(s, alpha);
    this.drawDockLink(s, player);
    if (!s.gameOver) this.drawPlayer(s, player, frameSeconds);
    this.drawBeams();
    this.drawParticles();
    this.drawRings();
    this.drawFloats();
    ctx.restore();
  }

  drawBackdropOnly(): void {
    this.time++;
    this.drawBackdrop();
  }

  private drawBackdrop(): void {
    const ctx = this.ctx;
    this.tile(this.nebula, 0.008);
    for (const layer of this.stars) this.tile(layer.canvas, layer.parallax);
    ctx.globalAlpha = 1;
  }

  private tile(canvas: HTMLCanvasElement, parallax: number): void {
    const ctx = this.ctx;
    const ox = ((-this.cameraX * WORLD_SCALE * parallax) % SCREEN_W + SCREEN_W) % SCREEN_W;
    const oy = ((this.cameraY * WORLD_SCALE * parallax) % SCREEN_H + SCREEN_H) % SCREEN_H;
    const x = Math.floor(ox);
    const y = Math.floor(oy);
    if (canvas === this.nebula) {
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalCompositeOperation = 'lighter';
    }
    for (const dx of [x - SCREEN_W, x]) {
      for (const dy of [y - SCREEN_H, y]) ctx.drawImage(canvas, dx, dy);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private onScreen(x: number, y: number, marginWorld: number): boolean {
    const halfW = SCREEN_W / 2 / WORLD_SCALE + marginWorld;
    const halfH = SCREEN_H / 2 / WORLD_SCALE + marginWorld;
    return Math.abs(x - this.cameraX) < halfW && Math.abs(y - this.cameraY) < halfH;
  }

  private drawWalls(s: GameState): void {
    const { inner, outer } = WALL;
    const left: Array<[number, number, number, number]> = [
      [-outer, -outer, -inner, s.gate.bottom],
      [-outer, s.gate.top, -inner, outer],
      [inner, -outer, outer, outer],
      [-inner, -outer, outer, -inner],
      [-inner, inner, outer, outer],
    ];
    for (const rect of left) this.drawWallRect(rect);
  }

  private drawWallRect([x1, y1, x2, y2]: [number, number, number, number]): void {
    const ctx = this.ctx;
    if (y2 <= y1) return;
    const left = Math.max(-2, this.sx(x1));
    const right = Math.min(SCREEN_W + 2, this.sx(x2));
    const top = Math.max(-2, this.sy(y2));
    const bottom = Math.min(SCREEN_H + 2, this.sy(y1));
    if (right <= left || bottom <= top) return;
    ctx.save();
    ctx.translate(Math.floor(this.time / 3) % 8, 0);
    ctx.fillStyle = this.wallPattern;
    ctx.fillRect(left - 8, top, right - left + 8, bottom - top);
    ctx.restore();
    ctx.fillStyle = '#a2ffc4';
    const edges: Array<[number, number, number, number]> = [
      [this.sx(x1), top, 1, bottom - top],
      [this.sx(x2), top, 1, bottom - top],
      [left, this.sy(y1), right - left, 1],
      [left, this.sy(y2), right - left, 1],
    ];
    for (const [x, y, w, h] of edges) {
      if (x >= -1 && x <= SCREEN_W && y >= -1 && y <= SCREEN_H) ctx.fillRect(x, y, w, h);
    }
  }

  private drawPlanets(s: GameState): void {
    const ctx = this.ctx;
    if (s.moonAlive && this.onScreen(MOON.x, MOON.y, MOON.radius + 50)) {
      ctx.drawImage(this.moon, this.sx(MOON.x) - this.moon.width / 2, this.sy(MOON.y) - this.moon.height / 2);
    }
    if (s.earthAlive && this.onScreen(EARTH.x, EARTH.y, EARTH.gravityRange)) {
      const x = this.sx(EARTH.x);
      const y = this.sy(EARTH.y);
      this.glow(this.glows.atmosphere, x, y);
      ctx.drawImage(this.earth, x - this.earth.width / 2, y - this.earth.height / 2);
      // A dashed circle marks the point of no return.
      const r = EARTH.gravityRange * WORLD_SCALE;
      const steps = 72;
      ctx.fillStyle = '#ff5a48';
      for (let i = 0; i < steps; i += 2) {
        const a = (i / steps) * Math.PI * 2 + this.time * 0.003;
        ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 2, 1);
      }
    }
  }

  private glow(glow: HTMLCanvasElement, x: number, y: number, size?: number): void {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter';
    const w = size ?? glow.width;
    ctx.drawImage(glow, Math.round(x - w / 2), Math.round(y - w / 2), w, w);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawHomeBase(s: GameState): void {
    const ctx = this.ctx;
    if (!this.onScreen(0, 0, 700)) return;
    const station = s.base.battleStations ? this.homeAlert : this.home;
    const x = this.sx(0);
    const y = this.sy(0);
    this.drawBay(s);
    ctx.drawImage(station.canvas, x - station.half, y - station.half);
    const blink = this.time % 30 < 15;
    const lightGlow = s.base.battleStations ? this.glows.red : this.glows.blue;
    if (blink || !s.base.battleStations) {
      for (const [px, py] of [[0, 0], [0, 400], [0, -400], [325, 0], [-325, 0]]) {
        this.glow(lightGlow, this.sx(px), this.sy(py), px === 0 && py === 0 ? 48 : 24);
      }
    }
    drawTextCentered(ctx, 'HOME', x, y + 56, '#a8e8c0');
  }

  /** The refit dock from label 25, drawn all the time here so players can find where to park. */
  private drawBay(s: GameState): void {
    const ctx = this.ctx;
    const refit = s.player.refit;
    const x1 = this.sx(BAY.minX - 25);
    const x2 = this.sx(BAY.maxX + 25);
    const y1 = this.sy(BAY.halfY);
    const y2 = this.sy(-BAY.halfY);
    ctx.fillStyle = '#0a2030';
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    if (refit) {
      const done = 1 - refit.remaining / refit.total;
      ctx.fillStyle = this.time % 8 < 4 ? '#2dbb6b' : '#38d07c';
      ctx.fillRect(x1, y1, Math.round((x2 - x1) * done), y2 - y1);
    }
    ctx.fillStyle = '#54bf8d';
    ctx.fillRect(x1, y1, x2 - x1, 2);
    ctx.fillRect(x1, y2 - 2, x2 - x1, 2);
    ctx.fillRect(x2 - 2, y1, 2, y2 - y1);
    for (let i = x1 + 6; i < x2; i += 10) ctx.fillRect(i, y1 + 2, 1, 2);
    drawTextCentered(ctx, 'REFIT', (x1 + x2) / 2 + 12, y2 + 3, '#54bf8d');
  }

  private drawDockLink(s: GameState, player: Snapshot): void {
    if (!s.player.docked) return;
    const ctx = this.ctx;
    const x1 = this.sx(DOCK.x);
    const y1 = this.sy(DOCK.y);
    const x2 = this.sx(player.x);
    const y2 = this.sy(player.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.time % 10 < 5 ? '#3c9cff' : '#7cc0ff';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    this.glow(this.glows.blue, x2, y2, 28);
  }

  private drawEnemyBase(s: GameState): void {
    const e = s.enemies.enemyBase;
    if (!this.onScreen(e.x, e.y, 700)) return;
    const x = this.sx(e.x);
    const y = this.sy(e.y);
    this.ctx.drawImage(this.enemyBase.canvas, x - this.enemyBase.half, y - this.enemyBase.half);
    for (const [px, py] of [[0, 0], [0, 400], [0, -400], [325, 0], [-325, 0]]) {
      this.glow(this.glows.red, this.sx(e.x + px), this.sy(e.y + py), px === 0 && py === 0 ? 48 : 24);
    }
  }

  private drawCrate(s: GameState): void {
    const ctx = this.ctx;
    const { x: wx, y: wy } = s.crate;
    if (!this.onScreen(wx, wy, 100)) return;
    const x = this.sx(wx);
    const y = this.sy(wy);
    this.glow(this.glows.amber, x, y, 30 + (this.time % 40 < 20 ? 6 : 0));
    ctx.fillStyle = '#7a4a10';
    ctx.fillRect(x - 7, y - 7, 15, 15);
    ctx.fillStyle = '#ffc93c';
    ctx.fillRect(x - 6, y - 6, 13, 13);
    ctx.fillStyle = '#fff2a0';
    ctx.fillRect(x - 6, y - 6, 13, 2);
    ctx.fillRect(x - 6, y - 6, 2, 13);
    ctx.fillStyle = '#b07a18';
    ctx.fillRect(x - 1, y - 6, 2, 13);
    ctx.fillRect(x - 6, y - 1, 13, 2);
  }

  private drawMiner(s: GameState, alpha: number): void {
    const m = this.lerp('miner', s.miner, alpha);
    if (!this.onScreen(m.x, m.y, 50)) return;
    const x = this.sx(m.x);
    const y = this.sy(m.y);
    this.glow(this.glows.amber, x, y, 16);
    ball(this.ctx, x, y, 3, ['#a06a14', '#ffc93c', '#fff2a0']);
    drawText(this.ctx, 'miner', x + 5, y - 3, '#a8905a');
  }

  private drawCruiser(s: GameState, alpha: number): void {
    const c = this.lerp('cruiser', s.enemies.cruiser, alpha);
    if (!this.onScreen(c.x, c.y, 500)) return;
    const { canvas, halfW, halfH } = this.cruiser;
    const x = this.sx(c.x);
    const y = this.sy(c.y);
    this.ctx.drawImage(canvas, x - halfW, y - halfH);
    if (s.target === 'cruiser') this.drawReticle(x, y, halfW + 6, halfH + 6);
  }

  private drawFighter(s: GameState, id: 'fighter1' | 'fighter2', frames: HTMLCanvasElement[], key: 'raider' | 'hunter', alpha: number): void {
    const e = s.enemies[id];
    const pos = this.lerp(id, e, alpha);
    if (!this.onScreen(pos.x, pos.y, 80)) return;
    const prev = this.prev[id];
    if (prev) {
      const dx = e.x - prev.x;
      const dy = e.y - prev.y;
      if (dx !== 0 || dy !== 0) this.headings[key] = Math.atan2(dx, dy);
    }
    const index = ((Math.round((this.headings[key] / (Math.PI * 2)) * HEADINGS) % HEADINGS) + HEADINGS) % HEADINGS;
    const frame = frames[index];
    const x = this.sx(pos.x);
    const y = this.sy(pos.y);
    this.glow(id === 'fighter1' ? this.glows.red : this.glows.green, x, y, 22);
    this.ctx.drawImage(frame, x - frame.width / 2, y - frame.height / 2);
    if (s.target === id) this.drawReticle(x, y, 13, 13);
  }

  private drawReticle(x: number, y: number, halfW: number, halfH: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = this.time % 16 < 12 ? '#ff5a48' : '#ffb0a0';
    const len = 4;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const cx = x + sx * halfW;
        const cy = y + sy * halfH;
        ctx.fillRect(sx < 0 ? cx : cx - len + 1, cy, len, 1);
        ctx.fillRect(cx, sy < 0 ? cy : cy - len + 1, 1, len);
      }
    }
  }

  private drawRocket(s: GameState, alpha: number): void {
    if (!s.rocket) return;
    const r = this.lerp('rocket', s.rocket, alpha);
    const x = this.sx(r.x);
    const y = this.sy(r.y);
    this.glow(this.glows.amber, x, y, 18);
    ball(this.ctx, x, y, 2, ['#454859', '#a4a9b8', '#ffffff']);
    if (s.rocket.timeBomb && this.time % 16 < 8) {
      this.ctx.fillStyle = '#ff5a48';
      this.ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }

  /**
   * The four-lobed ship from the original: a hub with four pods that stretch along the direction
   * of travel, as the CIRCLE aspect ratios did.
   */
  private drawPlayer(s: GameState, pos: Snapshot, frameSeconds: number): void {
    const p = s.player;
    const x = this.sx(pos.x);
    const y = this.sy(pos.y);

    if (p.solar === 1) this.drawSolarPanels(x, y);

    const speed = Math.hypot(p.vx, p.vy);
    const ux = speed > 0 ? p.vx / speed : 0;
    const uy = speed > 0 ? -p.vy / speed : 0;
    this.updateShipPose(ux, uy, speed, frameSeconds);

    if (speed > 0) {
      const flare = Math.min(speed, 10) / 10;
      this.glow(this.glows.blue, x - ux * (8 + flare * 8), y - uy * (8 + flare * 8), 18 + flare * 12);
    }
    this.drawShipBody(x, y);

    if (p.extraShieldOn) {
      const r = 19 + (this.time % 12 < 6 ? 1 : 0);
      this.pixelCircle(x, y, r, '#ffe27a', 1);
      this.pixelCircle(x, y, r + 1, '#e8483c', 3);
      this.glow(this.glows.amber, x, y, 44);
    }
    if (p.refit || p.docked) this.glow(this.glows.green, x, y, 40);
  }

  /** Eases the ship toward its heading. Ovals look the same both ways round, so it turns by the short way mod 180. */
  private updateShipPose(ux: number, uy: number, speed: number, frameSeconds: number): void {
    const moving = speed > 0;
    let target = moving
      ? Math.atan2(uy, ux)
      : Math.round(this.shipAngle / (Math.PI / 2)) * (Math.PI / 2); // At rest, settle back to an upright cross.
    let delta = target - this.shipAngle;
    const period = moving ? Math.PI : Math.PI / 2;
    delta -= Math.round(delta / period) * period;
    target = this.shipAngle + delta;
    const turn = Math.min(1, frameSeconds * 16);
    this.shipAngle += (target - this.shipAngle) * turn;
    const stretchTarget = Math.min(speed, 10); // The source capped the drawn speed at 10 too (lines 398-401).
    this.shipStretch += (stretchTarget - this.shipStretch) * Math.min(1, frameSeconds * 12);
  }

  /**
   * The ship from lines 499-518, generalised to any heading. Moving along an axis, the source draws
   * a hub with radius 10+v and two side pods of radius 5+v at distance 10+v, all squashed by the same
   * aspect ratio, and the pods ahead and behind disappear. So the cross collapses into three parallel
   * ovals that get longer and thinner with speed. At rest it is the four-lobed cross.
   */
  private drawShipBody(x: number, y: number): void {
    const s = this.shipStretch;
    const angle = this.shipAngle;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const blend = Math.min(1, s); // 0 at rest, 1 once it is really moving, so nothing pops.
    const aspect = 1 + (3.4 / (11 - s) + 1 - 1) * blend;
    const units = WORLD_SCALE * SHIP_ZOOM;

    // Pods ahead and behind shrink into the hub as soon as the ship moves.
    const endPods = 1 - blend;
    if (endPods > 0.05) {
      for (const dir of [-1, 1]) {
        const wx = cos * dir;
        const wy = sin * dir;
        // The source's cross is wider vertically: pods at 20 up and down, 15 left and right.
        const px = x + wx * 15 * units;
        const py = y + wy * 20 * units;
        this.shipOval(px, py, 5 * units * endPods, 5 * units * endPods, angle, POD_RAMP);
      }
    }
    const sideLong = (5 + s) * units;
    const sideWide = sideLong / aspect;
    for (const dir of [-1, 1]) {
      const wx = -sin * dir;
      const wy = cos * dir;
      const restX = wx * 15;
      const restY = wy * 20;
      const moveDistance = 10 + s;
      const ox = restX + (wx * moveDistance - restX) * blend;
      const oy = restY + (wy * moveDistance - restY) * blend;
      this.shipOval(x + ox * units, y + oy * units, sideLong, sideWide, angle, POD_RAMP);
    }
    const hubLong = (10 + s) * units;
    this.shipOval(x, y, hubLong, hubLong / aspect, angle, HUB_RAMP);
  }

  /** A rotated, shaded ellipse, set pixel by pixel so it stays crisp at any angle. */
  private shipOval(cx: number, cy: number, long: number, wide: number, angle: number, ramp: readonly [string, string, string]): void {
    const ctx = this.ctx;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const reach = Math.ceil(Math.max(long, wide)) + 1;
    const x0 = Math.round(cx);
    const y0 = Math.round(cy);
    const fx = cx - x0;
    const fy = cy - y0;
    const a = Math.max(0.8, long);
    const b = Math.max(0.8, wide);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const px = dx - fx;
        const py = dy - fy;
        const u = (px * cos + py * sin) / a;
        const v = (-px * sin + py * cos) / b;
        const d = u * u + v * v;
        if (d > 1) continue;
        // Light from the upper left, as on every other sprite.
        const lit = (-px - py) / (Math.max(a, b) * 1.6);
        ctx.fillStyle = d > 0.62 ? ramp[0] : lit > 0.25 && d < 0.5 ? ramp[2] : ramp[1];
        ctx.fillRect(x0 + dx, y0 + dy, 1, 1);
      }
    }
  }

  /** The four panels opened by the '9' key, from lines 229-232. */
  private drawSolarPanels(x: number, y: number): void {
    const ctx = this.ctx;
    const panels: Array<[number, number, number, number]> = [
      [x - 36, y - 7, 30, 14],
      [x + 7, y - 7, 30, 14],
      [x - 5, y - 43, 11, 34],
      [x - 5, y + 10, 11, 34],
    ];
    for (const [px, py, w, h] of panels) {
      ctx.fillStyle = '#6b5216';
      ctx.fillRect(px, py, w, h);
      ctx.fillStyle = '#ffc93c';
      ctx.fillRect(px + 1, py + 1, w - 2, h - 2);
      ctx.fillStyle = '#163a7a';
      for (let i = 2; i < w - 2; i += 4) {
        for (let j = 2; j < h - 2; j += 4) ctx.fillRect(px + i, py + j, 3, 3);
      }
    }
    this.glow(this.glows.amber, x, y, 70);
  }

  private pixelCircle(cx: number, cy: number, r: number, color: string, skip: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    const steps = Math.max(16, Math.round(r * 6));
    for (let i = 0; i < steps; i += skip) {
      const a = (i / steps) * Math.PI * 2;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
    }
  }

  private drawBeams(): void {
    const ctx = this.ctx;
    for (const b of this.beams) {
      const style = BEAM_STYLE[b.kind];
      const x1 = this.sx(b.x1);
      const y1 = this.sy(b.y1);
      const x2 = this.sx(b.x2);
      const y2 = this.sy(b.y2);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = style.glow;
      ctx.lineWidth = style.width + 2;
      ctx.beginPath();
      ctx.moveTo(x1 + 0.5, y1 + 0.5);
      ctx.lineTo(x2 + 0.5, y2 + 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      pixelLine(ctx, x1, y1, x2, y2, style.core, style.width);
      this.glow(style.glow === '#2dd468' ? this.glows.green : style.glow === '#3c9cff' ? this.glows.blue : this.glows.red, x2, y2, 22);
    }
  }

  private drawParticles(): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const t = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.ramp[Math.min(p.ramp.length - 1, Math.floor(t * p.ramp.length))];
      const size = p.life > p.maxLife * 0.5 ? 2 : 1;
      ctx.fillRect(this.sx(p.x), this.sy(p.y), size, size);
    }
  }

  private drawRings(): void {
    for (const r of this.rings) {
      const px = r.radius * WORLD_SCALE;
      this.pixelCircle(this.sx(r.x), this.sy(r.y), px, r.color, 1);
      this.pixelCircle(this.sx(r.x), this.sy(r.y), px * 0.85, '#e8483c', 2);
    }
    if (this.rings.length > 0) {
      for (const r of this.rings) this.glow(this.glows.amber, this.sx(r.x), this.sy(r.y), r.radius * WORLD_SCALE * 1.4);
    }
  }

  private drawFloats(): void {
    for (const f of this.floats) {
      drawTextCentered(this.ctx, f.text, this.sx(f.x), this.sy(f.y), f.color);
    }
  }
}

/** Bresenham, clipped to the screen so a beam from far off screen stays cheap. */
function pixelLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width: number): void {
  const clipped = clipLine(x0, y0, x1, y1);
  if (!clipped) return;
  let [ax, ay, bx, by] = clipped;
  ax = Math.round(ax);
  ay = Math.round(ay);
  bx = Math.round(bx);
  by = Math.round(by);
  ctx.fillStyle = color;
  const dx = Math.abs(bx - ax);
  const dy = -Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1;
  const sy = ay < by ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 2000; guard++) {
    ctx.fillRect(ax, ay, width, width);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      ax += sx;
    }
    if (e2 <= dx) {
      err += dx;
      ay += sy;
    }
  }
}

/** Liang-Barsky clip against the screen. */
function clipLine(x0: number, y0: number, x1: number, y1: number): [number, number, number, number] | null {
  let t0 = 0;
  let t1 = 1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const checks: Array<[number, number]> = [
    [-dx, x0],
    [dx, SCREEN_W - 1 - x0],
    [-dy, y0],
    [dy, SCREEN_H - 1 - y0],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  return [x0 + t0 * dx, y0 + t0 * dy, x0 + t1 * dx, y0 + t1 * dy];
}

// Kept alongside the renderer so the title screen can show the same ship.
export function drawTitleShip(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  const [canvas, c] = makeCanvas(26, 26);
  c.fillStyle = '#23405a';
  c.fillRect(13, 5, 1, 17);
  c.fillRect(5, 13, 17, 1);
  for (const [dx, dy] of [[0, -8], [8, 0], [0, 8], [-8, 0]]) {
    ball(c, 13 + dx, 13 + dy, 2.5, ['#1c6e4a', '#4adf8a', '#d0ffe0']);
  }
  ball(c, 13, 13, 4.5, ['#1a3a8a', '#3c8cf0', '#c8e4ff']);
  c.fillStyle = '#ffffff';
  fillDisc(c, 12, 12, 0.5);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, x - 13 * scale, y - 13 * scale, 26 * scale, 26 * scale);
}

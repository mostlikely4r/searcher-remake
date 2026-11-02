// All art is generated in code at startup: no asset files.
// Shared look: limited palettes, one light direction, ordered dithering between shades.

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const dither = (x: number, y: number) => (BAYER[y & 3][x & 3] + 0.5) / 16 - 0.5;

const LIGHT = normalize([-0.55, -0.6, 0.58]);

function normalize(v: number[]): number[] {
  const m = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / m, v[1] / m, v[2] / m];
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

// --- Noise ---------------------------------------------------------------

function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Tileable value noise. `period` is in lattice cells. */
function valueNoise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = smooth(x - xi);
  const fy = smooth(y - yi);
  const wrap = (v: number) => ((v % period) + period) % period;
  const a = hash2(wrap(xi), wrap(yi), seed);
  const b = hash2(wrap(xi + 1), wrap(yi), seed);
  const c = hash2(wrap(xi), wrap(yi + 1), seed);
  const d = hash2(wrap(xi + 1), wrap(yi + 1), seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function fbm(x: number, y: number, period: number, seed: number, octaves = 4): number {
  let total = 0;
  let amplitude = 0.5;
  let norm = 0;
  let p = period;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise(fx, fy, p, seed + i * 17) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    fx *= 2;
    fy *= 2;
    p *= 2;
  }
  return total / norm;
}

// --- Shaded bodies --------------------------------------------------------

type Surface = (nx: number, ny: number, nz: number, px: number, py: number) => [string[], number];

/** Lit, dithered sphere. `surface` picks a ramp and an optional brightness shift for each pixel. */
function paintSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, surface: Surface): void {
  const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = image.data;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(h - 1, Math.ceil(cy + ry)); y++) {
    for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(w - 1, Math.ceil(cx + rx)); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const [ramp, shift] = surface(nx, ny, nz, x, y);
      const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const light = 0.12 + diffuse * 0.95 + shift;
      const level = Math.max(0, Math.min(ramp.length - 1, Math.round(light * (ramp.length - 1) + dither(x, y) * 0.9)));
      const [r, g, b] = hexToRgb(ramp[level]);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

const STONE = ['#14141f', '#24263a', '#3a3e55', '#5a5f78', '#868ba0', '#b5b9c6', '#e0e2e8'];
const OCEAN = ['#040a26', '#0a1a4d', '#10307e', '#1a55b0', '#2f86d6', '#6cc0ee'];
const LAND = ['#061a12', '#0b2c1c', '#134a26', '#1f6b30', '#35893a', '#5aa548'];
const CLOUD = ['#2a3350', '#59698c', '#9aa8c4', '#d6deef', '#ffffff'];

export function buildMoon(radiusPx: number): HTMLCanvasElement {
  const size = radiusPx * 2 + 2;
  const [canvas, ctx] = makeCanvas(size, size);
  const c = radiusPx + 1;
  const craters = [
    [-0.35, -0.3, 0.2], [0.3, 0.25, 0.26], [-0.1, 0.5, 0.13], [0.45, -0.4, 0.14],
    [-0.55, 0.2, 0.11], [0.05, -0.05, 0.09], [0.15, -0.65, 0.1], [-0.65, -0.55, 0.08],
    [0.62, 0.05, 0.07], [-0.2, 0.15, 0.06], [0.35, 0.62, 0.08],
  ];
  paintSphere(ctx, c, c, radiusPx, radiusPx, (nx, ny) => {
    let shift = (fbm((nx + 1) * 6, (ny + 1) * 6, 64, 3) - 0.5) * 0.25;
    for (const [cx, cy, r] of craters) {
      const d = Math.hypot(nx - cx, ny - cy) / r;
      if (d < 1) shift -= 0.22 * (1 - d * d);
      else if (d < 1.2) shift += 0.12;
    }
    return [STONE, shift];
  });
  return canvas;
}

export function buildEarth(radiusPx: number): HTMLCanvasElement {
  const size = radiusPx * 2 + 2;
  const [canvas, ctx] = makeCanvas(size, size);
  const c = radiusPx + 1;
  paintSphere(ctx, c, c, radiusPx, radiusPx, (nx, ny, nz) => {
    // Spherical bulge so the features curve with the surface.
    const u = nx / (1 + nz) * 2 + 2;
    const v = ny / (1 + nz) * 2 + 2;
    const clouds = fbm(u * 5 + 40, v * 9, 512, 11);
    if (clouds > 0.6) return [CLOUD, 0.08];
    const land = fbm(u * 4, v * 4, 256, 5);
    if (land > 0.52) return [LAND, (land - 0.52) * 0.8];
    return [OCEAN, 0];
  });
  return canvas;
}

export interface StationPalette {
  hull: string[];
  arm: string[];
  lightIdle: string;
  lightAlert: string;
}

export const HOME_PALETTE: StationPalette = {
  hull: ['#06201c', '#0d3b30', '#16604a', '#27906a', '#54bf8d', '#a8e8c0'],
  arm: ['#0b2b26', '#14493d', '#217058', '#37a077'],
  lightIdle: '#52a8ff',
  lightAlert: '#ff5a48',
};
export const ENEMY_PALETTE: StationPalette = {
  hull: ['#1c0a14', '#34121f', '#55202b', '#7e3338', '#a9554d', '#dc9a7e'],
  arm: ['#1a0d12', '#431720', '#6e2028', '#a22a2c'],
  lightIdle: '#ff4a3c',
  lightAlert: '#ffb12e',
};

function fillRamped(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ramp: string[], horizontal: boolean): void {
  const steps = ramp.length;
  for (let i = 0; i < (horizontal ? h : w); i++) {
    const t = i / Math.max(1, (horizontal ? h : w) - 1);
    const level = Math.min(steps - 1, Math.floor((1 - Math.abs(t - 0.35)) * steps));
    ctx.fillStyle = ramp[level];
    if (horizontal) ctx.fillRect(x, y + i, w, 1);
    else ctx.fillRect(x + i, y, 1, h);
  }
}

/**
 * The cross-shaped station from DrawStation: central hub r150, pods r75 at (0,±400) and (±325,0).
 * Used for both bases, in different colours. Coordinates are in world units before scaling.
 */
export function buildStation(scale: number, palette: StationPalette, alert: boolean): { canvas: HTMLCanvasElement; half: number } {
  const half = Math.ceil(490 * scale);
  const [canvas, ctx] = makeCanvas(half * 2, half * 2);
  const u = (v: number) => Math.round(v * scale);

  // Arms between the hub and pods (the four bars in DrawStation).
  fillRamped(ctx, half - u(20), half - u(340), u(40), u(680), palette.arm, false);
  fillRamped(ctx, half - u(270), half - u(20), u(540), u(40), palette.arm, true);

  const light = alert ? palette.lightAlert : palette.lightIdle;
  ctx.fillStyle = light;
  for (const sign of [-1, 1]) {
    for (let i = 165; i <= 250; i += 22) {
      ctx.fillRect(half + sign * u(i), half - 1, 2, 2);
      ctx.fillRect(half - 1, half + sign * u(i + 40), 2, 2);
    }
  }

  const pods: Array<[number, number, number]> = [[0, 0, 150], [0, 400, 75], [0, -400, 75], [325, 0, 75], [-325, 0, 75]];
  for (const [px, py, r] of pods) {
    const cx = half + px * scale;
    const cy = half - py * scale;
    const rr = r * scale;
    paintSphere(ctx, cx, cy, rr, rr, (nx, ny) => {
      const ring = Math.abs(Math.hypot(nx, ny) - 0.62);
      const panel = Math.floor((Math.atan2(ny, nx) + Math.PI) * 4) % 2 === 0 ? 0.05 : -0.05;
      return [palette.hull, (ring < 0.04 ? -0.28 : 0) + panel];
    });
    // Core light, the r20/r10 circles at the centre of each hub in DrawStation.
    const coreR = Math.max(2, Math.round(rr * 0.2));
    ctx.fillStyle = light;
    fillDisc(ctx, cx, cy, coreR);
    ctx.fillStyle = '#ffffff';
    fillDisc(ctx, cx - 1, cy - 1, Math.max(1, coreR - 2));
  }
  return { canvas, half };
}

export function buildCruiser(scale: number): { canvas: HTMLCanvasElement; halfW: number; halfH: number } {
  const halfW = Math.ceil(70 * scale) + 8;
  const halfH = Math.ceil(345 * scale);
  const [canvas, ctx] = makeCanvas(halfW * 2, halfH * 2);
  const hull = ['#170a12', '#2c121d', '#4a1c28', '#722b33', '#a54542', '#dc7d5c'];
  const plate = ['#14131d', '#2a2b3c', '#454859', '#6e7284', '#a4a9b8'];
  // Circle (r300, aspect 4) makes the long hull; three r30 gun pods sit along it.
  paintSphere(ctx, halfW, halfH, 300 * scale / 4 + 6, 300 * scale, (nx, ny, _nz, _x, y) => {
    const seam = Math.abs(nx) < 0.12 ? -0.2 : 0;
    const rib = y % 12 < 1 ? -0.14 : 0;
    return [hull, seam + rib + (ny < 0 ? 0.03 : 0)];
  });
  for (const py of [-300, 0, 300]) {
    const cy = halfH + py * scale;
    paintSphere(ctx, halfW, cy, 30 * scale + 2, 30 * scale + 2, () => [plate, 0]);
    ctx.fillStyle = '#ff5a48';
    fillDisc(ctx, halfW, cy, 2);
  }
  return { canvas, halfW, halfH };
}

export function fillDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  const rr = r * r + r * 0.4;
  for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
    const span = Math.floor(Math.sqrt(Math.max(0, rr - dy * dy)));
    if (dy * dy <= rr) ctx.fillRect(x0 - span, y0 + dy, span * 2 + 1, 1);
  }
}

export function ball(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, ramp: readonly [string, string, string]): void {
  ctx.fillStyle = ramp[0];
  fillDisc(ctx, cx, cy, r);
  ctx.fillStyle = ramp[1];
  fillDisc(ctx, cx - r * 0.18, cy - r * 0.18, Math.max(0.5, r * 0.72));
  ctx.fillStyle = ramp[2];
  fillDisc(ctx, cx - r * 0.38, cy - r * 0.38, Math.max(0.4, r * 0.28));
}

// --- Indexed sprites -----------------------------------------------------

const SPRITE_COLORS: Record<string, string> = {
  K: '#180c16', D: '#5a1c28', R: '#b0332f', r: '#e8583c', O: '#ffa13c', Y: '#ffe27a',
  G: '#2dbb6b', g: '#a2f0b0', S: '#454859', s: '#878ca0', P: '#7b2fbf', p: '#c77bff',
};

const RAIDER_ART = [
  '......KK......',
  '.....KrrK.....',
  '.....KrRK.....',
  '....KrYYRK....',
  '....KrYORK....',
  '...KrRRRRDK...',
  '..KrRDRRDRDK..',
  '.KrRDKRRKDRDK.',
  'KrRDK.RR.KDRDK',
  'KRDK..DD..KDDK',
  'KDK...OO...KDK',
  'KK....KK....KK',
];

const HUNTER_ART = [
  '.......K.......',
  '......KpK......',
  '......KPK......',
  '..K..KpPPK..K..',
  '.KpK.KPggK.KPK.',
  '.KPK.KPGGK.KPK.',
  '.KPKKpPPPPKKPK.',
  '.KPPpPPPPPPPPK.',
  '.KPKKPPKKPPKKPK',
  '.KK..KPOOPK..KK',
  '......KKKK.....',
];

function artToCanvas(art: string[]): HTMLCanvasElement {
  const h = art.length;
  const w = Math.max(...art.map((row) => row.length));
  const [canvas, ctx] = makeCanvas(w, h);
  art.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = SPRITE_COLORS[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
  return canvas;
}

/** Nearest-neighbour rotations of a sprite pointing up, in `steps` headings. */
function rotations(source: HTMLCanvasElement, steps: number): HTMLCanvasElement[] {
  const size = Math.ceil(Math.hypot(source.width, source.height)) + 2;
  const srcData = source.getContext('2d')!.getImageData(0, 0, source.width, source.height).data;
  const result: HTMLCanvasElement[] = [];
  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2;
    const [canvas, ctx] = makeCanvas(size, size);
    const image = ctx.createImageData(size, size);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - size / 2;
        const dy = y + 0.5 - size / 2;
        const sx = Math.floor(dx * cos - dy * sin + source.width / 2);
        const sy = Math.floor(dx * sin + dy * cos + source.height / 2);
        if (sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) continue;
        const si = (sy * source.width + sx) * 4;
        const di = (y * size + x) * 4;
        for (let c = 0; c < 4; c++) image.data[di + c] = srcData[si + c];
      }
    }
    ctx.putImageData(image, 0, 0);
    result.push(canvas);
  }
  return result;
}

export const HEADINGS = 16;

export function buildFighters(): { raider: HTMLCanvasElement[]; hunter: HTMLCanvasElement[] } {
  return {
    raider: rotations(artToCanvas(RAIDER_ART), HEADINGS),
    hunter: rotations(artToCanvas(HUNTER_ART), HEADINGS),
  };
}

// --- Space backdrop ------------------------------------------------------

export function buildStarLayer(w: number, h: number, count: number, colors: string[], seed: number, big = false): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(w, h);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(hash2(i, 1, seed) * w);
    const y = Math.floor(hash2(i, 2, seed) * h);
    ctx.fillStyle = colors[Math.floor(hash2(i, 3, seed) * colors.length)];
    ctx.fillRect(x, y, 1, 1);
    if (big && hash2(i, 4, seed) > 0.75) {
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x, y - 1, 1, 3);
      ctx.globalAlpha = 1;
    }
  }
  return canvas;
}

/** Tileable dithered nebula, kept subtle so it never competes with gameplay. */
export function buildNebula(w: number, h: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(w, h);
  const image = ctx.createImageData(w, h);
  const ramp = [
    [5, 6, 15], [8, 8, 24], [14, 10, 36], [22, 13, 50], [33, 17, 66],
  ];
  const blueRamp = [
    [5, 6, 15], [6, 11, 26], [8, 18, 40], [10, 27, 56],
  ];
  const period = 8;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w) * period;
      const v = (y / h) * period;
      const a = fbm(u, v, period, 21, 5);
      const b = fbm(u + 3, v + 5, period, 57, 5);
      const useRamp = a > b ? ramp : blueRamp;
      const strength = Math.max(a, b);
      const t = Math.max(0, (strength - 0.5) * 3.6) * (useRamp.length - 1);
      const level = Math.max(0, Math.min(useRamp.length - 1, Math.round(t + dither(x, y) * 0.8)));
      const c = useRamp[level];
      const i = (y * w + x) * 4;
      image.data[i] = c[0];
      image.data[i + 1] = c[1];
      image.data[i + 2] = c[2];
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** A stepped radial glow, drawn additively. Hard steps keep it looking like pixel art rather than a blur. */
export function buildGlow(radius: number, rgb: [number, number, number], strength = 1): HTMLCanvasElement {
  const size = radius * 2;
  const [canvas, ctx] = makeCanvas(size, size);
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - radius, y + 0.5 - radius) / radius;
      if (d >= 1) continue;
      const raw = (1 - d) * (1 - d);
      const stepped = Math.round((raw + dither(x, y) * 0.1) * 6) / 6;
      const i = (y * size + x) * 4;
      image.data[i] = rgb[0];
      image.data[i + 1] = rgb[1];
      image.data[i + 2] = rgb[2];
      image.data[i + 3] = Math.max(0, stepped) * 180 * strength;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function buildWallPattern(): HTMLCanvasElement {
  const size = 8;
  const [canvas, ctx] = makeCanvas(size, size);
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = (x + y) % 4 === 0;
      const i = (y * size + x) * 4;
      image.data[i] = on ? 90 : 20;
      image.data[i + 1] = on ? 255 : 110;
      image.data[i + 2] = on ? 150 : 70;
      image.data[i + 3] = on ? 150 : 70;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

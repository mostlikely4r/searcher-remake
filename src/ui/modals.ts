// Keyboard-driven overlays that replace the original's PRINT and INPUT screens.

import { CHAR_W, drawText, drawTextCentered, drawTextRight, wrapText } from '../render/font';
import { panel } from '../render/hud';
import { SCREEN_H, SCREEN_W } from '../render/renderer';

export interface Modal {
  draw(ctx: CanvasRenderingContext2D): void;
  /** Returns true when the key was used. */
  key(key: string): void;
  click?(x: number, y: number): void;
}

/** Lets a modal open others and close itself. */
export interface ModalHost {
  push(modal: Modal): void;
  pop(): void;
  blip(): void;
  deny(): void;
}

const TITLE = '#9dbdff';
const TEXT = '#d8e4ff';
const DIM = '#7f93bd';
const SELECT = '#ffc93c';
const GOOD = '#4adf8a';
const BAD = '#ff5a48';

function dimBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(3, 4, 12, 0.72)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

export interface MenuRow {
  label: string;
  value?: string;
  disabled?: boolean;
  /** Run on Enter. A returned message shows at the bottom of the menu. */
  run: () => { ok: boolean; message: string } | void;
}

const ROW_H = 14;

export class MenuModal implements Modal {
  private selected = 0;
  private note: { text: string; ok: boolean } | null = null;
  private layout = { x: 0, y: 0, w: 0, firstRow: 0 };

  constructor(
    private readonly host: ModalHost,
    private readonly title: string,
    private readonly rows: () => MenuRow[],
    private readonly header?: () => string,
    private readonly width = 380,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    dimBackground(ctx);
    const rows = this.rows();
    this.selected = Math.min(this.selected, rows.length - 1);
    const w = this.width;
    const headerLines = this.header ? wrapText(this.header(), w - 24) : [];
    const noteLines = this.note ? wrapText(this.note.text, w - 24) : [];
    const h = 36 + headerLines.length * 10 + rows.length * ROW_H + (noteLines.length ? noteLines.length * 10 + 8 : 0) + 18;
    const x = Math.round((SCREEN_W - w) / 2);
    const y = Math.round((SCREEN_H - h) / 2);
    panel(ctx, x, y, w, h, 'rgba(8, 12, 30, 0.97)', '#3c5488');
    ctx.fillStyle = '#16233f';
    ctx.fillRect(x + 1, y + 1, w - 2, 16);
    drawText(ctx, this.title, x + 10, y + 5, TITLE);

    let cy = y + 24;
    for (const line of headerLines) {
      drawText(ctx, line, x + 12, cy, DIM);
      cy += 10;
    }
    if (headerLines.length) cy += 3;
    this.layout = { x, y, w, firstRow: cy };
    rows.forEach((row, i) => {
      const active = i === this.selected;
      if (active) {
        ctx.fillStyle = '#1e2d50';
        ctx.fillRect(x + 6, cy - 3, w - 12, ROW_H - 1);
        drawText(ctx, '>', x + 9, cy, SELECT);
      }
      const color = row.disabled ? '#4a5678' : active ? SELECT : TEXT;
      drawText(ctx, row.label, x + 18, cy, color);
      if (row.value) drawTextRight(ctx, row.value, x + w - 12, cy, row.disabled ? '#4a5678' : DIM);
      cy += ROW_H;
    });
    if (noteLines.length) {
      cy += 3;
      for (const line of noteLines) {
        drawText(ctx, line, x + 12, cy, this.note!.ok ? GOOD : BAD);
        cy += 10;
      }
    }
    drawTextRight(ctx, 'Up/Down  Enter select  Esc back', x + w - 10, y + h - 12, '#5a6a90');
  }

  key(key: string): void {
    const rows = this.rows();
    if (key === 'ArrowUp' || key === 'w') {
      this.selected = (this.selected - 1 + rows.length) % rows.length;
      this.host.blip();
    } else if (key === 'ArrowDown' || key === 's' || key === 'x') {
      this.selected = (this.selected + 1) % rows.length;
      this.host.blip();
    } else if (key === 'Enter' || key === ' ') {
      this.activate(rows);
    } else if (key === 'Escape' || key === 'q') {
      this.host.pop();
    } else if (/^[1-9]$/.test(key)) {
      const i = Number(key) - 1;
      if (i < rows.length) {
        this.selected = i;
        this.activate(rows);
      }
    }
  }

  private activate(rows: MenuRow[]): void {
    const row = rows[this.selected];
    if (row.disabled) {
      this.host.deny();
      return;
    }
    const result = row.run();
    if (result) {
      this.note = { text: result.message, ok: result.ok };
      if (result.ok) this.host.blip();
      else this.host.deny();
    } else {
      this.host.blip();
    }
  }

  click(x: number, y: number): void {
    const { x: lx, w, firstRow } = this.layout;
    if (x < lx || x > lx + w) return;
    const i = Math.floor((y - firstRow + 3) / ROW_H);
    const rows = this.rows();
    if (i >= 0 && i < rows.length) {
      this.selected = i;
      this.activate(rows);
    }
  }
}

export interface FormField {
  label: string;
  initial?: string;
  hint?: string;
}

/** Typed numeric form, the replacement for INPUT. Accepts negatives and decimals. */
export class FormModal implements Modal {
  private readonly values: string[];
  private active = 0;
  private note = '';
  private tick = 0;

  constructor(
    private readonly host: ModalHost,
    private readonly title: string,
    private readonly help: string,
    private readonly fields: FormField[],
    private readonly submit: (values: number[]) => string | void,
  ) {
    this.values = fields.map((f) => f.initial ?? '');
  }

  draw(ctx: CanvasRenderingContext2D): void {
    dimBackground(ctx);
    this.tick++;
    const w = 340;
    const helpLines = wrapText(this.help, w - 24);
    const h = 44 + helpLines.length * 10 + this.fields.length * 16 + (this.note ? 14 : 0);
    const x = Math.round((SCREEN_W - w) / 2);
    const y = Math.round((SCREEN_H - h) / 2);
    panel(ctx, x, y, w, h, 'rgba(8, 12, 30, 0.97)', '#3c5488');
    ctx.fillStyle = '#16233f';
    ctx.fillRect(x + 1, y + 1, w - 2, 16);
    drawText(ctx, this.title, x + 10, y + 5, TITLE);
    let cy = y + 24;
    for (const line of helpLines) {
      drawText(ctx, line, x + 12, cy, DIM);
      cy += 10;
    }
    cy += 4;
    this.fields.forEach((f, i) => {
      const active = i === this.active;
      drawText(ctx, f.label, x + 12, cy, active ? SELECT : TEXT);
      const boxX = x + 120;
      ctx.fillStyle = active ? '#1e2d50' : '#121a30';
      ctx.fillRect(boxX, cy - 3, 110, 13);
      const value = this.values[i];
      drawText(ctx, value, boxX + 4, cy, TEXT);
      if (active && this.tick % 40 < 22) {
        ctx.fillStyle = SELECT;
        ctx.fillRect(boxX + 4 + value.length * CHAR_W, cy - 1, 2, 9);
      }
      if (f.hint) drawText(ctx, f.hint, boxX + 116, cy, '#5a6a90');
      cy += 16;
    });
    if (this.note) drawText(ctx, this.note, x + 12, cy + 2, BAD);
    drawTextRight(ctx, 'Tab next  Enter confirm  Esc cancel', x + w - 10, y + h - 12, '#5a6a90');
  }

  key(key: string): void {
    const i = this.active;
    if (key === 'Escape') {
      this.host.pop();
    } else if (key === 'Tab' || key === 'ArrowDown') {
      this.active = (i + 1) % this.fields.length;
    } else if (key === 'ArrowUp') {
      this.active = (i - 1 + this.fields.length) % this.fields.length;
    } else if (key === 'Enter') {
      if (i < this.fields.length - 1) {
        this.active = i + 1;
      } else {
        this.confirm();
      }
    } else if (key === 'Backspace') {
      this.values[i] = this.values[i].slice(0, -1);
    } else if (/^[0-9.-]$/.test(key) && this.values[i].length < 14) {
      this.values[i] += key;
    }
  }

  private confirm(): void {
    const numbers = this.values.map((v) => {
      const n = Number(v);
      return v === '' || Number.isNaN(n) ? 0 : n;
    });
    this.host.pop();
    const error = this.submit(numbers);
    if (error) {
      // Reopen with the entered values kept, so a typo does not lose the whole form.
      this.note = error;
      this.host.push(this);
      this.host.deny();
    } else {
      this.host.blip();
    }
  }
}

/** A read-only page: help, status report, messages. Any key dismisses it. */
export class TextModal implements Modal {
  constructor(
    private readonly host: ModalHost,
    private readonly title: string,
    private readonly lines: () => string[],
    private readonly onKey?: (key: string) => boolean,
    private readonly width = 460,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    dimBackground(ctx);
    const lines = this.lines();
    const w = this.width;
    const h = Math.min(SCREEN_H - 8, 34 + lines.length * 10);
    const x = Math.round((SCREEN_W - w) / 2);
    const y = Math.round((SCREEN_H - h) / 2);
    panel(ctx, x, y, w, h, 'rgba(8, 12, 30, 0.97)', '#3c5488');
    ctx.fillStyle = '#16233f';
    ctx.fillRect(x + 1, y + 1, w - 2, 16);
    drawText(ctx, this.title, x + 10, y + 5, TITLE);
    lines.forEach((line, i) => {
      const heading = line.startsWith('# ');
      drawText(ctx, heading ? line.slice(2) : line, x + 12, y + 22 + i * 10, heading ? SELECT : TEXT);
    });
    drawTextCentered(ctx, 'Press any key', x + w / 2, y + h - 11, '#5a6a90');
  }

  key(key: string): void {
    if (this.onKey?.(key)) return;
    this.host.pop();
  }
}

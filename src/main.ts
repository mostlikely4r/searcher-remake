// Entry point: owns the frame loop, keyboard, saves and the title and game-over screens.

import { Audio } from './audio/audio';
import { canOpenStation } from './core/economy';
import { drainEvents, type GameEvent } from './core/events';
import { cancelRefit, type Command, TICK_RATE, tick } from './core/sim';
import { createInitialState, type GameState, SAVE_VERSION } from './core/state';
import { drawText, drawTextCentered } from './render/font';
import { type CommsLine, drawHud } from './render/hud';
import { drawTitleShip, Renderer, SCREEN_H, SCREEN_W } from './render/renderer';
import { MenuModal, type Modal, type ModalHost, TextModal } from './ui/modals';
import {
  HELP_LINES, openAutopilot, openBeamForm, openHyperjump, openReport, openRocketForm, openStationMenu,
} from './ui/station';

const SAVE_KEY = 'searcher.save.v1';
const TICK_MS = 1000 / TICK_RATE;

/** Movement keys auto-repeat while held, standing in for the keyboard repeat INKEY$ relied on. */
const THRUST_KEYS: Record<string, [number, number]> = {
  w: [0, 1], x: [0, -1], a: [-1, 0], d: [1, 0],
  q: [-1, 1], e: [1, 1], z: [-1, -1], c: [1, -1],
  ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};
const REPEAT_DELAY_TICKS = 5;
const REPEAT_EVERY_TICKS = 2;

type Scene = 'title' | 'playing' | 'gameOver';

class Game implements ModalHost {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: Renderer;
  private readonly audio = new Audio();
  private state: GameState = createInitialState();
  private scene: Scene = 'title';
  private modals: Modal[] = [];
  private paused = false;
  private commands: Command[] = [];
  private held = new Map<string, number>();
  private comms: CommsLine[] = [];
  private accumulator = 0;
  private lastTime = 0;
  private frame = 0;
  private lastAutosave = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.bindInput();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('beforeunload', () => this.autosave());
    this.openTitleMenu();
    requestAnimationFrame((t) => this.loop(t));
  }

  // --- ModalHost ---
  push(modal: Modal): void {
    this.modals.push(modal);
  }
  pop(): void {
    this.modals.pop();
    if (this.scene === 'playing') this.autosave();
  }
  blip(): void {
    this.audio.blip();
  }
  deny(): void {
    this.audio.deny();
  }

  // --- Scenes ---
  private openTitleMenu(): void {
    this.modals = [];
    this.scene = 'title';
  }

  private titleRows(): Array<{ label: string; action: () => void }> {
    const rows: Array<{ label: string; action: () => void }> = [];
    if (this.hasSave()) rows.push({ label: 'CONTINUE', action: () => this.continueGame() });
    rows.push({ label: 'NEW GAME', action: () => this.newGame() });
    rows.push({ label: 'CONTROLS', action: () => this.showHelp() });
    return rows;
  }
  private titleIndex = 0;

  private hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  private newGame(): void {
    this.state = createInitialState();
    this.startPlaying();
  }

  private continueGame(): void {
    const loaded = this.load();
    if (!loaded) {
      this.newGame();
      return;
    }
    this.state = loaded;
    this.startPlaying();
  }

  private startPlaying(): void {
    this.scene = 'playing';
    this.paused = false;
    this.modals = [];
    this.comms = [];
    this.commands = [];
    this.held.clear();
    drainEvents();
    this.renderer.snapCamera(this.state);
    this.renderer.snapshot(this.state);
  }

  private showHelp(): void {
    this.push(new TextModal(this, 'CONTROLS', () => HELP_LINES, undefined, 500));
  }

  private openPauseMenu(): void {
    this.paused = true;
    this.push(new MenuModal(this, 'PAUSED', () => [
      { label: 'Resume', run: () => { this.closePause(); } },
      { label: 'Controls', run: () => this.showHelp() },
      { label: this.audio.muted ? 'Sound: off' : 'Sound: on', run: () => this.audio.setMuted(!this.audio.muted) },
      { label: 'Save and quit to title', run: () => { this.autosave(); this.openTitleMenu(); } },
    ]));
  }

  private closePause(): void {
    this.paused = false;
    this.pop();
  }

  // --- Persistence ---
  private autosave(): void {
    if (this.scene !== 'playing' || this.state.gameOver) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage may be full or disabled. The game still plays, it just won't resume later.
    }
  }

  private load(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GameState;
      return parsed.version === SAVE_VERSION ? parsed : null;
    } catch {
      return null;
    }
  }

  private clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }

  // --- Input ---
  private bindInput(): void {
    window.addEventListener('keydown', (event) => {
      this.audio.unlock();
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === 'Tab' || key === ' ' || key.startsWith('Arrow') || key === "'" || key === '/') event.preventDefault();
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.repeat) return;
      this.onKey(key);
    });
    window.addEventListener('keyup', (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      this.held.delete(key);
    });
    window.addEventListener('blur', () => this.held.clear());
    this.canvas.addEventListener('mousedown', (event) => {
      this.audio.unlock();
      const rect = this.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * SCREEN_W;
      const y = ((event.clientY - rect.top) / rect.height) * SCREEN_H;
      this.modals[this.modals.length - 1]?.click?.(x, y);
    });
  }

  private onKey(key: string): void {
    const modal = this.modals[this.modals.length - 1];
    if (modal) {
      modal.key(key);
      if (this.paused && this.modals.length === 0) this.paused = false;
      return;
    }
    if (this.scene === 'title') return this.titleKey(key);
    if (this.scene === 'gameOver') return this.gameOverKey(key);
    this.playKey(key);
  }

  private titleKey(key: string): void {
    const rows = this.titleRows();
    if (key === 'ArrowUp' || key === 'w') this.titleIndex = (this.titleIndex - 1 + rows.length) % rows.length;
    else if (key === 'ArrowDown' || key === 'x' || key === 's') this.titleIndex = (this.titleIndex + 1) % rows.length;
    else if (key === 'Enter' || key === ' ') rows[Math.min(this.titleIndex, rows.length - 1)].action();
    else return;
    this.audio.blip();
  }

  private gameOverKey(key: string): void {
    // The original asked "wilt u verder gaan j/n" and accepted j, y, yes and ja.
    if (key === 'j' || key === 'y' || key === 'Enter') {
      this.clearSave();
      this.newGame();
    } else if (key === 'n' || key === 'Escape') {
      this.clearSave();
      this.titleIndex = 0;
      this.openTitleMenu();
    }
  }

  private notice(text: string, urgent = false): void {
    this.comms.push({ text, urgent, life: 240 });
    if (this.comms.length > 4) this.comms.shift();
  }

  private playKey(key: string): void {
    const s = this.state;
    const thrust = THRUST_KEYS[key];
    if (thrust) {
      this.commands.push({ c: 'thrust', dx: thrust[0], dy: thrust[1] });
      this.held.set(key, 0);
      return;
    }
    switch (key) {
      case 's':
      case ' ':
        this.commands.push({ c: 'stop' });
        break;
      case 'l': this.commands.push({ c: 'speedUp' }); this.held.set(key, 0); break;
      case 'k': this.commands.push({ c: 'speedDown' }); this.held.set(key, 0); break;
      case 'j': this.commands.push({ c: 'laser' }); break;
      case 'p': this.commands.push({ c: 'launcher' }); break;
      case 'u': this.commands.push({ c: 'extraShield' }); break;
      case '9': this.commands.push({ c: 'solar' }); break;
      case '[': this.commands.push({ c: 'fuelTank' }); break;
      case 'o': this.commands.push({ c: 'dock' }); break;
      case 'y': this.commands.push({ c: 'clearTarget' }); break;
      case 'Tab': this.commands.push({ c: 'cycleTarget' }); break;
      case '6': this.commands.push({ c: 'comms' }); break;
      case '1': this.commands.push({ c: 'viewHome' }); break;
      case '2': this.commands.push({ c: 'viewNormal' }); break;
      case 'n': this.commands.push({ c: 'tuneLaser', delta: -1 }); break;
      case 'm': this.commands.push({ c: 'tuneLaser', delta: 1 }); break;
      case 'v': this.commands.push({ c: 'tuneShield', delta: -1 }); break;
      case 'b': this.commands.push({ c: 'tuneShield', delta: 1 }); break;
      case 'i':
        if (canOpenStation(s)) {
          openStationMenu(this, s);
        } else {
          this.notice('The station menu needs you docked. Stop by the ring and press O.');
          this.audio.deny();
        }
        break;
      case ']': openAutopilot(this, s); break;
      case 't':
        if (s.player.hyperCharge < 100) {
          this.notice(`Hyperdrive is charging: ${Math.floor(s.player.hyperCharge)}%.`);
          this.audio.deny();
        } else {
          openHyperjump(this, s);
        }
        break;
      case 'f': {
        const refused = openBeamForm(this, s);
        if (refused) {
          this.notice(refused);
          this.audio.deny();
        }
        break;
      }
      case '5': openReport(this, s); break;
      case 'h': this.showHelp(); break;
      case '4':
      case 'Escape':
        this.openPauseMenu();
        break;
      case "'":
        // The original ran the DOS menu program from here, while the solar panels were open.
        if (s.player.solar === 1) {
          this.autosave();
          this.openTitleMenu();
        }
        break;
      default:
        break;
    }
  }

  /** Repeats held thrust keys while a game tick runs. */
  private repeatHeld(): void {
    for (const [key, age] of this.held) {
      const next = age + 1;
      this.held.set(key, next);
      if (next < REPEAT_DELAY_TICKS || (next - REPEAT_DELAY_TICKS) % REPEAT_EVERY_TICKS !== 0) continue;
      const thrust = THRUST_KEYS[key];
      if (thrust) this.commands.push({ c: 'thrust', dx: thrust[0], dy: thrust[1] });
      else if (key === 'l') this.commands.push({ c: 'speedUp' });
      else if (key === 'k') this.commands.push({ c: 'speedDown' });
    }
  }

  // --- Frame loop ---
  private loop(now: number): void {
    requestAnimationFrame((t) => this.loop(t));
    const elapsed = Math.min(now - this.lastTime, 250);
    this.lastTime = now;
    this.frame++;
    if (this.scene === 'playing' && this.modals.length === 0) {
      this.accumulator += elapsed;
      while (this.accumulator >= TICK_MS) {
        this.accumulator -= TICK_MS;
        this.simulate();
      }
    } else {
      this.accumulator = 0;
    }
    this.render(elapsed / 1000);
  }

  private simulate(): void {
    this.repeatHeld();
    this.renderer.snapshot(this.state);
    const px = this.state.player.x;
    const py = this.state.player.y;
    tick(this.state, this.commands);
    this.commands = [];
    this.renderer.stepEffects(this.state);
    this.processEvents(drainEvents());
    // A hyperjump must not smear the camera across the map.
    if (Math.abs(this.state.player.x - px) > 300 || Math.abs(this.state.player.y - py) > 300) {
      this.renderer.snapCamera(this.state);
    }
    for (const line of this.comms) line.life--;
    this.comms = this.comms.filter((line) => line.life > 0);
    this.lastAutosave++;
    if (this.lastAutosave > TICK_RATE * 20) {
      this.lastAutosave = 0;
      this.autosave();
    }
  }

  private processEvents(events: GameEvent[]): void {
    this.renderer.consume(events);
    this.audio.handle(events);
    for (const e of events) {
      if (e.t === 'comms') this.notice(e.text, e.urgent);
      if (e.t === 'rocketFormNeeded') openRocketForm(this, this.state);
      if (e.t === 'gameOver') {
        this.scene = 'gameOver';
        this.clearSave();
      }
    }
  }

  private render(frameSeconds: number): void {
    const ctx = this.renderer.ctx;
    if (this.scene === 'title') {
      this.drawTitle(ctx, frameSeconds);
    } else {
      // Anything queued while a modal was open still reaches the screen and the speakers.
      this.processEvents(drainEvents());
      const moving = this.scene === 'playing' && this.modals.length === 0;
      const alpha = moving ? this.accumulator / TICK_MS : 1;
      this.renderer.draw(this.state, alpha, frameSeconds);
      drawHud(ctx, this.state, this.comms, this.frame);
      if (this.scene === 'gameOver') {
        this.renderer.stepEffects(this.state);
        this.drawGameOver(ctx);
      }
    }
    const modal = this.modals[this.modals.length - 1];
    if (modal) modal.draw(ctx);
  }

  private drawTitle(ctx: CanvasRenderingContext2D, frameSeconds: number): void {
    this.renderer.cameraX = this.frame * 1.5;
    this.renderer.cameraY = Math.sin(this.frame * 0.003) * 200;
    const title = createTitleBackdrop(this.renderer, this.state, frameSeconds);
    title();
    ctx.fillStyle = 'rgba(3, 4, 12, 0.55)';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    drawTextCentered(ctx, 'SEARCHER', SCREEN_W / 2 + 3, 63, '#1a3a8a', 6);
    drawTextCentered(ctx, 'SEARCHER', SCREEN_W / 2, 60, '#c8e4ff', 6);
    drawTextCentered(ctx, 'Find the enemy base. Destroy it. Stay alive.', SCREEN_W / 2, 118, '#7f93bd');
    drawTitleShip(ctx, SCREEN_W / 2, 158 + Math.sin(this.frame * 0.05) * 4, 2);

    const rows = this.titleRows();
    const index = Math.min(this.titleIndex, rows.length - 1);
    rows.forEach((row, i) => {
      const y = 208 + i * 18;
      const active = i === index;
      drawTextCentered(ctx, row.label, SCREEN_W / 2, y, active ? '#ffc93c' : '#d8e4ff', 2);
      if (active) drawText(ctx, '>', SCREEN_W / 2 - 80, y + 4, '#ffc93c');
    });
    drawTextCentered(ctx, 'Up / Down, Enter', SCREEN_W / 2, SCREEN_H - 32, '#5a6a90');
    drawTextCentered(ctx, 'A remake of a QBasic game written as a kid', SCREEN_W / 2, SCREEN_H - 18, '#4a5678');
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(30, 4, 8, 0.55)';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    drawTextCentered(ctx, 'GAME OVER', SCREEN_W / 2, 110, '#ff5a48', 4);
    drawTextCentered(ctx, this.state.gameOver?.cause ?? '', SCREEN_W / 2, 158, '#ffb0a0');
    drawTextCentered(ctx, `Enemy bases destroyed: ${this.state.basesDestroyed}`, SCREEN_W / 2, 174, '#d8e4ff');
    drawTextCentered(ctx, 'Do you want to continue? Y / N', SCREEN_W / 2, 200, '#ffc93c');
  }

  private resize(): void {
    const scale = Math.floor(Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H));
    const fit = scale >= 1 ? scale : Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H);
    this.canvas.style.width = `${SCREEN_W * fit}px`;
    this.canvas.style.height = `${SCREEN_H * fit}px`;
  }

  /** Test hook for driving the game from automated checks and the dev console. */
  debugHandle() {
    return {
      state: () => this.state,
      key: (key: string) => this.onKey(key),
      release: (key: string) => this.held.delete(key),
      advance: (ticks: number) => {
        for (let i = 0; i < ticks; i++) this.simulate();
      },
      scene: () => this.scene,
      modals: () => this.modals.length,
      cancelRefit: () => cancelRefit(this.state),
    };
  }
}

function createTitleBackdrop(renderer: Renderer, _s: GameState, _dt: number): () => void {
  return () => renderer.drawBackdropOnly();
}

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Missing #game canvas');
const game = new Game(canvas);
if (import.meta.env.DEV) {
  (window as unknown as { searcher: unknown }).searcher = game.debugHandle();
}

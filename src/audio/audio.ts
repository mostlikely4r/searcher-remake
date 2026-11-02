// Small WebAudio synth. The original used SOUND and PLAY, so everything here is generated too,
// including the two PLAY melodies from the source.

import type { GameEvent } from '../core/events';

const NOTE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;
  private lastHit = 0;
  private lastBeam = 0;

  /** Browsers only allow audio after a user gesture, so this runs on the first key press. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null; // No audio device: the game plays silently.
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.22;
  }

  private tone(freq: number, duration: number, type: OscillatorType, volume = 0.5, slideTo?: number, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + duration);
  }

  private noise(duration: number, volume: number, cutoff: number): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
  }

  /** Plays a QBasic PLAY string such as "o3l64cdefgfedc". */
  private play(music: string): void {
    const octave = Number(/o(\d)/.exec(music)?.[1] ?? 4);
    const length = Number(/l(\d+)/.exec(music)?.[1] ?? 16);
    const notes = music.replace(/o\d|l\d+/g, '');
    const step = 4 / length / 2; // Roughly 120 BPM.
    [...notes].forEach((n, i) => {
      const semitone = NOTE[n];
      if (semitone === undefined) return;
      const freq = 440 * 2 ** ((octave - 4) + (semitone - 9) / 12) * 2;
      this.tone(freq, Math.max(0.06, step), 'square', 0.25, undefined, i * Math.max(0.05, step * 0.8));
    });
  }

  blip(): void {
    this.tone(660, 0.04, 'square', 0.18);
  }

  deny(): void {
    this.tone(150, 0.12, 'square', 0.25);
  }

  handle(events: readonly GameEvent[]): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const e of events) {
      switch (e.t) {
        case 'beam':
          if (e.kind === 'player') this.tone(1600, 0.11, 'sawtooth', 0.35, 500);
          else if (now - this.lastBeam > 0.06) {
            this.lastBeam = now;
            if (e.kind === 'cruiserHeavy') this.tone(320, 0.25, 'sawtooth', 0.4, 80);
            else this.tone(e.kind === 'hunter' ? 900 : 640, 0.05, 'square', 0.12, 300);
          }
          break;
        case 'laserMiss':
          this.tone(260, 0.06, 'triangle', 0.25, 130);
          break;
        case 'playerHit':
          if (now - this.lastHit > 0.1) {
            this.lastHit = now;
            this.noise(0.12, 0.5, 1200);
          }
          break;
        case 'explosion':
          this.noise(0.25 + Math.min(1.4, e.size / 300), Math.min(1, 0.4 + e.size / 400), 900);
          this.tone(90, 0.3 + Math.min(0.8, e.size / 500), 'sine', 0.5, 30);
          break;
        case 'rocketLaunch':
          this.noise(0.3, 0.3, 2400);
          this.tone(200, 0.3, 'sawtooth', 0.2, 700);
          break;
        case 'pickup':
          this.tone(880, 0.07, 'square', 0.3);
          this.tone(1320, 0.14, 'square', 0.3, undefined, 0.07);
          break;
        case 'docked':
          this.tone(2000, 0.14, 'sine', 0.3);
          break;
        case 'undocked':
          this.tone(800, 0.1, 'sine', 0.25, 400);
          break;
        case 'hyper':
          this.play('o3l64cdefgfedc');
          break;
        case 'delivery':
          this.play('o3l16cdedc');
          break;
        case 'comms':
          this.tone(e.urgent ? 1100 : 1500, 0.04, 'square', 0.12);
          break;
        default:
          break;
      }
    }
  }
}

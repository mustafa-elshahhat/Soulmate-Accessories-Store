import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const MUTE_KEY = 'soulmate_sound_muted';

/**
 * Centralised micro-interaction audio service.
 * Uses a single shared AudioContext that is resumed on first user gesture.
 * Guards against SSR and Chrome autoplay policy.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private platformId = inject(PLATFORM_ID);
  private ctx: AudioContext | null = null;
  private userHasInteracted = false;

  isMuted = signal(this.loadMuted());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const unlock = () => {
        this.userHasInteracted = true;
        if (this.ctx?.state === 'suspended') {
          this.ctx.resume();
        }
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
      document.addEventListener('touchstart', unlock, { once: true });
    }
  }

  toggleMute(): void {
    const next = !this.isMuted();
    this.isMuted.set(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(MUTE_KEY, JSON.stringify(next));
    }
  }

  /** Short chirp played when an item is added to the cart. */
  playCartSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /** Gentle descending tone when removing an item. */
  playRemoveSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /** Two-tone ascending chime for order placed successfully. */
  playOrderSuccessSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, ctx.currentTime);
    osc1.connect(gain);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
    osc2.connect(gain);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.35);
  }

  /** Soft ping for new notification. */
  playNotificationSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** Quick pop when toggling wishlist. */
  playWishlistSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Returns the shared AudioContext if playback is allowed, null otherwise.
   * Skips if: SSR, muted, no user gesture yet, or context is suspended.
   */
  private getContext(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId) || this.isMuted() || !this.userHasInteracted) {
      return null;
    }
    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx.state === 'running' ? this.ctx : null;
  }

  private loadMuted(): boolean {
    if (typeof globalThis.localStorage === 'undefined') return false;
    try {
      return JSON.parse(localStorage.getItem(MUTE_KEY) || 'false');
    } catch {
      return false;
    }
  }
}

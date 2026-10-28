/**
 * Procedural Web Audio Sound Synthesizer for PixelCraft Odyssey
 * Zero external audio files required, runs 100% offline & mobile-friendly!
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a simple frequency envelope
  public playTone(
    freq: number,
    endFreq: number,
    type: OscillatorType,
    duration: number,
    gainLevel = 0.15
  ) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(10, endFreq),
        this.ctx.currentTime + duration
      );

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback fails gracefully if blocked by autoplay policy
    }
  }

  // Noise burst for hitting or footsteps
  private playNoise(duration: number, gainLevel = 0.1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  }

  public playSlash() {
    this.playTone(420, 120, 'triangle', 0.1, 0.18);
  }

  public playHit() {
    this.playNoise(0.08, 0.22);
    this.playTone(180, 45, 'sawtooth', 0.12, 0.2);
  }

  public playChop() {
    this.playTone(280, 90, 'square', 0.08, 0.15);
    this.playNoise(0.06, 0.12);
  }

  public playMine() {
    this.playTone(600, 220, 'square', 0.09, 0.14);
  }

  public playCoin() {
    this.playTone(987, 1318, 'sine', 0.12, 0.15);
  }

  public playEat() {
    this.playTone(320, 480, 'sine', 0.08, 0.18);
    setTimeout(() => this.playTone(480, 600, 'sine', 0.08, 0.15), 90);
  }

  public playLevelUp() {
    const notes = [261, 329, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.05, 'triangle', 0.15, 0.2);
      }, i * 90);
    });
  }

  public playCraft() {
    this.playTone(350, 700, 'sawtooth', 0.15, 0.14);
  }

  public playBuild() {
    this.playTone(240, 360, 'square', 0.12, 0.15);
  }

  public playDash() {
    this.playTone(250, 650, 'sine', 0.14, 0.12);
  }

  public playFishBite() {
    this.playTone(650, 880, 'sine', 0.1, 0.25);
    setTimeout(() => this.playTone(880, 1100, 'sine', 0.1, 0.25), 80);
  }

  public playSplash() {
    this.playNoise(0.18, 0.15);
  }

  public playNightHowl() {
    this.playTone(180, 240, 'sine', 0.6, 0.08);
  }

  public playMorningChime() {
    this.playTone(523, 659, 'triangle', 0.3, 0.12);
  }

  public playVoiceChirp() {
    this.playTone(500, 750, 'sine', 0.06, 0.1);
  }
}

export const sound = new SoundManager();

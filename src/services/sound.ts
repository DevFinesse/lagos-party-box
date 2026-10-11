// Procedural sound synthesizer using Web Audio API (Zero audio assets required)
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Bottle spinning whirr
  public spin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(80, now + 2.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.5);
  }

  // Sharp tick/pop when bottle lands or card flips
  public click() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Dramatic suspense sting
  public suspense() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [220, 261.63, 311.13].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // Victory / point scored chime
  public victory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  // Buzzer / forfeit sound
  public buzz() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(95, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Liquid / sip / forfeit drink
  public drink() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [400, 300, 220].forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, t + 0.09);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // 💸 Spray Money: Fluttering naira notes & coin clinks
  public sprayMoney() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Notes flutter (white-noise-like filtered burst + rapid melodic coin rings)
    [1200, 1600, 2200, 1800, 2400].forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.05);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // 🥁 African talking drum roll before reveals
  public drumRoll() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + i * 15, t);
      osc.frequency.exponentialRampToValueAtTime(180 + i * 20, t + 0.07);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // 🎺 Lagos party horn celebration
  public horn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // 🎶 Ambient Afrobeats procedural background lounge vibe
  public musicEnabled: boolean = false;
  private musicInterval: any = null;
  private currentStep: number = 0;

  public toggleMusic(): boolean {
    if (this.musicEnabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicEnabled;
  }

  public startMusic() {
    this.initCtx();
    if (!this.ctx) return;
    this.musicEnabled = true;
    if (this.musicInterval) clearInterval(this.musicInterval);

    // 108 BPM -> 16th note step = ~138ms
    const stepTime = 138;
    // Chords: Fm7 -> Bbm7 -> Eb7 -> Abmaj7
    const chords = [
      [174.61, 207.65, 261.63, 311.13], // F, Ab, C, Eb
      [116.54, 138.59, 174.61, 207.65], // Bb, Db, F, Ab
      [155.56, 196.00, 233.08, 277.18], // Eb, G, Bb, Db
      [207.65, 261.63, 311.13, 392.00]  // Ab, C, Eb, G
    ];
    const bassNotes = [87.31, 58.27, 77.78, 103.83];

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const beat = this.currentStep % 16;
      const chordIdx = Math.floor(beat / 4);

      // Shaker on every 16th note
      if (beat % 2 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200 + Math.random() * 800, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }

      // Soft kick on beat 0, 6, 10
      if (beat === 0 || beat === 6 || beat === 10) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(110, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        kickGain.gain.setValueAtTime(0.12, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      // Afrobeats Rhodes chord tap on beat 0 and beat 8
      if (beat === 0 || beat === 8) {
        const activeChord = chords[chordIdx];
        activeChord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        });
      }

      // Warm syncopated bass on beat 2, 7, 12
      if (beat === 2 || beat === 7 || beat === 12) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassNotes[chordIdx], now);
        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.25);
      }

      this.currentStep = (this.currentStep + 1) % 64;
    }, stepTime);
  }

  public stopMusic() {
    this.musicEnabled = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sounds = new SoundEngine();

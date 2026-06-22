// Retro 8-bit sound synthesizer using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMuted: boolean = false;
  private currentTempo: number = 120;

  constructor() {
    // AudioContext is initialized lazily upon first interaction to comply with browser autoplay policies.
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.initCtx();
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  private playTone(
    freqs: number[],
    durations: number[],
    type: OscillatorType = "square",
    volume: number = 0.1,
    glide: boolean = false
  ) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    let accumTime = 0;
    freqs.forEach((freq, idx) => {
      const start = now + accumTime;
      const dur = durations[idx];

      if (glide && idx > 0) {
        osc.frequency.exponentialRampToValueAtTime(freq, start + dur);
      } else {
        osc.frequency.setValueAtTime(freq, start);
      }
      accumTime += dur;
    });

    // Volume envelope
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + accumTime);

    osc.start(now);
    osc.stop(now + accumTime + 0.05);
  }

  public playJump() {
    this.playTone([150, 600], [0.05, 0.15], "triangle", 0.15, true);
  }

  public playCoin() {
    this.playTone([987.77, 1318.51], [0.08, 0.25], "sine", 0.1, false);
  }

  public playPowerUp() {
    this.playTone([330, 392, 659, 523, 587, 784], [0.06, 0.06, 0.06, 0.06, 0.06, 0.15], "triangle", 0.1, false);
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // White noise stomp sound
    const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start();
  }

  public playBrickBreak() {
    this.playTone([180, 80], [0.08, 0.12], "sawtooth", 0.15, true);
  }

  public playHurt() {
    this.playTone([220, 110, 55], [0.1, 0.1, 0.15], "sawtooth", 0.2, false);
  }

  public playFireball() {
    this.playTone([400, 700], [0.04, 0.08], "triangle", 0.08, true);
  }

  public playGameOver() {
    this.playTone([392, 370, 349, 293], [0.15, 0.15, 0.15, 0.5], "square", 0.15, false);
  }

  public playVictory() {
    // Iconic victory tune arpeggio
    this.playTone(
      [261, 329, 392, 523, 659, 784, 987, 1046, 1046],
      [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.15, 0.4],
      "square",
      0.12,
      false
    );
  }

  public playLevelSuccess() {
    this.playTone([523, 587, 659, 698, 784, 880, 987, 1046], [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.4], "sine", 0.12, false);
  }

  public startMusic(theme: "grass" | "underground" | "sky" | "castle" = "grass") {
    this.stopMusic();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    let index = 0;
    let mainNotes: number[];
    let bassNotes: number[];

    if (theme === "underground") {
      // Mystical, slower subterranean beat
      mainNotes = [
        196, 262, 330, 0, 196, 262, 330, 0,
        147, 220, 277, 0, 147, 220, 277, 0
      ];
      bassNotes = [98, 0, 98, 0, 87, 0, 87, 0];
      this.currentTempo = 110;
    } else if (theme === "castle") {
      // Intense, faster battle beat
      mainNotes = [
        131, 139, 147, 156, 165, 0, 165, 165,
        156, 147, 139, 131, 123, 0, 123, 123
      ];
      bassNotes = [65, 65, 69, 69, 73, 73, 62, 62];
      this.currentTempo = 140;
    } else if (theme === "sky") {
      // Dreamy floating notes
      mainNotes = [
        293, 349, 440, 523, 587, 523, 440, 349,
        329, 392, 494, 587, 659, 587, 494, 392
      ];
      bassNotes = [147, 0, 147, 0, 165, 0, 165, 0];
      this.currentTempo = 115;
    } else {
      // Classical Mario-inspired upbeat 1-1 track
      mainNotes = [
        659, 659, 0, 659, 0, 523, 659, 0,
        784, 0, 0, 0, 392, 0, 0, 0,
        523, 0, 0, 392, 0, 0, 330, 0,
        0, 440, 0, 494, 0, 440, 415, 0
      ];
      bassNotes = [
        131, 131, 0, 131, 0, 131, 131, 0,
        196, 0, 0, 0, 98, 0, 0, 0,
        131, 0, 0, 98, 0, 0, 82, 0,
        0, 110, 0, 123, 0, 110, 103, 0
      ];
      this.currentTempo = 130;
    }

    const noteDuration = 60 / this.currentTempo / 2; // eighth notes

    const playNextBar = () => {
      if (this.isMuted || !this.ctx) return;
      
      const now = this.ctx.currentTime;
      
      for (let i = 0; i < 8; i++) {
        const noteIdx = (index + i) % mainNotes.length;
        const mainNote = mainNotes[noteIdx];
        const bassVal = bassNotes[Math.floor((index + i) / 2) % bassNotes.length];
        const timeOffset = i * noteDuration;

        // Play main voice
        if (mainNote > 0) {
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(mainNote, now + timeOffset);
          
          gainNode.gain.setValueAtTime(0.04, now + timeOffset);
          gainNode.gain.exponentialRampToValueAtTime(0.005, now + timeOffset + noteDuration - 0.02);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + noteDuration);
        }

        // Play bass voice on the beat
        if (i % 2 === 0 && bassVal > 0) {
          const bOsc = this.ctx.createOscillator();
          const bGainNode = this.ctx.createGain();
          bOsc.type = "sine";
          bOsc.frequency.setValueAtTime(bassVal, now + timeOffset);
          
          bGainNode.gain.setValueAtTime(0.08, now + timeOffset);
          bGainNode.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + noteDuration * 1.8);
          
          bOsc.connect(bGainNode);
          bGainNode.connect(this.ctx.destination);
          
          bOsc.start(now + timeOffset);
          bOsc.stop(now + timeOffset + noteDuration * 2);
        }
      }

      index = (index + 8) % mainNotes.length;
    };

    // Orchestrate with a reliable interval matching the tempo
    const barDurationMs = 8 * noteDuration * 1000;
    
    // Play immediately first
    playNextBar();
    
    this.musicInterval = setInterval(playNextBar, barDurationMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundManager();

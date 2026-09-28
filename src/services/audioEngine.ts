/**
 * Professional Web Audio DJ Engine
 * Handles audio playback, 3-band EQ, resonant DJ filter, master ducking,
 * vinyl scratching, loop management, sound FX synthesis, and real-time spectrum analysis.
 */

export class DJAudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  
  // EQ Nodes
  private lowNode: BiquadFilterNode | null = null;
  private midNode: BiquadFilterNode | null = null;
  private highNode: BiquadFilterNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  
  // Gain Nodes
  private deckGainNode: GainNode | null = null;
  private duckingGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  
  // Analysis
  private analyserNode: AnalyserNode | null = null;
  
  // State
  private isInitialized = false;
  private duckingAmount = 0.8; // 80% volume drop during speech
  private isDucking = false;
  
  // Looping
  public isLooping = false;
  public loopInTime = 0;
  public loopOutTime = 0;
  
  // Cue Points
  public cuePoints: Map<number, number> = new Map();
  public tempCue = 0;

  // Listeners
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.audioElement) return;
      const current = this.audioElement.currentTime;
      const duration = this.audioElement.duration || 0;
      
      // Auto-loop check
      if (this.isLooping && this.loopOutTime > this.loopInTime) {
        if (current >= this.loopOutTime) {
          this.audioElement.currentTime = this.loopInTime;
        }
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(current, duration);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    if (!this.audioElement) return;

    this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);

    // 1. Low EQ (Lowshelf at 250 Hz)
    this.lowNode = this.ctx.createBiquadFilter();
    this.lowNode.type = 'lowshelf';
    this.lowNode.frequency.value = 250;
    this.lowNode.gain.value = 0;

    // 2. Mid EQ (Peaking at 1000 Hz)
    this.midNode = this.ctx.createBiquadFilter();
    this.midNode.type = 'peaking';
    this.midNode.frequency.value = 1000;
    this.midNode.Q.value = 1.0;
    this.midNode.gain.value = 0;

    // 3. High EQ (Highshelf at 4000 Hz)
    this.highNode = this.ctx.createBiquadFilter();
    this.highNode.type = 'highshelf';
    this.highNode.frequency.value = 4000;
    this.highNode.gain.value = 0;

    // 4. DJ Filter (Lowpass / Highpass sweep)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'allpass';
    this.filterNode.frequency.value = 1000;
    this.filterNode.Q.value = 1.5;

    // 5. Deck Volume Gain
    this.deckGainNode = this.ctx.createGain();
    this.deckGainNode.gain.value = 1.0;

    // 6. Voice Auto-Ducking Gain
    this.duckingGainNode = this.ctx.createGain();
    this.duckingGainNode.gain.value = 1.0;

    // 7. Master Gain
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 1.0;

    // 8. Real-time Analyser
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect node chain:
    // Source -> Low -> Mid -> High -> DJ Filter -> Deck Gain -> Ducking Gain -> Master Gain -> Analyser -> Destination
    this.sourceNode
      .connect(this.lowNode)
      .connect(this.midNode)
      .connect(this.highNode)
      .connect(this.filterNode)
      .connect(this.deckGainNode)
      .connect(this.duckingGainNode)
      .connect(this.masterGainNode)
      .connect(this.analyserNode)
      .connect(this.ctx.destination);

    this.isInitialized = true;
  }

  public async loadTrack(url: string): Promise<void> {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.audioElement) return;

    return new Promise((resolve, reject) => {
      if (!this.audioElement) return reject(new Error('Audio element missing'));
      
      const onCanPlay = () => {
        this.audioElement?.removeEventListener('canplay', onCanPlay);
        resolve();
      };
      
      const onError = (e: Event) => {
        this.audioElement?.removeEventListener('error', onError);
        reject(e);
      };

      this.audioElement.addEventListener('canplay', onCanPlay, { once: true });
      this.audioElement.addEventListener('error', onError, { once: true });

      this.audioElement.src = url;
      this.audioElement.load();
    });
  }

  public async play(): Promise<void> {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.audioElement) {
      return this.audioElement.play();
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public isPlaying(): boolean {
    return !!(this.audioElement && !this.audioElement.paused && !this.audioElement.ended);
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  public seek(seconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || 0));
    }
  }

  public setPlaybackRate(rate: number): void {
    if (this.audioElement) {
      // Clamped between 0.5x and 2.0x
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }

  public getPlaybackRate(): number {
    return this.audioElement?.playbackRate || 1.0;
  }

  // --- Cue Management ---
  public setCue(id: number): void {
    const time = this.getCurrentTime();
    this.cuePoints.set(id, time);
  }

  public jumpToCue(id: number): void {
    const time = this.cuePoints.get(id);
    if (time !== undefined) {
      this.seek(time);
    }
  }

  public deleteCue(id: number): void {
    this.cuePoints.delete(id);
  }

  public jumpToTempCue(): void {
    this.seek(this.tempCue);
    this.pause();
  }

  public setTempCue(): void {
    this.tempCue = this.getCurrentTime();
  }

  // --- Looping ---
  public setAutoLoop(beatCount: number, bpm: number): void {
    if (!bpm || bpm <= 0) bpm = 128;
    const beatDuration = 60 / bpm;
    const loopLength = beatCount * beatDuration;
    
    const current = this.getCurrentTime();
    this.loopInTime = current;
    this.loopOutTime = current + loopLength;
    this.isLooping = true;
  }

  public exitLoop(): void {
    this.isLooping = false;
  }

  // --- EQ & Filters ---
  public setLow(db: number): void {
    if (this.lowNode && this.ctx) {
      this.lowNode.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
    }
  }

  public setMid(db: number): void {
    if (this.midNode && this.ctx) {
      this.midNode.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
    }
  }

  public setHigh(db: number): void {
    if (this.highNode && this.ctx) {
      this.highNode.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * DJ Filter Knob: range -100 to +100
   * -100: Heavy Low Pass Filter (underwater)
   * 0: Neutral (Filter Off)
   * +100: Heavy High Pass Filter (air sweep)
   */
  public setDjFilter(value: number): void {
    if (!this.filterNode || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (Math.abs(value) < 3) {
      // Neutral bypass
      this.filterNode.type = 'allpass';
      this.filterNode.frequency.setTargetAtTime(1000, now, 0.04);
    } else if (value < 0) {
      // Lowpass sweep: value from -3 to -100 maps to 18000 Hz down to 250 Hz
      const norm = Math.abs(value) / 100;
      const freq = 18000 * Math.pow(0.015, norm);
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setTargetAtTime(Math.max(150, freq), now, 0.04);
      this.filterNode.Q.setTargetAtTime(2.2, now, 0.04);
    } else {
      // Highpass sweep: value from +3 to +100 maps to 40 Hz up to 7000 Hz
      const norm = value / 100;
      const freq = 40 + (7000 - 40) * Math.pow(norm, 1.8);
      this.filterNode.type = 'highpass';
      this.filterNode.frequency.setTargetAtTime(freq, now, 0.04);
      this.filterNode.Q.setTargetAtTime(2.2, now, 0.04);
    }
  }

  public setDeckGain(gain: number): void {
    if (this.deckGainNode && this.ctx) {
      this.deckGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1.5, gain)), this.ctx.currentTime, 0.05);
    }
  }

  public setMasterGain(gain: number): void {
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1.2, gain)), this.ctx.currentTime, 0.05);
    }
  }

  // --- Auto-Ducking for DJ Voice commentary ---
  public setDuckingAmount(amount: number): void {
    this.duckingAmount = Math.max(0, Math.min(1, amount));
  }

  public activateDucking(): void {
    if (!this.duckingGainNode || !this.ctx) return;
    this.isDucking = true;
    const targetGain = Math.max(0.1, 1 - this.duckingAmount);
    // Smooth radio-style attenuation over 120ms
    this.duckingGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.duckingGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.12);
  }

  public releaseDucking(): void {
    if (!this.duckingGainNode || !this.ctx) return;
    this.isDucking = false;
    // Smooth ramp back to full volume over 250ms
    this.duckingGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.duckingGainNode.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.25);
  }

  public getIsDucking(): boolean {
    return this.isDucking;
  }

  // --- Real-time Analyser ---
  public getFrequencyData(array: any): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  public getTimeDomainData(array: any): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    }
  }

  // --- Vinyl Scratch Simulation ---
  public simulateScratch(direction: number): void {
    if (!this.audioElement) return;
    const now = this.getCurrentTime();
    const jump = direction * 0.08;
    this.seek(now + jump);

    // Play tactile scratch noise
    this.playSynthesizedSfx('scratch');
  }

  // --- Event Callbacks ---
  public onTimeUpdate(cb: (time: number, duration: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void): void {
    this.onEndedCallback = cb;
  }

  // --- Built-in Procedural DJ Sound Effects Synthesizer ---
  public playSynthesizedSfx(type: string): void {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    switch (type) {
      case 'airhorn': {
        // Classic reggae / club air horn chord (F#, G, G# triad dissonant blast)
        const freqs = [370, 466, 554, 740];
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.4);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        });
        break;
      }

      case 'laser': {
        // Sci-fi club laser sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'siren': {
        // Rising club rave siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.3);
        osc.frequency.linearRampToValueAtTime(450, now + 0.6);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.9);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
        break;
      }

      case 'scratch': {
        // Short vinyl scratch vinyl click & scrape
        const bufferSize = ctx.sampleRate * 0.09;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.05);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.09);
        filter.Q.value = 4.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        break;
      }

      case 'subdrop': {
        // Massive 808 sub bass drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }

      case 'rewind': {
        // Vinyl tape stop / backspin sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }
    }
  }

  // --- Text-to-Speech Playback with Auto-Ducking ---
  public async playTtsAudio(
    audioBase64: string,
    mimeType: string,
    sampleRate = 24000
  ): Promise<void> {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Activate auto-ducking on music deck
    this.activateDucking();

    try {
      if (mimeType.includes('pcm')) {
        // Raw PCM (Gemini TTS default)
        const binaryString = atob(audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const floatArray = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          floatArray[i] = int16Array[i] / 32768.0;
        }

        const audioBuffer = ctx.createBuffer(1, floatArray.length, sampleRate);
        audioBuffer.copyToChannel(floatArray, 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Add a slight DJ vocal radio presence boost (high-mid EQ)
        const presenceFilter = ctx.createBiquadFilter();
        presenceFilter.type = 'peaking';
        presenceFilter.frequency.value = 3200;
        presenceFilter.gain.value = 3;

        const voiceGain = ctx.createGain();
        voiceGain.gain.value = 1.25;

        source.connect(presenceFilter);
        presenceFilter.connect(voiceGain);
        voiceGain.connect(ctx.destination);

        return new Promise((resolve) => {
          source.onended = () => {
            this.releaseDucking();
            resolve();
          };
          source.start();
        });
      } else {
        // Encoded MP3 / WAV (e.g. from Speechify)
        const blob = await fetch(`data:${mimeType};base64,${audioBase64}`).then((r) => r.blob());
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        return new Promise((resolve) => {
          source.onended = () => {
            this.releaseDucking();
            resolve();
          };
          source.start();
        });
      }
    } catch (err) {
      console.error('Error playing TTS audio buffer:', err);
      this.releaseDucking();
    }
  }

  // --- Fallback Browser Speech Synthesis with Auto-Ducking ---
  public speakWithBrowser(text: string, language: 'en' | 'sk', onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    this.activateDucking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'sk' ? 'sk-SK' : 'en-US';
    utterance.rate = 1.05; // punchy DJ delivery
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      language === 'sk'
        ? v.lang.startsWith('sk')
        : (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      this.releaseDucking();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.releaseDucking();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopAllSpeech(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.releaseDucking();
  }
}

// Export singleton audio engine
export const audioEngine = new DJAudioEngine();

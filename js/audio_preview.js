/**
 * サブカルポップBGM リアルタイム合成プレビューエンジン (Web Audio API)
 * ローズピアノ × 8bitピコピコ × ローファイビートによる作業用チル音響
 */

class SubculAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.currentStep = 0;
    this.masterGain = null;
    this.volume = 0.25;
    this.noiseBuffer = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.0;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // スケール・コードごとの周波数 (Hz)
  getScaleData(keyId) {
    switch (keyId) {
      case 'city_maj7':
        // C maj7 (シティポップ: C4, E4, G4, B4, D5, E5, G5, A5)
        return {
          chords: [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [329.63, 392.00, 493.88, 587.33], // Em7
            [349.23, 440.00, 523.25, 659.25]  // Fmaj7
          ],
          arpFreqs: [261.63, 329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 880.00],
          rootBasses: [130.81, 146.83, 164.81, 174.61]
        };
      case 'neo_soul_min':
        // Fm7 / ネオソウル
        return {
          chords: [
            [174.61, 261.63, 311.13, 392.00], // Fm9
            [207.65, 261.63, 311.13, 415.30], // Abmaj7
            [233.08, 293.66, 349.23, 440.00], // Bb7
            [261.63, 311.13, 392.00, 466.16]  // Cm7
          ],
          arpFreqs: [349.23, 392.00, 415.30, 523.25, 622.25, 698.46, 783.99, 880.00],
          rootBasses: [87.31, 103.83, 116.54, 130.81]
        };
      case 'sweet_penta':
        // G渋谷系ポップ (G, A, B, D, E)
        return {
          chords: [
            [196.00, 246.94, 293.66, 392.00], // G
            [220.00, 261.63, 329.63, 440.00], // Am
            [246.94, 293.66, 392.00, 493.88], // Bm
            [261.63, 329.63, 392.00, 523.25]  // C
          ],
          arpFreqs: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77],
          rootBasses: [98.00, 110.00, 123.47, 130.81]
        };
      case 'marusa_eb':
      default:
        // 丸サ進行 (Ebmaj7 - D7 - Gm7 - Bb7) 最高にお洒落な王道
        return {
          chords: [
            [311.13, 392.00, 466.16, 587.33], // Ebmaj7 (IVmaj7)
            [293.66, 369.99, 440.00, 523.25], // D7 (III7)
            [196.00, 293.66, 349.23, 440.00], // Gm7 (VIm7)
            [233.08, 293.66, 349.23, 466.16]  // Bb7 (I7)
          ],
          arpFreqs: [311.13, 392.00, 466.16, 523.25, 587.33, 698.46, 783.99, 932.33],
          rootBasses: [155.56, 146.83, 98.00, 116.54]
        };
    }
  }

  // ローズピアノの温かいコード音
  playRhodesChord(chordNotes, time, duration = 0.8) {
    if (!this.ctx) return;
    chordNotes.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // 8bitアルペジオ (ピコピコ矩形波)
  playChiptuneArp(freq, time, duration = 0.09) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.045, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // ウォーキングベース (丸い三角波)
  playWalkingBass(freq, time, duration = 0.25) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // ローファイキック
  playLofiKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.1);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // ローファイスネア / リムショット
  playLofiSnare(time) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(2.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.08);
  }

  // ハイハット (シャッフルスウィング)
  playLofiHihat(time) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.03);
  }

  // ループ演奏
  start(getStateFn, onStepCallback) {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const scheduleNext = () => {
      if (!this.isPlaying) return;

      const state = getStateFn();
      const bpm = Math.max(75, Math.min(125, Number(state.tempo) || 96));
      // 16分音符のステップ
      const stepDuration = (60 / bpm) / 4;
      const now = this.ctx.currentTime;
      const step = this.currentStep;

      const scaleData = this.getScaleData(state.key);
      const chordIndex = Math.floor(step / 4) % scaleData.chords.length;

      // 1. ローズピアノ（小節や拍の頭でコード演奏）
      if (step % 4 === 0) {
        this.playRhodesChord(scaleData.chords[chordIndex], now, stepDuration * 3.8);
      }

      // 2. ローファイビート
      // キック (1拍目・3拍目の裏など)
      if (step === 0 || step === 10) {
        this.playLofiKick(now);
      }
      // スネア (2拍目・4拍目)
      if (step === 4 || step === 12) {
        this.playLofiSnare(now);
      }
      // ハイハット (スウィングシャッフル)
      if (step % 2 === 0) {
        this.playLofiHihat(now);
      }

      // 3. ウォーキングベース (8分音符で小気味よくステップ)
      if (step % 2 === 0) {
        const root = scaleData.rootBasses[chordIndex];
        const bassNote = (step % 4 === 2) ? root * 1.25 : root;
        this.playWalkingBass(bassNote, now, stepDuration * 1.6);
      }

      // 4. 8bitピコピコアルペジオ (ゲーム音とチルの融合！)
      const arpNotes = scaleData.arpFreqs;
      const arpPattern = [0, 2, 4, 7, 5, 3, 2, 1, 0, 4, 6, 7, 5, 4, 2, 1];
      const freq = arpNotes[arpPattern[step % 16] % arpNotes.length];
      this.playChiptuneArp(freq, now, stepDuration * 0.85);

      if (onStepCallback) {
        onStepCallback(step % 16);
      }

      this.currentStep = (this.currentStep + 1) % 16;
      this.timerId = setTimeout(scheduleNext, stepDuration * 1000);
    };

    scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle(getStateFn, onStepCallback, onStateChange) {
    if (this.isPlaying) {
      this.stop();
      if (onStateChange) onStateChange(false);
    } else {
      this.start(getStateFn, onStepCallback);
      if (onStateChange) onStateChange(true);
    }
  }
}

export const subculAudio = new SubculAudioEngine();

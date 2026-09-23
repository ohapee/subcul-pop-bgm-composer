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

  // 🎮 ゲーム効果音: 8bitピコピコ音
  playPikoBlip(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1650, time);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.045);
  }

  // 🎮 ゲーム効果音: ピコーン！ (決定・ひらめき音)
  playPikoonChime(time) {
    if (!this.ctx) return;
    // 1音目: E6 (1318.5Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1318.5, time);
    gain1.gain.setValueAtTime(0.12, time);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(time);
    osc1.stop(time + 0.07);

    // 2音目: B6 (1975.5Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.5, time + 0.05);
    gain2.gain.setValueAtTime(0.001, time);
    gain2.gain.setValueAtTime(0.18, time + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(time + 0.05);
    osc2.stop(time + 0.28);
  }

  // 🎮 ゲーム効果音: プユゥ〜ん (バウンス・ピッチベンド急降下)
  playPuyonBounce(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    // 最初700Hzから一瞬880Hzへ跳ねてから160Hzへ滑らかに急降下
    osc.frequency.setValueAtTime(700, time);
    osc.frequency.linearRampToValueAtTime(880, time + 0.03);
    osc.frequency.exponentialRampToValueAtTime(160, time + 0.26);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.26);
  }

  // 🎮 ゲーム効果音: コイン獲得音 (チャリン)
  playCoin(time) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, time); // B5
    gain1.gain.setValueAtTime(0.12, time);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(time);
    osc1.stop(time + 0.06);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318.51, time + 0.06); // E6
    gain2.gain.setValueAtTime(0.001, time);
    gain2.gain.setValueAtTime(0.15, time + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(time + 0.06);
    osc2.stop(time + 0.3);
  }

  // 🎮 ゲーム効果音: パワーアップ音
  playPowerup(time) {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = time + idx * 0.04;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.07);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.07);
    });
  }

  // 🎮 ゲーム効果音: ジャンプ音
  playJump(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(640, time + 0.12);
    gain.gain.setValueAtTime(0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  // 🎮 ゲーム効果音: ポーズ音
  playPause(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, time);
    osc.frequency.setValueAtTime(440, time + 0.05);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  // 🎮 ゲーム効果音: 1UP音
  playOneUp(time) {
    if (!this.ctx) return;
    const notes = [330, 659, 523, 784, 1046];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = time + idx * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.09);
    });
  }

  // ☕ サブカル環境音: カセットテープクリック
  playTapeClick(time) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(4.0, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.025);
  }

  // 統合SFXディスパッチャー (単体試聴および自動再生に利用)
  playSfx(type, time = null) {
    this.initContext();
    const t = time !== null ? time : this.ctx.currentTime;
    switch (type) {
      case 'sfx_pikopiko':
        this.playPikoBlip(t);
        break;
      case 'sfx_pikoon':
        this.playPikoonChime(t);
        break;
      case 'sfx_puyon':
        this.playPuyonBounce(t);
        break;
      case 'coin_pickup':
        this.playCoin(t);
        break;
      case 'sfx_powerup':
        this.playPowerup(t);
        break;
      case 'sfx_jump':
        this.playJump(t);
        break;
      case 'sfx_pause':
        this.playPause(t);
        break;
      case 'sfx_1up':
        this.playOneUp(t);
        break;
      case 'tape_click':
      case 'typewriter':
      case 'camera_click':
        this.playTapeClick(t);
        break;
      default:
        this.playPikoBlip(t);
        break;
    }
  }

  // メロディリード演奏 (選択された楽器に応じて音色を切り替え)
  playMelodyLead(freq, time, duration, melodyInstId) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (melodyInstId) {
      case 'rhodes_chill':
        // ローズ調サイン波
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.07, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.4);
        break;
      case 'synth_pluck':
        // プラック系三角波
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.065, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.7);
        break;
      case 'vibraphone':
        // ヴィブラフォン
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.6);
        break;
      case 'toy_piano':
        // トイピアノ
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.09, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.5);
        break;
      case 'tape_flute':
        // フルート調
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.055, time + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.2);
        break;
      case 'guitar_clean':
        // クリーンギター風（三角波＋短い減衰）
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.07, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.9);
        break;
      case 'square_lead':
      default:
        // 8bit矩形波
        osc.type = 'square';
        gain.gain.setValueAtTime(0.045, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        break;
    }

    osc.frequency.setValueAtTime(freq, time);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration * 2.0);
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
      const isSparse = Boolean(state.sparseNotes);

      // 1. ローズピアノ（小節や拍の頭でコード演奏）
      // 音数極小の場合は1小節に1回のみ、ゆったりと余韻を残す
      if (isSparse ? (step === 0) : (step % 4 === 0)) {
        this.playRhodesChord(scaleData.chords[chordIndex], now, isSparse ? stepDuration * 7.0 : stepDuration * 3.8);
      }

      // 2. ローファイビート
      if (isSparse) {
        // 音数極小: キックとスネアを必要最小限に抑え、静寂をキープ
        if (step === 0) {
          this.playLofiKick(now);
        }
        if (step === 8) {
          this.playLofiSnare(now);
        }
        if (step % 4 === 0) {
          this.playLofiHihat(now);
        }
      } else {
        // 通常ビート
        if (step === 0 || step === 10) {
          this.playLofiKick(now);
        }
        if (step === 4 || step === 12) {
          this.playLofiSnare(now);
        }
        if (step % 2 === 0) {
          this.playLofiHihat(now);
        }
      }

      // 3. ウォーキングベース
      if (isSparse) {
        // 音数極小: 1小節に1〜2音だけ静かにルート音を響かせる
        if (step === 0 || step === 6) {
          const root = scaleData.rootBasses[chordIndex];
          this.playWalkingBass(root, now, stepDuration * 3.0);
        }
      } else {
        // 通常: 8分音符で小気味よくステップ
        if (step % 2 === 0) {
          const root = scaleData.rootBasses[chordIndex];
          const bassNote = (step % 4 === 2) ? root * 1.25 : root;
          this.playWalkingBass(bassNote, now, stepDuration * 1.6);
        }
      }

      // 4. メロディ / アルペジオ
      const arpNotes = scaleData.arpFreqs;
      const arpPattern = [0, 2, 4, 7, 5, 3, 2, 1, 0, 4, 6, 7, 5, 4, 2, 1];
      if (isSparse) {
        // 音数極小: 16ステップ中2回だけ、ポツリ…ポツリ…と優しく音を置く
        if (step === 3 || step === 10) {
          const freq = arpNotes[arpPattern[step] % arpNotes.length];
          this.playMelodyLead(freq, now, stepDuration * 2.2, state.melodyInst);
        }
      } else {
        const freq = arpNotes[arpPattern[step % 16] % arpNotes.length];
        this.playMelodyLead(freq, now, stepDuration * 0.85, state.melodyInst);
      }

      // 5. ゲーム効果音・環境音のアクセント自動挿入
      if (state.density !== 'none' && state.sfx && state.sfx.size > 0) {
        const sfxArr = [...state.sfx];
        // frequentなら8ステップごと、occasionalなら16ステップの終わり
        const triggerStep = state.density === 'frequent' ? (step === 7 || step === 15) : (step === 14);
        if (triggerStep && Math.random() < (state.density === 'frequent' ? 0.75 : 0.45)) {
          const sfxChoice = sfxArr[Math.floor(Math.random() * sfxArr.length)];
          this.playSfx(sfxChoice, now);
        }
      }

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

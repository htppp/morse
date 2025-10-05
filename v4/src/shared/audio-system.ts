/**
 * 音声システムモジュール
 * Web Audio APIを使用したモールス信号音の生成
 */

export interface AudioSettings {
  frequency: number;  // Hz
  volume: number;     // 0-1
  wpm?: number;       // Words Per Minute (for morse playback)
}

/**
 * 音声システムクラス
 */
export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private settings: AudioSettings;

  constructor(settings: AudioSettings = { frequency: 750, volume: 0.7, wpm: 20 }) {
    this.settings = settings;
    this.init();
  }

  /**
   * AudioContextの初期化
   */
  private ensureAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * 初期化（ユーザーインタラクション後にAudioContextを有効化）
   */
  private init(): void {
    const handler = () => {
      this.ensureAudioContext();
    };
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
  }

  /**
   * 設定を更新
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * 指定された時間に音を再生
   */
  private scheduleTone(startTime: number, durationMs: number): void {
    this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = this.settings.frequency;
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      const t0 = Math.max(now, startTime);
      gainNode.gain.setValueAtTime(0, t0);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume, t0 + 0.001);
      gainNode.gain.setValueAtTime(this.settings.volume, t0 + (durationMs - 1) / 1000);
      gainNode.gain.linearRampToValueAtTime(0, t0 + durationMs / 1000);

      oscillator.start(t0);
      oscillator.stop(t0 + durationMs / 1000);
    } catch (error) {
      console.error('音声エラー:', error);
    }
  }

  /**
   * 連続音の開始
   */
  startContinuousTone(): void {
    this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      // 既存の音を停止
      this.stopContinuousTone();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = this.settings.frequency;
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume, now + 0.001);

      oscillator.start(now);

      this.currentOscillator = oscillator;
      this.currentGain = gainNode;
    } catch (error) {
      console.error('連続音開始エラー:', error);
    }
  }

  /**
   * 連続音の停止
   */
  stopContinuousTone(): void {
    if (!this.audioContext) return;

    try {
      if (this.currentOscillator && this.currentGain) {
        const now = this.audioContext.currentTime;
        this.currentGain.gain.cancelScheduledValues(now);
        this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
        this.currentGain.gain.linearRampToValueAtTime(0, now + 0.001);
        this.currentOscillator.stop(now + 0.002);
        this.currentOscillator = null;
        this.currentGain = null;
      }
    } catch (error) {
      console.error('連続音停止エラー:', error);
    }
  }

  /**
   * モールス符号文字列の再生
   */
  async playMorseString(morse: string): Promise<boolean> {
    if (this.isPlaying) return false;
    if (!morse) return false;

    this.ensureAudioContext();
    if (!this.audioContext) return false;

    this.isPlaying = true;

    const wpm = this.settings.wpm || 20;
    const unit = 1200 / wpm;
    const dot = unit;
    const dash = 3 * unit;
    const egap = unit;
    const lgap = 3 * unit;
    const wgap = 7 * unit;

    let t = this.audioContext.currentTime + 0.02;

    for (let i = 0; i < morse.length && this.isPlaying; i++) {
      const ch = morse[i];
      if (ch === '.') {
        this.scheduleTone(t, dot);
        t += (dot + egap) / 1000;
      } else if (ch === '-') {
        this.scheduleTone(t, dash);
        t += (dash + egap) / 1000;
      } else if (ch === ' ') {
        t += (lgap - egap) / 1000;
      } else if (ch === '/') {
        t += (wgap - egap) / 1000;
      }
    }

    const totalMs = (t - this.audioContext.currentTime) * 1000;
    await new Promise(res => setTimeout(res, totalMs));

    const wasPlaying = this.isPlaying;
    this.isPlaying = false;

    return wasPlaying;
  }

  /**
   * 再生の停止
   */
  stopPlaying(): void {
    this.isPlaying = false;
  }

  /**
   * AudioContextの取得
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}

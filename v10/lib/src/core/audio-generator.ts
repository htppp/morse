/**
 * 音声生成モジュール
 * Web Audio APIを使用したモールス信号音の生成
 * UI非依存のピュアなロジックモジュール（localStorage依存を削除）
 */

export interface AudioSettings {
	/** 周波数（Hz） */
	frequency: number;
	/** 音量（0-1） */
	volume: number;
	/** 文字速度（Words Per Minute） */
	wpm?: number;
	/** 実効速度（語間スペースの速度） */
	effectiveWpm?: number;
}

/**
 * 音声生成クラス
 *
 * Web Audio APIを使用してモールス信号音を生成する
 * 設定の保存/読み込みは外部に委譲し、UI非依存を保つ
 */
export class AudioGenerator {
	private audioContext: AudioContext | null = null;
	private currentOscillator: OscillatorNode | null = null;
	private currentGain: GainNode | null = null;
	private isPlaying: boolean = false;
	private settings: AudioSettings;

	/**
	 * AudioGeneratorを初期化する
	 *
	 * @param settings - 音声設定
	 */
	constructor(settings: AudioSettings = { frequency: 750, volume: 0.7, wpm: 20 }) {
		this.settings = settings;
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
	 * 設定を更新する
	 *
	 * @param settings - 更新する設定（部分更新可能）
	 */
	updateSettings(settings: Partial<AudioSettings>): void {
		this.settings = { ...this.settings, ...settings };
	}

	/**
	 * 現在の設定を取得する
	 *
	 * @returns 現在の音声設定
	 */
	getSettings(): AudioSettings {
		return { ...this.settings };
	}

	/**
	 * 指定された時間に音を再生する
	 *
	 * @param startTime - 開始時刻（AudioContext時刻）
	 * @param durationMs - 音の長さ（ミリ秒）
	 */
	scheduleTone(startTime: number, durationMs: number): void {
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
	 * モールス符号文字列を再生する
	 *
	 * @param morse - モールス符号文字列（'.-', ' ', '/' を含む）
	 * @returns 再生が完了したらtrueを返すPromise（中断された場合はfalse）
	 *
	 * @example
	 * ```ts
	 * const audio = new AudioGenerator({ frequency: 750, volume: 0.7, wpm: 20 });
	 * await audio.playMorseString('.- -... -.-. / -.. . ..-.');
	 * ```
	 */
	async playMorseString(morse: string): Promise<boolean> {
		if (this.isPlaying) return false;
		if (!morse) return false;

		this.ensureAudioContext();
		if (!this.audioContext) return false;

		this.isPlaying = true;

		const charWpm = this.settings.wpm || 20;
		const effectiveWpm = Math.min(this.settings.effectiveWpm || charWpm, charWpm);

		const unit = 1200 / charWpm;
		const dot = unit;
		const dash = 3 * unit;
		const egap = unit;
		const lgap = 3 * unit;

		// 実効速度を実装: 単語間の空白時間を調整
		const wgapBase = 7 * (1200 / effectiveWpm);
		const wgap = wgapBase;

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
	 * 再生を停止する
	 */
	stopPlaying(): void {
		this.isPlaying = false;
	}

	/**
	 * 再生中かどうかを確認する
	 *
	 * @returns 再生中の場合true
	 */
	isCurrentlyPlaying(): boolean {
		return this.isPlaying;
	}

	/**
	 * AudioContextを取得する
	 *
	 * @returns AudioContextインスタンス（未初期化の場合null）
	 */
	getAudioContext(): AudioContext | null {
		return this.audioContext;
	}

	/**
	 * 音量を取得する
	 *
	 * @returns 現在の音量（0-1）
	 */
	getVolume(): number {
		return this.settings.volume;
	}

	/**
	 * 音量を設定する
	 *
	 * @param volume - 音量（0-1）
	 */
	setVolume(volume: number): void {
		this.settings.volume = Math.max(0, Math.min(1, volume));
	}

	/**
	 * 周波数を取得する
	 *
	 * @returns 現在の周波数（Hz）
	 */
	getFrequency(): number {
		return this.settings.frequency;
	}

	/**
	 * 周波数を設定する
	 *
	 * @param frequency - 周波数（Hz、400-1200の範囲）
	 */
	setFrequency(frequency: number): void {
		this.settings.frequency = Math.max(400, Math.min(1200, frequency));
	}

	/**
	 * WPMを取得する
	 *
	 * @returns 現在のWPM
	 */
	getWPM(): number {
		return this.settings.wpm || 20;
	}

	/**
	 * WPMを設定する
	 *
	 * @param wpm - WPM（5-40の範囲）
	 */
	setWPM(wpm: number): void {
		this.settings.wpm = Math.max(5, Math.min(40, wpm));
	}
}

/**
 * トレーナーモードの基底クラス
 * vertical/main.ts と horizontal/main.ts の共通機能を提供する
 */

import { AudioSystem } from '../../core/audio-system';
import { MorseCode } from '../../core/morse-code';
import { Settings } from '../../core/settings';
import { TimingCalculator, MorseTimings } from '../../core/timing-calculator';
import { BufferManager } from '../../core/buffer-manager';
import { TimerManager } from '../../core/timer-manager';
import { ModeController } from '../../core/router';

/**
 * トレーナー基底クラス
 *
 * 垂直電鍵（VerticalKeyTrainer）と横振り電鍵（HorizontalKeyTrainer）の
 * 共通機能を提供する抽象基底クラス
 */
export abstract class TrainerBase implements ModeController {
	protected audioSystem: AudioSystem;
	protected bufferManager: BufferManager;
	protected timerManager: TimerManager;

	constructor() {
		// 設定の読み込み
		Settings.load();
		const settings = Settings.getAll();

		// AudioSystemの初期化
		this.audioSystem = new AudioSystem({
			frequency: settings.frequency,
			volume: settings.volume,
			wpm: settings.wpm
		});

		// バッファ管理の初期化
		this.bufferManager = new BufferManager();

		// タイマー管理の初期化
		this.timerManager = new TimerManager();
	}

	/**
	 * タイミング計算を取得する
	 *
	 * @param shortenGaps - ギャップを10%短縮するか
	 * @returns モールス信号のタイミング情報
	 */
	protected getTimings(shortenGaps: boolean = false): MorseTimings {
		const wpm = Settings.get('wpm');
		return TimingCalculator.calculate(wpm, { shortenGaps });
	}

	/**
	 * 文字確定タイマーを設定する
	 *
	 * @param callback - 文字確定時のコールバック
	 */
	protected setCharTimer(callback: () => void): void {
		const timings = this.getTimings(true); // ギャップを10%短縮
		const delay = TimingCalculator.getCharGapDelay(timings);
		this.timerManager.set('charGap', callback, delay);
	}

	/**
	 * 語間スペースタイマーを設定する
	 *
	 * @param callback - 語間スペース確定時のコールバック
	 */
	protected setWordTimer(callback: () => void): void {
		const timings = this.getTimings(true); // ギャップを10%短縮
		const delay = TimingCalculator.getWordGapDelay(timings);
		this.timerManager.set('wordGap', callback, delay);
	}

	/**
	 * 全てのタイマーをクリアする
	 */
	protected clearAllTimers(): void {
		this.timerManager.clearAll();
	}

	/**
	 * バッファをクリアする
	 */
	protected clearBuffer(): void {
		this.bufferManager.clear();
	}

	/**
	 * モールス信号表示を更新する（サブクラスで実装）
	 */
	protected abstract updateDisplay(): void;

	/**
	 * DOMのレンダリング（サブクラスで実装）
	 */
	abstract render(): void;

	/**
	 * リソースのクリーンアップ（サブクラスで実装）
	 */
	abstract destroy(): void;

	/**
	 * DOM要素を安全に取得する
	 *
	 * @param id - 要素のID
	 * @param throwError - 要素が見つからない場合にエラーをthrowするか
	 * @returns DOM要素、または見つからない場合はnull
	 */
	protected getElement<T extends HTMLElement>(
		id: string,
		throwError: boolean = false
	): T | null {
		const element = document.getElementById(id) as T | null;
		if (!element && throwError) {
			throw new Error(`Required element not found: #${id}`);
		}
		return element;
	}

	/**
	 * DOM要素を必須として取得する（見つからない場合はエラー）
	 *
	 * @param id - 要素のID
	 * @returns DOM要素
	 * @throws 要素が見つからない場合
	 */
	protected getRequiredElement<T extends HTMLElement>(id: string): T {
		const element = this.getElement<T>(id, true);
		if (!element) {
			throw new Error(`Required element not found: #${id}`);
		}
		return element;
	}

	/**
	 * 入力要素の値を安全に取得する
	 *
	 * @param id - 入力要素のID
	 * @param defaultValue - デフォルト値
	 * @returns 入力値
	 */
	protected getInputValue(id: string, defaultValue: string = ''): string {
		const input = this.getElement<HTMLInputElement>(id);
		return input?.value ?? defaultValue;
	}

	/**
	 * 入力要素の数値を安全に取得する
	 *
	 * @param id - 入力要素のID
	 * @param defaultValue - デフォルト値
	 * @returns 数値
	 */
	protected getInputNumber(id: string, defaultValue: number = 0): number {
		const value = this.getInputValue(id);
		const parsed = parseFloat(value);
		return isNaN(parsed) ? defaultValue : parsed;
	}
}

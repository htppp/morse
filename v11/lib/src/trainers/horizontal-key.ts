/**
 * 横振り電鍵（Paddle Key）トレーナー
 * UI非依存のピュアロジック実装
 * Iambic A/Bモードをサポート
 */

import { MorseBuffer } from '../core/buffer';
import { TimerManager } from '../core/timer';
import { MorseCodec } from '../core/morse-codec';
import type { MorseTimings } from '../core/timing';
import { TimingEvaluator } from '../core/timing-evaluator';
import type {
	SpacingEvaluation,
	TimingStatistics,
} from '../core/timing-evaluator';

/**
 * Iambic モード
 * - A: 両パドル押下中のみ交互送信
 * - B: スクイーズ検出後、パドル離しても1要素追加送信
 */
export type IambicMode = 'A' | 'B';

/**
 * パドルレイアウト
 * - normal: 左=短点、右=長点
 * - reversed: 左=長点、右=短点
 */
export type PaddleLayout = 'normal' | 'reversed';

/**
 * 横振り電鍵トレーナーの設定
 */
export interface HorizontalKeySettings {
	/**
	 * Iambic モード（デフォルト: 'A'）
	 */
	iambicMode?: IambicMode;

	/**
	 * パドルレイアウト（デフォルト: 'normal'）
	 */
	paddleLayout?: PaddleLayout;
}

/**
 * 横振り電鍵トレーナーのコールバック定義
 */
export interface HorizontalKeyCallbacks {
	/**
	 * 要素の送信開始時に呼ばれる
	 * @param element - 送信する要素 ('.' または '-')
	 * @param duration - 送信時間（ミリ秒）
	 */
	onElementStart?: (element: '.' | '-', duration: number) => void;

	/**
	 * 要素の送信終了時に呼ばれる
	 * @param element - 送信した要素 ('.' | '-')
	 */
	onElementEnd?: (element: '.' | '-') => void;

	/**
	 * シーケンスが更新された時に呼ばれる
	 * @param sequence - 現在のシーケンス (例: ".-")
	 */
	onSequenceUpdate?: (sequence: string) => void;

	/**
	 * 文字が確定した時に呼ばれる
	 * @param morse - モールス信号 (例: ".-")
	 * @param char - 解読された文字 (例: "A")
	 */
	onCharacter?: (morse: string, char: string) => void;

	/**
	 * 語間スペースが追加された時に呼ばれる
	 */
	onWordSeparator?: () => void;

	/**
	 * バッファ全体が更新された時に呼ばれる
	 * @param buffer - モールス信号バッファ (例: ".- -...")
	 * @param decoded - 解読された文字列 (例: "AB")
	 */
	onBufferUpdate?: (buffer: string, decoded: string) => void;

	/**
	 * スクイーズ状態が変化した時に呼ばれる
	 * @param squeezing - スクイーズ中かどうか
	 */
	onSqueezeChange?: (squeezing: boolean) => void;

	/**
	 * スペーシング評価が完了した時に呼ばれる
	 * @param evaluation - スペーシング評価結果
	 */
	onSpacingEvaluated?: (evaluation: SpacingEvaluation) => void;
}

/**
 * 横振り電鍵トレーナークラス
 * 左右のパドル押下/解放イベントから自動的にモールス信号を生成する
 * Iambic A/Bモードをサポート
 */
export class HorizontalKeyTrainer {
	// パドル状態
	private leftDown: boolean = false;
	private rightDown: boolean = false;

	// 送信状態
	private sending: boolean = false;
	private lastSent: '.' | '-' | null = null;

	// Iambic B用の制御変数
	private forceNextElement: '.' | '-' | null = null;
	private squeezeDetected: boolean = false;

	// スクイーズ状態
	private isSqueezing: boolean = false;

	// 設定
	private iambicMode: IambicMode;
	private paddleLayout: PaddleLayout;

	// スペーシング評価
	private spacingEvaluations: SpacingEvaluation[] = [];
	private lastElementEndTime: number | null = null;

	/**
	 * 横振り電鍵トレーナーを初期化する
	 * @param buffer - モールスバッファインスタンス
	 * @param timer - タイマーマネージャーインスタンス
	 * @param timings - タイミング設定
	 * @param callbacks - イベントコールバック
	 * @param settings - トレーナー設定
	 */
	constructor(
		private buffer: MorseBuffer,
		private timer: TimerManager,
		private timings: MorseTimings,
		private callbacks: HorizontalKeyCallbacks = {},
		settings: HorizontalKeySettings = {}
	) {
		this.iambicMode = settings.iambicMode || 'A';
		this.paddleLayout = settings.paddleLayout || 'normal';
	}

	/**
	 * 左パドルが押された時の処理
	 */
	leftPaddlePress(): void {
		this.leftDown = true;
		this.updateSqueezeState();

		// Iambic Bモードで送信中かつ右も押されている場合、次の要素を予約
		if (this.iambicMode === 'B' && this.sending && this.rightDown) {
			const element = this.paddleLayout === 'reversed' ? '-' : '.';
			this.forceNextElement = element;
			this.squeezeDetected = true;
		}

		if (!this.sending) {
			const element = this.paddleLayout === 'reversed' ? '-' : '.';
			this.sendPaddleElement(element);
		}
	}

	/**
	 * 右パドルが押された時の処理
	 */
	rightPaddlePress(): void {
		this.rightDown = true;
		this.updateSqueezeState();

		// Iambic Bモードで送信中かつ左も押されている場合、次の要素を予約
		if (this.iambicMode === 'B' && this.sending && this.leftDown) {
			const element = this.paddleLayout === 'reversed' ? '.' : '-';
			this.forceNextElement = element;
			this.squeezeDetected = true;
		}

		if (!this.sending) {
			const element = this.paddleLayout === 'reversed' ? '.' : '-';
			this.sendPaddleElement(element);
		}
	}

	/**
	 * 左パドルが離された時の処理
	 */
	leftPaddleRelease(): void {
		this.leftDown = false;
		this.updateSqueezeState();
	}

	/**
	 * 右パドルが離された時の処理
	 */
	rightPaddleRelease(): void {
		this.rightDown = false;
		this.updateSqueezeState();
	}

	/**
	 * パドル要素を送信する
	 * @param element - 送信する要素 ('.' | '-')
	 */
	private sendPaddleElement(element: '.' | '-'): void {
		if (this.sending) return;

		this.sending = true;
		this.timer.clearAll();

		// 送信開始時にsqueezeDetectedをリセット（前回のスクイーズが処理された）
		if (!(this.leftDown && this.rightDown)) {
			this.squeezeDetected = false;
		}

		// スペーシング評価を実行
		if (this.lastElementEndTime !== null) {
			const spacingDuration = Date.now() - this.lastElementEndTime;
			const spacingRecord = TimingEvaluator.createSpacingRecord(
				spacingDuration,
				this.timings,
			);
			const spacingEvaluation = TimingEvaluator.evaluateSpacing(spacingRecord);
			this.spacingEvaluations.push(spacingEvaluation);
			this.callbacks.onSpacingEvaluated?.(spacingEvaluation);
		}

		// 送信時間を計算
		const duration = element === '.' ? this.timings.dot : this.timings.dash;

		// コールバック呼び出し
		this.callbacks.onElementStart?.(element, duration);

		// シーケンスに追加
		this.buffer.addElement(element);
		this.lastSent = element;

		this.callbacks.onSequenceUpdate?.(this.buffer.getSequence());
		this.notifyBufferUpdate();

		// Iambic logic (duration - 5ms前に判定)
		this.timer.set('iambicCheck', () => {
			const both = this.leftDown && this.rightDown;

			// Iambic B: スクイーズが検出されていた場合、次の要素を設定
			if (this.iambicMode === 'B' && this.squeezeDetected && !this.forceNextElement) {
				this.forceNextElement = element === '.' ? '-' : '.';
			}

			// 現在も両方のパドルが押されている場合のみ交互送信
			if (both && !this.forceNextElement) {
				this.forceNextElement = element === '.' ? '-' : '.';
			}
		}, Math.max(0, duration - 5));

		// 送信終了後の処理
		this.timer.set('elementEnd', () => {
			this.sending = false;
			this.callbacks.onElementEnd?.(element);

			// 要素送信終了時刻を記録（スペーシング評価用）
			this.lastElementEndTime = Date.now();

			// Iambic Bモード: forceNextElementが設定されている場合は必ず送信
			if (this.forceNextElement) {
				this.scheduleNext();
			} else if (this.leftDown || this.rightDown) {
				this.scheduleNext();
			} else {
				this.setupCharWordTimers();
			}
		}, duration + this.timings.dot);
	}

	/**
	 * 次の要素をスケジュールする
	 */
	private scheduleNext(): void {
		if (this.forceNextElement) {
			const next = this.forceNextElement;
			this.forceNextElement = null;
			this.sendPaddleElement(next);
		} else if (this.leftDown && this.rightDown) {
			// 両パドル - 交互送信
			const nextElement = this.lastSent === '.' ? '-' : '.';
			this.sendPaddleElement(nextElement);
		} else if (this.leftDown) {
			const element = this.paddleLayout === 'reversed' ? '-' : '.';
			this.sendPaddleElement(element);
		} else if (this.rightDown) {
			const element = this.paddleLayout === 'reversed' ? '.' : '-';
			this.sendPaddleElement(element);
		}
	}

	/**
	 * 文字確定・語間スペースタイマーを設定する
	 */
	private setupCharWordTimers(): void {
		this.timer.clearAll();

		// 文字確定タイマー
		this.timer.set('charGap', () => {
			const sequence = this.buffer.getSequence();
			if (sequence) {
				const char = MorseCodec.morseToText([sequence]);
				this.buffer.commitSequence();
				this.callbacks.onCharacter?.(sequence, char || '?');
				this.notifyBufferUpdate();
			}
		}, this.timings.charGap);

		// 語間スペースタイマー
		this.timer.set('wordGap', () => {
			const sequence = this.buffer.getSequence();
			if (sequence) {
				const char = MorseCodec.morseToText([sequence]);
				this.buffer.commitSequence();
				this.callbacks.onCharacter?.(sequence, char || '?');
			}
			this.buffer.addWordSeparator();
			this.callbacks.onWordSeparator?.();
			this.notifyBufferUpdate();
		}, this.timings.wordGap);
	}

	/**
	 * スクイーズ状態を更新する
	 */
	private updateSqueezeState(): void {
		const squeezing = this.leftDown && this.rightDown;
		if (this.isSqueezing !== squeezing) {
			this.isSqueezing = squeezing;
			this.callbacks.onSqueezeChange?.(squeezing);
		}
	}

	/**
	 * バッファ更新を通知する
	 */
	private notifyBufferUpdate(): void {
		const buffer = this.buffer.getBuffer();
		const sequences = buffer.trim().split(/\s+/);
		const decoded = MorseCodec.morseToText(sequences);
		this.callbacks.onBufferUpdate?.(buffer, decoded);
	}

	/**
	 * バッファとタイマーをクリアする
	 */
	clear(): void {
		this.buffer.clear();
		this.timer.clearAll();
		this.sending = false;
		this.forceNextElement = null;
		this.squeezeDetected = false;
		this.lastSent = null;
		this.spacingEvaluations = [];
		this.lastElementEndTime = null;
		this.notifyBufferUpdate();
	}

	/**
	 * 現在のモールス信号バッファを取得する
	 * @returns モールス信号文字列 (例: ".- -...")
	 */
	getBuffer(): string {
		return this.buffer.getBuffer();
	}

	/**
	 * 現在入力中のシーケンスを取得する
	 * @returns シーケンス文字列 (例: ".-")
	 */
	getSequence(): string {
		return this.buffer.getSequence();
	}

	/**
	 * 現在のバッファを解読した文字列を取得する
	 * @returns 解読された文字列 (例: "AB")
	 */
	getDecoded(): string {
		const buffer = this.buffer.getBuffer();
		const sequences = buffer.trim().split(/\s+/);
		return MorseCodec.morseToText(sequences);
	}

	/**
	 * 左パドルが押されているかどうかを取得する
	 * @returns 左パドルが押されている場合true
	 */
	isLeftPaddleDown(): boolean {
		return this.leftDown;
	}

	/**
	 * 右パドルが押されているかどうかを取得する
	 * @returns 右パドルが押されている場合true
	 */
	isRightPaddleDown(): boolean {
		return this.rightDown;
	}

	/**
	 * 現在送信中かどうかを取得する
	 * @returns 送信中の場合true
	 */
	isSending(): boolean {
		return this.sending;
	}

	/**
	 * スクイーズ中かどうかを取得する
	 * @returns スクイーズ中の場合true
	 */
	isSqueezingNow(): boolean {
		return this.isSqueezing;
	}

	/**
	 * Iambicモードを設定する
	 * @param mode - 'A' または 'B'
	 */
	setIambicMode(mode: IambicMode): void {
		this.iambicMode = mode;
	}

	/**
	 * パドルレイアウトを設定する
	 * @param layout - 'normal' または 'reversed'
	 */
	setPaddleLayout(layout: PaddleLayout): void {
		this.paddleLayout = layout;
	}

	/**
	 * 現在のIambicモードを取得する
	 * @returns 'A' または 'B'
	 */
	getIambicMode(): IambicMode {
		return this.iambicMode;
	}

	/**
	 * 現在のパドルレイアウトを取得する
	 * @returns 'normal' または 'reversed'
	 */
	getPaddleLayout(): PaddleLayout {
		return this.paddleLayout;
	}

	/**
	 * スペーシング評価の統計情報を取得する
	 * @returns 統計情報
	 */
	getSpacingStatistics(): TimingStatistics {
		return TimingEvaluator.calculateSpacingStatistics(this.spacingEvaluations);
	}

	/**
	 * 最近のN件のスペーシング評価結果を取得する
	 * @param count - 取得する件数
	 * @returns スペーシング評価結果の配列
	 */
	getRecentSpacingEvaluations(count: number): SpacingEvaluation[] {
		const sorted = [...this.spacingEvaluations].sort(
			(a, b) => b.record.timestamp - a.record.timestamp,
		);
		return sorted.slice(0, count);
	}

	/**
	 * 全てのスペーシング評価結果を取得する
	 * @returns スペーシング評価結果の配列
	 */
	getAllSpacingEvaluations(): SpacingEvaluation[] {
		return [...this.spacingEvaluations];
	}

	/**
	 * スペースタイプ（element/character/word）別の統計情報を取得する
	 * @returns スペースタイプ別の統計情報
	 */
	getStatisticsBySpacingType(): {
		element: TimingStatistics;
		character: TimingStatistics;
		word: TimingStatistics;
	} {
		const classified = TimingEvaluator.classifyBySpacingType(this.spacingEvaluations);
		return {
			element: TimingEvaluator.calculateSpacingStatistics(classified.element),
			character: TimingEvaluator.calculateSpacingStatistics(classified.character),
			word: TimingEvaluator.calculateSpacingStatistics(classified.word),
		};
	}
}

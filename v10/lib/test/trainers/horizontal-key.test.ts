/**
 * horizontal-key.ts のユニットテスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
	HorizontalKeyTrainer,
	HorizontalKeyCallbacks,
	HorizontalKeySettings,
} from '../../src/trainers/horizontal-key';
import { MorseBuffer } from '../../src/core/buffer';
import { TimerManager } from '../../src/core/timer';
import { TimingCalculator, MorseTimings } from '../../src/core/timing';

describe('HorizontalKeyTrainer', () => {
	let trainer: HorizontalKeyTrainer;
	let buffer: MorseBuffer;
	let timer: TimerManager;
	let timings: MorseTimings;
	let callbacks: HorizontalKeyCallbacks;

	beforeEach(() => {
		buffer = new MorseBuffer();
		timer = new TimerManager();
		timings = TimingCalculator.calculate(20); // WPM=20
		callbacks = {
			onElementStart: vi.fn(),
			onElementEnd: vi.fn(),
			onSequenceUpdate: vi.fn(),
			onCharacter: vi.fn(),
			onWordSeparator: vi.fn(),
			onBufferUpdate: vi.fn(),
			onSqueezeChange: vi.fn(),
		};
		trainer = new HorizontalKeyTrainer(buffer, timer, timings, callbacks);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('コンストラクタと初期状態', () => {
		it('初期状態ではパドルが押されていない', () => {
			expect(trainer.isLeftPaddleDown()).toBe(false);
			expect(trainer.isRightPaddleDown()).toBe(false);
		});

		it('初期状態では送信中ではない', () => {
			expect(trainer.isSending()).toBe(false);
		});

		it('初期状態ではスクイーズ中ではない', () => {
			expect(trainer.isSqueezingNow()).toBe(false);
		});

		it('デフォルト設定でインスタンスを作成できる', () => {
			expect(trainer.getIambicMode()).toBe('A');
			expect(trainer.getPaddleLayout()).toBe('normal');
		});

		it('カスタム設定でインスタンスを作成できる', () => {
			const settings: HorizontalKeySettings = {
				iambicMode: 'B',
				paddleLayout: 'reversed',
			};
			const customTrainer = new HorizontalKeyTrainer(
				new MorseBuffer(),
				new TimerManager(),
				timings,
				{},
				settings
			);
			expect(customTrainer.getIambicMode()).toBe('B');
			expect(customTrainer.getPaddleLayout()).toBe('reversed');
		});
	});

	describe('leftPaddlePress() - normalレイアウト', () => {
		it('左パドルを押すとisLeftPaddleDown()がtrueになる', () => {
			trainer.leftPaddlePress();
			expect(trainer.isLeftPaddleDown()).toBe(true);
		});

		it('短点（.）の送信が開始される', () => {
			trainer.leftPaddlePress();
			expect(callbacks.onElementStart).toHaveBeenCalledWith('.', timings.dot);
		});

		it('送信中フラグがtrueになる', () => {
			trainer.leftPaddlePress();
			expect(trainer.isSending()).toBe(true);
		});

		it('シーケンスに短点が追加される', () => {
			trainer.leftPaddlePress();
			expect(trainer.getSequence()).toBe('.');
		});
	});

	describe('rightPaddlePress() - normalレイアウト', () => {
		it('右パドルを押すとisRightPaddleDown()がtrueになる', () => {
			trainer.rightPaddlePress();
			expect(trainer.isRightPaddleDown()).toBe(true);
		});

		it('長点（-）の送信が開始される', () => {
			trainer.rightPaddlePress();
			expect(callbacks.onElementStart).toHaveBeenCalledWith('-', timings.dash);
		});

		it('送信中フラグがtrueになる', () => {
			trainer.rightPaddlePress();
			expect(trainer.isSending()).toBe(true);
		});

		it('シーケンスに長点が追加される', () => {
			trainer.rightPaddlePress();
			expect(trainer.getSequence()).toBe('-');
		});
	});

	describe('パドルレイアウト - reversed', () => {
		beforeEach(() => {
			trainer.setPaddleLayout('reversed');
		});

		it('左パドルで長点（-）が送信される', () => {
			trainer.leftPaddlePress();
			expect(callbacks.onElementStart).toHaveBeenCalledWith('-', timings.dash);
		});

		it('右パドルで短点（.）が送信される', () => {
			trainer.rightPaddlePress();
			expect(callbacks.onElementStart).toHaveBeenCalledWith('.', timings.dot);
		});
	});

	describe('パドル解放', () => {
		it('leftPaddleRelease()でisLeftPaddleDown()がfalseになる', () => {
			trainer.leftPaddlePress();
			trainer.leftPaddleRelease();
			expect(trainer.isLeftPaddleDown()).toBe(false);
		});

		it('rightPaddleRelease()でisRightPaddleDown()がfalseになる', () => {
			trainer.rightPaddlePress();
			trainer.rightPaddleRelease();
			expect(trainer.isRightPaddleDown()).toBe(false);
		});
	});

	describe('自動送信', () => {
		it('左パドルを押し続けると連続で短点が送信される', () => {
			trainer.leftPaddlePress();

			// 1つ目の短点送信完了
			vi.advanceTimersByTime(timings.dot + timings.dot); // 要素時間 + ギャップ
			expect(callbacks.onElementEnd).toHaveBeenCalledWith('.');

			// 2つ目の短点送信開始
			expect(trainer.getSequence()).toBe('..');
		});

		it('右パドルを押し続けると連続で長点が送信される', () => {
			trainer.rightPaddlePress();

			// 1つ目の長点送信完了
			vi.advanceTimersByTime(timings.dash + timings.dot);
			expect(callbacks.onElementEnd).toHaveBeenCalledWith('-');

			// 2つ目の長点送信開始
			expect(trainer.getSequence()).toBe('--');
		});

		it('パドルを離すと送信が停止する', () => {
			trainer.leftPaddlePress();

			// 1つ目の短点送信完了
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('..');

			// パドルを離す
			trainer.leftPaddleRelease();

			// 2つ目の短点送信完了後、3つ目は送信されない
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('..');
		});
	});

	describe('スクイーズ検出', () => {
		it('両パドル押下でスクイーズ中になる', () => {
			trainer.leftPaddlePress();
			trainer.rightPaddlePress();
			expect(trainer.isSqueezingNow()).toBe(true);
			expect(callbacks.onSqueezeChange).toHaveBeenCalledWith(true);
		});

		it('片方のパドルを離すとスクイーズ解除', () => {
			trainer.leftPaddlePress();
			trainer.rightPaddlePress();
			expect(trainer.isSqueezingNow()).toBe(true);

			vi.clearAllMocks();
			trainer.leftPaddleRelease();
			expect(trainer.isSqueezingNow()).toBe(false);
			expect(callbacks.onSqueezeChange).toHaveBeenCalledWith(false);
		});
	});

	describe('Iambic A モード - 交互送信', () => {
		beforeEach(() => {
			trainer.setIambicMode('A');
		});

		it('両パドル押下で交互に短点・長点が送信される', () => {
			trainer.leftPaddlePress();
			expect(trainer.getSequence()).toBe('.');

			// 短点送信中に右パドルも押す
			trainer.rightPaddlePress();

			// 短点送信完了後、自動的に長点が送信される
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('.-');

			// 長点送信完了後、自動的に短点が送信される
			vi.advanceTimersByTime(timings.dash + timings.dot);
			expect(trainer.getSequence()).toBe('.-.');
		});

		it('両パドルを離すと交互送信が停止する', () => {
			trainer.leftPaddlePress();
			trainer.rightPaddlePress();

			// 1サイクル完了（短点 → 長点）
			vi.advanceTimersByTime(timings.dot + timings.dot);
			vi.advanceTimersByTime(timings.dash + timings.dot);

			// 両パドルを離す
			trainer.leftPaddleRelease();
			trainer.rightPaddleRelease();

			// 最後の短点送信完了後、次は送信されない
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('.-.');
		});
	});

	describe('Iambic B モード - スクイーズメモリ', () => {
		beforeEach(() => {
			trainer.setIambicMode('B');
		});

		it('スクイーズ後、パドルを離しても1要素追加送信される', () => {
			trainer.leftPaddlePress();
			expect(trainer.getSequence()).toBe('.');

			// 短点送信中に右パドルも押す（スクイーズ検出）
			trainer.rightPaddlePress();

			// すぐに両パドルを離す
			trainer.leftPaddleRelease();
			trainer.rightPaddleRelease();

			// 短点送信完了後、スクイーズメモリで長点が送信される
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('.-');

			// 長点送信完了後、追加送信はない
			vi.advanceTimersByTime(timings.dash + timings.dot);
			vi.advanceTimersByTime(timings.dot + timings.dot);
			expect(trainer.getSequence()).toBe('.-');
		});
	});

	describe('文字確定タイマー', () => {
		it('charGap経過後に文字が確定する', () => {
			trainer.leftPaddlePress();

			// 短点送信中にパドルを離す
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();

			// 短点送信完了まで待つ
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);

			expect(trainer.getSequence()).toBe('.');

			// charGap経過
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getSequence()).toBe('');
			expect(callbacks.onCharacter).toHaveBeenCalledWith('.', 'E');
		});
	});

	describe('語間スペースタイマー', () => {
		it('wordGap経過後に語間スペースが追加される', () => {
			trainer.leftPaddlePress();

			// 短点送信中にパドルを離す
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();

			// 短点送信完了まで待つ
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);

			// wordGap経過
			vi.advanceTimersByTime(timings.wordGap);
			expect(trainer.getBuffer()).toContain('/');
			expect(callbacks.onWordSeparator).toHaveBeenCalled();
		});
	});

	describe('clear()', () => {
		it('バッファをクリアする', () => {
			trainer.leftPaddlePress();
			vi.advanceTimersByTime(timings.dot + timings.dot);

			trainer.clear();
			expect(trainer.getBuffer()).toBe('');
			expect(trainer.getSequence()).toBe('');
		});

		it('送信状態をリセットする', () => {
			trainer.leftPaddlePress();
			expect(trainer.isSending()).toBe(true);

			trainer.clear();
			expect(trainer.isSending()).toBe(false);
		});
	});

	describe('getBuffer(), getSequence(), getDecoded()', () => {
		it('バッファ、シーケンス、解読文字列を取得できる', () => {
			// "A" (.-) を入力
			trainer.leftPaddlePress();
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);
			expect(trainer.getSequence()).toBe('.');

			trainer.rightPaddlePress();
			vi.advanceTimersByTime(timings.dash / 2);
			trainer.rightPaddleRelease();
			vi.advanceTimersByTime(timings.dash / 2 + timings.dot);
			expect(trainer.getSequence()).toBe('.-');

			// 文字確定
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getBuffer()).toContain('.-');
			expect(trainer.getDecoded()).toBe('A');
		});
	});

	describe('統合テスト - A入力 (Iambic A)', () => {
		beforeEach(() => {
			trainer.setIambicMode('A');
		});

		it('左→右のシーケンシャル入力でAを送信できる', () => {
			// 短点
			trainer.leftPaddlePress();
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);

			// 長点
			trainer.rightPaddlePress();
			vi.advanceTimersByTime(timings.dash / 2);
			trainer.rightPaddleRelease();
			vi.advanceTimersByTime(timings.dash / 2 + timings.dot);

			expect(trainer.getSequence()).toBe('.-');

			// 文字確定
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getDecoded()).toBe('A');
		});
	});

	describe('統合テスト - SOS入力 (スクイーズ使用)', () => {
		beforeEach(() => {
			trainer.setIambicMode('A');
		});

		it('スクイーズを使ってSOSを送信できる', () => {
			// S (...) - 左パドル3回
			trainer.leftPaddlePress();
			vi.advanceTimersByTime(timings.dot + timings.dot); // 1個目
			vi.advanceTimersByTime(timings.dot + timings.dot); // 2個目
			// 3個目が送信開始された直後にパドルを離す
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);

			// 文字確定
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getDecoded()).toBe('S');

			// O (---) - 右パドル3回
			trainer.rightPaddlePress();
			vi.advanceTimersByTime(timings.dash + timings.dot); // 1個目
			vi.advanceTimersByTime(timings.dash + timings.dot); // 2個目
			// 3個目が送信開始された直後にパドルを離す
			vi.advanceTimersByTime(timings.dash / 2);
			trainer.rightPaddleRelease();
			vi.advanceTimersByTime(timings.dash / 2 + timings.dot);

			// 文字確定
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getDecoded()).toBe('SO');

			// S (...) - 左パドル3回
			trainer.leftPaddlePress();
			vi.advanceTimersByTime(timings.dot + timings.dot); // 1個目
			vi.advanceTimersByTime(timings.dot + timings.dot); // 2個目
			// 3個目が送信開始された直後にパドルを離す
			vi.advanceTimersByTime(timings.dot / 2);
			trainer.leftPaddleRelease();
			vi.advanceTimersByTime(timings.dot / 2 + timings.dot);

			// 文字確定
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getDecoded()).toBe('SOS');
		});
	});

	describe('コールバックなしでの動作', () => {
		it('コールバックなしでも正常に動作する', () => {
			const trainerNoCallback = new HorizontalKeyTrainer(
				new MorseBuffer(),
				new TimerManager(),
				timings
			);

			expect(() => {
				trainerNoCallback.leftPaddlePress();
				vi.advanceTimersByTime(timings.dot + timings.dot);
				trainerNoCallback.leftPaddleRelease();
			}).not.toThrow();
		});
	});

	describe('設定の変更', () => {
		it('setIambicMode()でモードを変更できる', () => {
			expect(trainer.getIambicMode()).toBe('A');
			trainer.setIambicMode('B');
			expect(trainer.getIambicMode()).toBe('B');
		});

		it('setPaddleLayout()でレイアウトを変更できる', () => {
			expect(trainer.getPaddleLayout()).toBe('normal');
			trainer.setPaddleLayout('reversed');
			expect(trainer.getPaddleLayout()).toBe('reversed');
		});
	});
});

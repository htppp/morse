/**
 * vertical-key.ts のユニットテスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VerticalKeyTrainer, VerticalKeyCallbacks } from '../../src/trainers/vertical-key';
import { MorseBuffer } from '../../src/core/buffer';
import { TimerManager } from '../../src/core/timer';
import { TimingCalculator, MorseTimings } from '../../src/core/timing';

describe('VerticalKeyTrainer', () => {
	let trainer: VerticalKeyTrainer;
	let buffer: MorseBuffer;
	let timer: TimerManager;
	let timings: MorseTimings;
	let callbacks: VerticalKeyCallbacks;

	beforeEach(() => {
		buffer = new MorseBuffer();
		timer = new TimerManager();
		timings = TimingCalculator.calculate(20);
		callbacks = {
			onKeyPress: vi.fn(),
			onKeyRelease: vi.fn(),
			onSequenceUpdate: vi.fn(),
			onCharacter: vi.fn(),
			onWordSeparator: vi.fn(),
			onBufferUpdate: vi.fn(),
		};
		trainer = new VerticalKeyTrainer(buffer, timer, timings, callbacks);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('コンストラクタと初期状態', () => {
		it('初期状態ではキーが押されていない', () => {
			expect(trainer.isKeyDown()).toBe(false);
		});

		it('初期状態ではバッファが空', () => {
			expect(trainer.getBuffer()).toBe('');
			expect(trainer.getSequence()).toBe('');
			expect(trainer.getDecoded()).toBe('');
		});

		it('初期状態ではタイマーが0個', () => {
			expect(trainer.getTimerCount()).toBe(0);
		});
	});

	describe('keyPress()', () => {
		it('キーを押すとisKeyDown()がtrueになる', () => {
			trainer.keyPress();
			expect(trainer.isKeyDown()).toBe(true);
		});

		it('onKeyPressコールバックが呼ばれる', () => {
			trainer.keyPress();
			expect(callbacks.onKeyPress).toHaveBeenCalledTimes(1);
		});

		it('連続して押しても状態は変わらない', () => {
			trainer.keyPress();
			trainer.keyPress();
			expect(trainer.isKeyDown()).toBe(true);
			expect(callbacks.onKeyPress).toHaveBeenCalledTimes(1);
		});

		it('既存のタイマーがクリアされる', () => {
			// 事前にタイマーを設定
			timer.set('test', () => {}, 1000);
			expect(trainer.getTimerCount()).toBe(1);

			trainer.keyPress();
			expect(trainer.getTimerCount()).toBe(0);
		});
	});

	describe('keyRelease()', () => {
		it('キーを離すとisKeyDown()がfalseになる', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50); // 短い時間
			trainer.keyRelease();
			expect(trainer.isKeyDown()).toBe(false);
		});

		it('短い押下でdot(".")が追加される', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50); // timings.dot (60ms) より短い
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');
		});

		it('長い押下でdash("-")が追加される', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(200); // timings.dot * 2 (120ms) より長い
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('-');
		});

		it('onKeyReleaseコールバックが呼ばれる（dot）', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(callbacks.onKeyRelease).toHaveBeenCalledWith('.');
		});

		it('onKeyReleaseコールバックが呼ばれる（dash）', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			expect(callbacks.onKeyRelease).toHaveBeenCalledWith('-');
		});

		it('onSequenceUpdateコールバックが呼ばれる', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(callbacks.onSequenceUpdate).toHaveBeenCalledWith('.');
		});

		it('onBufferUpdateコールバックが呼ばれる', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(callbacks.onBufferUpdate).toHaveBeenCalled();
		});

		it('文字確定タイマーと語間スペースタイマーが設定される', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getTimerCount()).toBe(2); // charGap + wordGap
		});

		it('キーが押されていない状態でkeyRelease()を呼んでも何もしない', () => {
			trainer.keyRelease();
			expect(callbacks.onKeyRelease).not.toHaveBeenCalled();
			expect(trainer.getSequence()).toBe('');
		});
	});

	describe('文字確定タイマー', () => {
		it('charGap経過後に文字が確定する', () => {
			// "A" (.-) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');

			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.-');

			// charGap経過
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getSequence()).toBe('');
			expect(trainer.getBuffer()).toContain('.-');
		});

		it('onCharacterコールバックが呼ばれる', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');

			// charGap経過
			vi.advanceTimersByTime(timings.charGap);
			expect(callbacks.onCharacter).toHaveBeenCalledWith('.', 'E');
		});
	});

	describe('語間スペースタイマー', () => {
		it('wordGap経過後に語間スペースが追加される', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();

			// wordGap経過
			vi.advanceTimersByTime(timings.wordGap);
			expect(trainer.getBuffer()).toContain('/');
		});

		it('onWordSeparatorコールバックが呼ばれる', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();

			// wordGap経過
			vi.advanceTimersByTime(timings.wordGap);
			expect(callbacks.onWordSeparator).toHaveBeenCalled();
		});

		it('wordGap経過前にシーケンスがある場合、文字確定してから語間スペースが追加される', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');

			// wordGap経過
			vi.advanceTimersByTime(timings.wordGap);
			expect(trainer.getSequence()).toBe('');
			expect(trainer.getBuffer()).toBe('. / ');
		});
	});

	describe('clear()', () => {
		it('バッファをクリアする', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');

			trainer.clear();
			expect(trainer.getBuffer()).toBe('');
			expect(trainer.getSequence()).toBe('');
		});

		it('タイマーをクリアする', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getTimerCount()).toBe(2);

			trainer.clear();
			expect(trainer.getTimerCount()).toBe(0);
		});

		it('onBufferUpdateコールバックが呼ばれる', () => {
			vi.clearAllMocks();
			trainer.clear();
			expect(callbacks.onBufferUpdate).toHaveBeenCalledWith('', '');
		});
	});

	describe('getBuffer()', () => {
		it('現在のバッファを返す', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();

			// 文字確定タイマー待ち
			vi.advanceTimersByTime(timings.charGap);

			const buffer = trainer.getBuffer();
			expect(buffer).toContain('.-');
		});
	});

	describe('getSequence()', () => {
		it('現在入力中のシーケンスを返す', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.');

			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			expect(trainer.getSequence()).toBe('.-');
		});

		it('文字確定後は空文字列を返す', () => {
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);
			expect(trainer.getSequence()).toBe('');
		});
	});

	describe('getDecoded()', () => {
		it('バッファを解読した文字列を返す', () => {
			// "A" (.-) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			expect(trainer.getDecoded()).toBe('A');
		});

		it('複数文字を解読する', () => {
			// "A" (.-) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			// "B" (-...) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			expect(trainer.getDecoded()).toBe('AB');
		});
	});

	describe('統合テスト', () => {
		it('SOS信号を正しく入力できる', () => {
			// S (...)
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			// O (---)
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			// S (...)
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			expect(trainer.getDecoded()).toBe('SOS');
		});

		it('語間スペースを含む信号を正しく入力できる', () => {
			// "A" (.-) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();

			// wordGap経過（語間スペース）
			vi.advanceTimersByTime(timings.wordGap);

			// "B" (-...) を入力
			trainer.keyPress();
			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			trainer.keyPress();
			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			vi.advanceTimersByTime(timings.charGap);

			expect(trainer.getDecoded()).toBe('A B');
		});

		it('全てのコールバックが適切に呼ばれる', () => {
			vi.clearAllMocks();

			// "A" (.-) を入力
			trainer.keyPress();
			expect(callbacks.onKeyPress).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(50);
			trainer.keyRelease();
			expect(callbacks.onKeyRelease).toHaveBeenCalledWith('.');
			expect(callbacks.onSequenceUpdate).toHaveBeenCalledWith('.');
			expect(callbacks.onBufferUpdate).toHaveBeenCalled();

			trainer.keyPress();
			expect(callbacks.onKeyPress).toHaveBeenCalledTimes(2);

			vi.advanceTimersByTime(200);
			trainer.keyRelease();
			expect(callbacks.onKeyRelease).toHaveBeenCalledWith('-');
			expect(callbacks.onSequenceUpdate).toHaveBeenCalledWith('.-');

			// charGap経過で文字確定
			vi.clearAllMocks();
			vi.advanceTimersByTime(timings.charGap);
			expect(callbacks.onCharacter).toHaveBeenCalledWith('.-', 'A');
			expect(callbacks.onBufferUpdate).toHaveBeenCalled();

			// wordGap経過で語間スペース
			vi.clearAllMocks();
			vi.advanceTimersByTime(timings.wordGap - timings.charGap);
			expect(callbacks.onWordSeparator).toHaveBeenCalled();
			expect(callbacks.onBufferUpdate).toHaveBeenCalled();
		});
	});

	describe('境界値テスト', () => {
		it('dot/dashの閾値ちょうどでdashと判定される', () => {
			const threshold = timings.dot * 2; // 120ms (WPM=20の場合)

			trainer.keyPress();
			vi.advanceTimersByTime(threshold);
			trainer.keyRelease();

			// threshold以上はdash
			expect(trainer.getSequence()).toBe('-');
		});

		it('dot/dashの閾値-1msでdotと判定される', () => {
			const threshold = timings.dot * 2; // 120ms

			trainer.keyPress();
			vi.advanceTimersByTime(threshold - 1);
			trainer.keyRelease();

			expect(trainer.getSequence()).toBe('.');
		});
	});

	describe('コールバックなしでの動作', () => {
		it('コールバックなしでも正常に動作する', () => {
			const trainerNoCallback = new VerticalKeyTrainer(
				new MorseBuffer(),
				new TimerManager(),
				timings
			);

			expect(() => {
				trainerNoCallback.keyPress();
				vi.advanceTimersByTime(50);
				trainerNoCallback.keyRelease();
				vi.advanceTimersByTime(timings.charGap);
			}).not.toThrow();
		});
	});
});

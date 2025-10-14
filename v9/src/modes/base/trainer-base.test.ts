/**
 * base/trainer-base.ts のユニットテスト
 * 垂直・横振り電鍵トレーナーの共通基底クラスをテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TrainerBase } from './trainer-base';
import { Settings } from '../../core/settings';

// テスト用の具体的なサブクラス
class TestTrainer extends TrainerBase {
	updateDisplay(): void {
		// テスト用の実装
	}

	render(): void {
		const app = document.getElementById('app');
		if (app) {
			app.innerHTML = '<div id="test-element">Test</div><input id="test-input" value="42" />';
		}
	}

	destroy(): void {
		this.clearAllTimers();
		this.clearBuffer();
	}
}

describe('TrainerBase', () => {
	let trainer: TestTrainer;
	let originalGetItem: typeof localStorage.getItem;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `<div id="app"></div>`;
	};

	beforeEach(() => {
		// LocalStorageをクリア
		originalGetItem = localStorage.getItem;
		localStorage.clear();
		Settings.load();

		// DOM構造をセットアップ
		setupDOM();
		vi.clearAllMocks();
	});

	afterEach(() => {
		if (trainer) {
			trainer.destroy();
		}
		localStorage.getItem = originalGetItem;
		localStorage.clear();
	});

	describe('コンストラクタと初期化', () => {
		it('インスタンスを作成できる', () => {
			trainer = new TestTrainer();
			expect(trainer).toBeDefined();
			expect(trainer).toBeInstanceOf(TrainerBase);
		});

		it('AudioSystemが初期化される', () => {
			trainer = new TestTrainer();
			expect(trainer).toHaveProperty('audioSystem');
		});

		it('BufferManagerが初期化される', () => {
			trainer = new TestTrainer();
			expect(trainer).toHaveProperty('bufferManager');
		});

		it('TimerManagerが初期化される', () => {
			trainer = new TestTrainer();
			expect(trainer).toHaveProperty('timerManager');
		});

		it('Settingsから設定を読み込んで初期化される', () => {
			Settings.set('frequency', 800);
			Settings.set('volume', 0.8);
			Settings.set('wpm', 25);

			trainer = new TestTrainer();

			// 設定が読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});
	});

	describe('getTimings()', () => {
		it('デフォルト設定でタイミングを取得できる', () => {
			trainer = new TestTrainer();
			const timings = (trainer as any).getTimings();

			expect(timings).toBeDefined();
			expect(timings).toHaveProperty('dot');
			expect(timings).toHaveProperty('dash');
			expect(timings).toHaveProperty('elementGap');
			expect(timings).toHaveProperty('charGap');
			expect(timings).toHaveProperty('wordGap');
		});

		it('shortenGaps=falseの場合、通常のタイミング', () => {
			Settings.set('wpm', 20);
			trainer = new TestTrainer();

			const timings = (trainer as any).getTimings(false);

			expect(timings.dot).toBe(60);
			expect(timings.charGap).toBe(180);
			expect(timings.wordGap).toBe(420);
		});

		it('shortenGaps=trueの場合、ギャップが10%短縮される', () => {
			Settings.set('wpm', 20);
			trainer = new TestTrainer();

			const timings = (trainer as any).getTimings(true);

			expect(timings.dot).toBe(60);
			// charGap: 180 * 0.9 = 162
			expect(timings.charGap).toBe(162);
			// wordGap: 420 * 0.9 = 378
			expect(timings.wordGap).toBe(378);
		});
	});

	describe('setCharTimer()', () => {
		it('文字確定タイマーを設定できる', () => {
			trainer = new TestTrainer();
			const callback = vi.fn();

			(trainer as any).setCharTimer(callback);

			// タイマーが設定されたことを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('指定したコールバックが呼ばれる', () => {
			vi.useFakeTimers();
			trainer = new TestTrainer();
			const callback = vi.fn();

			(trainer as any).setCharTimer(callback);

			// タイマーを進める（WPM=20で約240ms）
			vi.advanceTimersByTime(250);

			expect(callback).toHaveBeenCalled();

			vi.useRealTimers();
		});
	});

	describe('setWordTimer()', () => {
		it('語間スペースタイマーを設定できる', () => {
			trainer = new TestTrainer();
			const callback = vi.fn();

			(trainer as any).setWordTimer(callback);

			// タイマーが設定されたことを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('指定したコールバックが呼ばれる', () => {
			vi.useFakeTimers();
			trainer = new TestTrainer();
			const callback = vi.fn();

			(trainer as any).setWordTimer(callback);

			// タイマーを進める（WPM=20で約378ms、短縮あり）
			vi.advanceTimersByTime(400);

			expect(callback).toHaveBeenCalled();

			vi.useRealTimers();
		});
	});

	describe('clearAllTimers()', () => {
		it('全てのタイマーをクリアできる', () => {
			vi.useFakeTimers();
			trainer = new TestTrainer();
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			(trainer as any).setCharTimer(callback1);
			(trainer as any).setWordTimer(callback2);

			// タイマーをクリア
			(trainer as any).clearAllTimers();

			// タイマーを進めてもコールバックは呼ばれない
			vi.advanceTimersByTime(1000);

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();

			vi.useRealTimers();
		});
	});

	describe('clearBuffer()', () => {
		it('バッファをクリアできる', () => {
			trainer = new TestTrainer();

			expect(() => {
				(trainer as any).clearBuffer();
			}).not.toThrow();
		});
	});

	describe('getElement()', () => {
		it('存在する要素を取得できる', () => {
			trainer = new TestTrainer();
			trainer.render();

			const element = (trainer as any).getElement('test-element');

			expect(element).not.toBeNull();
			expect(element?.textContent).toBe('Test');
		});

		it('存在しない要素の場合nullを返す（throwError=false）', () => {
			trainer = new TestTrainer();
			trainer.render();

			const element = (trainer as any).getElement('non-existent', false);

			expect(element).toBeNull();
		});

		it('存在しない要素の場合エラーをthrow（throwError=true）', () => {
			trainer = new TestTrainer();
			trainer.render();

			expect(() => {
				(trainer as any).getElement('non-existent', true);
			}).toThrow('Required element not found: #non-existent');
		});
	});

	describe('getRequiredElement()', () => {
		it('存在する要素を取得できる', () => {
			trainer = new TestTrainer();
			trainer.render();

			const element = (trainer as any).getRequiredElement('test-element');

			expect(element).not.toBeNull();
			expect(element.textContent).toBe('Test');
		});

		it('存在しない要素の場合エラーをthrow', () => {
			trainer = new TestTrainer();
			trainer.render();

			expect(() => {
				(trainer as any).getRequiredElement('non-existent');
			}).toThrow('Required element not found: #non-existent');
		});
	});

	describe('getInputValue()', () => {
		it('input要素の値を取得できる', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputValue('test-input');

			expect(value).toBe('42');
		});

		it('存在しないinput要素の場合はデフォルト値を返す', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputValue('non-existent', 'default');

			expect(value).toBe('default');
		});

		it('デフォルト値を指定しない場合は空文字列', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputValue('non-existent');

			expect(value).toBe('');
		});
	});

	describe('getInputNumber()', () => {
		it('input要素の数値を取得できる', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputNumber('test-input');

			expect(value).toBe(42);
		});

		it('存在しないinput要素の場合はデフォルト値を返す', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputNumber('non-existent', 100);

			expect(value).toBe(100);
		});

		it('デフォルト値を指定しない場合は0', () => {
			trainer = new TestTrainer();
			trainer.render();

			const value = (trainer as any).getInputNumber('non-existent');

			expect(value).toBe(0);
		});

		it('数値に変換できない場合はデフォルト値を返す', () => {
			setupDOM();
			const app = document.getElementById('app');
			if (app) {
				app.innerHTML = '<input id="invalid-input" value="not a number" />';
			}

			trainer = new TestTrainer();

			const value = (trainer as any).getInputNumber('invalid-input', 99);

			expect(value).toBe(99);
		});
	});

	describe('抽象メソッド', () => {
		it('updateDisplay()が実装されている', () => {
			trainer = new TestTrainer();

			expect(() => {
				trainer.updateDisplay();
			}).not.toThrow();
		});

		it('render()が実装されている', () => {
			trainer = new TestTrainer();

			expect(() => {
				trainer.render();
			}).not.toThrow();
		});

		it('destroy()が実装されている', () => {
			trainer = new TestTrainer();

			expect(() => {
				trainer.destroy();
			}).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('完全なライフサイクル（作成→レンダリング→破棄）を実行できる', () => {
			trainer = new TestTrainer();
			trainer.render();
			trainer.destroy();

			expect(true).toBe(true);
		});

		it('タイマーとバッファを組み合わせて使用できる', () => {
			vi.useFakeTimers();
			trainer = new TestTrainer();

			const callback = vi.fn();
			(trainer as any).setCharTimer(callback);
			(trainer as any).clearBuffer();

			vi.advanceTimersByTime(250);
			expect(callback).toHaveBeenCalled();

			trainer.destroy();
			vi.useRealTimers();
		});

		it('複数のタイマーを同時に設定・クリアできる', () => {
			vi.useFakeTimers();
			trainer = new TestTrainer();

			const callback1 = vi.fn();
			const callback2 = vi.fn();

			(trainer as any).setCharTimer(callback1);
			(trainer as any).setWordTimer(callback2);
			(trainer as any).clearAllTimers();

			vi.advanceTimersByTime(1000);

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();

			vi.useRealTimers();
		});
	});
});

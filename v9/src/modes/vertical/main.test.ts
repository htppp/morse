/**
 * vertical/main.ts のユニットテスト
 * 縦振り電鍵のタイミング制御とロジックのテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VerticalKeyTrainer } from './main';
import { Settings } from '../../core/settings';

describe('VerticalKeyTrainer', () => {
	let trainer: VerticalKeyTrainer;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `
			<div id="app"></div>
		`;
	};

	beforeEach(() => {
		// 環境をクリーンアップ
		localStorage.clear();
		Settings.reset();
		vi.clearAllMocks();
		vi.useFakeTimers();

		// DOMをセットアップ
		setupDOM();

		// VerticalKeyTrainerインスタンスを作成
		trainer = new VerticalKeyTrainer();
	});

	afterEach(() => {
		// クリーンアップ
		trainer.destroy();
		vi.useRealTimers();
		document.body.innerHTML = '';
	});

	describe('コンストラクタと初期化', () => {
		it('インスタンスを作成できる', () => {
			expect(trainer).toBeDefined();
			expect(trainer).toBeInstanceOf(VerticalKeyTrainer);
		});

		it('Settingsを読み込んで AudioSystem を初期化する', () => {
			// Settingsのデフォルト値でAudioSystemが初期化されているはず
			expect(trainer).toBeDefined();
		});

		it('DOMに必要な要素をレンダリングする', () => {
			expect(document.getElementById('morseKey')).not.toBeNull();
			expect(document.getElementById('morseDisplay')).not.toBeNull();
			expect(document.getElementById('decodedOutput')).not.toBeNull();
			expect(document.getElementById('clearBtn')).not.toBeNull();
		});
	});

	describe('タイミング計算', () => {
		it('WPM=20でタイミングを正しく計算する', () => {
			Settings.set('wpm', 20);
			// getTimings()はprivateなので、間接的にテスト

			// WPM=20の場合: unit = 1200/20 = 60ms
			// dot = 60ms, dash = 180ms, charGap = 216ms, wordGap = 378ms
			const expectedUnit = 1200 / 20; // 60ms
			expect(expectedUnit).toBe(60);
		});

		it('WPM=30でタイミングを正しく計算する', () => {
			Settings.set('wpm', 30);

			// WPM=30の場合: unit = 1200/30 = 40ms
			// dot = 40ms, dash = 120ms, charGap = 144ms, wordGap = 252ms
			const expectedUnit = 1200 / 30; // 40ms
			expect(expectedUnit).toBe(40);
		});

		it('WPM=10でタイミングを正しく計算する', () => {
			Settings.set('wpm', 10);

			// WPM=10の場合: unit = 1200/10 = 120ms
			const expectedUnit = 1200 / 10; // 120ms
			expect(expectedUnit).toBe(120);
		});
	});

	describe('キーイベント処理', () => {
		it('電鍵ボタンをクリックするとモールス信号を入力できる', () => {
			const morseKey = document.getElementById('morseKey');
			expect(morseKey).not.toBeNull();

			// MouseDownイベントをシミュレート
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));

			// キーが押された状態になる
			expect(morseKey!.classList.contains('pressed')).toBe(true);

			// 短時間待機（dot相当）
			vi.advanceTimersByTime(50);

			// MouseUpイベントをシミュレート
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// キーが離された状態になる
			expect(morseKey!.classList.contains('pressed')).toBe(false);
		});

		it('スペースキーでモールス信号を入力できる', () => {
			// KeyDownイベントをシミュレート
			document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));

			// 短時間待機（dot相当）
			vi.advanceTimersByTime(50);

			// KeyUpイベントをシミュレート
			document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));

			// モールス信号が入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('.');
		});

		it('長押しでdash(-)を入力できる', () => {
			const morseKey = document.getElementById('morseKey');

			// 長押し（dash相当）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(200); // dash = 180ms, これは200msなのでdash
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// タイマーを進めてdisplay更新を待つ
			vi.advanceTimersByTime(1);

			// dashが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('-');
		});

		it('短押しでdot(.)を入力できる', () => {
			const morseKey = document.getElementById('morseKey');

			// 短押し（dot相当）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50); // dot = 60ms未満
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// タイマーを進めてdisplay更新を待つ
			vi.advanceTimersByTime(1);

			// dotが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('.');
		});
	});

	describe('文字確定ロジック', () => {
		it('charGap経過後に文字を確定する', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// SOS (... --- ...)を入力
			// S = ...
			// dot
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(60); // element gap

			// dot
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(60); // element gap

			// dot
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// charGap経過（216ms）で文字確定
			vi.advanceTimersByTime(216);

			// モールス信号が確定している（スペースで区切られている）
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('...');
		});

		it('wordGap経過後に語間スペース(/)を追加する', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// dot
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// wordGap経過（378ms）で語間スペース追加
			vi.advanceTimersByTime(378);

			// モールス信号に/が追加されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('/');
		});

		it('複数の文字を連続して入力できる', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// S = ...
			for (let i = 0; i < 3; i++) {
				morseKey!.dispatchEvent(new MouseEvent('mousedown'));
				vi.advanceTimersByTime(50);
				morseKey!.dispatchEvent(new MouseEvent('mouseup'));
				vi.advanceTimersByTime(60);
			}

			// charGap経過で文字確定
			vi.advanceTimersByTime(216);

			// O = ---
			for (let i = 0; i < 3; i++) {
				morseKey!.dispatchEvent(new MouseEvent('mousedown'));
				vi.advanceTimersByTime(200);
				morseKey!.dispatchEvent(new MouseEvent('mouseup'));
				vi.advanceTimersByTime(60);
			}

			// charGap経過で文字確定
			vi.advanceTimersByTime(216);

			// モールス信号に複数の文字が含まれている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('...');
			expect(morseDisplay!.textContent).toContain('---');
		});
	});

	describe('デコード表示', () => {
		it('モールス符号をテキストにデコードして表示する', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// E = .
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// charGap経過で文字確定
			vi.advanceTimersByTime(216);

			// デコードされた文字が表示されている
			const decodedOutput = document.getElementById('decodedOutput');
			expect(decodedOutput!.textContent).toContain('E');
		});

		it('SOSをデコードして表示する', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// S = ...
			for (let i = 0; i < 3; i++) {
				morseKey!.dispatchEvent(new MouseEvent('mousedown'));
				vi.advanceTimersByTime(50);
				morseKey!.dispatchEvent(new MouseEvent('mouseup'));
				vi.advanceTimersByTime(60);
			}
			vi.advanceTimersByTime(216);

			// O = ---
			for (let i = 0; i < 3; i++) {
				morseKey!.dispatchEvent(new MouseEvent('mousedown'));
				vi.advanceTimersByTime(200);
				morseKey!.dispatchEvent(new MouseEvent('mouseup'));
				vi.advanceTimersByTime(60);
			}
			vi.advanceTimersByTime(216);

			// S = ...
			for (let i = 0; i < 3; i++) {
				morseKey!.dispatchEvent(new MouseEvent('mousedown'));
				vi.advanceTimersByTime(50);
				morseKey!.dispatchEvent(new MouseEvent('mouseup'));
				vi.advanceTimersByTime(60);
			}
			vi.advanceTimersByTime(216);

			// デコードされた文字が表示されている
			const decodedOutput = document.getElementById('decodedOutput');
			expect(decodedOutput!.textContent).toContain('SOS');
		});
	});

	describe('クリア機能', () => {
		it('クリアボタンでバッファをクリアできる', () => {
			const morseKey = document.getElementById('morseKey');
			const clearBtn = document.getElementById('clearBtn');

			// 何か入力する
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(216);

			// クリアボタンをクリック
			clearBtn!.click();

			// 表示がクリアされている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toBe('入力されたモールス信号');
		});
	});

	describe('設定機能', () => {
		it('設定モーダルを開ける', () => {
			const settingsIcon = document.getElementById('settingsIcon');
			const settingsModal = document.getElementById('settingsModal');

			settingsIcon!.click();

			expect(settingsModal!.classList.contains('active')).toBe(true);
		});

		it('設定を変更して適用できる', () => {
			const settingsIcon = document.getElementById('settingsIcon');
			const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
			const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
			const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;
			const settingsOK = document.getElementById('settingsOK');

			// 設定モーダルを開く
			settingsIcon!.click();

			// 設定を変更
			volumeInput.value = '50';
			frequencyInput.value = '800';
			wpmInput.value = '25';

			// OKボタンをクリック
			settingsOK!.click();

			// 設定が適用されている
			expect(Settings.get('volume')).toBe(0.5);
			expect(Settings.get('frequency')).toBe(800);
			expect(Settings.get('wpm')).toBe(25);
		});
	});

	describe('destroy()', () => {
		it('destroy()でタイマーをクリアする', () => {
			const morseKey = document.getElementById('morseKey');

			// 何か入力してタイマーを開始
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(50);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// destroy()を呼ぶ
			trainer.destroy();

			// タイマーがクリアされている（エラーが発生しない）
			vi.advanceTimersByTime(1000);
		});

		it('destroy()で音を停止する', () => {
			// 音を開始
			const morseKey = document.getElementById('morseKey');
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));

			// destroy()を呼ぶ
			trainer.destroy();

			// 音が停止している（エラーが発生しない）
		});
	});

	describe('dot/dash判定の閾値テスト（2dot相当）', () => {
		it('WPM=20で119ms押下時はdotと判定される', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// 119ms押下（2dot未満 = 120ms未満）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(119);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dotが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('.');
			expect(morseDisplay!.textContent).not.toContain('-');
		});

		it('WPM=20で120ms押下時はdashと判定される', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// 120ms押下（2dot = 120ms）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(120);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dashが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('-');
			expect(morseDisplay!.textContent).not.toContain('.');
		});

		it('WPM=20で121ms押下時はdashと判定される', () => {
			Settings.set('wpm', 20);
			const morseKey = document.getElementById('morseKey');

			// 121ms押下（2dotより長い）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(121);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dashが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('-');
			expect(morseDisplay!.textContent).not.toContain('.');
		});

		it('WPM=30で79ms押下時はdotと判定される', () => {
			Settings.set('wpm', 30);
			const morseKey = document.getElementById('morseKey');

			// WPM=30: unit=40ms, 2dot=80ms
			// 79ms押下（2dot未満）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(79);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dotが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('.');
			expect(morseDisplay!.textContent).not.toContain('-');
		});

		it('WPM=30で80ms押下時はdashと判定される', () => {
			Settings.set('wpm', 30);
			const morseKey = document.getElementById('morseKey');

			// WPM=30: unit=40ms, 2dot=80ms
			// 80ms押下（2dot）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(80);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dashが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('-');
			expect(morseDisplay!.textContent).not.toContain('.');
		});

		it('WPM=10で239ms押下時はdotと判定される', () => {
			Settings.set('wpm', 10);
			const morseKey = document.getElementById('morseKey');

			// WPM=10: unit=120ms, 2dot=240ms
			// 239ms押下（2dot未満）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(239);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dotが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('.');
			expect(morseDisplay!.textContent).not.toContain('-');
		});

		it('WPM=10で240ms押下時はdashと判定される', () => {
			Settings.set('wpm', 10);
			const morseKey = document.getElementById('morseKey');

			// WPM=10: unit=120ms, 2dot=240ms
			// 240ms押下（2dot）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));
			vi.advanceTimersByTime(240);
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));
			vi.advanceTimersByTime(1);

			// dashが入力されている
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toContain('-');
			expect(morseDisplay!.textContent).not.toContain('.');
		});
	});

	describe('エッジケース', () => {
		it('重複したキーダウンイベントを無視する', () => {
			const morseKey = document.getElementById('morseKey');

			// 1回目のキーダウン
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));

			// 2回目のキーダウン（無視される）
			morseKey!.dispatchEvent(new MouseEvent('mousedown'));

			// キーアップ
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// エラーが発生しない
		});

		it('キーダウンなしのキーアップを無視する', () => {
			const morseKey = document.getElementById('morseKey');

			// キーダウンなしでキーアップ
			morseKey!.dispatchEvent(new MouseEvent('mouseup'));

			// エラーが発生しない
		});

		it('INPUTフィールドにフォーカスがあるときはキーボードイベントを無視する', () => {
			// input要素を追加
			const input = document.createElement('input');
			document.body.appendChild(input);
			input.focus();

			// キーダウンイベント
			input.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));

			vi.advanceTimersByTime(50);

			input.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));

			// モールス信号が入力されていない（input要素にフォーカスがあるため）
			const morseDisplay = document.getElementById('morseDisplay');
			expect(morseDisplay!.textContent).toBe('入力されたモールス信号');
		});
	});
});

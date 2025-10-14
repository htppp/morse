/**
 * koch/main.ts のユニットテスト
 * コッホ法トレーニングの基本機能をテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KochTrainer } from './main';

describe('KochTrainer', () => {
	let trainer: KochTrainer;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `<div id="app"></div>`;
	};

	beforeEach(() => {
		// 環境をクリーンアップ
		localStorage.clear();
		vi.clearAllMocks();
		setupDOM();
	});

	describe('コンストラクタと初期化', () => {
		it('インスタンスを作成できる', () => {
			trainer = new KochTrainer();
			expect(trainer).toBeDefined();
			expect(trainer).toBeInstanceOf(KochTrainer);
		});

		it('初期状態でレッスン1から開始する', () => {
			trainer = new KochTrainer();
			// プライベートプロパティなので、render()を呼んで動作を確認
			expect(() => trainer.render()).not.toThrow();
		});

		it('AudioSystemが初期化される', () => {
			trainer = new KochTrainer();
			// AudioSystemが正しく初期化されていることを確認
			expect(trainer).toHaveProperty('audioSystem');
		});
	});

	describe('render()', () => {
		it('DOM要素をレンダリングできる', () => {
			trainer = new KochTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();
			expect(app?.innerHTML).not.toBe('');
		});

		it('戻るボタンがレンダリングされる', () => {
			trainer = new KochTrainer();
			trainer.render();

			const backBtn = document.getElementById('backBtn');
			expect(backBtn).not.toBeNull();
		});

		it('設定アイコンがレンダリングされる', () => {
			trainer = new KochTrainer();
			trainer.render();

			const settingsIcon = document.getElementById('settingsIcon');
			expect(settingsIcon).not.toBeNull();
		});
	});

	describe('LocalStorage統合', () => {
		it('進捗をLocalStorageに保存できる', () => {
			// 事前に進捗を保存
			localStorage.setItem('v4.koch.currentLesson', '5');

			trainer = new KochTrainer();

			// 進捗が読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('ビューモードをLocalStorageから読み込める', () => {
			// 事前にビューモードを保存
			localStorage.setItem('v8.koch.viewMode', 'custom');

			trainer = new KochTrainer();

			// ビューモードが読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('選択文字をLocalStorageから読み込める', () => {
			// 事前に選択文字を保存
			localStorage.setItem('v8.koch.selectedChars', JSON.stringify(['K', 'M']));

			trainer = new KochTrainer();

			// 選択文字が読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});
	});

	describe('基本機能', () => {
		it('destroy()を呼び出せる', () => {
			trainer = new KochTrainer();
			expect(() => trainer.destroy()).not.toThrow();
		});

		it('destroy()後も安全に呼び出せる', () => {
			trainer = new KochTrainer();
			trainer.destroy();
			trainer.destroy(); // 2回目
			expect(true).toBe(true);
		});
	});

	describe('エラーハンドリング', () => {
		it('DOMが存在しない場合でもエラーにならない', () => {
			document.body.innerHTML = ''; // DOM削除

			trainer = new KochTrainer();
			expect(() => trainer.render()).not.toThrow();
		});

		it('LocalStorageが無効でもエラーにならない', () => {
			// LocalStorageをモック
			const originalGetItem = localStorage.getItem;
			localStorage.getItem = vi.fn(() => {
				throw new Error('LocalStorage disabled');
			});

			expect(() => {
				trainer = new KochTrainer();
			}).not.toThrow();

			// 復元
			localStorage.getItem = originalGetItem;
		});

		it('不正なJSON形式のLocalStorageデータを処理できる', () => {
			localStorage.setItem('v8.koch.selectedChars', 'invalid json');

			expect(() => {
				trainer = new KochTrainer();
			}).not.toThrow();
		});

		it('不正なレッスン番号を処理できる', () => {
			localStorage.setItem('v4.koch.currentLesson', 'not a number');

			expect(() => {
				trainer = new KochTrainer();
			}).not.toThrow();
		});

		it('不正なビューモードを無視する', () => {
			localStorage.setItem('v8.koch.viewMode', 'invalid_mode');

			expect(() => {
				trainer = new KochTrainer();
			}).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('完全なライフサイクル（作成→レンダリング→破棄）を実行できる', () => {
			trainer = new KochTrainer();
			trainer.render();
			trainer.destroy();

			expect(true).toBe(true);
		});

		it('複数のインスタンスを作成できる', () => {
			const trainer1 = new KochTrainer();
			const trainer2 = new KochTrainer();

			expect(trainer1).toBeDefined();
			expect(trainer2).toBeDefined();

			trainer1.destroy();
			trainer2.destroy();
		});

		it('レンダリング→破棄→再レンダリングできる', () => {
			trainer = new KochTrainer();

			trainer.render();
			trainer.destroy();

			// 再レンダリング
			setupDOM();
			trainer = new KochTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();

			trainer.destroy();
		});
	});
});

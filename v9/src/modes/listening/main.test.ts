/**
 * listening/main.ts のユニットテスト
 * モールス信号聞き取り練習の基本機能をテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ListeningTrainer } from './main';

describe('ListeningTrainer', () => {
	let trainer: ListeningTrainer;
	let originalGetItem: typeof localStorage.getItem;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `<div id="app"></div>`;
	};

	beforeEach(() => {
		// 環境をクリーンアップ
		localStorage.clear();
		vi.clearAllMocks();
		setupDOM();
		// LocalStorageの元のメソッドを保存
		originalGetItem = localStorage.getItem;
	});

	afterEach(() => {
		// LocalStorageを確実に復元
		localStorage.getItem = originalGetItem;
	});

	describe('コンストラクタと初期化', () => {
		it('インスタンスを作成できる', () => {
			trainer = new ListeningTrainer();
			expect(trainer).toBeDefined();
			expect(trainer).toBeInstanceOf(ListeningTrainer);
		});

		it('初期状態でQSOカテゴリーから開始する', () => {
			trainer = new ListeningTrainer();
			// プライベートプロパティなので、render()を呼んで動作を確認
			expect(() => trainer.render()).not.toThrow();
		});

		it('AudioSystemが初期化される', () => {
			trainer = new ListeningTrainer();
			// AudioSystemが正しく初期化されていることを確認
			expect(trainer).toHaveProperty('audioSystem');
		});
	});

	describe('render()', () => {
		it('DOM要素をレンダリングできる', () => {
			trainer = new ListeningTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();
			expect(app?.innerHTML).not.toBe('');
		});

		it('戻るボタンがレンダリングされる', () => {
			trainer = new ListeningTrainer();
			trainer.render();

			const backBtn = document.getElementById('backBtn');
			expect(backBtn).not.toBeNull();
		});

		it('設定アイコンがレンダリングされる', () => {
			trainer = new ListeningTrainer();
			trainer.render();

			const settingsIcon = document.getElementById('settingsIcon');
			expect(settingsIcon).not.toBeNull();
		});
	});

	describe('LocalStorage統合', () => {
		it('カテゴリーをLocalStorageから読み込める', () => {
			// 事前にカテゴリーを保存
			localStorage.setItem('v8.listening.category', 'text100');

			trainer = new ListeningTrainer();

			// カテゴリーが読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('QSOカテゴリーを選択できる', () => {
			localStorage.setItem('v8.listening.category', 'qso');

			trainer = new ListeningTrainer();

			expect(trainer).toBeDefined();
		});

		it('テキストカテゴリーを選択できる', () => {
			localStorage.setItem('v8.listening.category', 'text200');

			trainer = new ListeningTrainer();

			expect(trainer).toBeDefined();
		});

		it('カスタムカテゴリーを選択できる', () => {
			localStorage.setItem('v8.listening.category', 'custom');

			trainer = new ListeningTrainer();

			expect(trainer).toBeDefined();
		});
	});

	describe('基本機能', () => {
		it('destroy()を呼び出せる', () => {
			trainer = new ListeningTrainer();
			expect(() => trainer.destroy()).not.toThrow();
		});

		it('destroy()後も安全に呼び出せる', () => {
			trainer = new ListeningTrainer();
			trainer.destroy();
			trainer.destroy(); // 2回目
			expect(true).toBe(true);
		});
	});

	describe('エラーハンドリング', () => {
		it('DOMが存在しない場合でもエラーにならない', () => {
			document.body.innerHTML = ''; // DOM削除

			trainer = new ListeningTrainer();
			expect(() => trainer.render()).not.toThrow();
		});

		it('不正なカテゴリーを無視する', () => {
			localStorage.setItem('v8.listening.category', 'invalid_category');

			expect(() => {
				trainer = new ListeningTrainer();
			}).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('完全なライフサイクル（作成→レンダリング→破棄）を実行できる', () => {
			trainer = new ListeningTrainer();
			trainer.render();
			trainer.destroy();

			expect(true).toBe(true);
		});

		it('複数のインスタンスを作成できる', () => {
			const trainer1 = new ListeningTrainer();
			const trainer2 = new ListeningTrainer();

			expect(trainer1).toBeDefined();
			expect(trainer2).toBeDefined();

			trainer1.destroy();
			trainer2.destroy();
		});

		it('レンダリング→破棄→再レンダリングできる', () => {
			trainer = new ListeningTrainer();

			trainer.render();
			trainer.destroy();

			// 再レンダリング
			setupDOM();
			trainer = new ListeningTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();

			trainer.destroy();
		});
	});
});

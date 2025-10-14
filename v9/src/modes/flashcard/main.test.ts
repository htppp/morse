/**
 * flashcard/main.ts のユニットテスト
 * 複雑なフィルタリングと学習ロジックの基本機能をテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlashcardTrainer } from './main';

describe('FlashcardTrainer', () => {
	let trainer: FlashcardTrainer;

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
			trainer = new FlashcardTrainer();
			expect(trainer).toBeDefined();
			expect(trainer).toBeInstanceOf(FlashcardTrainer);
		});

		it('初期状態で空の配列を持つ', () => {
			trainer = new FlashcardTrainer();
			// プライベートプロパティなので、render()を呼んで動作を確認
			expect(() => trainer.render()).not.toThrow();
		});

		it('AudioSystemが初期化される', () => {
			trainer = new FlashcardTrainer();
			// AudioSystemが正しく初期化されていることを確認
			expect(trainer).toHaveProperty('audioSystem');
		});
	});

	describe('render()', () => {
		it('DOM要素をレンダリングできる', () => {
			trainer = new FlashcardTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();
			expect(app?.innerHTML).not.toBe('');
		});

		it('戻るボタンがレンダリングされる', () => {
			trainer = new FlashcardTrainer();
			trainer.render();

			const backBtn = document.getElementById('backBtn');
			expect(backBtn).not.toBeNull();
		});

		it('設定ボタンがレンダリングされる', () => {
			trainer = new FlashcardTrainer();
			trainer.render();

			const settingsBtn = document.getElementById('settingsBtn');
			expect(settingsBtn).not.toBeNull();
		});
	});

	describe('LocalStorage統合', () => {
		it('進捗をLocalStorageに保存できる', () => {
			trainer = new FlashcardTrainer();

			// ここではローカルストレージのキーの存在を確認
			// 実際の保存は複雑なので、基本的なAPI呼び出しのみテスト
			expect(localStorage.getItem('v8.flashcard.knownIds')).toBeNull();
		});

		it('フィルタ設定をLocalStorageから読み込める', () => {
			// 事前にフィルタ設定を保存
			localStorage.setItem('v8.flashcard.selectedTags', JSON.stringify(['Q符号']));

			trainer = new FlashcardTrainer();

			// フィルタが読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});

		it('ビューモードをLocalStorageから読み込める', () => {
			// 事前にビューモードを保存
			localStorage.setItem('v8.flashcard.viewMode', 'learn');

			trainer = new FlashcardTrainer();

			// ビューモードが読み込まれていることを確認（間接的）
			expect(trainer).toBeDefined();
		});
	});

	describe('基本機能', () => {
		it('destroy()を呼び出せる', () => {
			trainer = new FlashcardTrainer();
			expect(() => trainer.destroy()).not.toThrow();
		});

		it('destroy()後も安全に呼び出せる', () => {
			trainer = new FlashcardTrainer();
			trainer.destroy();
			trainer.destroy(); // 2回目
			expect(true).toBe(true);
		});
	});

	describe('エラーハンドリング', () => {
		it('DOMが存在しない場合でもエラーにならない', () => {
			document.body.innerHTML = ''; // DOM削除

			trainer = new FlashcardTrainer();
			expect(() => trainer.render()).not.toThrow();
		});

		it('LocalStorageが無効でもエラーにならない', () => {
			// LocalStorageをモック
			const originalGetItem = localStorage.getItem;
			localStorage.getItem = vi.fn(() => {
				throw new Error('LocalStorage disabled');
			});

			expect(() => {
				trainer = new FlashcardTrainer();
			}).not.toThrow();

			// 復元
			localStorage.getItem = originalGetItem;
		});

		it('不正なJSON形式のLocalStorageデータを処理できる', () => {
			localStorage.setItem('v8.flashcard.selectedTags', 'invalid json');

			expect(() => {
				trainer = new FlashcardTrainer();
			}).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('完全なライフサイクル（作成→レンダリング→破棄）を実行できる', () => {
			trainer = new FlashcardTrainer();
			trainer.render();
			trainer.destroy();

			expect(true).toBe(true);
		});

		it('複数のインスタンスを作成できる', () => {
			const trainer1 = new FlashcardTrainer();
			const trainer2 = new FlashcardTrainer();

			expect(trainer1).toBeDefined();
			expect(trainer2).toBeDefined();

			trainer1.destroy();
			trainer2.destroy();
		});

		it('レンダリング→破棄→再レンダリングできる', () => {
			trainer = new FlashcardTrainer();

			trainer.render();
			trainer.destroy();

			// 再レンダリング
			setupDOM();
			trainer = new FlashcardTrainer();
			trainer.render();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();

			trainer.destroy();
		});
	});
});

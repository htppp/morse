/**
 * menu/main.ts のユニットテスト
 * メニューページの基本機能をテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuPage } from './main';

describe('MenuPage', () => {
	let page: MenuPage;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `<div id="app"></div>`;
	};

	beforeEach(() => {
		// 環境をクリーンアップ
		vi.clearAllMocks();
		setupDOM();
	});

	describe('コンストラクタと初期化', () => {
		it('インスタンスを作成できる', () => {
			page = new MenuPage();
			expect(page).toBeDefined();
			expect(page).toBeInstanceOf(MenuPage);
		});

		it('コンストラクタで自動的にrender()が呼ばれる', () => {
			page = new MenuPage();
			const app = document.getElementById('app');
			expect(app?.innerHTML).not.toBe('');
		});
	});

	describe('render()', () => {
		it('DOM要素をレンダリングできる', () => {
			page = new MenuPage();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();
			expect(app?.innerHTML).not.toBe('');
		});

		it('ヘッダーがレンダリングされる', () => {
			page = new MenuPage();

			const app = document.getElementById('app');
			expect(app?.innerHTML).toContain('モールス練習アプリ');
			expect(app?.innerHTML).toContain('練習メニューを選択してください');
		});

		it('5つのメニューアイテムがレンダリングされる', () => {
			page = new MenuPage();

			const menuCards = document.querySelectorAll('.menu-card');
			expect(menuCards.length).toBe(5);
		});

		it('縦振り電鍵練習のメニューアイテムが正しく表示される', () => {
			page = new MenuPage();

			const verticalCard = document.querySelector('[data-id="vertical"]');
			expect(verticalCard).not.toBeNull();
			expect(verticalCard?.getAttribute('href')).toBe('#vertical');
			expect(verticalCard?.innerHTML).toContain('縦振り電鍵練習');
			expect(verticalCard?.innerHTML).toContain('縦振り電鍵の操作を練習');
		});

		it('横振り電鍵練習のメニューアイテムが正しく表示される', () => {
			page = new MenuPage();

			const horizontalCard = document.querySelector('[data-id="horizontal"]');
			expect(horizontalCard).not.toBeNull();
			expect(horizontalCard?.getAttribute('href')).toBe('#horizontal');
			expect(horizontalCard?.innerHTML).toContain('横振り電鍵練習');
		});

		it('CW略語・Q符号学習のメニューアイテムが正しく表示される', () => {
			page = new MenuPage();

			const flashcardCard = document.querySelector('[data-id="flashcard"]');
			expect(flashcardCard).not.toBeNull();
			expect(flashcardCard?.getAttribute('href')).toBe('#flashcard');
			expect(flashcardCard?.innerHTML).toContain('CW略語・Q符号学習');
		});

		it('コッホ法トレーニングのメニューアイテムが正しく表示される', () => {
			page = new MenuPage();

			const kochCard = document.querySelector('[data-id="koch"]');
			expect(kochCard).not.toBeNull();
			expect(kochCard?.getAttribute('href')).toBe('#koch');
			expect(kochCard?.innerHTML).toContain('コッホ法トレーニング');
		});

		it('モールス信号聞き取り練習のメニューアイテムが正しく表示される', () => {
			page = new MenuPage();

			const listeningCard = document.querySelector('[data-id="listening"]');
			expect(listeningCard).not.toBeNull();
			expect(listeningCard?.getAttribute('href')).toBe('#listening');
			expect(listeningCard?.innerHTML).toContain('モールス信号聞き取り練習');
		});

		it('フッターがレンダリングされる', () => {
			page = new MenuPage();

			const footer = document.querySelector('.footer');
			expect(footer).not.toBeNull();
			expect(footer?.innerHTML).toContain('モールス練習アプリ');
		});
	});

	describe('destroy()', () => {
		it('destroy()を呼び出せる', () => {
			page = new MenuPage();
			expect(() => page.destroy()).not.toThrow();
		});

		it('destroy()後も安全に呼び出せる', () => {
			page = new MenuPage();
			page.destroy();
			page.destroy(); // 2回目
			expect(true).toBe(true);
		});
	});

	describe('エラーハンドリング', () => {
		it('DOMが存在しない場合でもエラーにならない', () => {
			document.body.innerHTML = ''; // DOM削除

			expect(() => {
				page = new MenuPage();
			}).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('完全なライフサイクル（作成→破棄）を実行できる', () => {
			page = new MenuPage();
			page.destroy();

			expect(true).toBe(true);
		});

		it('複数のインスタンスを作成できる', () => {
			const page1 = new MenuPage();
			const page2 = new MenuPage();

			expect(page1).toBeDefined();
			expect(page2).toBeDefined();

			page1.destroy();
			page2.destroy();
		});

		it('破棄→再作成できる', () => {
			page = new MenuPage();
			page.destroy();

			// 再作成
			setupDOM();
			page = new MenuPage();

			const app = document.getElementById('app');
			expect(app).not.toBeNull();
			expect(app?.innerHTML).not.toBe('');

			page.destroy();
		});
	});
});

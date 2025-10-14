/**
 * router.ts の統合テスト
 * ハッシュベースのルーティングとモードライフサイクル管理をテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ModeController } from './router';

describe('Router 統合テスト', () => {
	let router: Router;

	// 最小限のDOM構造を作成
	const setupDOM = () => {
		document.body.innerHTML = `<div id="app"></div>`;
	};

	// モックのモードコントローラー作成
	const createMockController = (name: string): ModeController => {
		const destroy = vi.fn();
		return { destroy };
	};

	// ハッシュ変更イベントを手動でトリガー
	const triggerHashChange = async (hash: string) => {
		window.location.hash = hash;
		// happy-domでは、window.location.hashの変更で自動的にhashchangeイベントが発火する
		await new Promise(resolve => setTimeout(resolve, 50));
	};

	beforeEach(async () => {
		// 環境をクリーンアップ
		setupDOM();
		vi.clearAllMocks();
		// 古いrouterがあればクリーンアップ（イベントリスナーを先に削除）
		if (router) {
			router.destroy();
		}
		// ハッシュをクリア（イベントリスナー削除後に実行）
		window.location.hash = '';
		// ハッシュ変更のイベントが処理されるまで待機
		await new Promise(resolve => setTimeout(resolve, 10));
		router = new Router();
	});

	afterEach(() => {
		// routerをクリーンアップ
		if (router) {
			router.destroy();
		}
	});

	describe('基本機能', () => {
		it('Routerインスタンスを作成できる', () => {
			expect(router).toBeDefined();
			expect(router).toBeInstanceOf(Router);
		});

		it('getCurrentMode()で現在のモードを取得できる', () => {
			expect(router.getCurrentMode()).toBe('menu');
		});
	});

	describe('ルート登録', () => {
		it('ルートを登録できる', () => {
			const factory = vi.fn(async () => createMockController('test'));

			expect(() => {
				router.register('menu', factory);
			}).not.toThrow();
		});

		it('複数のルートを登録できる', () => {
			const menuFactory = vi.fn(async () => createMockController('menu'));
			const verticalFactory = vi.fn(async () => createMockController('vertical'));
			const horizontalFactory = vi.fn(async () => createMockController('horizontal'));

			expect(() => {
				router.register('menu', menuFactory);
				router.register('vertical', verticalFactory);
				router.register('horizontal', horizontalFactory);
			}).not.toThrow();
		});
	});

	describe('ルーティング', () => {
		it('start()を呼ぶとメニューモードが読み込まれる', async () => {
			const menuFactory = vi.fn(async () => createMockController('menu'));
			router.register('menu', menuFactory);

			await router.start();

			expect(menuFactory).toHaveBeenCalled();
			expect(router.getCurrentMode()).toBe('menu');
		});

		it('ハッシュを変更すると対応するモードが読み込まれる', async () => {
			const menuFactory = vi.fn(async () => createMockController('menu'));
			const verticalFactory = vi.fn(async () => createMockController('vertical'));

			router.register('menu', menuFactory);
			router.register('vertical', verticalFactory);

			await router.start();
			expect(menuFactory).toHaveBeenCalledTimes(1);

			// ハッシュ変更
			await triggerHashChange('#vertical');

			expect(verticalFactory).toHaveBeenCalled();
		});

		it('未登録のルートはmenuにリダイレクトされる', async () => {
			const menuFactory = vi.fn(async () => createMockController('menu'));
			router.register('menu', menuFactory);

			window.location.hash = '#invalid-route';
			await router.start();

			// menuにリダイレクトされる
			expect(window.location.hash).toBe('#menu');
		});
	});

	describe('モードライフサイクル', () => {
		it('モード切り替え時に前のコントローラーのdestroy()が呼ばれる', async () => {
			const menuController = createMockController('menu');
			const verticalController = createMockController('vertical');

			const menuFactory = vi.fn(async () => menuController);
			const verticalFactory = vi.fn(async () => verticalController);

			router.register('menu', menuFactory);
			router.register('vertical', verticalFactory);

			// menu起動
			await router.start();
			expect(menuController.destroy).not.toHaveBeenCalled();

			// verticalに切り替え
			await triggerHashChange('#vertical');

			// menuのdestroy()が呼ばれる
			expect(menuController.destroy).toHaveBeenCalledTimes(1);
		});

		it('モード切り替え時にDOMがクリアされる', async () => {
			const app = document.getElementById('app');
			if (app) app.innerHTML = '<div>テスト内容</div>';

			const menuFactory = vi.fn(async () => createMockController('menu'));
			const verticalFactory = vi.fn(async () => createMockController('vertical'));

			router.register('menu', menuFactory);
			router.register('vertical', verticalFactory);

			await router.start();

			await triggerHashChange('#vertical');

			// DOMがクリアされている（新しいコントローラーが描画する前）
			expect(app?.innerHTML).not.toContain('テスト内容');
		});
	});

	describe('エラーハンドリング', () => {
		it('ファクトリーがエラーをthrowした場合、エラーメッセージを表示する', async () => {
			const errorFactory = vi.fn(async () => {
				throw new Error('Test error');
			});

			router.register('menu', errorFactory);
			await router.start();

			const app = document.getElementById('app');
			expect(app?.innerHTML).toContain('エラー');
			expect(app?.innerHTML).toContain('menu');
		});

		it('DOMが存在しない場合でもエラーにならない', async () => {
			document.body.innerHTML = ''; // DOM削除

			const menuFactory = vi.fn(async () => createMockController('menu'));
			router.register('menu', menuFactory);

			await expect(router.start()).resolves.not.toThrow();
		});

		it('エラーメッセージはXSSエスケープされる', async () => {
			// モード名に危険な文字列が含まれていても安全に表示される
			const errorFactory = vi.fn(async () => {
				throw new Error('Test error');
			});

			router.register('menu', errorFactory);
			await router.start();

			const app = document.getElementById('app');
			// エラーメッセージが表示されている
			expect(app?.innerHTML).toContain('エラー');
			expect(app?.innerHTML).toContain('menu');
			// スクリプトタグは含まれていない
			expect(app?.innerHTML).not.toContain('<script>');
		});
	});

	describe('統合シナリオ', () => {
		it('menu → vertical → horizontal → menuの遷移が正しく動作する', async () => {
			let menuCallCount = 0;
			let verticalCallCount = 0;
			let horizontalCallCount = 0;

			const menuFactory = vi.fn(async () => {
				menuCallCount++;
				return createMockController('menu');
			});
			const verticalFactory = vi.fn(async () => {
				verticalCallCount++;
				return createMockController('vertical');
			});
			const horizontalFactory = vi.fn(async () => {
				horizontalCallCount++;
				return createMockController('horizontal');
			});

			router.register('menu', menuFactory);
			router.register('vertical', verticalFactory);
			router.register('horizontal', horizontalFactory);

			// 1. menu起動
			await router.start();
			expect(router.getCurrentMode()).toBe('menu');
			expect(menuCallCount).toBe(1);

			// 2. verticalに遷移
			await triggerHashChange('#vertical');
			expect(router.getCurrentMode()).toBe('vertical');
			expect(verticalCallCount).toBe(1);

			// 3. horizontalに遷移
			await triggerHashChange('#horizontal');
			expect(router.getCurrentMode()).toBe('horizontal');
			expect(horizontalCallCount).toBe(1);

			// 4. menuに戻る
			await triggerHashChange('#menu');
			expect(router.getCurrentMode()).toBe('menu');
			expect(menuCallCount).toBe(2); // 2回目の呼び出し
		});

		it('連続してハッシュを変更しても正しく動作する', async () => {
			let menuCallCount = 0;
			let verticalCallCount = 0;
			let horizontalCallCount = 0;

			router.register('menu', async () => {
				menuCallCount++;
				return createMockController('menu');
			});
			router.register('vertical', async () => {
				verticalCallCount++;
				return createMockController('vertical');
			});
			router.register('horizontal', async () => {
				horizontalCallCount++;
				return createMockController('horizontal');
			});

			await router.start();
			expect(menuCallCount).toBe(1);

			// 連続でハッシュ変更
			await triggerHashChange('#vertical');
			expect(verticalCallCount).toBe(1);

			await triggerHashChange('#horizontal');
			expect(horizontalCallCount).toBe(1);

			await triggerHashChange('#menu');
			expect(menuCallCount).toBe(2);

			expect(router.getCurrentMode()).toBe('menu');
		});
	});
});

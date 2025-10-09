/**
 * SPA用のシンプルなルーティングシステム
 * ハッシュベースのルーティングを提供し、各モードのライフサイクルを管理する
 */

export type Route = 'menu' | 'vertical' | 'horizontal' | 'flashcard' | 'koch' | 'listening';

export interface ModeController {
	destroy(): void;
}

export type ModeFactory = () => Promise<ModeController>;

/**
 * ルーター
 */
export class Router {
	private currentMode: Route = 'menu';
	private currentController: ModeController | null = null;
	private routes: Map<Route, ModeFactory> = new Map();

	constructor() {
		// ハッシュ変更イベントをリッスン
		window.addEventListener('hashchange', () => this.handleHashChange());
	}

	/**
	 * ルートを登録
	 */
	register(route: Route, factory: ModeFactory): void {
		this.routes.set(route, factory);
	}

	/**
	 * 初期ルートを読み込み
	 */
	async start(): Promise<void> {
		await this.handleHashChange();
	}

	/**
	 * URLハッシュの変更を処理
	 */
	private async handleHashChange(): Promise<void> {
		const hash = (window.location.hash.slice(1) || 'menu') as Route;

		// 登録されていないルートの場合はmenuにリダイレクト
		if (!this.routes.has(hash)) {
			window.location.hash = '#menu';
			return;
		}

		await this.switchMode(hash);
	}

	/**
	 * モードを切り替える
	 */
	private async switchMode(mode: Route): Promise<void> {
		// 現在のモードコントローラーをクリーンアップ
		if (this.currentController) {
			this.currentController.destroy();
			this.currentController = null;
		}

		// appコンテナをクリア
		const app = document.getElementById('app');
		if (app) {
			app.innerHTML = '';
		}

		this.currentMode = mode;

		// 新しいモードのファクトリーを実行
		const factory = this.routes.get(mode);
		if (factory) {
			try {
				this.currentController = await factory();
			} catch (error) {
				console.error(`Failed to load mode: ${mode}`, error);
				this.showError(`モード「${mode}」の読み込みに失敗しました`);
			}
		}
	}

	/**
	 * エラー表示
	 */
	private showError(message: string): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="error-container">
				<h2>エラー</h2>
				<p>${message}</p>
				<a href="#menu" class="btn">メニューに戻る</a>
			</div>
		`;
	}

	/**
	 * 現在のモードを取得
	 */
	getCurrentMode(): Route {
		return this.currentMode;
	}
}

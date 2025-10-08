/**
 * モールス練習アプリ v4 - SPA統合版
 *
 * 各モード(vertical/horizontal/flashcard/koch)を1つのアプリケーションに統合し、
 * ハッシュルーティングで切り替え可能にする。
 *
 * 各モードは独自のAudioSystemインスタンスを持つが、
 * ページ遷移がないため、一度初期化した音声システムは保持される。
 */

// モードの型定義
type Mode = 'menu' | 'vertical' | 'horizontal' | 'flashcard' | 'koch';

/**
 * SPAアプリケーションクラス
 */
class MorseApp {
	private currentMode: Mode = 'menu';
	private currentModeInstance: any = null;

	constructor() {
		// ハッシュ変更イベントをリッスン
		window.addEventListener('hashchange', () => this.handleHashChange());

		// 初期表示
		this.handleHashChange();
	}

	/**
	 * URLハッシュの変更を処理
	 */
	private handleHashChange(): void {
		const hash = window.location.hash.slice(1) || 'menu';
		this.switchMode(hash as Mode);
	}

	/**
	 * モードを切り替える
	 */
	private async switchMode(mode: Mode): void {
		// 現在のモードインスタンスをクリーンアップ
		if (this.currentModeInstance && typeof this.currentModeInstance.destroy === 'function') {
			this.currentModeInstance.destroy();
		}
		this.currentModeInstance = null;

		// appコンテナをクリア
		const app = document.getElementById('app');
		if (app) {
			app.innerHTML = '';
		}

		this.currentMode = mode;

		switch (mode) {
			case 'menu':
				this.renderMenu();
				break;
			case 'vertical':
				await this.loadVerticalMode();
				break;
			case 'horizontal':
				await this.loadHorizontalMode();
				break;
			case 'flashcard':
				await this.loadFlashcardMode();
				break;
			case 'koch':
				await this.loadKochMode();
				break;
			default:
				this.renderMenu();
		}
	}

	/**
	 * メニュー画面を表示
	 */
	private renderMenu(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="menu-container">
				<header class="menu-header">
					<h1>モールス練習アプリ v4</h1>
					<p class="subtitle">練習モードを選択してください</p>
				</header>

				<nav class="menu-nav">
					<a href="#vertical" class="menu-item">
						<div class="menu-icon">📱</div>
						<h2>縦振り電鍵練習</h2>
						<p>縦振り電鍵の操作を練習します</p>
					</a>
					<a href="#horizontal" class="menu-item">
						<div class="menu-icon">⌨️</div>
						<h2>横振り電鍵練習</h2>
						<p>横振り電鍵(パドル)の操作を練習します</p>
					</a>
					<a href="#flashcard" class="menu-item">
						<div class="menu-icon">📚</div>
						<h2>CW略語・Q符号学習</h2>
						<p>無線通信で使用する略語とQ符号を学習します</p>
					</a>
					<a href="#koch" class="menu-item">
						<div class="menu-icon">🎓</div>
						<h2>コッホ法トレーニング</h2>
						<p>系統的にモールス符号を学習します</p>
					</a>
				</nav>

				<footer class="menu-footer">
					<p>※SPA版では、モード間の切り替え時にページがリロードされません</p>
					<p>※音声システムは各モードで1回のみ初期化されます</p>
				</footer>
			</div>
		`;
	}

	/**
	 * 縦振りモードを読み込み
	 */
	private async loadVerticalMode(): void {
		try {
			// CSSを動的にインポート
			await import('../vertical/style.css');
			// モジュールを動的にインポート
			const module = await import('../vertical/main.ts');
			// モジュールがエクスポートしているクラスまたは初期化関数を呼び出す
			// 既存のコードはDOMContentLoaded内で自動実行されるため、
			// ここでは再度DOMContentLoadedイベントを発火させる
			const event = new Event('DOMContentLoaded');
			document.dispatchEvent(event);
		} catch (error) {
			console.error('Failed to load vertical mode:', error);
			this.showError('縦振りモードの読み込みに失敗しました');
		}
	}

	/**
	 * 横振りモードを読み込み
	 */
	private async loadHorizontalMode(): void {
		try {
			await import('../horizontal/style.css');
			const module = await import('../horizontal/main.ts');
			const event = new Event('DOMContentLoaded');
			document.dispatchEvent(event);
		} catch (error) {
			console.error('Failed to load horizontal mode:', error);
			this.showError('横振りモードの読み込みに失敗しました');
		}
	}

	/**
	 * フラッシュカードモードを読み込み
	 */
	private async loadFlashcardMode(): void {
		try {
			await import('../flashcard/style.css');
			const module = await import('../flashcard/main.ts');
			const event = new Event('DOMContentLoaded');
			document.dispatchEvent(event);
		} catch (error) {
			console.error('Failed to load flashcard mode:', error);
			this.showError('フラッシュカードモードの読み込みに失敗しました');
		}
	}

	/**
	 * コッホ法モードを読み込み
	 */
	private async loadKochMode(): void {
		try {
			await import('../koch/style.css');
			const module = await import('../koch/main.ts');
			const event = new Event('DOMContentLoaded');
			document.dispatchEvent(event);
		} catch (error) {
			console.error('Failed to load koch mode:', error);
			this.showError('コッホ法モードの読み込みに失敗しました');
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
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
	new MorseApp();
});

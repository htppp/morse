/**
 * モールス練習アプリ v8 - PWAアプリ版
 *
 * すべてのモードを単一のアプリケーションに統合し、
 * ハッシュルーティングでシームレスに切り替え可能。
 * オフライン対応、インストール可能なPWAとして動作。
 */

import { Router } from './core/router';
import './styles/global.css';

/**
 * アプリケーションエントリーポイント
 */
class MorseApp {
	private router: Router;

	constructor() {
		this.router = new Router();
		this.registerRoutes();
		this.router.start();
	}

	/**
	 * 各モードをルーターに登録
	 */
	private registerRoutes(): void {
		// メニューモード
		this.router.register('menu', async () => {
			const { MenuPage } = await import('./modes/menu/main');
			return new MenuPage();
		});

		// 縦振り電鍵モード
		this.router.register('vertical', async () => {
			const { VerticalKeyTrainer } = await import('./modes/vertical/main');
			return new VerticalKeyTrainer();
		});

		// 横振り電鍵モード
		this.router.register('horizontal', async () => {
			const { HorizontalKeyTrainer } = await import('./modes/horizontal/main');
			return new HorizontalKeyTrainer();
		});

		// フラッシュカードモード
		this.router.register('flashcard', async () => {
			const { FlashcardTrainer } = await import('./modes/flashcard/main');
			return new FlashcardTrainer();
		});

		// コッホ法モード
		this.router.register('koch', async () => {
			const { KochTrainer } = await import('./modes/koch/main');
			return new KochTrainer();
		});

		// モールス信号聞き取り練習モード
		this.router.register('listening', async () => {
			const { ListeningTrainer } = await import('./modes/listening/main');
			return new ListeningTrainer();
		});
	}
}

// DOMの準備ができたらアプリケーションを起動
document.addEventListener('DOMContentLoaded', () => {
	new MorseApp();
});

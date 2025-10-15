/**
 * アプリケーションエントリポイント
 */

import { Router } from './router';
import './assets/styles.css';

//! アプリケーション起動時の処理。
function init(): void {
	console.log('モールス練習アプリ v10 起動');

	//! ルーターを初期化。
	const router = new Router();
	router.init();
}

//! DOMContentLoaded後に初期化。
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

//! アプリケーションのエントリーポイント。

/**
 * アプリケーションを初期化する。
 */
function main(): void {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = '<h1>Hello, Morse!</h1>';
	}
}

// DOMContentLoadedイベントでmain関数を実行。
document.addEventListener('DOMContentLoaded', main);

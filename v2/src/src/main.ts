//! メインアプリケーション初期化。

import { Settings } from './settings.js';
import { AudioSystem } from './audio-system.js';
import { UIControls } from './ui-controls.js';
import { StraightKey } from './straight-key.js';
import { PaddleKey } from './paddle-key.js';

//! アプリケーションのメイン初期化。
document.addEventListener('DOMContentLoaded', () => {
	// 各モジュールの初期化順序が重要。
	console.log('モールスアプリケーション初期化開始');

	// 1. 設定モジュールを最初に初期化（他のモジュールが依存するため）。
	Settings.init();
	console.log('設定モジュール初期化完了');

	// 2. 音声システムを初期化。
	AudioSystem.init();
	console.log('音声システム初期化完了');

	// 3. UIコントロールを初期化。
	UIControls.init();
	console.log('UIコントロール初期化完了');

	// 4. 縦振り電鍵を初期化。
	StraightKey.init();
	console.log('縦振り電鍵初期化完了');

	// 5. 横振り電鍵を初期化。
	PaddleKey.init();
	console.log('横振り電鍵初期化完了');

	console.log('モールスアプリケーション初期化完了');
});

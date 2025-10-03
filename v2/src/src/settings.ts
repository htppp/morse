//! 設定管理モジュール。

//! 設定値の型定義。
interface SettingsData {
	volume: number;
	frequency: number;
	wpm: number;
	straightKey: string;
	paddleLeft: string;
	paddleRight: string;
	iambicMode: 'A' | 'B';
	paddleLayout: 'normal' | 'reversed';
}

//! 設定管理クラス。
export class Settings {
	private static defaultSettings: SettingsData = {
		volume: 0.3,
		frequency: 600,
		wpm: 20,
		straightKey: 'Space',
		paddleLeft: 'j',
		paddleRight: 'k',
		iambicMode: 'B',
		paddleLayout: 'normal'
	};

	private static settings: SettingsData = { ...Settings.defaultSettings };
	private static playHistory: string[] = [];
	private static tempSettings: SettingsData | null = null; // 一時的な設定保存用。

	//! 設定値の取得。
	static get<K extends keyof SettingsData>(key: K): SettingsData[K] {
		return this.settings[key];
	}

	//! 設定値の設定。
	static set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
		this.settings[key] = value;
		this.updateUI();
	}

	//! 設定値の一時設定（保存しない）。
	static setTemp<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
		this.settings[key] = value;
		this.updateUI();
	}

	//! 設定の読み込み。
	static load(): void {
		const saved = localStorage.getItem('morseSettings');
		if (saved) {
			this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
		} else {
			this.settings = { ...this.defaultSettings };
		}

		const savedHistory = localStorage.getItem('morsePlayHistory');
		if (savedHistory) {
			this.playHistory = JSON.parse(savedHistory);
		}
	}

	//! 設定の保存。
	static save(): void {
		localStorage.setItem('morseSettings', JSON.stringify(this.settings));
	}

	//! 一時設定の保存。
	static saveTempSettings(): void {
		this.tempSettings = JSON.parse(JSON.stringify(this.settings));
	}

	//! 一時設定の復元。
	static restoreTempSettings(): void {
		if (this.tempSettings) {
			this.settings = JSON.parse(JSON.stringify(this.tempSettings));
			this.tempSettings = null;
			this.updateUI();
			this.updatePaddleLayout();
		}
	}

	//! 設定の確定（保存）。
	static applySettings(): void {
		this.save();
		this.tempSettings = null;
	}

	//! 履歴の追加。
	static addToHistory(text: string): void {
		this.playHistory.push(text);
		localStorage.setItem('morsePlayHistory', JSON.stringify(this.playHistory));
		this.updateHistoryDisplay();
	}

	//! 履歴のクリア。
	static clearHistory(): void {
		this.playHistory = [];
		localStorage.setItem('morsePlayHistory', JSON.stringify(this.playHistory));
		this.updateHistoryDisplay();
	}

	//! UIの更新。
	static updateUI(): void {
		// 音量。
		const volumeRange = document.getElementById('volumeRange') as HTMLInputElement | null;
		const volumeInput = document.getElementById('volumeInput') as HTMLInputElement | null;
		if (volumeRange && volumeInput) {
			volumeRange.value = String(this.settings.volume * 100);
			volumeInput.value = String(Math.round(this.settings.volume * 100));
		}

		// 周波数。
		const frequencyInput = document.getElementById('globalFrequency') as HTMLInputElement | null;
		if (frequencyInput) {
			frequencyInput.value = String(this.settings.frequency);
		}

		// WPM。
		const wpmInput = document.getElementById('globalWPM') as HTMLInputElement | null;
		if (wpmInput) {
			wpmInput.value = String(this.settings.wpm);
		}

		// キー設定。
		const straightKeyInput = document.getElementById('straightKey') as HTMLInputElement | null;
		if (straightKeyInput) {
			straightKeyInput.value = this.settings.straightKey;
		}

		const paddleLeftInput = document.getElementById('paddleLeftKey') as HTMLInputElement | null;
		if (paddleLeftInput) {
			paddleLeftInput.value = this.settings.paddleLeft;
		}

		const paddleRightInput = document.getElementById('paddleRightKey') as HTMLInputElement | null;
		if (paddleRightInput) {
			paddleRightInput.value = this.settings.paddleRight;
		}

		// Iambicモード。
		const iambicCheckbox = document.getElementById('iambicMode') as HTMLInputElement | null;
		if (iambicCheckbox) {
			iambicCheckbox.checked = this.settings.iambicMode === 'B';
		}

		// パドルレイアウト。
		const paddleLayoutCheckbox = document.getElementById('paddleLayout') as HTMLInputElement | null;
		if (paddleLayoutCheckbox) {
			paddleLayoutCheckbox.checked = this.settings.paddleLayout === 'reversed';
		}

		this.updateKeyHints();
		this.updateHistoryDisplay();
		this.updateJapaneseModeStatus();
		this.updateIambicModeStatus();
		this.updatePaddleLayoutStatus();
	}

	//! キーヒントの更新。
	static updateKeyHints(): void {
		const straightKeyHint = document.getElementById('straightKeyHint');
		if (straightKeyHint) {
			straightKeyHint.textContent = this.settings.straightKey;
		}

		const paddleKeysHint = document.getElementById('paddleKeysHint');
		if (paddleKeysHint) {
			paddleKeysHint.textContent =
				this.settings.paddleLeft.toUpperCase() + ' / ' + this.settings.paddleRight.toUpperCase();
		}
	}

	//! 履歴表示の更新。
	static updateHistoryDisplay(): void {
		const historyDiv = document.getElementById('playHistory');
		if (!historyDiv) return;

		if (this.playHistory.length === 0) {
			historyDiv.textContent = '再生履歴はありません';
		} else {
			historyDiv.innerHTML = this.playHistory.map((item, i) =>
				`<div>${i + 1}. ${item}</div>`
			).join('');
		}
	}

	//! 和文モードステータスの更新。
	static updateJapaneseModeStatus(): void {
		const statusSpan = document.getElementById('japaneseModeStatus');
		const checkbox = document.getElementById('japaneseMode') as HTMLInputElement | null;
		if (statusSpan && checkbox) {
			statusSpan.textContent = checkbox.checked ? '(現在: 和文)' : '(現在: 欧文)';
		}
	}

	//! Iambicモードステータスの更新。
	static updateIambicModeStatus(): void {
		const statusSpan = document.getElementById('iambicModeStatus');
		const checkbox = document.getElementById('iambicMode') as HTMLInputElement | null;
		if (statusSpan && checkbox) {
			statusSpan.textContent = checkbox.checked ? '(現在: Iambic B)' : '(現在: Iambic A)';
		}
	}

	//! パドルレイアウトステータスの更新。
	static updatePaddleLayoutStatus(): void {
		const statusSpan = document.getElementById('paddleLayoutStatus');
		const checkbox = document.getElementById('paddleLayout') as HTMLInputElement | null;
		if (statusSpan && checkbox) {
			statusSpan.textContent = checkbox.checked ? '(現在: 左:長点 / 右:短点)' : '(現在: 左:短点 / 右:長点)';
		}
	}

	//! パドルレイアウトの更新。
	static updatePaddleLayout(): void {
		const leftBtn = document.getElementById('paddleLeft') as HTMLButtonElement | null;
		const rightBtn = document.getElementById('paddleRight') as HTMLButtonElement | null;

		if (!leftBtn || !rightBtn) {
			// DOM要素が見つからない場合は何もしない（横振りタブが表示されていない場合など）。
			return;
		}

		if (this.settings.paddleLayout === 'reversed') {
			// 左ボタンを長点に。
			leftBtn.innerHTML = '長点<br>ー';
			leftBtn.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
			// 右ボタンを短点に。
			rightBtn.innerHTML = '短点<br>・';
			rightBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
		} else {
			// 左ボタンを短点に。
			leftBtn.innerHTML = '短点<br>・';
			leftBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
			// 右ボタンを長点に。
			rightBtn.innerHTML = '長点<br>ー';
			rightBtn.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
		}
	}

	//! イベントリスナーの設定。
	static setupEventListeners(): void {
		// 音量。
		const volumeRange = document.getElementById('volumeRange') as HTMLInputElement | null;
		const volumeInput = document.getElementById('volumeInput') as HTMLInputElement | null;

		if (volumeRange) {
			volumeRange.addEventListener('input', (e) => {
				const value = parseInt((e.target as HTMLInputElement).value);
				this.setTemp('volume', value / 100);
				if (volumeInput) volumeInput.value = String(value);
			});
		}

		if (volumeInput) {
			volumeInput.addEventListener('input', (e) => {
				const value = Math.max(0, Math.min(100, parseInt((e.target as HTMLInputElement).value) || 0));
				this.setTemp('volume', value / 100);
				if (volumeRange) volumeRange.value = String(value);
				(e.target as HTMLInputElement).value = String(value);
			});
		}

		// 周波数。
		const frequencyInput = document.getElementById('globalFrequency') as HTMLInputElement | null;
		if (frequencyInput) {
			frequencyInput.addEventListener('change', (e) => {
				let val = parseInt((e.target as HTMLInputElement).value);
				if (isNaN(val) || val < 100) val = 100;
				if (val > 2000) val = 2000;
				(e.target as HTMLInputElement).value = String(val);
				this.setTemp('frequency', val);
			});
		}

		// WPM。
		const wpmInput = document.getElementById('globalWPM') as HTMLInputElement | null;
		if (wpmInput) {
			wpmInput.addEventListener('change', (e) => {
				let val = parseInt((e.target as HTMLInputElement).value);
				if (isNaN(val) || val < 1) val = 1;
				if (val > 999) val = 999;
				(e.target as HTMLInputElement).value = String(val);
				this.setTemp('wpm', val);
			});
		}

		// キー設定。
		const straightKeyInput = document.getElementById('straightKey') as HTMLInputElement | null;
		if (straightKeyInput) {
			straightKeyInput.addEventListener('change', (e) => {
				this.setTemp('straightKey', (e.target as HTMLInputElement).value.trim() || 'Space');
			});
		}

		const paddleLeftInput = document.getElementById('paddleLeftKey') as HTMLInputElement | null;
		if (paddleLeftInput) {
			paddleLeftInput.addEventListener('change', (e) => {
				this.setTemp('paddleLeft', (e.target as HTMLInputElement).value.trim() || 'j');
			});
		}

		const paddleRightInput = document.getElementById('paddleRightKey') as HTMLInputElement | null;
		if (paddleRightInput) {
			paddleRightInput.addEventListener('change', (e) => {
				this.setTemp('paddleRight', (e.target as HTMLInputElement).value.trim() || 'k');
			});
		}

		// Iambicモード。
		const iambicCheckbox = document.getElementById('iambicMode') as HTMLInputElement | null;
		if (iambicCheckbox) {
			iambicCheckbox.addEventListener('change', (e) => {
				this.setTemp('iambicMode', (e.target as HTMLInputElement).checked ? 'B' : 'A');
				this.updateIambicModeStatus();
			});
		}

		// パドルレイアウト。
		const paddleLayoutCheckbox = document.getElementById('paddleLayout') as HTMLInputElement | null;
		if (paddleLayoutCheckbox) {
			paddleLayoutCheckbox.addEventListener('change', (e) => {
				this.setTemp('paddleLayout', (e.target as HTMLInputElement).checked ? 'reversed' : 'normal');
				this.updatePaddleLayoutStatus();
				this.updatePaddleLayout();
			});
		}

		// 和文モード。
		const japaneseModeCheckbox = document.getElementById('japaneseMode') as HTMLInputElement | null;
		if (japaneseModeCheckbox) {
			japaneseModeCheckbox.addEventListener('change', () => {
				this.updateJapaneseModeStatus();
			});
		}

		// 履歴クリア。
		const clearHistoryBtn = document.getElementById('clearHistory');
		if (clearHistoryBtn) {
			clearHistoryBtn.addEventListener('click', () => {
				this.clearHistory();
			});
		}
	}

	//! 初期化。
	static init(): void {
		this.load();
		this.updateUI();
		this.setupEventListeners();

		// DOMが読み込まれた後にパドルレイアウトを更新。
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				this.updatePaddleLayout();
			});
		} else {
			this.updatePaddleLayout();
		}
	}
}

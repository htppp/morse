//! 縦振り電鍵機能モジュール。

import { Settings } from './settings.js';
import { AudioSystem } from './audio-system.js';
import { MorseCode } from './morse-code.js';

//! タイミング設定の型定義。
interface Timings {
	dot: number;
	dash: number;
	charGap: number;
	wordGap: number;
}

//! 縦振り電鍵クラス。
export class StraightKey {
	private static keyDown: boolean = false;
	private static keyDownTime: number = 0;
	private static buffer: string = '';
	private static sequence: string = '';
	private static lastInputTime: number = 0;
	private static charTimer: number | null = null;
	private static wordTimer: number | null = null;

	//! タイミング設定の取得。
	private static getTimings(): Timings {
		const wpm = Settings.get('wpm');
		const unit = 1200 / wpm;
		return {
			dot: unit,
			dash: unit * 3,
			charGap: unit * 4,
			wordGap: unit * 7
		};
	}

	//! タイマーのクリア。
	private static clearTimers(): void {
		if (this.charTimer !== null) {
			clearTimeout(this.charTimer);
			this.charTimer = null;
		}
		if (this.wordTimer !== null) {
			clearTimeout(this.wordTimer);
			this.wordTimer = null;
		}
	}

	//! タイマーの設定。
	private static setTimers(): void {
		this.clearTimers();
		const timings = this.getTimings();

		this.charTimer = window.setTimeout(() => {
			if (this.sequence) {
				this.buffer += this.sequence + ' ';
				this.sequence = '';
				this.updateDisplay();
			}
		}, timings.charGap);

		this.wordTimer = window.setTimeout(() => {
			if (this.sequence) {
				this.buffer += this.sequence + ' ';
				this.sequence = '';
			}
			if (!this.buffer.endsWith('/ ')) {
				this.buffer += '/ ';
			}
			this.updateDisplay();
		}, timings.wordGap);
	}

	//! キーダウン処理。
	private static onKeyDown(): void {
		if (this.keyDown) return;

		this.keyDown = true;
		this.keyDownTime = Date.now();
		this.clearTimers();

		AudioSystem.startContinuousTone();
	}

	//! キーアップ処理。
	private static onKeyUp(): void {
		if (!this.keyDown) return;

		this.keyDown = false;
		const duration = Date.now() - this.keyDownTime;

		AudioSystem.stopContinuousTone();

		const timings = this.getTimings();
		const signal = duration < timings.dash ? '.' : '-';
		this.sequence += signal;
		this.lastInputTime = Date.now();
		this.updateDisplay();
		this.setTimers();
	}

	//! 表示の更新。
	private static updateDisplay(): void {
		let display = '';
		if (this.buffer) {
			display = this.buffer.trim();
		}
		if (this.sequence) {
			if (display) display += ' ';
			display += `[${this.sequence}]`;
		}

		const morseDisplay = document.getElementById('straightMorseDisplay');
		if (morseDisplay) {
			morseDisplay.textContent = display || '入力されたモールス信号';
		}

		this.updateDecoded();
	}

	//! デコード表示の更新。
	private static updateDecoded(): void {
		const sequences = this.buffer.trim().split(/\s+/);
		const decoded = MorseCode.morseSequencesToText(sequences);

		const decodedOutput = document.getElementById('straightDecoded');
		if (decodedOutput) {
			decodedOutput.textContent = decoded || '解読された文字';
		}
	}

	//! クリア処理。
	private static clear(): void {
		this.buffer = '';
		this.sequence = '';
		this.clearTimers();
		this.updateDisplay();
	}

	//! イベントリスナーの設定。
	private static setupEventListeners(): void {
		// マウスイベント。
		const morseKey = document.getElementById('morseKey');
		if (morseKey) {
			morseKey.addEventListener('mousedown', () => this.onKeyDown());
			morseKey.addEventListener('mouseup', () => this.onKeyUp());
			morseKey.addEventListener('mouseleave', () => {
				if (this.keyDown) {
					this.onKeyUp();
				}
			});
		}

		// クリアボタン。
		const clearBtn = document.getElementById('straightClear');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => this.clear());
		}

		// キーボードイベント。
		document.addEventListener('keydown', (e) => {
			if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
			if (e.repeat) return;

			const activeTab = document.querySelector('.tab.active') as HTMLElement | null;
			if (!activeTab || activeTab.dataset.tab !== 'straight') return;

			const straightKey = Settings.get('straightKey');
			if (e.key === straightKey || (straightKey === 'Space' && e.code === 'Space')) {
				e.preventDefault();
				this.onKeyDown();
			}
		});

		document.addEventListener('keyup', (e) => {
			if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

			const activeTab = document.querySelector('.tab.active') as HTMLElement | null;
			if (!activeTab || activeTab.dataset.tab !== 'straight') return;

			const straightKey = Settings.get('straightKey');
			if (e.key === straightKey || (straightKey === 'Space' && e.code === 'Space')) {
				e.preventDefault();
				this.onKeyUp();
			}
		});
	}

	//! 初期化。
	static init(): void {
		this.setupEventListeners();
	}
}

/**
 * 縦振り電鍵練習ビュー
 */

import type { View } from '../../router';
import {
	VerticalKeyTrainer,
	MorseBuffer,
	TimerManager,
	TimingCalculator,
	AudioGenerator
} from 'morse-engine';

/**
 * 縦振り電鍵練習ビュークラス
 */
export class VerticalKeyView implements View {
	private trainer: VerticalKeyTrainer;
	private buffer: MorseBuffer;
	private timer: TimerManager;
	private audio: AudioGenerator;
	private isKeyPressed = false;
	private keyPressHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyReleaseHandler: ((e: KeyboardEvent) => void) | null = null;
	private updateIntervalId: number | null = null;
	private currentWPM = 20;

	constructor() {
		//! コアコンポーネントを初期化。
		this.buffer = new MorseBuffer();
		this.timer = new TimerManager();
		this.audio = new AudioGenerator({
			frequency: 700,
			volume: 0.5,
			wpm: 20
		});

		//! タイミング計算（初期WPM: 20）。
		const timings = TimingCalculator.calculate(this.currentWPM);

		//! トレーナーを初期化（コールバックで音声制御）。
		this.trainer = new VerticalKeyTrainer(
			this.buffer,
			this.timer,
			timings,
			{
				onKeyPress: () => {
					//! キー押下時に音を鳴らす。
					this.audio.startContinuousTone();
				},
				onKeyRelease: () => {
					//! キー解放時に音を止める。
					this.audio.stopContinuousTone();
				}
			}
		);
	}

	/**
	 * ビューをレンダリングする
	 */
	render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>縦振り電鍵練習</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="instructions">
					<h3>使い方</h3>
					<ul>
						<li>スペースキーまたは画面のボタンを押している間、モールス信号が送信されます</li>
						<li>短く押すと「・」(dit)、長く押すと「ー」(dah)になります</li>
						<li>文字間は自動的に判定されます</li>
						<li>WPM（Words Per Minute）で速度を調整できます</li>
						<li>音声が鳴らない場合は、一度ボタンをクリックしてください（ブラウザのオーディオポリシー）</li>
					</ul>
				</div>

				<div class="key-button-container">
					<button class="key-button" id="morse-key">
						KEY
						<span class="key-label">(クリック/タップで送信)</span>
					</button>
				</div>

				<div class="practice-container">
					<div class="status-area">
						<div class="status-item">
							<span class="label">現在の速度</span>
							<span class="value" id="current-wpm">20</span>
						</div>
						<div class="status-item" id="key-status">
							<span class="label">キー状態</span>
							<span class="value">解放</span>
						</div>
						<div class="status-item">
							<span class="label">入力文字数</span>
							<span class="value" id="char-count">0</span>
						</div>
					</div>

					<div class="display-area">
						<div class="display-section">
							<h3>モールスバッファ</h3>
							<div class="display-output morse-buffer" id="morse-buffer">（ここにモールス符号が表示されます）</div>
						</div>
						<div class="display-section">
							<h3>デコード結果</h3>
							<div class="display-output" id="decoded-text">（ここにデコードされた文字が表示されます）</div>
						</div>
					</div>

					<div class="settings-panel">
						<h3>設定</h3>
						<div class="setting-row">
							<label for="wpm-range">送信速度 (WPM)</label>
							<input type="range" id="wpm-range" min="5" max="40" value="20" step="1">
							<span class="value-display" id="wpm-display">20</span>
						</div>
						<div class="setting-row">
							<label for="frequency-range">音声周波数 (Hz)</label>
							<input type="range" id="frequency-range" min="400" max="1200" value="700" step="50">
							<span class="value-display" id="frequency-display">700</span>
						</div>
						<div class="setting-row">
							<label for="volume-range">音量</label>
							<input type="range" id="volume-range" min="0" max="100" value="50" step="5">
							<span class="value-display" id="volume-display">50</span>
						</div>
					</div>

					<div class="action-area">
						<button class="btn btn-large btn-danger" id="clear-btn">クリア</button>
					</div>
				</div>
			</div>
		`;

		//! イベントリスナーを設定。
		this.attachEventListeners();
		//! 定期更新を開始。
		this.startUpdate();
	}

	/**
	 * イベントリスナーを設定する
	 */
	private attachEventListeners(): void {
		//! 戻るボタン。
		const backBtn = document.querySelector('.back-btn');
		backBtn?.addEventListener('click', () => {
			window.location.hash = '#menu';
		});

		//! クリアボタン。
		const clearBtn = document.getElementById('clear-btn');
		clearBtn?.addEventListener('click', () => {
			this.trainer.clear();
			this.updateDisplay();
		});

		//! WPM調整。
		const wpmRange = document.getElementById('wpm-range') as HTMLInputElement;
		const wpmDisplay = document.getElementById('wpm-display');
		const currentWpmDisplay = document.getElementById('current-wpm');
		wpmRange?.addEventListener('input', () => {
			const wpm = parseInt(wpmRange.value, 10);
			this.currentWPM = wpm;

			//! タイミングを再計算してトレーナーを再初期化。
			const timings = TimingCalculator.calculate(wpm);
			this.trainer = new VerticalKeyTrainer(
				this.buffer,
				this.timer,
				timings,
				{
					onKeyPress: () => {
						this.audio.startContinuousTone();
					},
					onKeyRelease: () => {
						this.audio.stopContinuousTone();
					}
				}
			);

			if (wpmDisplay) wpmDisplay.textContent = wpm.toString();
			if (currentWpmDisplay) currentWpmDisplay.textContent = wpm.toString();
		});

		//! 音声周波数調整。
		const frequencyRange = document.getElementById('frequency-range') as HTMLInputElement;
		const frequencyDisplay = document.getElementById('frequency-display');
		frequencyRange?.addEventListener('input', () => {
			const frequency = parseInt(frequencyRange.value, 10);
			this.audio.setFrequency(frequency);
			if (frequencyDisplay) frequencyDisplay.textContent = frequency.toString();
		});

		//! 音量調整。
		const volumeRange = document.getElementById('volume-range') as HTMLInputElement;
		const volumeDisplay = document.getElementById('volume-display');
		volumeRange?.addEventListener('input', () => {
			const volume = parseInt(volumeRange.value, 10);
			this.audio.setVolume(volume / 100);
			if (volumeDisplay) volumeDisplay.textContent = volume.toString();
		});

		//! キーボードイベント（スペースキー）。
		this.keyPressHandler = (e: KeyboardEvent) => {
			if (e.code === 'Space' && !e.repeat) {
				e.preventDefault();
				if (!this.isKeyPressed) {
					this.handleKeyDown();
				}
			}
		};

		this.keyReleaseHandler = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				e.preventDefault();
				if (this.isKeyPressed) {
					this.handleKeyUp();
				}
			}
		};

		window.addEventListener('keydown', this.keyPressHandler);
		window.addEventListener('keyup', this.keyReleaseHandler);

		//! ボタンイベント（マウス/タッチ）。
		const keyButton = document.getElementById('morse-key');
		if (keyButton) {
			//! マウスイベント。
			keyButton.addEventListener('mousedown', (e) => {
				e.preventDefault();
				if (!this.isKeyPressed) {
					this.handleKeyDown();
				}
			});

			keyButton.addEventListener('mouseup', (e) => {
				e.preventDefault();
				if (this.isKeyPressed) {
					this.handleKeyUp();
				}
			});

			keyButton.addEventListener('mouseleave', () => {
				if (this.isKeyPressed) {
					this.handleKeyUp();
				}
			});

			//! タッチイベント。
			keyButton.addEventListener('touchstart', (e) => {
				e.preventDefault();
				if (!this.isKeyPressed) {
					this.handleKeyDown();
				}
			});

			keyButton.addEventListener('touchend', (e) => {
				e.preventDefault();
				if (this.isKeyPressed) {
					this.handleKeyUp();
				}
			});

			keyButton.addEventListener('touchcancel', () => {
				if (this.isKeyPressed) {
					this.handleKeyUp();
				}
			});
		}
	}

	/**
	 * キー押下処理
	 */
	private handleKeyDown(): void {
		this.isKeyPressed = true;
		this.trainer.keyPress();
		this.updateKeyStatus(true);

		//! ボタンの見た目を更新。
		const keyButton = document.getElementById('morse-key');
		if (keyButton) {
			keyButton.classList.add('pressed');
		}
	}

	/**
	 * キー解放処理
	 */
	private handleKeyUp(): void {
		this.isKeyPressed = false;
		this.trainer.keyRelease();
		this.updateKeyStatus(false);

		//! ボタンの見た目を更新。
		const keyButton = document.getElementById('morse-key');
		if (keyButton) {
			keyButton.classList.remove('pressed');
		}
	}

	/**
	 * 定期更新を開始する
	 */
	private startUpdate(): void {
		//! 100msごとに画面を更新。
		this.updateIntervalId = window.setInterval(() => {
			this.updateDisplay();
		}, 100);
	}

	/**
	 * 表示を更新する
	 */
	private updateDisplay(): void {
		const morseBuffer = document.getElementById('morse-buffer');
		const decodedText = document.getElementById('decoded-text');
		const charCount = document.getElementById('char-count');

		if (morseBuffer) {
			const buffer = this.trainer.getBuffer();
			const sequence = this.trainer.getSequence();
			const fullDisplay = sequence ? `${buffer} ${sequence}` : buffer;
			morseBuffer.textContent = fullDisplay || '（ここにモールス符号が表示されます）';
		}

		if (decodedText) {
			const text = this.trainer.getDecoded();
			decodedText.textContent = text || '（ここにデコードされた文字が表示されます）';
		}

		if (charCount) {
			const text = this.trainer.getDecoded();
			charCount.textContent = text.length.toString();
		}
	}

	/**
	 * キー状態表示を更新する
	 */
	private updateKeyStatus(isPressed: boolean): void {
		const keyStatus = document.getElementById('key-status');
		if (keyStatus) {
			const valueSpan = keyStatus.querySelector('.value');
			if (valueSpan) {
				valueSpan.textContent = isPressed ? '押下中' : '解放';
			}
			if (isPressed) {
				keyStatus.classList.add('active');
			} else {
				keyStatus.classList.remove('active');
			}
		}
	}

	/**
	 * ビューを破棄する
	 */
	destroy(): void {
		//! イベントリスナーを削除。
		if (this.keyPressHandler) {
			window.removeEventListener('keydown', this.keyPressHandler);
			this.keyPressHandler = null;
		}
		if (this.keyReleaseHandler) {
			window.removeEventListener('keyup', this.keyReleaseHandler);
			this.keyReleaseHandler = null;
		}

		//! 定期更新を停止。
		if (this.updateIntervalId !== null) {
			clearInterval(this.updateIntervalId);
			this.updateIntervalId = null;
		}

		//! 音声を停止。
		this.audio.stopContinuousTone();

		//! トレーナーをクリア。
		this.trainer.clear();
	}
}

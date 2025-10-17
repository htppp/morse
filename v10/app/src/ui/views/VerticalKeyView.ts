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
import { SettingsModal, ALL_SETTING_ITEMS, type SettingValues } from 'morse-engine';

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
	private keyCode = 'Space';

	constructor() {
		//! 設定を読み込む。
		const savedWPM = localStorage.getItem('verticalKeyWPM');
		if (savedWPM) {
			this.currentWPM = parseInt(savedWPM, 10);
		}

		const savedKeyCode = localStorage.getItem('verticalKeyCode');
		if (savedKeyCode) {
			this.keyCode = savedKeyCode;
		}

		//! コアコンポーネントを初期化。
		this.buffer = new MorseBuffer();
		this.timer = new TimerManager();
		this.audio = new AudioGenerator({
			frequency: 700,
			volume: 0.5,
			wpm: this.currentWPM
		});

		//! タイミング計算。
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
					<button class="back-btn">メニューに戻る</button>
					<h1>縦振り電鍵練習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="key-button-container">
					<button class="key-button" id="morse-key">
						KEY
						<span class="key-label">(クリック/タップで送信)</span>
					</button>
				</div>

				<div class="practice-container">
					<div class="display-area">
						<div class="display-section">
							<h3>モールス信号</h3>
							<div class="display-output morse-buffer" id="morse-buffer">（ここにモールス符号が表示されます）</div>
						</div>
						<div class="display-section">
							<h3>デコード結果</h3>
							<div class="display-output" id="decoded-text">（ここにデコードされた文字が表示されます）</div>
						</div>
					</div>

					<div class="action-area">
						<button class="btn btn-large btn-danger" id="clear-btn">クリア</button>
					</div>

					<div class="status-area">
						<div class="status-item">
							<span class="label">現在の速度</span>
							<span class="value" id="current-wpm">${this.currentWPM}</span>
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

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>スペースキーまたは画面のボタンを押している間、モールス信号が送信されます</li>
							<li>短く押すと「・」(dit)、長く押すと「ー」(dah)になります</li>
							<li>文字間は自動的に判定されます</li>
							<li>WPM（Words Per Minute）で速度を調整できます</li>
							<li>画面右上の⚙アイコンから音量・周波数・速度を調整できます</li>
							<li>音声が鳴らない場合は、一度ボタンをクリックしてください（ブラウザのオーディオポリシー）</li>
						</ul>
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

		//! 設定ボタン。
		const settingsBtn = document.getElementById('settings-btn');
		settingsBtn?.addEventListener('click', () => {
			this.openSettingsModal();
		});

		//! クリアボタン。
		const clearBtn = document.getElementById('clear-btn');
		clearBtn?.addEventListener('click', () => {
			this.trainer.clear();
			this.updateDisplay();
		});

		//! キーボードイベント（設定されたキー）。
		this.keyPressHandler = (e: KeyboardEvent) => {
			if (e.code === this.keyCode && !e.repeat) {
				e.preventDefault();
				if (!this.isKeyPressed) {
					this.handleKeyDown();
				}
			}
		};

		this.keyReleaseHandler = (e: KeyboardEvent) => {
			if (e.code === this.keyCode) {
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
	 * 設定モーダルを開く
	 */
	private openSettingsModal(): void {
		//! 現在の設定値を取得。
		const currentValues: SettingValues = {
			volume: Math.round(this.audio.getVolume() * 100),
			frequency: this.audio.getFrequency(),
			wpm: this.currentWPM,
			keyCode: this.keyCode
		};

		//! 設定変更前の値を保存（キャンセル時の復元用）。
		const savedSettings = {
			volume: this.audio.getVolume(),
			frequency: this.audio.getFrequency(),
			wpm: this.currentWPM,
			keyCode: this.keyCode
		};

		//! SettingsModalを作成。
		const modal = new SettingsModal(
			'vertical-key-settings-modal',
			ALL_SETTING_ITEMS,
			currentValues,
			{
				onSave: (values: SettingValues) => {
					//! 設定を保存。
					this.audio.setVolume((values.volume as number) / 100);
					this.audio.setFrequency(values.frequency as number);
					this.audio.setWPM(values.wpm as number);
					this.currentWPM = values.wpm as number;
					this.keyCode = values.keyCode as string;

					//! localStorageに保存。
					localStorage.setItem('verticalKeyWPM', this.currentWPM.toString());
					localStorage.setItem('verticalKeyCode', this.keyCode);

					//! タイミングを再計算してトレーナーを再初期化。
					const timings = TimingCalculator.calculate(this.currentWPM);
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

					//! 現在のWPM表示を更新。
					const currentWpmDisplay = document.getElementById('current-wpm');
					if (currentWpmDisplay) currentWpmDisplay.textContent = this.currentWPM.toString();
				},
				onCancel: () => {
					//! 設定を元に戻す。
					this.audio.setVolume(savedSettings.volume);
					this.audio.setFrequency(savedSettings.frequency);
					this.audio.setWPM(savedSettings.wpm);
					this.currentWPM = savedSettings.wpm;
					this.keyCode = savedSettings.keyCode;
				}
			}
		);

		//! モーダルを表示。
		modal.show('vertical-key');
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

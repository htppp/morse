/**
 * 横振り電鍵練習ビュー
 */

import type { View } from '../../router';
import {
	HorizontalKeyTrainer,
	MorseBuffer,
	TimerManager,
	TimingCalculator,
	AudioGenerator,
	type HorizontalKeySettings,
	type IambicMode,
	type PaddleLayout
} from 'morse-engine';

/**
 * 横振り電鍵練習ビュークラス
 */
export class HorizontalKeyView implements View {
	private trainer: HorizontalKeyTrainer;
	private buffer: MorseBuffer;
	private timer: TimerManager;
	private audio: AudioGenerator;
	private leftPressed = false;
	private rightPressed = false;
	private updateIntervalId: number | null = null;
	private currentWPM = 20;
	private iambicMode: IambicMode = 'B';
	private paddleLayout: PaddleLayout = 'normal';

	// イベントハンドラーの参照を保持
	private keyPressHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyReleaseHandler: ((e: KeyboardEvent) => void) | null = null;

	constructor() {
		//! コアコンポーネントを初期化。
		this.buffer = new MorseBuffer();
		this.timer = new TimerManager();
		this.audio = new AudioGenerator({
			frequency: 600,
			volume: 0.5,
			wpm: 20
		});

		//! トレーナーを初期化。
		this.initializeTrainer();
	}

	/**
	 * トレーナーを初期化する
	 */
	private initializeTrainer(): void {
		const timings = TimingCalculator.calculate(this.currentWPM);

		this.trainer = new HorizontalKeyTrainer(
			this.buffer,
			this.timer,
			timings,
			{
				onElementStart: () => {
					//! 要素送信開始時に音を鳴らす。
					this.audio.startContinuousTone();
				},
				onElementEnd: () => {
					//! 要素送信終了時に音を止める。
					this.audio.stopContinuousTone();
				}
			},
			{
				iambicMode: this.iambicMode,
				paddleLayout: this.paddleLayout
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
					<h1>横振り電鍵練習</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="instructions">
					<h3>使い方</h3>
					<ul>
						<li>左パドル（Z）: 短点（・）/ 右パドル（X）: 長点（ー）</li>
						<li>両方同時押しで自動交互送信（Iambic）</li>
						<li>Iambic Bモード: スクイーズ後1要素追加送信</li>
						<li>パドルレイアウトとモードは設定で変更可能</li>
					</ul>
				</div>

				<div class="paddle-container">
					<button class="paddle-button dit" id="left-paddle">
						DIT
						<span class="paddle-label">(短点)</span>
						<span class="paddle-key">Z キー</span>
					</button>
					<button class="paddle-button dah" id="right-paddle">
						DAH
						<span class="paddle-label">(長点)</span>
						<span class="paddle-key">X キー</span>
					</button>
				</div>

				<div class="practice-container">
					<div class="status-area">
						<div class="status-item">
							<span class="label">現在の速度</span>
							<span class="value" id="current-wpm">20</span>
						</div>
						<div class="status-item">
							<span class="label">Iambicモード</span>
							<span class="value" id="current-iambic-mode">B</span>
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
							<label for="iambic-mode">Iambicモード</label>
							<select id="iambic-mode">
								<option value="A">Iambic A</option>
								<option value="B" selected>Iambic B</option>
							</select>
						</div>
						<div class="setting-row">
							<label for="paddle-layout">パドルレイアウト</label>
							<select id="paddle-layout">
								<option value="normal" selected>標準（左=dit / 右=dah）</option>
								<option value="reversed">反転（左=dah / 右=dit）</option>
							</select>
						</div>
						<div class="setting-row">
							<label for="frequency-range">音声周波数 (Hz)</label>
							<input type="range" id="frequency-range" min="400" max="1200" value="600" step="50">
							<span class="value-display" id="frequency-display">600</span>
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
			this.initializeTrainer();
			if (wpmDisplay) wpmDisplay.textContent = wpm.toString();
			if (currentWpmDisplay) currentWpmDisplay.textContent = wpm.toString();
		});

		//! Iambicモード変更。
		const iambicModeSelect = document.getElementById('iambic-mode') as HTMLSelectElement;
		const currentIambicModeDisplay = document.getElementById('current-iambic-mode');
		iambicModeSelect?.addEventListener('change', () => {
			this.iambicMode = iambicModeSelect.value as IambicMode;
			this.initializeTrainer();
			if (currentIambicModeDisplay) currentIambicModeDisplay.textContent = this.iambicMode;
		});

		//! パドルレイアウト変更。
		const paddleLayoutSelect = document.getElementById('paddle-layout') as HTMLSelectElement;
		paddleLayoutSelect?.addEventListener('change', () => {
			this.paddleLayout = paddleLayoutSelect.value as PaddleLayout;
			this.initializeTrainer();
			this.updatePaddleLabels();
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

		//! キーボードイベント（Z/X キー）。
		this.keyPressHandler = (e: KeyboardEvent) => {
			if (e.repeat) return;

			if (e.code === 'KeyZ') {
				e.preventDefault();
				this.handleLeftPaddlePress();
			} else if (e.code === 'KeyX') {
				e.preventDefault();
				this.handleRightPaddlePress();
			}
		};

		this.keyReleaseHandler = (e: KeyboardEvent) => {
			if (e.code === 'KeyZ') {
				e.preventDefault();
				this.handleLeftPaddleRelease();
			} else if (e.code === 'KeyX') {
				e.preventDefault();
				this.handleRightPaddleRelease();
			}
		};

		window.addEventListener('keydown', this.keyPressHandler);
		window.addEventListener('keyup', this.keyReleaseHandler);

		//! ボタンイベント（左パドル）。
		const leftPaddle = document.getElementById('left-paddle');
		if (leftPaddle) {
			leftPaddle.addEventListener('mousedown', (e) => {
				e.preventDefault();
				this.handleLeftPaddlePress();
			});
			leftPaddle.addEventListener('mouseup', (e) => {
				e.preventDefault();
				this.handleLeftPaddleRelease();
			});
			leftPaddle.addEventListener('mouseleave', () => {
				if (this.leftPressed) this.handleLeftPaddleRelease();
			});
			leftPaddle.addEventListener('touchstart', (e) => {
				e.preventDefault();
				this.handleLeftPaddlePress();
			});
			leftPaddle.addEventListener('touchend', (e) => {
				e.preventDefault();
				this.handleLeftPaddleRelease();
			});
			leftPaddle.addEventListener('touchcancel', () => {
				if (this.leftPressed) this.handleLeftPaddleRelease();
			});
		}

		//! ボタンイベント（右パドル）。
		const rightPaddle = document.getElementById('right-paddle');
		if (rightPaddle) {
			rightPaddle.addEventListener('mousedown', (e) => {
				e.preventDefault();
				this.handleRightPaddlePress();
			});
			rightPaddle.addEventListener('mouseup', (e) => {
				e.preventDefault();
				this.handleRightPaddleRelease();
			});
			rightPaddle.addEventListener('mouseleave', () => {
				if (this.rightPressed) this.handleRightPaddleRelease();
			});
			rightPaddle.addEventListener('touchstart', (e) => {
				e.preventDefault();
				this.handleRightPaddlePress();
			});
			rightPaddle.addEventListener('touchend', (e) => {
				e.preventDefault();
				this.handleRightPaddleRelease();
			});
			rightPaddle.addEventListener('touchcancel', () => {
				if (this.rightPressed) this.handleRightPaddleRelease();
			});
		}
	}

	/**
	 * 左パドル押下処理
	 */
	private handleLeftPaddlePress(): void {
		if (this.leftPressed) return;
		this.leftPressed = true;
		this.trainer.leftPaddlePress();

		const leftPaddle = document.getElementById('left-paddle');
		if (leftPaddle) leftPaddle.classList.add('pressed');
	}

	/**
	 * 左パドル解放処理
	 */
	private handleLeftPaddleRelease(): void {
		if (!this.leftPressed) return;
		this.leftPressed = false;
		this.trainer.leftPaddleRelease();

		const leftPaddle = document.getElementById('left-paddle');
		if (leftPaddle) leftPaddle.classList.remove('pressed');
	}

	/**
	 * 右パドル押下処理
	 */
	private handleRightPaddlePress(): void {
		if (this.rightPressed) return;
		this.rightPressed = true;
		this.trainer.rightPaddlePress();

		const rightPaddle = document.getElementById('right-paddle');
		if (rightPaddle) rightPaddle.classList.add('pressed');
	}

	/**
	 * 右パドル解放処理
	 */
	private handleRightPaddleRelease(): void {
		if (!this.rightPressed) return;
		this.rightPressed = false;
		this.trainer.rightPaddleRelease();

		const rightPaddle = document.getElementById('right-paddle');
		if (rightPaddle) rightPaddle.classList.remove('pressed');
	}

	/**
	 * パドルラベルを更新する
	 */
	private updatePaddleLabels(): void {
		const leftPaddle = document.getElementById('left-paddle');
		const rightPaddle = document.getElementById('right-paddle');

		if (this.paddleLayout === 'normal') {
			if (leftPaddle) {
				leftPaddle.className = 'paddle-button dit';
				leftPaddle.innerHTML = `
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">Z キー</span>
				`;
			}
			if (rightPaddle) {
				rightPaddle.className = 'paddle-button dah';
				rightPaddle.innerHTML = `
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">X キー</span>
				`;
			}
		} else {
			if (leftPaddle) {
				leftPaddle.className = 'paddle-button dah';
				leftPaddle.innerHTML = `
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">Z キー</span>
				`;
			}
			if (rightPaddle) {
				rightPaddle.className = 'paddle-button dit';
				rightPaddle.innerHTML = `
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">X キー</span>
				`;
			}
		}

		//! イベントリスナーを再設定。
		this.attachEventListeners();
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

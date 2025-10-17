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
	type IambicMode,
	type PaddleLayout
} from 'morse-engine';
import { SettingsModal, ALL_SETTING_ITEMS, type SettingValues } from '../components/SettingsModal';

/**
 * 横振り電鍵練習ビュークラス
 */
export class HorizontalKeyView implements View {
	private trainer!: HorizontalKeyTrainer;
	private buffer: MorseBuffer;
	private timer: TimerManager;
	private audio: AudioGenerator;
	private leftPressed = false;
	private rightPressed = false;
	private updateIntervalId: number | null = null;
	private currentWPM = 20;
	private iambicMode: IambicMode = 'B';
	private paddleLayout: PaddleLayout = 'normal';
	private leftKeyCode = 'KeyJ';
	private rightKeyCode = 'KeyK';

	// イベントハンドラーの参照を保持
	private keyPressHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyReleaseHandler: ((e: KeyboardEvent) => void) | null = null;

	constructor() {
		//! 設定を読み込む。
		const savedWPM = localStorage.getItem('horizontalKeyWPM');
		if (savedWPM) {
			this.currentWPM = parseInt(savedWPM, 10);
		}

		const savedIambicMode = localStorage.getItem('horizontalKeyIambicMode');
		if (savedIambicMode === 'A' || savedIambicMode === 'B') {
			this.iambicMode = savedIambicMode;
		}

		const savedPaddleLayout = localStorage.getItem('horizontalKeyPaddleLayout');
		if (savedPaddleLayout === 'normal' || savedPaddleLayout === 'reversed') {
			this.paddleLayout = savedPaddleLayout;
		}

		const savedLeftKeyCode = localStorage.getItem('horizontalKeyLeftCode');
		if (savedLeftKeyCode) {
			this.leftKeyCode = savedLeftKeyCode;
		}

		const savedRightKeyCode = localStorage.getItem('horizontalKeyRightCode');
		if (savedRightKeyCode) {
			this.rightKeyCode = savedRightKeyCode;
		}

		//! コアコンポーネントを初期化。
		this.buffer = new MorseBuffer();
		this.timer = new TimerManager();
		this.audio = new AudioGenerator({
			frequency: 700,
			volume: 0.5,
			wpm: this.currentWPM
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
				onElementStart: (_element: '.' | '-', duration: number) => {
					//! 要素送信開始時に指定時間だけ音を鳴らす。
					// scheduleToneに0を渡すと現在時刻から再生される
					this.audio.scheduleTone(0, duration);
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
					<button class="back-btn">メニューに戻る</button>
					<h1>横振り電鍵練習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="paddle-container">
					<button class="paddle-button dit" id="left-paddle">
						DIT
						<span class="paddle-label">(短点)</span>
						<span class="paddle-key">J キー</span>
					</button>
					<button class="paddle-button dah" id="right-paddle">
						DAH
						<span class="paddle-label">(長点)</span>
						<span class="paddle-key">K キー</span>
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
						<div class="status-item">
							<span class="label">Iambicモード</span>
							<span class="value" id="current-iambic-mode">${this.iambicMode}</span>
						</div>
						<div class="status-item">
							<span class="label">入力文字数</span>
							<span class="value" id="char-count">0</span>
						</div>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>左パドル（J）: 短点（・）/ 右パドル（K）: 長点（ー）</li>
							<li>両方同時押しで自動交互送信（Iambic）</li>
							<li>Iambic Bモード: スクイーズ後1要素追加送信</li>
							<li>画面右上の⚙アイコンから設定（WPM、Iambicモード、パドルレイアウト、音量・周波数）を変更できます</li>
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
			if (e.repeat) return;

			if (e.code === this.leftKeyCode) {
				e.preventDefault();
				this.handleLeftPaddlePress();
			} else if (e.code === this.rightKeyCode) {
				e.preventDefault();
				this.handleRightPaddlePress();
			}
		};

		this.keyReleaseHandler = (e: KeyboardEvent) => {
			if (e.code === this.leftKeyCode) {
				e.preventDefault();
				this.handleLeftPaddleRelease();
			} else if (e.code === this.rightKeyCode) {
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
					<span class="paddle-key">J キー</span>
				`;
			}
			if (rightPaddle) {
				rightPaddle.className = 'paddle-button dah';
				rightPaddle.innerHTML = `
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">K キー</span>
				`;
			}
		} else {
			if (leftPaddle) {
				leftPaddle.className = 'paddle-button dah';
				leftPaddle.innerHTML = `
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">J キー</span>
				`;
			}
			if (rightPaddle) {
				rightPaddle.className = 'paddle-button dit';
				rightPaddle.innerHTML = `
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">K キー</span>
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
	 * 設定モーダルを開く
	 */
	private openSettingsModal(): void {
		//! 現在の設定値を取得。
		const currentValues: SettingValues = {
			volume: Math.round(this.audio.getVolume() * 100),
			frequency: this.audio.getFrequency(),
			wpm: this.currentWPM,
			iambicMode: this.iambicMode,
			paddleLayout: this.paddleLayout,
			leftKeyCode: this.leftKeyCode,
			rightKeyCode: this.rightKeyCode
		};

		//! 設定変更前の値を保存（キャンセル時の復元用）。
		const savedSettings = {
			volume: this.audio.getVolume(),
			frequency: this.audio.getFrequency(),
			wpm: this.currentWPM,
			iambicMode: this.iambicMode,
			paddleLayout: this.paddleLayout,
			leftKeyCode: this.leftKeyCode,
			rightKeyCode: this.rightKeyCode
		};

		//! SettingsModalを作成。
		const modal = new SettingsModal(
			'horizontal-key-settings-modal',
			ALL_SETTING_ITEMS,
			currentValues,
			{
				onSave: (values: SettingValues) => {
					//! 設定を保存。
					this.audio.setVolume((values.volume as number) / 100);
					this.audio.setFrequency(values.frequency as number);
					this.audio.setWPM(values.wpm as number);
					this.currentWPM = values.wpm as number;
					this.iambicMode = values.iambicMode as IambicMode;
					this.paddleLayout = values.paddleLayout as PaddleLayout;
					this.leftKeyCode = values.leftKeyCode as string;
					this.rightKeyCode = values.rightKeyCode as string;

					//! localStorageに保存。
					localStorage.setItem('horizontalKeyWPM', this.currentWPM.toString());
					localStorage.setItem('horizontalKeyIambicMode', this.iambicMode);
					localStorage.setItem('horizontalKeyPaddleLayout', this.paddleLayout);
					localStorage.setItem('horizontalKeyLeftCode', this.leftKeyCode);
					localStorage.setItem('horizontalKeyRightCode', this.rightKeyCode);

					//! 現在のWPM表示を更新。
					const currentWpmDisplay = document.getElementById('current-wpm');
					if (currentWpmDisplay) currentWpmDisplay.textContent = this.currentWPM.toString();

					//! 現在のIambicモード表示を更新。
					const currentIambicModeDisplay = document.getElementById('current-iambic-mode');
					if (currentIambicModeDisplay) currentIambicModeDisplay.textContent = this.iambicMode;

					//! パドルレイアウトに応じてラベルを更新。
					this.updatePaddleLabels();

					//! トレーナーを再初期化。
					this.initializeTrainer();
				},
				onCancel: () => {
					//! 設定を元に戻す。
					this.audio.setVolume(savedSettings.volume);
					this.audio.setFrequency(savedSettings.frequency);
					this.audio.setWPM(savedSettings.wpm);
					this.currentWPM = savedSettings.wpm;
					this.iambicMode = savedSettings.iambicMode;
					this.paddleLayout = savedSettings.paddleLayout;
					this.leftKeyCode = savedSettings.leftKeyCode;
					this.rightKeyCode = savedSettings.rightKeyCode;
				}
			}
		);

		//! モーダルを表示。
		modal.show('horizontal-key');
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

		//! トレーナーをクリア。
		this.trainer.clear();
	}
}

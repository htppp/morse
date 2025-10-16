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
	 * キーコードを表示用にフォーマットする (KeyJ → J)
	 */
	private formatKeyCode(keyCode: string): string {
		return keyCode.replace(/^Key/, '');
	}

	/**
	 * ビューをレンダリングする
	 */
	render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="settings-modal" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label for="volume-range">音量</label>
							<div class="setting-row">
								<input type="range" id="volume-range" min="0" max="100" value="${Math.round(this.audio.getVolume() * 100)}">
								<input type="number" id="volume-input" min="0" max="100" value="${Math.round(this.audio.getVolume() * 100)}">
								<span>%</span>
							</div>
						</div>
						<div class="setting-item">
							<label for="frequency-input">周波数 (Hz)</label>
							<input type="number" id="frequency-input" min="400" max="1200" value="${this.audio.getFrequency()}" step="50">
						</div>
						<div class="setting-item">
							<label for="wpm-input">WPM (速度: 5-40)</label>
							<input type="number" id="wpm-input" min="5" max="40" value="${this.currentWPM}">
						</div>
						<div class="setting-item">
							<label for="iambic-mode-select">Iambicモード</label>
							<select id="iambic-mode-select">
								<option value="A" ${this.iambicMode === 'A' ? 'selected' : ''}>Iambic A</option>
								<option value="B" ${this.iambicMode === 'B' ? 'selected' : ''}>Iambic B</option>
							</select>
						</div>
						<div class="setting-item">
							<label for="paddle-layout-select">パドルレイアウト</label>
							<select id="paddle-layout-select">
								<option value="normal" ${this.paddleLayout === 'normal' ? 'selected' : ''}>標準（左=dit / 右=dah）</option>
								<option value="reversed" ${this.paddleLayout === 'reversed' ? 'selected' : ''}>反転（左=dah / 右=dit）</option>
							</select>
						</div>
						<div class="setting-item">
							<label for="left-key-binding">左パドルキー</label>
							<input type="text" id="left-key-binding" value="${this.formatKeyCode(this.leftKeyCode)}" readonly placeholder="キーを押してください">
							<span class="key-hint">クリックしてキーを押す</span>
						</div>
						<div class="setting-item">
							<label for="right-key-binding">右パドルキー</label>
							<input type="text" id="right-key-binding" value="${this.formatKeyCode(this.rightKeyCode)}" readonly placeholder="キーを押してください">
							<span class="key-hint">クリックしてキーを押す</span>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancel-btn" class="btn btn-secondary">キャンセル</button>
						<button id="ok-btn" class="btn btn-primary">OK</button>
					</div>
				</div>
			</div>

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

		//! モーダルのキャンセルボタン。
		const cancelBtn = document.getElementById('cancel-btn');
		cancelBtn?.addEventListener('click', () => {
			this.closeSettingsModal(false);
		});

		//! モーダルのOKボタン。
		const okBtn = document.getElementById('ok-btn');
		okBtn?.addEventListener('click', () => {
			this.closeSettingsModal(true);
		});

		//! モーダル背景クリックで閉じる。
		const modal = document.getElementById('settings-modal');
		modal?.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.closeSettingsModal(false);
			}
		});
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
		const modal = document.getElementById('settings-modal');
		if (!modal) return;

		//! モーダルを表示。
		modal.classList.add('active');

		//! 現在の設定値をinput要素に反映。
		const volumeRange = document.getElementById('volume-range') as HTMLInputElement;
		const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
		const frequencyInput = document.getElementById('frequency-input') as HTMLInputElement;
		const wpmInput = document.getElementById('wpm-input') as HTMLInputElement;
		const iambicModeSelect = document.getElementById('iambic-mode-select') as HTMLSelectElement;
		const paddleLayoutSelect = document.getElementById('paddle-layout-select') as HTMLSelectElement;

		const volume = Math.round(this.audio.getVolume() * 100);
		if (volumeRange) volumeRange.value = volume.toString();
		if (volumeInput) volumeInput.value = volume.toString();
		if (frequencyInput) frequencyInput.value = this.audio.getFrequency().toString();
		if (wpmInput) wpmInput.value = this.currentWPM.toString();
		if (iambicModeSelect) iambicModeSelect.value = this.iambicMode;
		if (paddleLayoutSelect) paddleLayoutSelect.value = this.paddleLayout;

		//! 音量スライダーと数値入力の同期のみ（実際の音声設定は変更しない）。
		const syncVolume = () => {
			if (volumeRange && volumeInput) {
				volumeInput.value = volumeRange.value;
			}
		};
		const syncVolumeReverse = () => {
			if (volumeRange && volumeInput) {
				volumeRange.value = volumeInput.value;
			}
		};

		volumeRange?.addEventListener('input', syncVolume);
		volumeInput?.addEventListener('input', syncVolumeReverse);

		//! 左パドルキーバインド設定。
		const leftKeyBindingInput = document.getElementById('left-key-binding') as HTMLInputElement;
		if (leftKeyBindingInput) {
			leftKeyBindingInput.addEventListener('click', () => {
				leftKeyBindingInput.value = 'キーを押してください...';
				leftKeyBindingInput.classList.add('waiting-key');
			});

			leftKeyBindingInput.addEventListener('keydown', (e) => {
				e.preventDefault();
				e.stopPropagation();
				leftKeyBindingInput.value = e.code;
				leftKeyBindingInput.classList.remove('waiting-key');
			});
		}

		//! 右パドルキーバインド設定。
		const rightKeyBindingInput = document.getElementById('right-key-binding') as HTMLInputElement;
		if (rightKeyBindingInput) {
			rightKeyBindingInput.addEventListener('click', () => {
				rightKeyBindingInput.value = 'キーを押してください...';
				rightKeyBindingInput.classList.add('waiting-key');
			});

			rightKeyBindingInput.addEventListener('keydown', (e) => {
				e.preventDefault();
				e.stopPropagation();
				rightKeyBindingInput.value = e.code;
				rightKeyBindingInput.classList.remove('waiting-key');
			});
		}
	}

	/**
	 * 設定モーダルを閉じる
	 */
	private closeSettingsModal(save: boolean): void {
		const modal = document.getElementById('settings-modal');
		if (!modal) return;

		//! モーダルを非表示。
		modal.classList.remove('active');

		if (save) {
			//! 設定を適用。
			const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
			const frequencyInput = document.getElementById('frequency-input') as HTMLInputElement;
			const wpmInput = document.getElementById('wpm-input') as HTMLInputElement;
			const iambicModeSelect = document.getElementById('iambic-mode-select') as HTMLSelectElement;
			const paddleLayoutSelect = document.getElementById('paddle-layout-select') as HTMLSelectElement;
			const leftKeyBindingInput = document.getElementById('left-key-binding') as HTMLInputElement;
			const rightKeyBindingInput = document.getElementById('right-key-binding') as HTMLInputElement;

			if (volumeInput) {
				const volume = parseInt(volumeInput.value, 10) / 100;
				this.audio.setVolume(volume);
			}

			if (frequencyInput) {
				const frequency = parseInt(frequencyInput.value, 10);
				this.audio.setFrequency(frequency);
			}

			if (wpmInput) {
				const newWpm = parseInt(wpmInput.value, 10);
				this.currentWPM = newWpm;
				this.audio.setWPM(newWpm);

				//! WPMをlocalStorageに保存。
				localStorage.setItem('horizontalKeyWPM', newWpm.toString());

				//! 現在のWPM表示を更新。
				const currentWpmDisplay = document.getElementById('current-wpm');
				if (currentWpmDisplay) currentWpmDisplay.textContent = newWpm.toString();
			}

			if (iambicModeSelect) {
				this.iambicMode = iambicModeSelect.value as IambicMode;

				//! IambicモードをlocalStorageに保存。
				localStorage.setItem('horizontalKeyIambicMode', this.iambicMode);

				//! 現在のIambicモード表示を更新。
				const currentIambicModeDisplay = document.getElementById('current-iambic-mode');
				if (currentIambicModeDisplay) currentIambicModeDisplay.textContent = this.iambicMode;
			}

			if (paddleLayoutSelect) {
				this.paddleLayout = paddleLayoutSelect.value as PaddleLayout;

				//! パドルレイアウトをlocalStorageに保存。
				localStorage.setItem('horizontalKeyPaddleLayout', this.paddleLayout);

				this.updatePaddleLabels();
			}

			if (leftKeyBindingInput && leftKeyBindingInput.value) {
				this.leftKeyCode = leftKeyBindingInput.value;

				//! 左パドルキーバインドをlocalStorageに保存。
				localStorage.setItem('horizontalKeyLeftCode', this.leftKeyCode);
			}

			if (rightKeyBindingInput && rightKeyBindingInput.value) {
				this.rightKeyCode = rightKeyBindingInput.value;

				//! 右パドルキーバインドをlocalStorageに保存。
				localStorage.setItem('horizontalKeyRightCode', this.rightKeyCode);
			}

			//! トレーナーを再初期化。
			this.initializeTrainer();
		}
		//! キャンセル時は何もしない（設定を元に戻す必要もない）。
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

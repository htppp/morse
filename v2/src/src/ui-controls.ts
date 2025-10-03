//! UIコントロールとタブ管理モジュール。

import { Settings } from './settings.js';
import { AudioSystem } from './audio-system.js';
import { MorseCode } from './morse-code.js';

//! テキストログアイテムの型定義。
interface TextLogItem {
	id: number;
	text: string;
	favorite: boolean;
}

//! UIコントロールクラス。
export class UIControls {
	private static modalMouseDownInside: boolean = false;
	private static textLogArr: TextLogItem[] = [];

	//! タブ切り替え機能。
	private static initTabs(): void {
		// 保存されたタブを復元。
		const savedTab = localStorage.getItem('activeTab');
		if (savedTab) {
			this.switchToTab(savedTab);
		}

		document.querySelectorAll('.tab').forEach(tab => {
			tab.addEventListener('click', function (this: HTMLElement) {
				const targetTab = this.dataset.tab;
				if (targetTab) {
					UIControls.switchToTab(targetTab);
				}
			});
		});
	}

	//! タブ切り替え処理。
	private static switchToTab(targetTab: string): void {
		// タブのアクティブ状態を更新。
		document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
		const targetTabElement = document.querySelector(`.tab[data-tab="${targetTab}"]`);
		if (targetTabElement) {
			targetTabElement.classList.add('active');
		}

		// コンテンツの表示を切り替え。
		document.querySelectorAll('.tab-content').forEach(content => {
			content.classList.remove('active');
		});
		const targetContent = document.getElementById(targetTab + '-content');
		if (targetContent) {
			targetContent.classList.add('active');
		}

		// 横振りタブに切り替えたときにパドルレイアウトを更新。
		if (targetTab === 'paddle') {
			Settings.updatePaddleLayout();
		}

		// タブの状態を保存。
		localStorage.setItem('activeTab', targetTab);
	}

	//! 設定モーダルの初期化。
	private static initSettingsModal(): void {
		const settingsIcon = document.getElementById('settingsIcon');
		const settingsModal = document.getElementById('settingsModal');
		const settingsCancel = document.getElementById('settingsCancel');
		const settingsOK = document.getElementById('settingsOK');

		if (settingsIcon) {
			settingsIcon.addEventListener('click', () => {
				if (settingsModal) {
					// 設定画面を開くときに現在の設定を一時保存。
					Settings.saveTempSettings();
					settingsModal.classList.add('active');
				}
			});
		}

		if (settingsCancel) {
			settingsCancel.addEventListener('click', () => {
				if (settingsModal) {
					// キャンセル: 設定を復元。
					Settings.restoreTempSettings();
					settingsModal.classList.remove('active');
				}
			});
		}

		if (settingsOK) {
			settingsOK.addEventListener('click', () => {
				if (settingsModal) {
					// OK: 設定を確定して保存。
					Settings.applySettings();
					settingsModal.classList.remove('active');
				}
			});
		}

		if (settingsModal) {
			settingsModal.addEventListener('mousedown', (e) => {
				this.modalMouseDownInside = (e.target as HTMLElement).closest('.settings-content') !== null;
			});

			settingsModal.addEventListener('click', (e) => {
				if ((e.target as HTMLElement).id === 'settingsModal' && !this.modalMouseDownInside) {
					// キャンセル: 設定を復元。
					Settings.restoreTempSettings();
					settingsModal.classList.remove('active');
				}
				this.modalMouseDownInside = false;
			});
		}
	}

	//! テキスト変換機能の初期化。
	private static initTextConversion(): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
		const stopButton = document.getElementById('stopButton') as HTMLButtonElement | null;
		const clearTextButton = document.getElementById('clearTextButton') as HTMLButtonElement | null;
		const morseOutput = document.getElementById('morseOutput');

		if (textInput) {
			// テキスト入力時のモールス変換。
			textInput.addEventListener('input', (e) => {
				const text = (e.target as HTMLInputElement).value.toUpperCase();
				const morse = MorseCode.textToMorse(text);

				if (morseOutput) {
					morseOutput.textContent = morse || 'モールス信号が表示されます';
				}
			});

			// Enterキーで再生。
			textInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					const text = textInput.value.trim();
					if (text) {
						Settings.addToHistory(text);
						this.playMorseText();
					}
				}
			});
		}

		if (playButton) {
			playButton.addEventListener('click', () => {
				this.playMorseText();
			});
		}

		if (stopButton) {
			stopButton.addEventListener('click', () => {
				AudioSystem.stopPlaying();
				if (playButton) playButton.disabled = false;
				stopButton.disabled = true;
			});
		}

		if (clearTextButton) {
			clearTextButton.addEventListener('click', () => {
				this.clearTextInput();
			});
		}
	}

	//! モールス文字列の再生。
	private static async playMorseText(): Promise<void> {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
		const stopButton = document.getElementById('stopButton') as HTMLButtonElement | null;
		const morseOutput = document.getElementById('morseOutput');

		if (!textInput || !playButton || !stopButton || !morseOutput) return;

		const morse = morseOutput.textContent;
		if (!morse || morse === 'モールス信号が表示されます') return;

		// 再生開始時のボタン状態設定。
		playButton.disabled = true;
		stopButton.disabled = false;

		try {
			// 再生実行。
			await AudioSystem.playMorseString(morse);
		} catch (error) {
			console.error('再生エラー:', error);
		} finally {
			// 再生終了後は必ずボタン状態をリセット。
			playButton.disabled = false;
			stopButton.disabled = true;
		}
	}

	//! テキストログ機能の初期化。
	private static initTextLog(): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
		const textLog = document.getElementById('textLog');
		const clearTextLogBtn = document.getElementById('clearTextLog');

		// ログ初期化 - 新しいフォーマットに対応。
		const saved = localStorage.getItem('morseTextLog');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// 旧フォーマット（文字列配列）から新フォーマット（オブジェクト配列）に変換。
				if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
					this.textLogArr = parsed.map((text: string, index: number) => ({
						text,
						favorite: false,
						id: Date.now() + index
					}));
					this.saveTextLog(); // 新フォーマットで保存。
				} else if (Array.isArray(parsed)) {
					this.textLogArr = parsed;
				} else {
					this.textLogArr = [];
				}
				this.renderTextLog();
			} catch (error) {
				console.error('ログ読み込みエラー:', error);
				this.textLogArr = [];
			}
		}

		if (textInput) {
			textInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					this.acceptTextInput();
				}
			});
		}

		if (playButton) {
			playButton.addEventListener('click', () => {
				this.acceptTextInput();
			});
		}

		if (clearTextLogBtn) {
			clearTextLogBtn.addEventListener('click', () => {
				this.clearTextLog();
			});
		}
	}

	//! テキスト入力の受理。
	private static acceptTextInput(): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		if (!textInput) return;

		const val = textInput.value.trim();
		if (val) {
			this.addTextLog(val);
			this.playTextInput(val);
			textInput.value = '';
		}
	}

	//! テキストログに追加。
	private static addTextLog(str: string): void {
		const logItem: TextLogItem = {
			id: Date.now() + Math.random(),
			text: str,
			favorite: false
		};
		this.textLogArr.push(logItem);
		this.renderTextLog();
		this.saveTextLog();
	}

	//! テキストログの保存。
	private static saveTextLog(): void {
		localStorage.setItem('morseTextLog', JSON.stringify(this.textLogArr));
	}

	//! テキストログの描画。
	private static renderTextLog(): void {
		const textLog = document.getElementById('textLog');
		if (textLog) {
			textLog.innerHTML = this.textLogArr.slice().reverse().map(item => {
				const starIcon = item.favorite ? '★' : '☆';
				const starClass = item.favorite ? 'favorite-star active' : 'favorite-star';
				return `
					<li data-id="${item.id}">
						<span class="log-text">${item.text}</span>
						<button class="${starClass}" data-id="${item.id}">${starIcon}</button>
					</li>
				`;
			}).join('');

			// ログアイテムのテキスト部分にクリックイベントを追加。
			textLog.querySelectorAll('.log-text').forEach(textSpan => {
				(textSpan as HTMLElement).style.cursor = 'pointer';
				textSpan.addEventListener('click', () => {
					this.selectLogItem(textSpan.textContent || '');
				});

				// ホバー効果。
				textSpan.addEventListener('mouseenter', () => {
					if (textSpan.parentElement) {
						(textSpan.parentElement as HTMLElement).style.backgroundColor = '#d6e3ff';
					}
				});
				textSpan.addEventListener('mouseleave', () => {
					if (textSpan.parentElement) {
						(textSpan.parentElement as HTMLElement).style.backgroundColor = '';
					}
				});
			});

			// 星ボタンにクリックイベントを追加。
			textLog.querySelectorAll('.favorite-star').forEach(starBtn => {
				starBtn.addEventListener('click', (e) => {
					e.stopPropagation(); // テキストクリックイベントを防ぐ。
					const id = (starBtn as HTMLElement).dataset.id;
					if (id) {
						this.toggleFavorite(id);
					}
				});
			});
		}
	}

	//! お気に入りの切り替え。
	private static toggleFavorite(itemId: string): void {
		const item = this.textLogArr.find(item => String(item.id) === itemId);
		if (item) {
			item.favorite = !item.favorite;
			this.renderTextLog();
			this.saveTextLog();
		}
	}

	//! テキストログのクリア（お気に入りは保持）。
	private static clearTextLog(): void {
		this.textLogArr = this.textLogArr.filter(item => item.favorite);
		this.renderTextLog();
		this.saveTextLog();
	}

	//! テキスト再生。
	private static playTextInput(str: string): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		if (textInput) {
			textInput.value = str;

			// モールス信号に変換。
			const morse = MorseCode.textToMorse(str);
			const morseOutput = document.getElementById('morseOutput');
			if (morseOutput) {
				morseOutput.textContent = morse || 'モールス信号が表示されます';
			}
		}
	}

	//! ログアイテム選択時の処理。
	private static selectLogItem(text: string): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		const morseOutput = document.getElementById('morseOutput');

		if (textInput) {
			// 入力欄にテキストを設定。
			textInput.value = text;

			// モールス信号に変換して表示。
			if (morseOutput) {
				const morse = MorseCode.textToMorse(text);
				morseOutput.textContent = morse || 'モールス信号が表示されます';
			}

			// 自動的に再生を開始。
			this.playMorseText();
		}
	}

	//! テキスト入力欄のクリア。
	private static clearTextInput(): void {
		const textInput = document.getElementById('textInput') as HTMLInputElement | null;
		const morseOutput = document.getElementById('morseOutput');

		if (textInput) {
			textInput.value = '';
		}

		if (morseOutput) {
			morseOutput.textContent = 'モールス信号が表示されます';
		}

		// 再生中の場合は停止。
		AudioSystem.stopPlaying();
		const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
		const stopButton = document.getElementById('stopButton') as HTMLButtonElement | null;
		if (playButton && stopButton) {
			playButton.disabled = false;
			stopButton.disabled = true;
		}
	}

	//! 初期化。
	static init(): void {
		this.initTabs();
		this.initSettingsModal();
		this.initTextConversion();
		this.initTextLog();
	}
}

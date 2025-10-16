/**
 * 聞き取り練習ビュー
 */

import type { View } from '../../router';
import {
	ListeningTrainer,
	AudioGenerator,
	MorseCodec,
	type ListeningTemplate,
	type TemplateCategory
} from 'morse-engine';

interface ListeningSettings {
	characterSpeed: number;
	effectiveSpeed: number;
	frequency: number;
	volume: number;
}

const DEFAULT_SETTINGS: ListeningSettings = {
	characterSpeed: 20,
	effectiveSpeed: 15,
	frequency: 700,
	volume: 0.7
};

interface State {
	currentCategory: TemplateCategory | 'custom';
	selectedTemplate: ListeningTemplate | null;
	isPlaying: boolean;
	userInput: string;
	showResult: boolean;
	showAnswer: boolean;
	showDialogFormat: boolean;
}

/**
 * 聞き取り練習ビュークラス
 */
export class ListeningView implements View {
	private audio: AudioGenerator;
	private settings: ListeningSettings = { ...DEFAULT_SETTINGS };

	private state: State = {
		currentCategory: 'qso',
		selectedTemplate: null,
		isPlaying: false,
		userInput: '',
		showResult: false,
		showAnswer: false,
		showDialogFormat: false
	};

	private customTemplates: ListeningTemplate[] = [];

	constructor() {
		//! 設定を読み込む。
		this.loadSettings();
		this.loadCategory();
		this.loadCustomTemplates();

		//! AudioGeneratorを初期化。
		this.audio = new AudioGenerator({
			frequency: this.settings.frequency,
			volume: this.settings.volume,
			wpm: this.settings.characterSpeed,
			effectiveWpm: this.settings.effectiveSpeed
		});
	}

	//! ========== 設定管理 ==========

	private loadSettings(): void {
		try {
			const saved = localStorage.getItem('v10.listening.settings');
			if (saved) {
				this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	}

	private saveSettings(): void {
		try {
			localStorage.setItem('v10.listening.settings', JSON.stringify(this.settings));
		} catch (error) {
			console.error('Failed to save settings:', error);
		}
	}

	private loadCategory(): void {
		try {
			const saved = localStorage.getItem('v10.listening.category') as TemplateCategory | 'custom' | null;
			if (saved && ['qso', 'text100', 'text200', 'text300', 'custom'].includes(saved)) {
				this.state.currentCategory = saved;
			}
		} catch (error) {
			console.error('Failed to load category:', error);
		}
	}

	private saveCategory(): void {
		try {
			localStorage.setItem('v10.listening.category', this.state.currentCategory);
		} catch (error) {
			console.error('Failed to save category:', error);
		}
	}

	private loadCustomTemplates(): void {
		try {
			const saved = localStorage.getItem('v10.listening.customTemplates');
			if (saved) {
				this.customTemplates = JSON.parse(saved);
			}
		} catch (error) {
			console.error('Failed to load custom templates:', error);
		}
	}

	private saveCustomTemplates(): void {
		try {
			localStorage.setItem('v10.listening.customTemplates', JSON.stringify(this.customTemplates));
		} catch (error) {
			console.error('Failed to save custom templates:', error);
		}
	}

	//! ========== テンプレート管理 ==========

	private getTemplates(): ListeningTemplate[] {
		if (this.state.currentCategory === 'custom') {
			//! ランダムQSO生成ボタンを追加。
			const randomButton: ListeningTemplate = {
				id: 'qso-random-generate',
				category: 'qso',
				title: 'ランダムQSO生成',
				content: ''
			};
			return [randomButton, ...this.customTemplates];
		} else {
			const builtin = ListeningTrainer.getBuiltinTemplates(this.state.currentCategory);
			//! QSOカテゴリーにはランダムQSO生成ボタンを追加。
			if (this.state.currentCategory === 'qso') {
				const randomButton: ListeningTemplate = {
					id: 'qso-random-generate',
					category: 'qso',
					title: 'ランダムQSO生成',
					content: ''
				};
				return [randomButton, ...builtin];
			}
			return builtin;
		}
	}

	//! ========== 再生制御 ==========

	private async playMorse(): Promise<void> {
		if (!this.state.selectedTemplate || this.state.isPlaying) return;

		this.state.isPlaying = true;
		this.updatePlaybackButtons();

		//! モールス信号を再生。
		const morse = MorseCodec.textToMorse(this.state.selectedTemplate.content);
		await this.audio.playMorseString(morse);

		this.state.isPlaying = false;
		this.updatePlaybackButtons();
	}

	private pauseMorse(): void {
		this.audio.stopPlaying();
		this.state.isPlaying = false;
		this.updatePlaybackButtons();
	}

	private stopMorse(): void {
		this.audio.stopPlaying();
		this.state.isPlaying = false;
		this.state.userInput = '';
		this.state.showResult = false;
		this.state.showAnswer = false;
		this.renderPracticeArea();
	}


	private updatePlaybackButtons(): void {
		const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
		const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;

		if (playBtn) playBtn.disabled = this.state.isPlaying;
		if (pauseBtn) pauseBtn.disabled = !this.state.isPlaying;
	}

	//! ========== 採点と結果表示 ==========

	private checkAnswer(): void {
		if (!this.state.selectedTemplate) return;

		this.state.showResult = true;
		this.state.showAnswer = true;
		this.renderPracticeArea();
	}

	private toggleAnswer(): void {
		this.state.showAnswer = !this.state.showAnswer;
		this.renderPracticeArea();
	}

	private toggleDialogFormat(): void {
		this.state.showDialogFormat = !this.state.showDialogFormat;
		this.renderAnswer();
	}

	//! ========== カスタムテンプレート管理 ==========

	private showCustomTemplateDialog(template?: ListeningTemplate): void {
		const isEdit = !!template;
		const title = isEdit ? template.title : '';
		const content = isEdit ? template.content : '';

		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal">
				<h2>${isEdit ? 'テンプレート編集' : 'テンプレート新規作成'}</h2>
				<div class="form-group">
					<label for="templateTitle">タイトル:</label>
					<input type="text" id="templateTitle" value="${title}" placeholder="タイトルを入力">
				</div>
				<div class="form-group">
					<label for="templateContent">内容:</label>
					<textarea id="templateContent" placeholder="モールス信号に変換するテキストを入力">${content}</textarea>
				</div>
				<div class="modal-actions">
					<button id="saveTemplateBtn" class="btn btn-primary">保存</button>
					<button id="cancelTemplateBtn" class="btn">キャンセル</button>
				</div>
			</div>
		`;
		document.body.appendChild(modal);

		//! 保存ボタン。
		document.getElementById('saveTemplateBtn')?.addEventListener('click', () => {
			const titleInput = document.getElementById('templateTitle') as HTMLInputElement;
			const contentInput = document.getElementById('templateContent') as HTMLTextAreaElement;

			if (!titleInput.value.trim() || !contentInput.value.trim()) {
				alert('タイトルと内容を入力してください');
				return;
			}

			if (isEdit && template) {
				//! 既存テンプレートを更新。
				template.title = titleInput.value.trim();
				template.content = contentInput.value.trim().toUpperCase();
			} else {
				//! 新規テンプレートを追加。
				const newTemplate: ListeningTemplate = {
					id: `custom-${Date.now()}`,
					category: 'qso',
					title: titleInput.value.trim(),
					content: contentInput.value.trim().toUpperCase()
				};
				this.customTemplates.push(newTemplate);
			}

			this.saveCustomTemplates();
			modal.remove();
			this.render();
		});

		//! キャンセルボタン。
		document.getElementById('cancelTemplateBtn')?.addEventListener('click', () => {
			modal.remove();
		});

		//! モーダル外クリックで閉じる。
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}

	private deleteCustomTemplate(id: string): void {
		if (confirm('この定型文を削除しますか?')) {
			this.customTemplates = this.customTemplates.filter(t => t.id !== id);
			this.saveCustomTemplates();
			this.render();
		}
	}

	//! ========== 設定モーダル ==========

	private showSettings(): void {
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal settings-modal">
				<h2>設定</h2>
				<div class="settings-content">
					<div class="setting-group">
						<label>
							<span>文字速度 (WPM):</span>
							<div class="input-with-value">
								<input type="range" id="characterSpeed" min="5" max="50" step="1" value="${this.settings.characterSpeed}">
								<span id="characterSpeedValue">${this.settings.characterSpeed}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>実効速度 (WPM):</span>
							<div class="input-with-value">
								<input type="range" id="effectiveSpeed" min="5" max="50" step="1" value="${this.settings.effectiveSpeed}">
								<span id="effectiveSpeedValue">${this.settings.effectiveSpeed}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>周波数 (Hz):</span>
							<div class="input-with-value">
								<input type="range" id="frequency" min="400" max="1200" step="50" value="${this.settings.frequency}">
								<span id="frequencyValue">${this.settings.frequency}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>音量:</span>
							<div class="input-with-value">
								<input type="range" id="volume" min="0" max="1" step="0.1" value="${this.settings.volume}">
								<span id="volumeValue">${Math.round(this.settings.volume * 100)}%</span>
							</div>
						</label>
					</div>
				</div>
				<div class="modal-actions">
					<button id="save-btn" class="btn btn-primary">保存</button>
					<button id="cancel-btn" class="btn">キャンセル</button>
				</div>
			</div>
		`;
		document.body.appendChild(modal);

		//! スライダーの値変更を監視。
		const characterSpeed = document.getElementById('characterSpeed') as HTMLInputElement;
		const effectiveSpeed = document.getElementById('effectiveSpeed') as HTMLInputElement;
		const frequency = document.getElementById('frequency') as HTMLInputElement;
		const volume = document.getElementById('volume') as HTMLInputElement;

		characterSpeed?.addEventListener('input', () => {
			document.getElementById('characterSpeedValue')!.textContent = characterSpeed.value;
		});

		effectiveSpeed?.addEventListener('input', () => {
			document.getElementById('effectiveSpeedValue')!.textContent = effectiveSpeed.value;
		});

		frequency?.addEventListener('input', () => {
			document.getElementById('frequencyValue')!.textContent = frequency.value;
		});

		volume?.addEventListener('input', () => {
			document.getElementById('volumeValue')!.textContent = `${Math.round(parseFloat(volume.value) * 100)}%`;
		});

		//! 設定の一時保存（キャンセル用）。
		const restoreSettings = () => {
			this.loadSettings();
		};

		//! 保存ボタン。
		document.getElementById('save-btn')?.addEventListener('click', () => {
			this.settings.characterSpeed = parseInt(characterSpeed.value);
			this.settings.effectiveSpeed = parseInt(effectiveSpeed.value);
			this.settings.frequency = parseInt(frequency.value);
			this.settings.volume = parseFloat(volume.value);

			this.saveSettings();

			//! AudioGeneratorを更新。
			this.audio.updateSettings({
				frequency: this.settings.frequency,
				volume: this.settings.volume,
				wpm: this.settings.characterSpeed,
				effectiveWpm: this.settings.effectiveSpeed
			});

			modal.remove();
		});

		//! キャンセル。
		document.getElementById('cancel-btn')?.addEventListener('click', () => {
			restoreSettings();
			modal.remove();
		});

		//! モーダル外クリックで閉じる（キャンセル扱い）。
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				restoreSettings();
				modal.remove();
			}
		});
	}

	//! ========== レンダリング ==========

	render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="settings-icon" id="settingsIcon">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
				</svg>
			</div>

			<div class="flashcard-container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>モールス信号聞き取り練習</h1>
				</header>

				<div class="tabs">
					${this.renderCategoryTabs()}
				</div>

				<div class="content-area">
					${this.state.selectedTemplate ? this.renderPracticeContent() : this.renderTemplateList()}
				</div>
			</div>
		`;

		this.attachEventListeners();
	}

	private renderCategoryTabs(): string {
		const categories: { id: TemplateCategory | 'custom'; label: string }[] = [
			{ id: 'qso', label: 'ラバースタンプQSO' },
			{ id: 'text100', label: '英文100字' },
			{ id: 'text200', label: '英文200字' },
			{ id: 'text300', label: '英文300字' },
			{ id: 'custom', label: 'ユーザー定義' }
		];

		return categories
			.map(
				cat => `
			<button class="tab-button ${this.state.currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
				${cat.label}
			</button>
		`
			)
			.join('');
	}

	private renderTemplateList(): string {
		const templates = this.getTemplates();

		if (templates.length === 0 || (templates.length === 1 && templates[0].id === 'qso-random-generate')) {
			return `
				<div class="empty-state">
					<p>定型文がありません</p>
					${this.state.currentCategory === 'custom' ? '<button id="addCustomBtn" class="btn btn-primary">新規作成</button>' : ''}
				</div>
			`;
		}

		return `
			<div class="template-list">
				${this.state.currentCategory === 'custom' ? '<button id="addCustomBtn" class="btn btn-primary">新規作成</button>' : ''}
				${templates
					.map(template => {
						const preview = template.id === 'qso-random-generate'
							? 'コールサイン、地名、名前、RSレポート、リグなどがランダムに生成された完全なQSOが作成されます。毎回異なる内容で練習できます。'
							: `${template.content.substring(0, 100)}${template.content.length > 100 ? '...' : ''}`;
						return `
					<div class="template-card" data-template-id="${template.id}">
						<h3>${template.title}</h3>
						<p class="template-preview">${preview}</p>
						<div class="template-actions">
							<button class="btn select-btn" data-template-id="${template.id}">選択</button>
							${
								this.state.currentCategory === 'custom' && template.id !== 'qso-random-generate'
									? `
								<button class="btn edit-btn" data-template-id="${template.id}">編集</button>
								<button class="btn delete-btn" data-template-id="${template.id}">削除</button>
							`
									: ''
							}
						</div>
					</div>
				`;
					})
					.join('')}
			</div>
		`;
	}

	private renderPracticeContent(): string {
		if (!this.state.selectedTemplate) return '';

		return `
			<div class="practice-area">
				<div class="practice-header">
					<h2>${this.state.selectedTemplate.title}</h2>
					<button id="backToListBtn" class="btn">一覧に戻る</button>
				</div>

				<div class="playback-controls">
					<button id="playBtn" class="control-btn" title="再生" ${this.state.isPlaying ? 'disabled' : ''}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					</button>
					<button id="pauseBtn" class="control-btn" title="一時停止" ${!this.state.isPlaying ? 'disabled' : ''}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
						</svg>
					</button>
					<button id="stopBtn" class="control-btn" title="停止">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12"/>
						</svg>
					</button>
				</div>

				<div id="practiceInputArea"></div>
			</div>
		`;
	}

	private renderPracticeArea(): void {
		const practiceInputArea = document.getElementById('practiceInputArea');
		if (!practiceInputArea) return;

		practiceInputArea.innerHTML = `
			<div class="input-section">
				<label for="userInput">聞き取った内容を入力してください:</label>
				<textarea id="userInput" class="input-area" placeholder="聞き取った文字を入力...">${this.state.userInput}</textarea>
			</div>

			<div class="action-buttons">
				<button id="checkBtn" class="btn btn-primary">採点</button>
				<button id="showAnswerBtn" class="btn">${this.state.showAnswer ? '正解を非表示' : '正解を表示'}</button>
			</div>

			${this.state.showAnswer ? '<div id="answerArea"></div>' : ''}
			${this.state.showResult ? '<div id="resultArea"></div>' : ''}
		`;

		//! ユーザー入力の監視。
		const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
		userInput?.addEventListener('input', () => {
			this.state.userInput = userInput.value;
		});

		//! 採点ボタン。
		document.getElementById('checkBtn')?.addEventListener('click', () => {
			this.checkAnswer();
		});

		//! 正解表示ボタン。
		document.getElementById('showAnswerBtn')?.addEventListener('click', () => {
			this.toggleAnswer();
		});

		//! 正解と結果を描画。
		if (this.state.showAnswer) {
			this.renderAnswer();
		}
		if (this.state.showResult) {
			this.renderResult();
		}
	}

	private renderAnswer(): void {
		const answerArea = document.getElementById('answerArea');
		if (!answerArea || !this.state.selectedTemplate) return;

		const isQSO = this.state.selectedTemplate.category === 'qso';
		const content = this.state.selectedTemplate.content;

		//! 対話形式ボタン（QSOの場合のみ表示）。
		const dialogButton = isQSO
			? `<button id="toggleDialogBtn" class="btn" style="margin-left: 10px;">${this.state.showDialogFormat ? '通常表示' : '対話形式で表示'}</button>`
			: '';

		//! 対話形式表示の生成。
		let answerContent = '';
		if (isQSO && this.state.showDialogFormat) {
			//! BTで区切って話者別に表示。
			const segments = content.split(/\s+BT\s+/);
			answerContent = `
				<table class="dialog-table">
					<tbody>
						${segments.map((segment, index) => {
							const speaker = index % 2 === 0 ? 'A' : 'B';
							return `
								<tr>
									<td class="speaker-cell">${speaker}</td>
									<td class="content-cell">${segment.trim()}</td>
								</tr>
							`;
						}).join('')}
					</tbody>
				</table>
			`;
		} else {
			answerContent = `<div class="answer-text">${content}</div>`;
		}

		answerArea.innerHTML = `
			<div class="answer-area">
				<h3 style="display: inline-block;">正解</h3>
				${dialogButton}
				${answerContent}
			</div>
		`;

		//! 対話形式ボタン。
		document.getElementById('toggleDialogBtn')?.addEventListener('click', () => {
			this.toggleDialogFormat();
		});
	}

	private renderResult(): void {
		const resultArea = document.getElementById('resultArea');
		if (!resultArea || !this.state.selectedTemplate) return;

		const accuracy = ListeningTrainer.calculateAccuracy(
			this.state.selectedTemplate.content,
			this.state.userInput
		);

		resultArea.innerHTML = `
			<div class="result-area">
				<h3>結果</h3>
				<div class="accuracy">正答率: ${accuracy}%</div>
				<div class="comparison">
					<div class="comparison-row">
						<strong>正解:</strong>
						<div class="comparison-text">${this.state.selectedTemplate.content}</div>
					</div>
					<div class="comparison-row">
						<strong>入力:</strong>
						<div class="comparison-text">${this.state.userInput || '（未入力）'}</div>
					</div>
				</div>
			</div>
		`;
	}

	//! ========== イベントリスナー ==========

	private attachEventListeners(): void {
		//! 戻るボタン。
		document.getElementById('backBtn')?.addEventListener('click', () => {
			window.location.hash = '#menu';
		});

		//! 設定アイコン。
		document.getElementById('settingsIcon')?.addEventListener('click', () => {
			this.showSettings();
		});

		//! カテゴリータブ。
		document.querySelectorAll('.tab-button').forEach(btn => {
			btn.addEventListener('click', () => {
				const category = btn.getAttribute('data-category') as TemplateCategory | 'custom';
				if (category) {
					this.state.currentCategory = category;
					this.state.selectedTemplate = null;
					this.state.showResult = false;
					this.state.showAnswer = false;
					this.state.showDialogFormat = false;
					this.state.userInput = '';
					this.saveCategory();
					this.render();
				}
			});
		});

		//! 定型文選択ボタン。
		document.querySelectorAll('.select-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const id = btn.getAttribute('data-template-id');
				if (id) {
					//! ランダムQSO生成ボタンの場合。
					if (id === 'qso-random-generate') {
						this.state.selectedTemplate = ListeningTrainer.generateRandomQSO();
						this.state.showResult = false;
						this.state.showAnswer = false;
						this.state.showDialogFormat = false;
						this.state.userInput = '';
						this.render();
						this.renderPracticeArea();
					} else {
						//! 通常のテンプレート選択。
						const allTemplates = [...ListeningTrainer.getBuiltinTemplates(), ...this.customTemplates];
						const template = allTemplates.find(t => t.id === id);
						if (template) {
							this.state.selectedTemplate = template;
							this.state.showResult = false;
							this.state.showAnswer = false;
							this.state.showDialogFormat = false;
							this.state.userInput = '';
							this.render();
							this.renderPracticeArea();
						}
					}
				}
			});
		});

		//! 一覧に戻るボタン。
		document.getElementById('backToListBtn')?.addEventListener('click', () => {
			this.state.selectedTemplate = null;
			this.state.showResult = false;
			this.state.showAnswer = false;
			this.state.showDialogFormat = false;
			this.state.userInput = '';
			this.audio.stopPlaying();
			this.render();
		});

		//! ユーザー定義定型文の新規作成ボタン。
		document.getElementById('addCustomBtn')?.addEventListener('click', () => {
			this.showCustomTemplateDialog();
		});

		//! ユーザー定義定型文の編集ボタン。
		document.querySelectorAll('.edit-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const id = btn.getAttribute('data-template-id');
				if (id) {
					const template = this.customTemplates.find(t => t.id === id);
					if (template) {
						this.showCustomTemplateDialog(template);
					}
				}
			});
		});

		//! ユーザー定義定型文の削除ボタン。
		document.querySelectorAll('.delete-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const id = btn.getAttribute('data-template-id');
				if (id) {
					this.deleteCustomTemplate(id);
				}
			});
		});

		//! 再生コントロール（練習画面のみ）。
		if (this.state.selectedTemplate) {
			document.getElementById('playBtn')?.addEventListener('click', () => {
				this.playMorse();
			});

			document.getElementById('pauseBtn')?.addEventListener('click', () => {
				this.pauseMorse();
			});

			document.getElementById('stopBtn')?.addEventListener('click', () => {
				this.stopMorse();
			});

			this.renderPracticeArea();
		}
	}

	destroy(): void {
		//! AudioGeneratorを停止。
		this.audio.stopPlaying();
	}
}

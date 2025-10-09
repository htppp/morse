/**
 * モールス信号聞き取り練習ページ
 */

import { AudioSystem } from '../../core/audio-system';
import { MorseCode } from '../../core/morse-code';
import { ModeController } from '../../core/router';
import {
	Template,
	getTemplatesByCategory,
	addCustomTemplate,
	updateCustomTemplate,
	deleteCustomTemplate,
	getTemplateById
} from './templates';
import './style.css';

type CategoryType = 'qso' | 'text100' | 'text200' | 'text300' | 'custom';

interface State {
	currentCategory: CategoryType;
	selectedTemplate: Template | null;
	isPlaying: boolean;
	userInput: string;
	showResult: boolean;
}

export class ListeningTrainer implements ModeController {
	private audioSystem: AudioSystem;
	private state: State = {
		currentCategory: 'qso',
		selectedTemplate: null,
		isPlaying: false,
		userInput: '',
		showResult: false
	};

	constructor() {
		//! AudioSystemを初期化。
		this.audioSystem = new AudioSystem({
			frequency: 600,
			volume: 0.5,
			wpm: 20
		});
		this.render();
	}

	/**
	 * 画面を描画する関数。
	 */
	private render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>モールス信号聞き取り練習</h1>
				</header>

				<div class="category-tabs">
					${this.renderCategoryTabs()}
				</div>

				<div class="content-area">
					${this.state.selectedTemplate ? this.renderPracticeArea() : this.renderTemplateList()}
				</div>
			</div>
		`;

		this.attachEventListeners();
	}

	/**
	 * カテゴリータブを描画する関数。
	 */
	private renderCategoryTabs(): string {
		const categories: { id: CategoryType; label: string }[] = [
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

	/**
	 * 定型文リストを描画する関数。
	 */
	private renderTemplateList(): string {
		const templates = getTemplatesByCategory(this.state.currentCategory);

		if (templates.length === 0) {
			return `
				<div class="empty-state">
					<p>定型文がありません</p>
					${this.state.currentCategory === 'custom' ? '<button id="addCustomBtn" class="btn primary">新規作成</button>' : ''}
				</div>
			`;
		}

		return `
			<div class="template-list">
				${this.state.currentCategory === 'custom' ? '<button id="addCustomBtn" class="btn primary">新規作成</button>' : ''}
				${templates
					.map(
						template => `
					<div class="template-card" data-template-id="${template.id}">
						<h3>${template.title}</h3>
						<p class="template-preview">${template.content.substring(0, 100)}${template.content.length > 100 ? '...' : ''}</p>
						<div class="template-actions">
							<button class="btn select-btn" data-template-id="${template.id}">選択</button>
							${
								this.state.currentCategory === 'custom'
									? `
								<button class="btn edit-btn" data-template-id="${template.id}">編集</button>
								<button class="btn delete-btn" data-template-id="${template.id}">削除</button>
							`
									: ''
							}
						</div>
					</div>
				`
					)
					.join('')}
			</div>
		`;
	}

	/**
	 * 練習エリアを描画する関数。
	 */
	private renderPracticeArea(): string {
		if (!this.state.selectedTemplate) return '';

		return `
			<div class="practice-area">
				<div class="practice-header">
					<h2>${this.state.selectedTemplate.title}</h2>
					<button id="backToListBtn" class="btn">一覧に戻る</button>
				</div>

				<div class="playback-controls">
					<button id="playBtn" class="control-btn ${this.state.isPlaying ? 'hidden' : ''}" title="再生">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					</button>
					<button id="pauseBtn" class="control-btn ${!this.state.isPlaying ? 'hidden' : ''}" title="一時停止">
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

				<div class="input-section">
					<label for="userInput">聞き取った内容を入力してください:</label>
					<textarea id="userInput" class="input-area" placeholder="聞き取った文字を入力...">${this.state.userInput}</textarea>
				</div>

				<div class="action-buttons">
					<button id="checkBtn" class="btn primary">採点</button>
					<button id="showAnswerBtn" class="btn">正解を表示</button>
				</div>

				${this.state.showResult ? this.renderResult() : ''}
			</div>
		`;
	}

	/**
	 * 結果を描画する関数。
	 */
	private renderResult(): string {
		if (!this.state.selectedTemplate) return '';

		const correct = this.state.selectedTemplate.content.toUpperCase().replace(/\s+/g, '');
		const input = this.state.userInput.toUpperCase().replace(/\s+/g, '');

		let matches = 0;
		const maxLen = Math.max(correct.length, input.length);
		for (let i = 0; i < maxLen; i++) {
			if (correct[i] === input[i]) matches++;
		}
		const accuracy = maxLen > 0 ? Math.round((matches / maxLen) * 100) : 0;

		return `
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

	/**
	 * イベントリスナーを設定する関数。
	 */
	private attachEventListeners(): void {
		//! 戻るボタン。
		document.getElementById('backBtn')?.addEventListener('click', () => {
			window.location.href = './index.html';
		});

		//! カテゴリータブ。
		document.querySelectorAll('.tab-button').forEach(btn => {
			btn.addEventListener('click', () => {
				const category = btn.getAttribute('data-category') as CategoryType;
				if (category) {
					this.state.currentCategory = category;
					this.state.selectedTemplate = null;
					this.state.showResult = false;
					this.state.userInput = '';
					this.render();
				}
			});
		});

		//! 定型文選択ボタン。
		document.querySelectorAll('.select-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const id = btn.getAttribute('data-template-id');
				if (id) {
					const template = getTemplateById(id);
					if (template) {
						this.state.selectedTemplate = template;
						this.state.showResult = false;
						this.state.userInput = '';
						this.render();
					}
				}
			});
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
					const template = getTemplateById(id);
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
				if (id && confirm('この定型文を削除しますか?')) {
					deleteCustomTemplate(id);
					this.render();
				}
			});
		});

		//! 一覧に戻るボタン。
		document.getElementById('backToListBtn')?.addEventListener('click', () => {
			this.state.selectedTemplate = null;
			this.state.showResult = false;
			this.state.userInput = '';
			this.audioSystem.stopPlaying();
			this.render();
		});

		//! 再生ボタン。
		document.getElementById('playBtn')?.addEventListener('click', () => {
			this.playMorse();
		});

		//! 一時停止ボタン。
		document.getElementById('pauseBtn')?.addEventListener('click', () => {
			this.pauseMorse();
		});

		//! 停止ボタン。
		document.getElementById('stopBtn')?.addEventListener('click', () => {
			this.stopMorse();
		});

		//! 入力欄。
		const inputEl = document.getElementById('userInput') as HTMLTextAreaElement;
		if (inputEl) {
			inputEl.addEventListener('input', e => {
				this.state.userInput = (e.target as HTMLTextAreaElement).value;
			});
		}

		//! 採点ボタン。
		document.getElementById('checkBtn')?.addEventListener('click', () => {
			this.state.showResult = true;
			this.render();
		});

		//! 正解表示ボタン。
		document.getElementById('showAnswerBtn')?.addEventListener('click', () => {
			if (this.state.selectedTemplate) {
				alert(`正解:\n${this.state.selectedTemplate.content}`);
			}
		});
	}

	/**
	 * モールス信号を再生する関数。
	 */
	private async playMorse(): Promise<void> {
		if (!this.state.selectedTemplate || this.state.isPlaying) return;

		this.state.isPlaying = true;
		this.render();

		const morse = MorseCode.textToMorse(this.state.selectedTemplate.content);
		await this.audioSystem.playMorseString(morse);

		this.state.isPlaying = false;
		this.render();
	}

	/**
	 * モールス信号を一時停止する関数。
	 */
	private pauseMorse(): void {
		this.state.isPlaying = false;
		this.audioSystem.stopPlaying();
		this.render();
	}

	/**
	 * モールス信号を停止する関数。
	 */
	private stopMorse(): void {
		this.state.isPlaying = false;
		this.audioSystem.stopPlaying();
		this.state.userInput = '';
		this.state.showResult = false;
		this.render();
	}

	/**
	 * ユーザー定義定型文のダイアログを表示する関数。
	 */
	private showCustomTemplateDialog(template?: Template): void {
		const isEdit = !!template;
		const modal = document.createElement('div');
		modal.className = 'modal';
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h2>${isEdit ? '定型文を編集' : '新しい定型文を作成'}</h2>
					<button id="closeDialog" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="templateTitle">タイトル:</label>
						<input type="text" id="templateTitle" class="form-input" value="${template?.title || ''}" placeholder="例: 私のQSO">
					</div>
					<div class="form-group">
						<label for="templateContent">内容:</label>
						<textarea id="templateContent" class="form-textarea" placeholder="モールス信号で送信する文章を入力してください">${template?.content || ''}</textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button id="cancelDialog" class="btn">キャンセル</button>
					<button id="saveDialog" class="btn primary">${isEdit ? '更新' : '作成'}</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		//! 保存ボタン。
		document.getElementById('saveDialog')?.addEventListener('click', () => {
			const titleEl = document.getElementById('templateTitle') as HTMLInputElement;
			const contentEl = document.getElementById('templateContent') as HTMLTextAreaElement;

			if (titleEl && contentEl) {
				const title = titleEl.value.trim();
				const content = contentEl.value.trim();

				if (!title || !content) {
					alert('タイトルと内容を入力してください');
					return;
				}

				if (isEdit && template) {
					updateCustomTemplate(template.id, title, content);
				} else {
					addCustomTemplate(title, content);
				}

				modal.remove();
				this.render();
			}
		});

		//! キャンセルボタン。
		document.getElementById('cancelDialog')?.addEventListener('click', () => {
			modal.remove();
		});

		//! 閉じるボタン。
		document.getElementById('closeDialog')?.addEventListener('click', () => {
			modal.remove();
		});

		//! モーダル外クリックで閉じる。
		modal.addEventListener('click', e => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}

	/**
	 * クリーンアップ処理
	 */
	destroy(): void {
		this.audioSystem.stopContinuousTone();
	}
}

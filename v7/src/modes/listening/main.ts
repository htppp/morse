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
import { ListeningSettings } from './settings';
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
		//! 設定を読み込み。
		ListeningSettings.load();
		const settings = ListeningSettings.getAll();

		//! AudioSystemを初期化。
		this.audioSystem = new AudioSystem({
			frequency: settings.frequency,
			volume: settings.volume,
			wpm: settings.characterSpeed,
			effectiveWpm: settings.effectiveSpeed
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
			<div class="settings-icon" id="settingsIcon">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
				</svg>
			</div>

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
					<button id="downloadBtn" class="control-btn" title="WAVファイルとしてダウンロード">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
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
			if (this.state.selectedTemplate) {
				//! 練習画面から一覧画面に戻る。
				this.state.selectedTemplate = null;
				this.state.showResult = false;
				this.state.userInput = '';
				this.audioSystem.stopPlaying();
				this.render();
			} else {
				//! 一覧画面からメニュー画面に戻る。
				window.location.href = './index.html';
			}
		});

		//! 設定アイコン。
		document.getElementById('settingsIcon')?.addEventListener('click', () => {
			this.showSettings();
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

		//! ダウンロードボタン。
		document.getElementById('downloadBtn')?.addEventListener('click', () => {
			this.downloadMorseAudio();
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
	 * 設定画面を表示する関数。
	 */
	private showSettings(): void {
		//! 現在の設定を保存（キャンセル時の復元用）。
		const savedSettings = { ...ListeningSettings.getAll() };

		const settings = ListeningSettings.getAll();
		const modal = document.createElement('div');
		modal.className = 'modal';
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h2>設定</h2>
					<button id="closeSettings" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<div class="setting-item">
						<label>文字速度 (Character Speed) WPM:</label>
						<input type="number" id="characterSpeed" min="5" max="40" step="1" value="${settings.characterSpeed}">
					</div>

					<div class="setting-item">
						<label>実効速度 (Effective Speed) WPM:</label>
						<input type="number" id="effectiveSpeed" min="5" max="40" step="1" value="${settings.effectiveSpeed}">
					</div>

					<div class="setting-item">
						<label>周波数 (Hz):</label>
						<input type="number" id="frequency" min="400" max="1000" step="10" value="${settings.frequency}">
					</div>

					<div class="setting-item">
						<label>音量 (%):</label>
						<div class="volume-control">
							<input type="range" id="volumeRange" min="0" max="100" step="5" value="${settings.volume * 100}">
							<input type="number" id="volumeInput" min="0" max="100" step="5" value="${Math.round(settings.volume * 100)}">
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button id="cancelSettings" class="btn">キャンセル</button>
					<button id="saveSettings" class="btn primary">OK</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		//! 音量のレンジと入力欄を連携。
		const volumeRange = document.getElementById('volumeRange') as HTMLInputElement;
		const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;

		if (volumeRange && volumeInput) {
			volumeRange.oninput = e => {
				const value = (e.target as HTMLInputElement).value;
				volumeInput.value = value;
			};
			volumeInput.oninput = e => {
				const value = (e.target as HTMLInputElement).value;
				volumeRange.value = value;
			};
		}

		//! 設定を復元する関数。
		const restoreSettings = () => {
			ListeningSettings.set('characterSpeed', savedSettings.characterSpeed);
			ListeningSettings.set('effectiveSpeed', savedSettings.effectiveSpeed);
			ListeningSettings.set('frequency', savedSettings.frequency);
			ListeningSettings.set('volume', savedSettings.volume);

			//! AudioSystemを元に戻す。
			this.audioSystem.updateSettings({
				frequency: savedSettings.frequency,
				volume: savedSettings.volume,
				wpm: savedSettings.characterSpeed,
				effectiveWpm: savedSettings.effectiveSpeed
			});
		};

		//! OK（保存）ボタン。
		document.getElementById('saveSettings')?.addEventListener('click', () => {
			const charSpeed = document.getElementById('characterSpeed') as HTMLInputElement;
			const effSpeed = document.getElementById('effectiveSpeed') as HTMLInputElement;
			const frequency = document.getElementById('frequency') as HTMLInputElement;

			const charSpeedValue = parseInt(charSpeed.value);
			let effSpeedValue = parseInt(effSpeed.value);

			//! 実効速度は文字速度を上限とする。
			if (effSpeedValue > charSpeedValue) {
				effSpeedValue = charSpeedValue;
				effSpeed.value = charSpeedValue.toString();
			}

			ListeningSettings.set('characterSpeed', charSpeedValue);
			ListeningSettings.set('effectiveSpeed', effSpeedValue);
			ListeningSettings.set('frequency', parseInt(frequency.value));
			ListeningSettings.set('volume', parseInt(volumeInput.value) / 100);

			//! AudioSystemを更新。
			this.audioSystem.updateSettings({
				frequency: ListeningSettings.get('frequency'),
				volume: ListeningSettings.get('volume'),
				wpm: ListeningSettings.get('characterSpeed'),
				effectiveWpm: ListeningSettings.get('effectiveSpeed')
			});

			modal.remove();
		});

		//! キャンセルボタン。
		document.getElementById('cancelSettings')?.addEventListener('click', () => {
			restoreSettings();
			modal.remove();
		});

		//! ×ボタンで閉じる（キャンセル扱い）。
		document.getElementById('closeSettings')?.addEventListener('click', () => {
			restoreSettings();
			modal.remove();
		});

		//! モーダル外クリックで閉じる（キャンセル扱い）。
		modal.addEventListener('click', e => {
			if (e.target === modal) {
				restoreSettings();
				modal.remove();
			}
		});
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
	 * モールス信号をWAVファイルとしてダウンロードする関数。
	 */
	private async downloadMorseAudio(): Promise<void> {
		if (!this.state.selectedTemplate) return;

		try {
			//! 設定を取得。
			const settings = ListeningSettings.getAll();
			const charSpeed = settings.characterSpeed;
			const effSpeed = settings.effectiveSpeed;
			const frequency = settings.frequency;
			const volume = settings.volume;

			//! モールス符号に変換。
			const morse = MorseCode.textToMorse(this.state.selectedTemplate.content);

			//! タイミングを計算（ミリ秒）。
			const dotDuration = 1200 / charSpeed;
			const dashDuration = dotDuration * 3;
			const symbolGap = dotDuration;
			const charGap = dotDuration * 3;
			const wordGap = 7 * (1200 / effSpeed);

			//! 総時間を計算。
			let totalDuration = 0;
			for (let i = 0; i < morse.length; i++) {
				const char = morse[i];
				if (char === '.') {
					totalDuration += dotDuration + symbolGap;
				} else if (char === '-') {
					totalDuration += dashDuration + symbolGap;
				} else if (char === ' ') {
					totalDuration += charGap - symbolGap;
				} else if (char === '/') {
					totalDuration += wordGap - symbolGap;
				}
			}

			//! サンプルレート。
			const sampleRate = 44100;
			const duration = totalDuration / 1000; // 秒に変換。

			//! OfflineAudioContextを作成。
			const offlineContext = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate);

			//! モールス信号を生成。
			let currentTime = 0;
			for (let i = 0; i < morse.length; i++) {
				const char = morse[i];
				let toneDuration = 0;

				if (char === '.') {
					toneDuration = dotDuration;
				} else if (char === '-') {
					toneDuration = dashDuration;
				}

				if (toneDuration > 0) {
					//! オシレーターとゲインノードを作成。
					const oscillator = offlineContext.createOscillator();
					const gainNode = offlineContext.createGain();

					oscillator.connect(gainNode);
					gainNode.connect(offlineContext.destination);

					oscillator.frequency.value = frequency;
					oscillator.type = 'sine';

					//! エンベロープ（フェードイン・フェードアウト）。
					const startTime = currentTime / 1000;
					const endTime = startTime + toneDuration / 1000;

					gainNode.gain.setValueAtTime(0, startTime);
					gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.001);
					gainNode.gain.setValueAtTime(volume, endTime - 0.001);
					gainNode.gain.linearRampToValueAtTime(0, endTime);

					oscillator.start(startTime);
					oscillator.stop(endTime);

					currentTime += toneDuration + symbolGap;
				} else if (char === ' ') {
					currentTime += charGap - symbolGap;
				} else if (char === '/') {
					currentTime += wordGap - symbolGap;
				}
			}

			//! レンダリング。
			const audioBuffer = await offlineContext.startRendering();

			//! WAVファイルに変換。
			const wavBlob = this.audioBufferToWav(audioBuffer);

			//! ダウンロード。
			const url = URL.createObjectURL(wavBlob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${this.state.selectedTemplate.title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('音声ダウンロードエラー:', error);
			alert('音声ファイルの生成に失敗しました');
		}
	}

	/**
	 * AudioBufferをWAVファイルに変換する関数。
	 */
	private audioBufferToWav(buffer: AudioBuffer): Blob {
		const numberOfChannels = buffer.numberOfChannels;
		const sampleRate = buffer.sampleRate;
		const format = 1; // PCM
		const bitDepth = 16;

		const bytesPerSample = bitDepth / 8;
		const blockAlign = numberOfChannels * bytesPerSample;

		const data = new Float32Array(buffer.length * numberOfChannels);
		for (let channel = 0; channel < numberOfChannels; channel++) {
			const channelData = buffer.getChannelData(channel);
			for (let i = 0; i < buffer.length; i++) {
				data[i * numberOfChannels + channel] = channelData[i];
			}
		}

		const dataLength = data.length * bytesPerSample;
		const bufferLength = 44 + dataLength;
		const arrayBuffer = new ArrayBuffer(bufferLength);
		const view = new DataView(arrayBuffer);

		//! WAVヘッダーを書き込む。
		const writeString = (offset: number, string: string) => {
			for (let i = 0; i < string.length; i++) {
				view.setUint8(offset + i, string.charCodeAt(i));
			}
		};

		//! RIFFチャンク。
		writeString(0, 'RIFF');
		view.setUint32(4, bufferLength - 8, true);
		writeString(8, 'WAVE');

		//! fmtチャンク。
		writeString(12, 'fmt ');
		view.setUint32(16, 16, true); // fmtチャンクのサイズ。
		view.setUint16(20, format, true); // オーディオフォーマット（PCM）。
		view.setUint16(22, numberOfChannels, true); // チャンネル数。
		view.setUint32(24, sampleRate, true); // サンプルレート。
		view.setUint32(28, sampleRate * blockAlign, true); // バイトレート。
		view.setUint16(32, blockAlign, true); // ブロックアライン。
		view.setUint16(34, bitDepth, true); // ビット深度。

		//! dataチャンク。
		writeString(36, 'data');
		view.setUint32(40, dataLength, true);

		//! PCMデータを書き込む。
		let offset = 44;
		for (let i = 0; i < data.length; i++) {
			const sample = Math.max(-1, Math.min(1, data[i]));
			const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
			view.setInt16(offset, intSample, true);
			offset += 2;
		}

		return new Blob([arrayBuffer], { type: 'audio/wav' });
	}

	/**
	 * クリーンアップ処理
	 */
	destroy(): void {
		this.audioSystem.stopContinuousTone();
	}
}

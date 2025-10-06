/**
 * CW略語・Q符号学習ページ
 */

import './style.css';
import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';

interface FlashcardEntry {
	tags: string;
	frequency: number;
	abbreviation: string;
	english: string;
	japanese: string;
	description: string;  // 説明
	example: string;      // 具体例
}

type DisplayMode = 'card' | 'list';
type ViewMode = 'browse' | 'learn' | 'exam';
type SortColumn = 'abbreviation' | 'english' | 'japanese' | 'frequency' | 'tags';
type SortDirection = 'asc' | 'desc';
type QuestionType = 'abbr-to-meaning' | 'meaning-to-abbr' | 'morse-to-abbr' | 'morse-to-meaning';

interface ExamQuestion {
	type: QuestionType;
	entry: FlashcardEntry;
	choices: string[];
	correctAnswer: string;
}

interface ExamResult {
	question: ExamQuestion;
	userAnswer: string;
	isCorrect: boolean;
}

interface CardProgress {
	known: Set<string>;      // 「わかる」とマークされた略語
	unknown: Set<string>;    // 「わからない」とマークされた略語
}

class FlashcardApp {
	private entries: FlashcardEntry[] = [];
	private filteredEntries: FlashcardEntry[] = [];
	private selectedTags: Set<string> = new Set();
	private selectedFrequencies: Set<number> = new Set([5]);
	private displayMode: DisplayMode = 'card';
	private viewMode: ViewMode = 'browse';
	private sortColumn: SortColumn = 'abbreviation';
	private sortDirection: SortDirection = 'asc';
	private searchQuery: string = '';

	// 学習モード用
	private currentCards: FlashcardEntry[] = [];
	private currentIndex: number = 0;
	private isFlipped: boolean = false;
	private progress: CardProgress = { known: new Set(), unknown: new Set() };
	private reviewMode: boolean = false; // 復習モード（わからないカードのみ）
	private hideAbbreviation: boolean = false; // 略語を非表示（モールス再生のみ）
	private isLearning: boolean = false; // 学習中かどうか
	private audioSystem: AudioSystem;
	private currentlyPlaying: string | null = null; // 再生中の略語

	// 試験モード用
	private examQuestions: ExamQuestion[] = [];
	private currentQuestionIndex: number = 0;
	private examResults: ExamResult[] = [];
	private questionCount: number = 10;
	private questionType: QuestionType = 'abbr-to-meaning';

	// 設定モーダル用
	private settingsModalOpen: boolean = false;
	private tempSettings: { volume: number; frequency: number; wpm: number } | null = null;
	private isTestPlaying: boolean = false;

	constructor() {
		this.audioSystem = new AudioSystem();
		this.loadProgress();
		this.loadFilters();
		this.loadData();
	}

	private async loadData(): Promise<void> {
		try {
			const response = await fetch('./flashcard.tsv');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const text = await response.text();

			this.entries = text
				.trim()
				.split('\n')
				.slice(1) // ヘッダー行をスキップ
				.map((line) => {
					const [tags, frequency, abbreviation, english, japanese, description, example] = line.split('\t');
					return {
						tags,
						frequency: parseInt(frequency),
						abbreviation,
						english,
						japanese,
						description: description || '',
						example: example || '',
					};
				});

			this.applyFilters();
			this.render();
		} catch (error) {
			console.error('データ読み込みエラー:', error);
			this.renderError();
		}
	}

	private getAllTags(): string[] {
		const tagsSet = new Set<string>();
		this.entries.forEach((entry) => {
			entry.tags.split(',').forEach((tag) => tagsSet.add(tag.trim()));
		});
		return Array.from(tagsSet).sort();
	}

	private applyFilters(): void {
		let result = this.entries;

		// タグでフィルタ
		if (this.selectedTags.size > 0) {
			result = result.filter((entry) => {
				const entryTags = entry.tags.split(',').map((t) => t.trim());
				return Array.from(this.selectedTags).some((tag) => entryTags.includes(tag));
			});
		}

		// 使用頻度でフィルタ（すべてOFFの場合は全て表示）
		if (this.selectedFrequencies.size > 0) {
			result = result.filter(entry => this.selectedFrequencies.has(entry.frequency));
		}

		// 検索フィルタ
		if (this.searchQuery.trim()) {
			const query = this.searchQuery.toLowerCase();
			result = result.filter(entry =>
				entry.abbreviation.toLowerCase().includes(query) ||
				entry.english.toLowerCase().includes(query) ||
				entry.japanese.includes(this.searchQuery) ||
				entry.tags.toLowerCase().includes(query)
			);
		}

		// ソート適用
		this.filteredEntries = this.sortEntries(result);
	}

	private sortEntries(entries: FlashcardEntry[]): FlashcardEntry[] {
		const sorted = [...entries];
		sorted.sort((a, b) => {
			let compareResult = 0;

			switch (this.sortColumn) {
				case 'abbreviation':
					compareResult = a.abbreviation.localeCompare(b.abbreviation);
					break;
				case 'english':
					compareResult = a.english.localeCompare(b.english);
					break;
				case 'japanese':
					compareResult = a.japanese.localeCompare(b.japanese);
					break;
				case 'frequency':
					compareResult = a.frequency - b.frequency;
					break;
				case 'tags':
					compareResult = a.tags.localeCompare(b.tags);
					break;
			}

			return this.sortDirection === 'asc' ? compareResult : -compareResult;
		});

		return sorted;
	}

	private toggleSort(column: SortColumn): void {
		if (this.sortColumn === column) {
			// 同じ列なら方向を反転
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// 異なる列なら昇順で開始
			this.sortColumn = column;
			this.sortDirection = 'asc';
		}
		this.applyFilters();
		this.render();
	}

	private toggleTag(tag: string): void {
		if (this.selectedTags.has(tag)) {
			this.selectedTags.delete(tag);
		} else {
			this.selectedTags.add(tag);
		}
		this.applyFilters();
		this.saveFilters();
		this.render();
	}

	private toggleFrequency(freq: number): void {
		if (this.selectedFrequencies.has(freq)) {
			this.selectedFrequencies.delete(freq);
		} else {
			this.selectedFrequencies.add(freq);
		}
		this.applyFilters();
		this.saveFilters();
		this.render();
	}

	private toggleAllFrequencies(): void {
		const allFrequencies = [1, 2, 3, 4, 5];
		// 全てチェック済みなら全て外す、それ以外は全てチェック
		if (allFrequencies.every(f => this.selectedFrequencies.has(f))) {
			this.selectedFrequencies.clear();
		} else {
			allFrequencies.forEach(f => this.selectedFrequencies.add(f));
		}
		this.applyFilters();
		this.saveFilters();
		this.render();
	}

	private toggleDisplayMode(): void {
		this.displayMode = this.displayMode === 'card' ? 'list' : 'card';
		this.render();
	}

	private getFrequencyStars(frequency: number): string {
		// 使用頻度を星で表示（1-5の範囲）。
		const stars = '★'.repeat(frequency) + '☆'.repeat(5 - frequency);
		return stars;
	}

	private formatAbbreviation(abbr: string): string {
		// prosign ([AR]など) をオーバーラインで表示
		const prosignMatch = abbr.match(/^\[([A-Z]+)\]$/);
		if (prosignMatch) {
			return `<span class="prosign">${prosignMatch[1]}</span>`;
		}
		return abbr;
	}

	private getCardCountText(): string {
		const total = this.filteredEntries.length;
		const unknown = this.filteredEntries.filter(e =>
			this.progress.unknown.has(e.abbreviation)
		).length;
		const known = this.filteredEntries.filter(e =>
			this.progress.known.has(e.abbreviation)
		).length;

		return `全${total}件 / わかる:${known}件 / わからない:${unknown}件`;
	}

	private shuffleCards(cards: FlashcardEntry[]): FlashcardEntry[] {
		const shuffled = [...cards];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	private startLearning(): void {
		if (this.reviewMode) {
			// 復習モード: わからないカードのみ
			this.currentCards = this.filteredEntries.filter(e =>
				this.progress.unknown.has(e.abbreviation)
			);
		} else {
			// 通常モード: フィルタされた全カードをシャッフル
			this.currentCards = this.shuffleCards(this.filteredEntries);
		}

		this.currentIndex = 0;
		this.isFlipped = false;
		this.isLearning = true;
		this.render();
	}

	private flipCard(): void {
		this.isFlipped = !this.isFlipped;
		this.render();
	}

	private nextCard(): void {
		if (this.currentIndex < this.currentCards.length - 1) {
			this.currentIndex++;
			this.isFlipped = false;
			this.render();
		}
	}

	private previousCard(): void {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			this.isFlipped = false;
			this.render();
		}
	}

	private markAsKnown(): void {
		const card = this.currentCards[this.currentIndex];
		this.progress.known.add(card.abbreviation);
		this.progress.unknown.delete(card.abbreviation);
		this.saveProgress();

		// 自動的に次のカードへ
		if (this.currentIndex < this.currentCards.length - 1) {
			this.currentIndex++;
			this.isFlipped = false;
		}
		this.render();
	}

	private markAsUnknown(): void {
		const card = this.currentCards[this.currentIndex];
		this.progress.unknown.add(card.abbreviation);
		this.progress.known.delete(card.abbreviation);
		this.saveProgress();

		// 自動的に次のカードへ
		if (this.currentIndex < this.currentCards.length - 1) {
			this.currentIndex++;
			this.isFlipped = false;
		}
		this.render();
	}

	private backToLearnSetup(): void {
		this.isLearning = false;
		this.currentCards = [];
		this.currentIndex = 0;
		this.isFlipped = false;
		this.render();
	}

	private async playMorse(text: string): Promise<void> {
		try {
			// 既に再生中の場合は停止
			if (this.currentlyPlaying === text) {
				this.audioSystem.stopPlaying();
				this.currentlyPlaying = null;
				// 試験モード以外の場合のみレンダリング
				if (this.viewMode !== 'exam') {
					this.render();
				}
				return;
			}

			// 別のものが再生中なら停止
			if (this.currentlyPlaying) {
				this.audioSystem.stopPlaying();
			}

			this.currentlyPlaying = text;
			// 試験モード以外の場合のみレンダリング
			if (this.viewMode !== 'exam') {
				this.render();
			}

			const morseSequence = MorseCode.textToMorse(text);
			if (morseSequence) {
				await this.audioSystem.playMorseString(morseSequence);
			}

			this.currentlyPlaying = null;
			// 試験モード以外の場合のみレンダリング
			if (this.viewMode !== 'exam') {
				this.render();
			}
		} catch (error) {
			console.error('モールス再生エラー:', error);
			this.currentlyPlaying = null;
			// 試験モード以外の場合のみレンダリング
			if (this.viewMode !== 'exam') {
				this.render();
			}
		}
	}

	private render(): void {
		if (this.viewMode === 'browse') {
			this.renderBrowseMode();
		} else if (this.viewMode === 'learn') {
			this.renderLearnMode();
		} else if (this.viewMode === 'exam') {
			this.renderExamMode();
		}

		// 設定モーダルを表示中の場合は再レンダリング
		if (this.settingsModalOpen) {
			this.renderSettingsModal();
		}
	}

	private renderBrowseMode(): void {
		const app = document.getElementById('app');
		if (!app) return;

		const allTags = this.getAllTags();

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button active" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<div class="filter-group">
						<h2>タグでフィルター</h2>
						<div class="tags-list">
							${allTags.map(tag => `
								<button class="tag-btn ${this.selectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}">
									${tag}
								</button>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h2>使用頻度 <button id="toggle-freq-btn" class="toggle-freq-btn" title="チェックを反転">⇆</button></h2>
						<div class="frequency-list">
							${[5, 4, 3, 2, 1].map(freq => `
								<label class="frequency-checkbox">
									<input type="checkbox" value="${freq}" ${this.selectedFrequencies.has(freq) ? 'checked' : ''}>
									<span>${this.getFrequencyStars(freq)}</span>
								</label>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h2>検索</h2>
						<input type="text" id="search-input" class="search-input" placeholder="略語、英文、和訳、タグで検索..." value="${this.searchQuery}">
					</div>

					<div class="result-count">
						全 ${this.filteredEntries.length} 件
					</div>
				</div>

				<div class="entries-container" id="entriesContainer"></div>
			</div>
		`;

		const backBtn = document.getElementById('backBtn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				window.location.href = './index.html';
			});
		}

		const settingsBtn = document.getElementById('settingsBtn');
		if (settingsBtn) {
			settingsBtn.addEventListener('click', () => {
				this.openSettingsModal();
			});
		}

		// タブボタンのイベントリスナー
		const tabButtons = document.querySelectorAll('.tab-button');
		tabButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tab = btn.getAttribute('data-tab');
				if (tab === 'learn') {
					this.viewMode = 'learn';
					this.render();
				} else if (tab === 'exam') {
					this.viewMode = 'exam';
					this.render();
				}
				// browseはすでに表示中なので何もしない
			});
		});

		this.renderEntries();
		this.attachBrowseModeListeners();
	}

	private renderEntries(): void {
		const entriesContainer = document.getElementById('entriesContainer');
		if (!entriesContainer) return;

		if (this.displayMode === 'card') {
			this.renderCardView(entriesContainer);
		} else {
			this.renderListView(entriesContainer);
		}

		// モード切り替えボタンのイベントリスナーを設定
		const toggleBtn = document.getElementById('toggleModeBtn');
		if (toggleBtn) {
			toggleBtn.addEventListener('click', () => this.toggleDisplayMode());
		}
	}

	private renderCardView(container: HTMLElement): void {
		container.innerHTML = `
			<div class="entries-header">
				<h2>略語一覧 (${this.filteredEntries.length}件 / ${this.entries.length}件中)</h2>
				<button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
					📋 リスト表示
				</button>
			</div>
			<div class="entries-list">
				${this.filteredEntries
					.map(
						(entry) => `
					<div class="entry-card ${this.currentlyPlaying === entry.abbreviation ? 'playing' : ''}" data-abbr="${entry.abbreviation}">
						<div class="entry-header">
							<div class="entry-abbr">${this.formatAbbreviation(entry.abbreviation)}</div>
							<div class="entry-frequency" title="使用頻度: ${entry.frequency}/5">${this.getFrequencyStars(entry.frequency)}</div>
						</div>
						<div class="entry-english">${entry.english}</div>
						<div class="entry-japanese">${entry.japanese}</div>
						${entry.description ? `<div class="entry-description">${entry.description}</div>` : ''}
						${entry.example ? `<div class="entry-example">例: ${entry.example}</div>` : ''}
						<div class="entry-tags">${entry.tags}</div>
					</div>
				`
					)
					.join('')}
			</div>
		`;

		// カードクリックでモールス再生
		container.querySelectorAll('.entry-card').forEach(card => {
			card.addEventListener('click', () => {
				const abbr = card.getAttribute('data-abbr');
				if (abbr) {
					this.playMorse(abbr);
				}
			});
		});
	}

	private getSortIndicator(column: SortColumn): string {
		if (this.sortColumn !== column) return '';
		return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
	}

	private renderListView(container: HTMLElement): void {
		container.innerHTML = `
			<div class="entries-header">
				<h2>略語一覧 (${this.filteredEntries.length}件 / ${this.entries.length}件中)</h2>
				<button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
					🃏 カード表示
				</button>
			</div>
			<div class="list-table-container">
				<table class="list-table">
					<thead>
						<tr>
							<th class="sortable" data-column="abbreviation">略語${this.getSortIndicator('abbreviation')}</th>
							<th class="sortable" data-column="english">英文${this.getSortIndicator('english')}</th>
							<th class="sortable" data-column="japanese">和訳${this.getSortIndicator('japanese')}</th>
							<th class="sortable" data-column="frequency">頻度${this.getSortIndicator('frequency')}</th>
							<th class="sortable" data-column="tags">タグ${this.getSortIndicator('tags')}</th>
						</tr>
					</thead>
					<tbody>
						${this.filteredEntries
							.map(
								(entry) => `
							<tr>
								<td class="list-abbr">
									<button class="abbr-play-btn ${this.currentlyPlaying === entry.abbreviation ? 'playing' : ''}" data-abbr="${entry.abbreviation}">
										${this.formatAbbreviation(entry.abbreviation)}
									</button>
								</td>
								<td class="list-english">${entry.english}</td>
								<td class="list-japanese">${entry.japanese}</td>
								<td class="list-frequency" title="使用頻度: ${entry.frequency}/5">${this.getFrequencyStars(entry.frequency)}</td>
								<td class="list-tags">${entry.tags}</td>
							</tr>
						`
							)
							.join('')}
					</tbody>
				</table>
			</div>
		`;

		// ソートヘッダのイベントリスナー
		const sortHeaders = container.querySelectorAll('th.sortable');
		sortHeaders.forEach(header => {
			header.addEventListener('click', () => {
				const column = header.getAttribute('data-column') as SortColumn;
				if (column) {
					this.toggleSort(column);
				}
			});
		});

		// 略語再生ボタンのイベントリスナー
		const playButtons = container.querySelectorAll('.abbr-play-btn');
		playButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const abbr = btn.getAttribute('data-abbr');
				if (abbr) {
					this.playMorse(abbr);
				}
			});
		});
	}

	private renderLearnMode(): void {
		const app = document.getElementById('app');
		if (!app) return;

		// 学習中でない場合は設定画面を表示
		if (!this.isLearning) {
			this.renderLearnSetupView(app);
			return;
		}

		// 学習中の場合
		if (this.currentCards.length === 0) {
			app.innerHTML = `
				<div class="container">
					<div class="no-cards">
						${this.reviewMode ? '復習するカードがありません' : '学習するカードがありません'}
					</div>
					<button id="back-to-setup-btn" class="secondary-button">設定に戻る</button>
				</div>
			`;

			const backBtn = document.getElementById('back-to-setup-btn');
			if (backBtn) {
				backBtn.addEventListener('click', () => this.backToLearnSetup());
			}
			return;
		}

		const card = this.currentCards[this.currentIndex];
		const currentNum = this.currentIndex + 1;
		const totalNum = this.currentCards.length;

		app.innerHTML = `
			<div class="container learning-view">
				<div class="learning-header">
					<button id="back-to-setup-btn" class="back-btn">← 設定に戻る</button>
					<div class="progress-indicator">${currentNum} / ${totalNum}</div>
				</div>

				<div class="card-container">
					<div class="flashcard ${this.isFlipped ? 'flipped' : ''}" id="flashcard">
						<div class="card-front">
							${this.hideAbbreviation ? '' : `
								<div class="card-label">略語</div>
								<div class="card-content">${this.formatAbbreviation(card.abbreviation)}</div>
							`}
							<button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">🔊 モールス再生</button>
						</div>
						<div class="card-back">
							<div class="card-label">意味</div>
							<div class="card-content-abbr">${this.formatAbbreviation(card.abbreviation)}</div>
							<div class="card-content-text">${card.english}</div>
							<div class="card-content-text">${card.japanese}</div>
							${card.description ? `<div class="card-description">${card.description}</div>` : ''}
							${card.example ? `<div class="card-example">例: ${card.example}</div>` : ''}
							<div class="card-tags">${card.tags} / ${this.getFrequencyStars(card.frequency)}</div>
						</div>
					</div>
				</div>

				<div class="card-controls">
					<button id="flip-card-btn" class="control-button">
						${this.isFlipped ? '問題に戻る' : '正解を確認する'} (Space)
					</button>
				</div>

				${this.isFlipped ? this.renderJudgmentButtons(card) : ''}

				<div class="navigation-controls">
					<button id="prev-card-btn" class="nav-button" ${this.currentIndex === 0 ? 'disabled' : ''}>
						← 前のカード
					</button>
					<button id="next-card-btn" class="nav-button" ${this.currentIndex >= this.currentCards.length - 1 ? 'disabled' : ''}>
						次のカード →
					</button>
				</div>
			</div>
		`;

		this.attachLearnModeListeners();
	}

	private renderLearnSetupView(app: HTMLElement): void {
		const allTags = this.getAllTags();

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button active" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<div class="filter-group">
						<h2>タグでフィルター</h2>
						<div class="tags-list">
							${allTags.map(tag => `
								<button class="tag-btn ${this.selectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}">
									${tag}
								</button>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h2>使用頻度 <button id="toggle-freq-btn" class="toggle-freq-btn" title="チェックを反転">⇆</button></h2>
						<div class="frequency-list">
							${[5, 4, 3, 2, 1].map(freq => `
								<label class="frequency-checkbox">
									<input type="checkbox" value="${freq}" ${this.selectedFrequencies.has(freq) ? 'checked' : ''}>
									<span>${this.getFrequencyStars(freq)}</span>
								</label>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h2>モード</h2>
						<label class="mode-checkbox">
							<input type="checkbox" id="review-mode-checkbox" ${this.reviewMode ? 'checked' : ''}>
							<span>復習モード（わからないカードのみ）</span>
						</label>
						<label class="mode-checkbox">
							<input type="checkbox" id="hide-abbreviation-checkbox" ${this.hideAbbreviation ? 'checked' : ''}>
							<span>略語を非表示（モールス再生のみ）</span>
						</label>
					</div>

					<div class="result-count">
						${this.getCardCountText()}
					</div>

					<div class="action-buttons">
						<button id="start-learning-btn" class="primary-button">学習開始</button>
						<button id="clear-progress-btn" class="secondary-button">進捗をリセット</button>
					</div>
				</div>
			</div>
		`;

		const backBtn = document.getElementById('backBtn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				window.location.href = './index.html';
			});
		}

		const settingsBtn = document.getElementById('settingsBtn');
		if (settingsBtn) {
			settingsBtn.addEventListener('click', () => {
				this.openSettingsModal();
			});
		}

		// タブボタンのイベントリスナー
		const tabButtons = document.querySelectorAll('.tab-button');
		tabButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tab = btn.getAttribute('data-tab');
				if (tab === 'browse') {
					this.viewMode = 'browse';
					this.render();
				} else if (tab === 'exam') {
					this.viewMode = 'exam';
					this.render();
				}
				// learnはすでに表示中なので何もしない
			});
		});

		this.attachLearnSetupListeners();
	}

	private renderJudgmentButtons(card: FlashcardEntry): string {
		const isKnown = this.progress.known.has(card.abbreviation);
		const isUnknown = this.progress.unknown.has(card.abbreviation);

		return `
			<div class="judgment-controls">
				<button id="mark-unknown-btn" class="judgment-button unknown ${isUnknown ? 'active' : ''}">
					× わからない
				</button>
				<button id="mark-known-btn" class="judgment-button known ${isKnown ? 'active' : ''}">
					○ わかる
				</button>
			</div>
		`;
	}

	private attachBrowseModeListeners(): void {
		// タグボタン
		const tagButtons = document.querySelectorAll('.tag-btn');
		tagButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tag = btn.getAttribute('data-tag');
				if (tag) this.toggleTag(tag);
			});
		});

		// 使用頻度チェックボックス
		const frequencyCheckboxes = document.querySelectorAll('.frequency-checkbox input');
		frequencyCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const freq = parseInt((e.target as HTMLInputElement).value, 10);
				this.toggleFrequency(freq);
			});
		});

		// 使用頻度反転ボタン
		const toggleFreqBtn = document.getElementById('toggle-freq-btn');
		if (toggleFreqBtn) {
			toggleFreqBtn.addEventListener('click', () => this.toggleAllFrequencies());
		}

		// 検索入力
		const searchInput = document.getElementById('search-input') as HTMLInputElement;
		if (searchInput) {
			searchInput.addEventListener('input', () => {
				this.searchQuery = searchInput.value;
				this.applyFilters();
				this.render();
			});
		}
	}

	private attachLearnSetupListeners(): void {
		// タグボタン
		const tagButtons = document.querySelectorAll('.tag-btn');
		tagButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tag = btn.getAttribute('data-tag');
				if (tag) this.toggleTag(tag);
			});
		});

		// 使用頻度チェックボックス
		const frequencyCheckboxes = document.querySelectorAll('.frequency-checkbox input');
		frequencyCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const freq = parseInt((e.target as HTMLInputElement).value, 10);
				this.toggleFrequency(freq);
			});
		});

		// 使用頻度反転ボタン
		const toggleFreqBtn = document.getElementById('toggle-freq-btn');
		if (toggleFreqBtn) {
			toggleFreqBtn.addEventListener('click', () => this.toggleAllFrequencies());
		}

		// 復習モードチェックボックス
		const reviewModeCheckbox = document.getElementById('review-mode-checkbox') as HTMLInputElement;
		if (reviewModeCheckbox) {
			reviewModeCheckbox.addEventListener('change', () => {
				this.reviewMode = reviewModeCheckbox.checked;
			});
		}

		// 略語非表示チェックボックス
		const hideAbbreviationCheckbox = document.getElementById('hide-abbreviation-checkbox') as HTMLInputElement;
		if (hideAbbreviationCheckbox) {
			hideAbbreviationCheckbox.addEventListener('change', () => {
				this.hideAbbreviation = hideAbbreviationCheckbox.checked;
			});
		}

		// 学習開始ボタン
		const startBtn = document.getElementById('start-learning-btn');
		if (startBtn) {
			startBtn.addEventListener('click', () => this.startLearning());
		}

		// 進捗リセットボタン
		const clearBtn = document.getElementById('clear-progress-btn');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				if (confirm('学習進捗をすべてリセットしますか？')) {
					this.progress = { known: new Set(), unknown: new Set() };
					this.saveProgress();
					this.render();
				}
			});
		}
	}

	private attachLearnModeListeners(): void {
		// 戻るボタン
		const backBtn = document.getElementById('back-to-setup-btn');
		if (backBtn) {
			backBtn.addEventListener('click', () => this.backToLearnSetup());
		}

		// カードめくり
		const flipBtn = document.getElementById('flip-card-btn');
		if (flipBtn) {
			flipBtn.addEventListener('click', () => this.flipCard());
		}

		// モールス再生
		const playBtn = document.getElementById('play-morse-btn');
		if (playBtn) {
			playBtn.addEventListener('click', () => {
				const card = this.currentCards[this.currentIndex];
				this.playMorse(card.abbreviation);
			});
		}

		// ナビゲーション
		const prevBtn = document.getElementById('prev-card-btn');
		const nextBtn = document.getElementById('next-card-btn');

		if (prevBtn) {
			prevBtn.addEventListener('click', () => this.previousCard());
		}
		if (nextBtn) {
			nextBtn.addEventListener('click', () => this.nextCard());
		}

		// 判定ボタン
		if (this.isFlipped) {
			const knownBtn = document.getElementById('mark-known-btn');
			const unknownBtn = document.getElementById('mark-unknown-btn');

			if (knownBtn) {
				knownBtn.addEventListener('click', () => this.markAsKnown());
			}
			if (unknownBtn) {
				unknownBtn.addEventListener('click', () => this.markAsUnknown());
			}
		}

		// キーボードショートカット
		this.attachKeyboardListeners();
	}

	private attachKeyboardListeners(): void {
		const handler = (e: KeyboardEvent) => {
			if (this.viewMode !== 'learn') return;

			if (e.key === ' ' || e.key === 'Spacebar') {
				e.preventDefault();
				this.flipCard();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				this.nextCard();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				this.previousCard();
			}
		};

		// 既存のリスナーを削除してから追加
		document.removeEventListener('keydown', handler);
		document.addEventListener('keydown', handler);
	}

	private saveFilters(): void {
		try {
			const data = {
				tags: Array.from(this.selectedTags),
				frequencies: Array.from(this.selectedFrequencies),
			};
			localStorage.setItem('v4.flashcard.filters', JSON.stringify(data));
		} catch (error) {
			console.error('フィルタ保存エラー:', error);
		}
	}

	private loadFilters(): void {
		try {
			const saved = localStorage.getItem('v4.flashcard.filters');
			if (saved) {
				const data = JSON.parse(saved);
				this.selectedTags = new Set(Array.isArray(data.tags) ? data.tags : []);
				this.selectedFrequencies = new Set(Array.isArray(data.frequencies) ? data.frequencies : [5]);
			}
		} catch (error) {
			console.error('フィルタ読み込みエラー:', error);
		}
	}

	private saveProgress(): void {
		try {
			const data = {
				known: Array.from(this.progress.known),
				unknown: Array.from(this.progress.unknown),
			};
			localStorage.setItem('v4.flashcard.progress', JSON.stringify(data));
		} catch (error) {
			console.error('進捗保存エラー:', error);
		}
	}

	private loadProgress(): void {
		try {
			const saved = localStorage.getItem('v4.flashcard.progress');
			if (saved) {
				const data = JSON.parse(saved);
				this.progress = {
					known: new Set(data.known || []),
					unknown: new Set(data.unknown || []),
				};
			}
		} catch (error) {
			console.error('進捗読み込みエラー:', error);
		}
	}

	private renderError(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<button onclick="window.location.href='./index.html'" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
				</header>
				<div class="error">
					データの読み込みに失敗しました。flashcard.tsvを確認してください。
				</div>
			</div>
		`;
	}

	// 設定モーダル関連メソッド
	private openSettingsModal(): void {
		this.settingsModalOpen = true;
		this.tempSettings = {
			volume: this.audioSystem.getVolume(),
			frequency: this.audioSystem.getFrequency(),
			wpm: this.audioSystem.getWPM(),
		};
		this.renderSettingsModal();
	}

	private closeSettingsModal(save: boolean): void {
		// 再生中の場合は停止
		if (this.isTestPlaying) {
			this.audioSystem.stopPlaying();
			this.isTestPlaying = false;
		}

		if (!save && this.tempSettings) {
			// キャンセル時は元の設定に戻す
			this.audioSystem.setVolume(this.tempSettings.volume);
			this.audioSystem.setFrequency(this.tempSettings.frequency);
			this.audioSystem.setWPM(this.tempSettings.wpm);
		} else if (save) {
			// OK時は設定を保存
			this.audioSystem.saveSettings();
		}
		this.settingsModalOpen = false;
		this.tempSettings = null;

		// モーダルを削除
		const modal = document.getElementById('settings-modal');
		if (modal) {
			modal.remove();
		}
	}

	private renderSettingsModal(): void {
		// 既存のモーダルを削除
		const existingModal = document.getElementById('settings-modal');
		if (existingModal) {
			existingModal.remove();
		}

		const volume = this.audioSystem.getVolume();
		const frequency = this.audioSystem.getFrequency();
		const wpm = this.audioSystem.getWPM();

		const modalHTML = `
			<div class="settings-modal" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label>音量</label>
							<input type="range" id="volumeRange" min="0" max="100" value="${volume * 100}">
							<input type="number" id="volumeInput" min="0" max="100" value="${Math.round(volume * 100)}">
							<span>%</span>
						</div>
						<div class="setting-item">
							<label>周波数 (Hz)</label>
							<input type="number" id="frequencyInput" min="400" max="1200" value="${frequency}" step="50">
						</div>
						<div class="setting-item">
							<label>WPM (速度: 5-40)</label>
							<input type="number" id="wpmInput" min="5" max="40" value="${wpm}">
						</div>
						<div class="setting-item">
							<label>テスト再生</label>
							<button id="testMorseBtn" class="test-button">再生</button>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancelBtn" class="secondary-button">キャンセル</button>
						<button id="okBtn" class="primary-button">OK</button>
					</div>
				</div>
			</div>
		`;

		document.body.insertAdjacentHTML('beforeend', modalHTML);

		// イベントリスナー
		const modal = document.getElementById('settings-modal');
		if (!modal) return;

		// 背景クリックで閉じる
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.closeSettingsModal(false);
			}
		});

		const volumeRange = document.getElementById('volumeRange') as HTMLInputElement;
		const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
		if (volumeRange && volumeInput) {
			volumeRange.addEventListener('input', () => {
				const val = parseInt(volumeRange.value) / 100;
				this.audioSystem.setVolume(val);
				volumeInput.value = volumeRange.value;
			});
			volumeInput.addEventListener('input', () => {
				const val = parseInt(volumeInput.value) / 100;
				this.audioSystem.setVolume(val);
				volumeRange.value = volumeInput.value;
			});
		}

		const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
		if (frequencyInput) {
			frequencyInput.addEventListener('input', () => {
				const val = parseInt(frequencyInput.value);
				this.audioSystem.setFrequency(val);
			});
		}

		const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;
		if (wpmInput) {
			wpmInput.addEventListener('input', () => {
				const val = parseInt(wpmInput.value);
				this.audioSystem.setWPM(val);
			});
		}

		const testBtn = document.getElementById('testMorseBtn');
		if (testBtn) {
			testBtn.addEventListener('click', async () => {
				if (this.isTestPlaying) {
					// 再生中の場合は停止
					this.audioSystem.stopPlaying();
					this.isTestPlaying = false;
					testBtn.textContent = '再生';
				} else {
					// 停止中の場合は再生
					this.isTestPlaying = true;
					testBtn.textContent = '停止';
					const morseCode = MorseCode.textToMorse('CQ');
					if (morseCode) {
						await this.audioSystem.playMorseString(morseCode);
					}
					this.isTestPlaying = false;
					testBtn.textContent = '再生';
				}
			});
		}

		const cancelBtn = document.getElementById('cancelBtn');
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.closeSettingsModal(false);
			});
		}

		const okBtn = document.getElementById('okBtn');
		if (okBtn) {
			okBtn.addEventListener('click', () => {
				this.closeSettingsModal(true);
			});
		}
	}

	// 試験モード関連メソッド
	private renderExamMode(): void {
		const app = document.getElementById('app');
		if (!app) return;

		if (this.examQuestions.length === 0) {
			// 試験設定画面
			this.renderExamSetup(app);
		} else if (this.currentQuestionIndex < this.examQuestions.length) {
			// 問題表示
			this.renderExamQuestion(app);
		} else {
			// 結果表示
			this.renderExamResult(app);
		}
	}

	private renderExamSetup(app: HTMLElement): void {
		const allTags = this.getAllTags();

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button active" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<h2>試験モード設定</h2>

					<div class="filter-group">
						<h3>タグでフィルター</h3>
						<div class="tags-list">
							${allTags.map(tag => `
								<button class="tag-btn ${this.selectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}">
									${tag}
								</button>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h3>使用頻度</h3>
						<div class="frequency-list">
							${[5, 4, 3, 2, 1].map(freq => `
								<label class="frequency-checkbox">
									<input type="checkbox" value="${freq}" ${this.selectedFrequencies.has(freq) ? 'checked' : ''}>
									<span>${this.getFrequencyStars(freq)}</span>
								</label>
							`).join('')}
						</div>
					</div>

					<div class="filter-group">
						<h3>出題形式</h3>
						<div class="question-type-buttons">
							<button class="question-type-btn ${this.questionType === 'abbr-to-meaning' ? 'selected' : ''}" data-type="abbr-to-meaning">略語→意味（基礎）</button>
							<button class="question-type-btn ${this.questionType === 'meaning-to-abbr' ? 'selected' : ''}" data-type="meaning-to-abbr">意味→略語（応用）</button>
							<button class="question-type-btn ${this.questionType === 'morse-to-abbr' ? 'selected' : ''}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
							<button class="question-type-btn ${this.questionType === 'morse-to-meaning' ? 'selected' : ''}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
						</div>
					</div>

					<div class="filter-group">
						<h3>問題数</h3>
						<div class="question-count-buttons">
							<button class="question-count-btn ${this.questionCount === 5 ? 'selected' : ''}" data-count="5">5問</button>
							<button class="question-count-btn ${this.questionCount === 10 ? 'selected' : ''}" data-count="10">10問</button>
							<button class="question-count-btn ${this.questionCount === 20 ? 'selected' : ''}" data-count="20">20問</button>
							<button class="question-count-btn ${this.questionCount === 50 ? 'selected' : ''}" data-count="50">50問</button>
						</div>
					</div>

					<div class="result-count">
						出題可能: ${this.filteredEntries.length}件
					</div>

					<div class="action-buttons">
						<button id="start-exam-btn" class="primary-button">試験開始</button>
					</div>
				</div>
			</div>
		`;

		this.attachExamSetupListeners();
	}

	private attachExamSetupListeners(): void {
		const backBtn = document.getElementById('backBtn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				window.location.href = './index.html';
			});
		}

		const settingsBtn = document.getElementById('settingsBtn');
		if (settingsBtn) {
			settingsBtn.addEventListener('click', () => {
				this.openSettingsModal();
			});
		}

		// タブボタン
		const tabButtons = document.querySelectorAll('.tab-button');
		tabButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tab = btn.getAttribute('data-tab');
				if (tab === 'browse') {
					this.viewMode = 'browse';
					this.render();
				} else if (tab === 'learn') {
					this.viewMode = 'learn';
					this.currentCards = [];
					this.render();
				}
			});
		});

		// タグボタン
		const tagButtons = document.querySelectorAll('.tag-btn');
		tagButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const tag = btn.getAttribute('data-tag');
				if (tag) {
					if (this.selectedTags.has(tag)) {
						this.selectedTags.delete(tag);
					} else {
						this.selectedTags.add(tag);
					}
					this.applyFilters();
					this.saveFilters();
					this.render();
				}
			});
		});

		// 使用頻度チェックボックス
		const frequencyCheckboxes = document.querySelectorAll('.frequency-checkbox input');
		frequencyCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const freq = parseInt((e.target as HTMLInputElement).value, 10);
				if ((e.target as HTMLInputElement).checked) {
					this.selectedFrequencies.add(freq);
				} else {
					this.selectedFrequencies.delete(freq);
				}
				this.applyFilters();
				this.saveFilters();
				this.render();
			});
		});

		// 出題形式ボタン
		const questionTypeButtons = document.querySelectorAll('.question-type-btn');
		questionTypeButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const type = btn.getAttribute('data-type') as QuestionType;
				if (type) {
					this.questionType = type;
					this.render();
				}
			});
		});

		// 問題数ボタン
		const questionCountButtons = document.querySelectorAll('.question-count-btn');
		questionCountButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const count = parseInt(btn.getAttribute('data-count') || '10', 10);
				this.questionCount = count;
				this.render();
			});
		});

		// 試験開始ボタン
		const startExamBtn = document.getElementById('start-exam-btn');
		if (startExamBtn) {
			startExamBtn.addEventListener('click', () => {
				this.startExam();
			});
		}
	}

	private startExam(): void {
		this.examQuestions = this.generateExamQuestions();
		this.currentQuestionIndex = 0;
		this.examResults = [];
		this.render();
	}

	private generateExamQuestions(): ExamQuestion[] {
		const count = Math.min(this.questionCount, this.filteredEntries.length);
		const shuffled = [...this.filteredEntries].sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, count);

		return selected.map(entry => this.createExamQuestion(entry));
	}

	private createExamQuestion(entry: FlashcardEntry): ExamQuestion {
		// 選択肢用に他の3つのエントリを取得
		const others = this.filteredEntries
			.filter(e => e.abbreviation !== entry.abbreviation)
			.sort(() => Math.random() - 0.5)
			.slice(0, 3);

		let correctAnswer: string;
		let choices: string[];

		switch (this.questionType) {
			case 'abbr-to-meaning':
				correctAnswer = `${entry.english} / ${entry.japanese}`;
				choices = [correctAnswer, ...others.map(e => `${e.english} / ${e.japanese}`)];
				break;
			case 'meaning-to-abbr':
				correctAnswer = entry.abbreviation;
				choices = [correctAnswer, ...others.map(e => e.abbreviation)];
				break;
			case 'morse-to-abbr':
				correctAnswer = entry.abbreviation;
				choices = [correctAnswer, ...others.map(e => e.abbreviation)];
				break;
			case 'morse-to-meaning':
				correctAnswer = `${entry.english} / ${entry.japanese}`;
				choices = [correctAnswer, ...others.map(e => `${e.english} / ${e.japanese}`)];
				break;
		}

		// 選択肢をシャッフル
		choices = choices.sort(() => Math.random() - 0.5);

		return {
			type: this.questionType,
			entry,
			choices,
			correctAnswer,
		};
	}

	private renderExamQuestion(app: HTMLElement): void {
		const question = this.examQuestions[this.currentQuestionIndex];
		const progress = `問題 ${this.currentQuestionIndex + 1} / ${this.examQuestions.length}`;

		app.innerHTML = `
			<div class="container exam-view">
				<div class="exam-header">
					<button id="quit-exam-btn" class="secondary-button">試験を中止</button>
					<div class="progress-indicator">${progress}</div>
				</div>

				<div class="question-container">
					${this.renderQuestion(question)}
				</div>

				<div class="choices-container">
					${this.renderChoices(question)}
				</div>

				<div id="feedback-area" class="feedback-area"></div>
			</div>
		`;

		this.attachExamQuestionListeners();

		// モールス音が必要な場合は再生
		if (question.type === 'morse-to-abbr' || question.type === 'morse-to-meaning') {
			setTimeout(() => this.playMorse(question.entry.abbreviation), 500);
		}
	}

	private renderQuestion(question: ExamQuestion): string {
		switch (question.type) {
			case 'abbr-to-meaning':
				return `
					<div class="question-text">
						<p>次の略語の意味を選んでください:</p>
						<p class="question-abbr">${this.formatAbbreviation(question.entry.abbreviation)}</p>
					</div>
				`;
			case 'meaning-to-abbr':
				return `
					<div class="question-text">
						<p>次の意味に対応する略語を選んでください:</p>
						<p class="question-meaning">${question.entry.english}</p>
						<p class="question-meaning">${question.entry.japanese}</p>
					</div>
				`;
			case 'morse-to-abbr':
				return `
					<div class="question-text">
						<p>モールス音を聞いて、対応する略語を選んでください:</p>
						<button id="replay-morse-btn" class="control-button">🔊 もう一度再生</button>
					</div>
				`;
			case 'morse-to-meaning':
				return `
					<div class="question-text">
						<p>モールス音を聞いて、対応する意味を選んでください:</p>
						<button id="replay-morse-btn" class="control-button">🔊 もう一度再生</button>
					</div>
				`;
		}
	}

	private renderChoices(question: ExamQuestion): string {
		return question.choices.map((choice, index) => `
			<button class="choice-button" data-choice="${choice}">
				${String.fromCharCode(65 + index)}. ${choice}
			</button>
		`).join('');
	}

	private attachExamQuestionListeners(): void {
		const quitBtn = document.getElementById('quit-exam-btn');
		if (quitBtn) {
			quitBtn.addEventListener('click', () => {
				if (confirm('試験を中止しますか？')) {
					this.examQuestions = [];
					this.examResults = [];
					this.currentQuestionIndex = 0;
					this.render();
				}
			});
		}

		const replayBtn = document.getElementById('replay-morse-btn');
		if (replayBtn) {
			replayBtn.addEventListener('click', () => {
				const question = this.examQuestions[this.currentQuestionIndex];
				this.playMorse(question.entry.abbreviation);
			});
		}

		const choiceButtons = document.querySelectorAll('.choice-button');
		choiceButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const choice = btn.getAttribute('data-choice');
				if (choice) {
					this.submitExamAnswer(choice);
				}
			});
		});
	}

	private submitExamAnswer(answer: string): void {
		const question = this.examQuestions[this.currentQuestionIndex];
		const isCorrect = answer === question.correctAnswer;

		this.examResults.push({
			question,
			userAnswer: answer,
			isCorrect,
		});

		this.showExamFeedback(isCorrect, question.correctAnswer);

		setTimeout(() => {
			this.currentQuestionIndex++;
			this.render();
		}, 1500);
	}

	private showExamFeedback(isCorrect: boolean, correctAnswer: string): void {
		const feedbackArea = document.getElementById('feedback-area');
		if (!feedbackArea) return;

		feedbackArea.className = `feedback-area ${isCorrect ? 'correct' : 'incorrect'}`;
		feedbackArea.innerHTML = isCorrect
			? '<div class="feedback-text">✓ 正解！</div>'
			: `<div class="feedback-text">✗ 不正解<br>正解: ${correctAnswer}</div>`;

		// 選択肢ボタンを無効化
		const choiceButtons = document.querySelectorAll('.choice-button');
		choiceButtons.forEach(btn => {
			(btn as HTMLButtonElement).disabled = true;
		});
	}

	private renderExamResult(app: HTMLElement): void {
		const correctCount = this.examResults.filter(r => r.isCorrect).length;
		const totalCount = this.examResults.length;
		const percentage = Math.round((correctCount / totalCount) * 100);
		const wrongAnswers = this.examResults.filter(r => !r.isCorrect);

		app.innerHTML = `
			<div class="container exam-result-view">
				<div class="result-header">
					<h2>試験結果</h2>
				</div>

				<div class="score-display">
					<div class="score-large">${correctCount} / ${totalCount}</div>
					<div class="score-percentage">${percentage}%</div>
				</div>

				<div class="result-details">
					${wrongAnswers.length > 0 ? `
						<h3>間違えた問題 (${wrongAnswers.length}問)</h3>
						<div class="wrong-questions">
							${wrongAnswers.map(r => this.renderWrongAnswer(r)).join('')}
						</div>
					` : `
						<p class="perfect-score">全問正解です！おめでとうございます！</p>
					`}
				</div>

				<div class="action-buttons">
					<button id="back-to-setup-btn" class="primary-button">設定に戻る</button>
					${wrongAnswers.length > 0 ? `
						<button id="retry-wrong-btn" class="secondary-button">間違えた問題を復習</button>
					` : ''}
				</div>
			</div>
		`;

		this.attachExamResultListeners();
	}

	private renderWrongAnswer(result: ExamResult): string {
		const { question, userAnswer } = result;
		return `
			<div class="wrong-question-item">
				<div class="wrong-q-abbr">${this.formatAbbreviation(question.entry.abbreviation)}</div>
				<div class="wrong-q-correct">正解: ${question.correctAnswer}</div>
				<div class="wrong-q-user">あなたの回答: ${userAnswer}</div>
				<div class="wrong-q-meaning">${question.entry.english} / ${question.entry.japanese}</div>
			</div>
		`;
	}

	private attachExamResultListeners(): void {
		const backBtn = document.getElementById('back-to-setup-btn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				this.examQuestions = [];
				this.examResults = [];
				this.currentQuestionIndex = 0;
				this.render();
			});
		}

		const retryBtn = document.getElementById('retry-wrong-btn');
		if (retryBtn) {
			retryBtn.addEventListener('click', () => {
				const wrongEntries = this.examResults
					.filter(r => !r.isCorrect)
					.map(r => r.question.entry);
				this.filteredEntries = wrongEntries;
				this.questionCount = wrongEntries.length;
				this.startExam();
			});
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new FlashcardApp();
});

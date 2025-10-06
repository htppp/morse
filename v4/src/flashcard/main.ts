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
type ViewMode = 'browse' | 'learn';
type SortColumn = 'abbreviation' | 'english' | 'japanese' | 'frequency' | 'tags';
type SortDirection = 'asc' | 'desc';

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

	// 学習モード用
	private currentCards: FlashcardEntry[] = [];
	private currentIndex: number = 0;
	private isFlipped: boolean = false;
	private progress: CardProgress = { known: new Set(), unknown: new Set() };
	private reviewMode: boolean = false; // 復習モード（わからないカードのみ）
	private audioSystem: AudioSystem;
	private currentlyPlaying: string | null = null; // 再生中の略語

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

		// 使用頻度でフィルタ
		result = result.filter(entry => this.selectedFrequencies.has(entry.frequency));

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
		this.viewMode = 'learn';
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

	private backToBrowse(): void {
		this.viewMode = 'browse';
		this.render();
	}

	private async playMorse(text: string): Promise<void> {
		try {
			// 既に再生中の場合は停止
			if (this.currentlyPlaying === text) {
				this.audioSystem.stopPlaying();
				this.currentlyPlaying = null;
				this.render();
				return;
			}

			// 別のものが再生中なら停止
			if (this.currentlyPlaying) {
				this.audioSystem.stopPlaying();
			}

			this.currentlyPlaying = text;
			this.render();

			const morseSequence = MorseCode.textToMorse(text);
			if (morseSequence) {
				await this.audioSystem.playMorseString(morseSequence);
			}

			this.currentlyPlaying = null;
			this.render();
		} catch (error) {
			console.error('モールス再生エラー:', error);
			this.currentlyPlaying = null;
			this.render();
		}
	}

	private render(): void {
		if (this.viewMode === 'browse') {
			this.renderBrowseMode();
		} else {
			this.renderLearnMode();
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
				</header>

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
						<h2>使用頻度</h2>
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
					</div>

					<div class="result-count">
						${this.getCardCountText()}
					</div>

					<div class="action-buttons">
						<button id="start-learning-btn" class="primary-button">学習開始</button>
						<button id="clear-progress-btn" class="secondary-button">進捗をリセット</button>
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
				<h2>略語一覧（${this.filteredEntries.length}件）</h2>
				<button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
					📋 リスト表示
				</button>
			</div>
			<div class="entries-list">
				${this.filteredEntries
					.map(
						(entry) => `
					<div class="entry-card">
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
	}

	private getSortIndicator(column: SortColumn): string {
		if (this.sortColumn !== column) return '';
		return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
	}

	private renderListView(container: HTMLElement): void {
		container.innerHTML = `
			<div class="entries-header">
				<h2>略語一覧（${this.filteredEntries.length}件）</h2>
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

		if (this.currentCards.length === 0) {
			app.innerHTML = `
				<div class="container">
					<div class="no-cards">
						${this.reviewMode ? '復習するカードがありません' : '学習するカードがありません'}
					</div>
					<button id="back-to-browse-btn" class="secondary-button">設定に戻る</button>
				</div>
			`;

			const backBtn = document.getElementById('back-to-browse-btn');
			if (backBtn) {
				backBtn.addEventListener('click', () => this.backToBrowse());
			}
			return;
		}

		const card = this.currentCards[this.currentIndex];
		const currentNum = this.currentIndex + 1;
		const totalNum = this.currentCards.length;

		app.innerHTML = `
			<div class="container learning-view">
				<div class="learning-header">
					<button id="back-to-browse-btn" class="back-btn">← 設定に戻る</button>
					<div class="progress-indicator">${currentNum} / ${totalNum}</div>
				</div>

				<div class="card-container">
					<div class="flashcard ${this.isFlipped ? 'flipped' : ''}" id="flashcard">
						<div class="card-front">
							<div class="card-label">略語</div>
							<div class="card-content">${this.formatAbbreviation(card.abbreviation)}</div>
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

		// 復習モードチェックボックス
		const reviewModeCheckbox = document.getElementById('review-mode-checkbox') as HTMLInputElement;
		if (reviewModeCheckbox) {
			reviewModeCheckbox.addEventListener('change', () => {
				this.reviewMode = reviewModeCheckbox.checked;
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
		const backBtn = document.getElementById('back-to-browse-btn');
		if (backBtn) {
			backBtn.addEventListener('click', () => this.backToBrowse());
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
}

document.addEventListener('DOMContentLoaded', () => {
	new FlashcardApp();
});

/**
 * フラッシュカードビュー
 * CW略語・Q符号学習
 */

import type { View } from '../../router';
import {
	FlashcardTrainer,
	type FlashcardEntry,
	type ExamQuestion,
	type ExamResult,
	type QuestionType
} from 'morse-engine';
import { loadFlashcardData } from '../../utils/flashcard-loader';

/**
 * 画面状態
 */
type ViewState = 'loading' | 'setup' | 'exam' | 'result';

/**
 * フラッシュカードビュークラス
 */
export class FlashcardView implements View {
	private allEntries: FlashcardEntry[] = [];
	private filteredEntries: FlashcardEntry[] = [];
	private currentState: ViewState = 'loading';
	private selectedTags: Set<string> = new Set();
	private selectedFrequencies: Set<number> = new Set([1, 2, 3, 4, 5]);
	private searchQuery = '';
	private questionType: QuestionType = 'abbr-to-meaning';
	private questionCount = 10;
	private questions: ExamQuestion[] = [];
	private currentQuestionIndex = 0;
	private results: ExamResult[] = [];

	async render(): Promise<void> {
		const app = document.getElementById('app');
		if (!app) return;

		//! ローディング画面を表示。
		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>
				<div class="loading-container">
					<p>フラッシュカードデータを読み込み中...</p>
				</div>
			</div>
		`;

		//! 戻るボタン。
		const backBtn = document.querySelector('.back-btn');
		backBtn?.addEventListener('click', () => {
			window.location.hash = '#menu';
		});

		//! データをロード。
		try {
			this.allEntries = await loadFlashcardData('/flashcard.tsv');
			this.updateFilteredEntries();
			this.currentState = 'setup';
			this.renderSetup();
		} catch (error) {
			console.error('Failed to load flashcard data:', error);
			app.innerHTML = `
				<div class="container">
					<header class="header">
						<h1>CW略語・Q符号学習</h1>
						<button class="back-btn">メニューに戻る</button>
					</header>
					<div class="error-container">
						<p>データの読み込みに失敗しました。</p>
						<p>エラー: ${error}</p>
					</div>
				</div>
			`;
		}
	}

	/**
	 * セットアップ画面をレンダリング
	 */
	private renderSetup(): void {
		const app = document.getElementById('app');
		if (!app) return;

		//! 全タグを取得。
		const allTags = FlashcardTrainer.getAllTags(this.allEntries);

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="flashcard-container">
					<div class="filter-section">
						<h3>フィルター設定</h3>

						<div class="filter-group">
							<label>タグで絞り込み</label>
							<div class="tag-filter" id="tag-filter">
								${allTags.map(tag => `
									<label class="tag-checkbox">
										<input type="checkbox" value="${tag}" ${this.selectedTags.has(tag) ? 'checked' : ''}>
										<span>${tag}</span>
									</label>
								`).join('')}
							</div>
						</div>

						<div class="filter-group">
							<label>使用頻度で絞り込み（1=低頻度、5=高頻度）</label>
							<div class="frequency-filter" id="frequency-filter">
								${[5, 4, 3, 2, 1].map(freq => `
									<label class="frequency-checkbox">
										<input type="checkbox" value="${freq}" ${this.selectedFrequencies.has(freq) ? 'checked' : ''}>
										<span>★${freq}</span>
									</label>
								`).join('')}
							</div>
						</div>

						<div class="filter-group">
							<label for="search-input">検索（略語・意味・タグ）</label>
							<input type="text" id="search-input" class="search-input" placeholder="例: QTH, location, Q符号" value="${this.searchQuery}">
						</div>

						<div class="filter-stats">
							<span>該当: <strong id="filtered-count">${this.filteredEntries.length}</strong> 件</span>
							<span>全体: <strong>${this.allEntries.length}</strong> 件</span>
						</div>
					</div>

					<div class="exam-setup-section">
						<h3>試験設定</h3>

						<div class="setting-row">
							<label for="question-type">出題形式</label>
							<select id="question-type">
								<option value="abbr-to-meaning" ${this.questionType === 'abbr-to-meaning' ? 'selected' : ''}>略語→意味</option>
								<option value="meaning-to-abbr" ${this.questionType === 'meaning-to-abbr' ? 'selected' : ''}>意味→略語</option>
							</select>
						</div>

						<div class="setting-row">
							<label for="question-count">問題数</label>
							<input type="number" id="question-count" min="1" max="${this.filteredEntries.length}" value="${this.questionCount}">
						</div>

						<div class="action-area">
							<button class="btn btn-large btn-primary" id="start-exam-btn">試験開始</button>
						</div>
					</div>
				</div>
			</div>
		`;

		this.attachSetupEventListeners();
	}

	/**
	 * セットアップ画面のイベントリスナーを設定
	 */
	private attachSetupEventListeners(): void {
		//! 戻るボタン。
		const backBtn = document.querySelector('.back-btn');
		backBtn?.addEventListener('click', () => {
			window.location.hash = '#menu';
		});

		//! タグフィルター。
		const tagFilter = document.getElementById('tag-filter');
		tagFilter?.addEventListener('change', (e) => {
			const target = e.target as HTMLInputElement;
			if (target.type === 'checkbox') {
				if (target.checked) {
					this.selectedTags.add(target.value);
				} else {
					this.selectedTags.delete(target.value);
				}
				this.updateFilteredEntries();
				this.updateFilteredCount();
			}
		});

		//! 使用頻度フィルター。
		const frequencyFilter = document.getElementById('frequency-filter');
		frequencyFilter?.addEventListener('change', (e) => {
			const target = e.target as HTMLInputElement;
			if (target.type === 'checkbox') {
				const freq = parseInt(target.value, 10);
				if (target.checked) {
					this.selectedFrequencies.add(freq);
				} else {
					this.selectedFrequencies.delete(freq);
				}
				this.updateFilteredEntries();
				this.updateFilteredCount();
			}
		});

		//! 検索。
		const searchInput = document.getElementById('search-input') as HTMLInputElement;
		searchInput?.addEventListener('input', () => {
			this.searchQuery = searchInput.value;
			this.updateFilteredEntries();
			this.updateFilteredCount();
		});

		//! 出題形式。
		const questionTypeSelect = document.getElementById('question-type') as HTMLSelectElement;
		questionTypeSelect?.addEventListener('change', () => {
			this.questionType = questionTypeSelect.value as QuestionType;
		});

		//! 問題数。
		const questionCountInput = document.getElementById('question-count') as HTMLInputElement;
		questionCountInput?.addEventListener('input', () => {
			this.questionCount = parseInt(questionCountInput.value, 10);
		});

		//! 試験開始ボタン。
		const startExamBtn = document.getElementById('start-exam-btn');
		startExamBtn?.addEventListener('click', () => {
			this.startExam();
		});
	}

	/**
	 * フィルター適用後のエントリー数を更新
	 */
	private updateFilteredCount(): void {
		const filteredCountElem = document.getElementById('filtered-count');
		if (filteredCountElem) {
			filteredCountElem.textContent = this.filteredEntries.length.toString();
		}

		//! 問題数の最大値も更新。
		const questionCountInput = document.getElementById('question-count') as HTMLInputElement;
		if (questionCountInput) {
			questionCountInput.max = this.filteredEntries.length.toString();
			if (parseInt(questionCountInput.value, 10) > this.filteredEntries.length) {
				questionCountInput.value = this.filteredEntries.length.toString();
				this.questionCount = this.filteredEntries.length;
			}
		}
	}

	/**
	 * フィルタリングされたエントリーを更新
	 */
	private updateFilteredEntries(): void {
		let entries = this.allEntries;

		//! タグでフィルタリング。
		entries = FlashcardTrainer.filterByTags(entries, this.selectedTags);

		//! 使用頻度でフィルタリング。
		entries = FlashcardTrainer.filterByFrequencies(entries, this.selectedFrequencies);

		//! 検索クエリでフィルタリング。
		entries = FlashcardTrainer.filterByQuery(entries, this.searchQuery);

		this.filteredEntries = entries;
	}

	/**
	 * 試験を開始
	 */
	private startExam(): void {
		if (this.filteredEntries.length === 0) {
			alert('該当するエントリーがありません。フィルターを調整してください。');
			return;
		}

		const actualCount = Math.min(this.questionCount, this.filteredEntries.length);
		if (actualCount === 0) {
			alert('問題数を1以上に設定してください。');
			return;
		}

		//! 問題を生成。
		this.questions = FlashcardTrainer.generateExamQuestions(
			this.filteredEntries,
			this.questionType,
			actualCount
		);

		this.currentQuestionIndex = 0;
		this.results = [];
		this.currentState = 'exam';
		this.renderExam();
	}

	/**
	 * 試験画面をレンダリング
	 */
	private renderExam(): void {
		const app = document.getElementById('app');
		if (!app) return;

		const question = this.questions[this.currentQuestionIndex];
		const progress = this.currentQuestionIndex + 1;
		const total = this.questions.length;

		//! 問題文を生成。
		let questionText = '';
		switch (question.type) {
			case 'abbr-to-meaning':
				questionText = `次の略語の意味は？<br><strong class="question-text">${question.entry.abbreviation}</strong>`;
				break;
			case 'meaning-to-abbr':
				questionText = `次の意味を表す略語は？<br><strong class="question-text">${question.entry.english} / ${question.entry.japanese}</strong>`;
				break;
		}

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 試験中</h1>
					<button class="back-btn">中断</button>
				</header>

				<div class="exam-container">
					<div class="exam-progress">
						<span>問題 <strong>${progress}</strong> / ${total}</span>
					</div>

					<div class="question-area">
						<p class="question">${questionText}</p>
					</div>

					<div class="choices-area">
						${question.choices.map((choice, index) => `
							<button class="choice-btn" data-choice="${choice}">
								${index + 1}. ${choice}
							</button>
						`).join('')}
					</div>
				</div>
			</div>
		`;

		this.attachExamEventListeners();
	}

	/**
	 * 試験画面のイベントリスナーを設定
	 */
	private attachExamEventListeners(): void {
		//! 中断ボタン。
		const backBtn = document.querySelector('.back-btn');
		backBtn?.addEventListener('click', () => {
			if (confirm('試験を中断してメニューに戻りますか？')) {
				window.location.hash = '#menu';
			}
		});

		//! 選択肢ボタン。
		const choiceBtns = document.querySelectorAll('.choice-btn');
		choiceBtns.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const target = e.currentTarget as HTMLButtonElement;
				const userAnswer = target.dataset.choice || '';
				this.handleAnswer(userAnswer);
			});
		});
	}

	/**
	 * 回答を処理
	 */
	private handleAnswer(userAnswer: string): void {
		const question = this.questions[this.currentQuestionIndex];
		const isCorrect = FlashcardTrainer.checkAnswer(question, userAnswer);

		//! 結果を記録。
		this.results.push({
			question,
			userAnswer,
			isCorrect
		});

		//! 次の問題に進むか結果表示。
		this.currentQuestionIndex++;
		if (this.currentQuestionIndex < this.questions.length) {
			this.renderExam();
		} else {
			this.currentState = 'result';
			this.renderResult();
		}
	}

	/**
	 * 結果画面をレンダリング
	 */
	private renderResult(): void {
		const app = document.getElementById('app');
		if (!app) return;

		const score = FlashcardTrainer.calculateScore(this.results);
		const isPassed = FlashcardTrainer.isPassed(score.percentage);
		const wrongAnswers = FlashcardTrainer.getWrongAnswers(this.results);

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 結果</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="result-container">
					<div class="score-area ${isPassed ? 'passed' : 'failed'}">
						<h2>${isPassed ? '合格！' : '不合格'}</h2>
						<div class="score-display">
							<span class="score-percentage">${score.percentage}%</span>
							<span class="score-detail">${score.correct} / ${score.total} 問正解</span>
						</div>
					</div>

					${wrongAnswers.length > 0 ? `
						<div class="wrong-answers-section">
							<h3>間違えた問題（${wrongAnswers.length}件）</h3>
							<div class="wrong-answers-list">
								${this.results.filter(r => !r.isCorrect).map(result => `
									<div class="wrong-answer-item">
										<div class="wrong-answer-question">
											<strong>${result.question.entry.abbreviation}</strong>
											<span>${result.question.entry.english} / ${result.question.entry.japanese}</span>
										</div>
										<div class="wrong-answer-detail">
											<span class="wrong-label">あなたの回答:</span>
											<span class="wrong-user-answer">${result.userAnswer}</span>
											<span class="correct-label">正解:</span>
											<span class="correct-answer">${result.question.correctAnswer}</span>
										</div>
										${result.question.entry.description ? `
											<div class="wrong-answer-description">
												${result.question.entry.description}
											</div>
										` : ''}
									</div>
								`).join('')}
							</div>
						</div>
					` : `
						<div class="perfect-score">
							<p>すべて正解しました！</p>
						</div>
					`}

					<div class="action-area">
						<button class="btn btn-primary btn-large" id="retry-btn">もう一度</button>
						<button class="btn btn-secondary btn-large" id="back-to-setup-btn">設定に戻る</button>
					</div>
				</div>
			</div>
		`;

		this.attachResultEventListeners();
	}

	/**
	 * 結果画面のイベントリスナーを設定
	 */
	private attachResultEventListeners(): void {
		//! 戻るボタン。
		const backBtn = document.querySelector('.back-btn');
		backBtn?.addEventListener('click', () => {
			window.location.hash = '#menu';
		});

		//! もう一度ボタン。
		const retryBtn = document.getElementById('retry-btn');
		retryBtn?.addEventListener('click', () => {
			this.startExam();
		});

		//! 設定に戻るボタン。
		const backToSetupBtn = document.getElementById('back-to-setup-btn');
		backToSetupBtn?.addEventListener('click', () => {
			this.currentState = 'setup';
			this.renderSetup();
		});
	}

	/**
	 * ビューを破棄
	 */
	destroy(): void {
		//! 特にクリーンアップは不要。
	}
}

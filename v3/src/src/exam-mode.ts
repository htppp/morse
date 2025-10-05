/**
 * 試験モード
 */

import type { FlashcardEntry } from './flashcard-data';
import {
  filterByTags,
  filterByFrequency,
  getAllTags,
} from './flashcard-data';
import { AudioSystem } from './audio-system';
import { MorseCode } from './morse-code';
import { Settings } from './settings';

type QuestionType = 'abbr-to-meaning' | 'meaning-to-abbr' | 'morse-to-abbr' | 'morse-to-meaning';

interface Question {
  type: QuestionType;
  entry: FlashcardEntry;
  choices: string[];
  correctAnswer: string;
}

interface ExamResult {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}

export class ExamMode {
  private allEntries: FlashcardEntry[] = [];
  private filteredEntries: FlashcardEntry[] = [];
  private selectedTags: string[] = [];
  private selectedFrequencies: Set<number> = new Set();

  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;
  private results: ExamResult[] = [];
  private questionCount: number = 10;
  private questionType: QuestionType = 'abbr-to-meaning';

  constructor(private container: HTMLElement) {}

  /**
   * データを設定して表示を初期化
   */
  setData(entries: FlashcardEntry[]): void {
    this.allEntries = entries;
    this.applyFilters();
    this.render();
  }

  /**
   * フィルタを適用
   */
  private applyFilters(): void {
    let result = this.allEntries;

    // タグでフィルタ
    result = filterByTags(result, this.selectedTags);

    // 使用頻度でフィルタ（選択されたもののみ、または全て選択されている場合）
    if (this.selectedFrequencies.size > 0) {
      result = result.filter(entry => this.selectedFrequencies.has(entry.frequency));
    }

    this.filteredEntries = result;
  }

  /**
   * UI全体をレンダリング
   */
  private render(): void {
    const allTags = getAllTags(this.allEntries);
    const tagButtons = allTags.map(tag => {
      const isSelected = this.selectedTags.includes(tag);
      return `<button class="tag-filter-btn ${isSelected ? 'selected' : ''}" data-tag="${tag}">${tag}</button>`;
    }).join('');

    const frequencyCheckboxes = [5, 4, 3, 2, 1].map(freq => {
      const isChecked = this.selectedFrequencies.has(freq);
      return `
        <label class="frequency-checkbox">
          <input type="checkbox" value="${freq}" ${isChecked ? 'checked' : ''}>
          <span>${'⭐'.repeat(freq)}</span>
        </label>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="exam-mode">
        <div class="filter-section">
          <h2>試験モード</h2>

          <div class="filter-controls-fc">
            <div class="filter-group-fc">
              <label>タグフィルタ:</label>
              <div class="tag-buttons-container">
                ${tagButtons || '<p style="color: #999;">タグがありません</p>'}
              </div>
            </div>

            <div class="filter-group-fc">
              <label>使用頻度:</label>
              <div class="frequency-checkboxes">
                ${frequencyCheckboxes}
              </div>
            </div>

            <div class="filter-group-fc">
              <label>出題形式:</label>
              <div class="question-type-buttons">
                <button class="question-type-btn ${this.questionType === 'abbr-to-meaning' ? 'selected' : ''}" data-type="abbr-to-meaning">略語→意味（基礎）</button>
                <button class="question-type-btn ${this.questionType === 'meaning-to-abbr' ? 'selected' : ''}" data-type="meaning-to-abbr">意味→略語（応用）</button>
                <button class="question-type-btn ${this.questionType === 'morse-to-abbr' ? 'selected' : ''}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
                <button class="question-type-btn ${this.questionType === 'morse-to-meaning' ? 'selected' : ''}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
              </div>
            </div>

            <div class="filter-group-fc">
              <label>問題数:</label>
              <div class="question-count-buttons">
                <button class="question-count-btn ${this.questionCount === 5 ? 'selected' : ''}" data-count="5">5問</button>
                <button class="question-count-btn ${this.questionCount === 10 ? 'selected' : ''}" data-count="10">10問</button>
                <button class="question-count-btn ${this.questionCount === 20 ? 'selected' : ''}" data-count="20">20問</button>
                <button class="question-count-btn ${this.questionCount === 50 ? 'selected' : ''}" data-count="50">50問</button>
              </div>
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

    this.attachEventListeners();
  }


  /**
   * 試験を開始
   */
  private startExam(): void {
    this.questions = this.generateQuestions();
    this.currentQuestionIndex = 0;
    this.results = [];
    this.renderQuestionView();
  }

  /**
   * 問題を生成
   */
  private generateQuestions(): Question[] {
    const count = Math.min(this.questionCount, this.filteredEntries.length);
    const shuffled = [...this.filteredEntries].sort(() => Math.random() - 0.5);
    const selectedEntries = shuffled.slice(0, count);

    return selectedEntries.map(entry => this.createQuestion(entry));
  }

  /**
   * 1つの問題を作成
   */
  private createQuestion(entry: FlashcardEntry): Question {
    const otherEntries = this.filteredEntries.filter(e => e.abbreviation !== entry.abbreviation);
    const wrongChoices = otherEntries
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    let correctAnswer: string;
    let choices: string[];

    switch (this.questionType) {
      case 'abbr-to-meaning':
        correctAnswer = `${entry.english} / ${entry.japanese}`;
        choices = [
          correctAnswer,
          ...wrongChoices.map(e => `${e.english} / ${e.japanese}`)
        ];
        break;

      case 'meaning-to-abbr':
        correctAnswer = entry.abbreviation;
        choices = [
          correctAnswer,
          ...wrongChoices.map(e => e.abbreviation)
        ];
        break;

      case 'morse-to-abbr':
        correctAnswer = entry.abbreviation;
        choices = [
          correctAnswer,
          ...wrongChoices.map(e => e.abbreviation)
        ];
        break;

      case 'morse-to-meaning':
        correctAnswer = `${entry.english} / ${entry.japanese}`;
        choices = [
          correctAnswer,
          ...wrongChoices.map(e => `${e.english} / ${e.japanese}`)
        ];
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

  /**
   * 問題ビューをレンダリング
   */
  private renderQuestionView(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.renderResultView();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    const progress = `問題 ${this.currentQuestionIndex + 1} / ${this.questions.length}`;

    this.container.innerHTML = `
      <div class="exam-mode question-view">
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

    this.attachQuestionEventListeners();

    // モールス音問題の場合、自動再生
    if (question.type === 'morse-to-abbr' || question.type === 'morse-to-meaning') {
      setTimeout(() => this.playMorse(question.entry.abbreviation), 500);
    }
  }

  /**
   * 問題文をレンダリング
   */
  private renderQuestion(question: Question): string {
    switch (question.type) {
      case 'abbr-to-meaning':
        return `
          <div class="question-text">
            <p>次の略語の意味を選んでください:</p>
            <p class="question-abbr">${question.entry.abbreviation}</p>
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
            <button id="replay-morse-btn" class="control-button">♪ もう一度再生</button>
          </div>
        `;

      case 'morse-to-meaning':
        return `
          <div class="question-text">
            <p>モールス音を聞いて、対応する意味を選んでください:</p>
            <button id="replay-morse-btn" class="control-button">♪ もう一度再生</button>
          </div>
        `;
    }
  }

  /**
   * 選択肢をレンダリング
   */
  private renderChoices(question: Question): string {
    return question.choices.map((choice, index) => `
      <button class="choice-button" data-choice="${choice}">
        ${String.fromCharCode(65 + index)}. ${choice}
      </button>
    `).join('');
  }

  /**
   * 結果ビューをレンダリング
   */
  private renderResultView(): void {
    const correctCount = this.results.filter(r => r.isCorrect).length;
    const totalCount = this.results.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    const wrongResults = this.results.filter(r => !r.isCorrect);

    this.container.innerHTML = `
      <div class="exam-mode result-view">
        <div class="result-header">
          <h2>試験結果</h2>
        </div>

        <div class="score-display">
          <div class="score-large">${correctCount} / ${totalCount}</div>
          <div class="score-percentage">${percentage}%</div>
        </div>

        <div class="result-details">
          ${wrongResults.length > 0 ? `
            <h3>間違えた問題 (${wrongResults.length}問)</h3>
            <div class="wrong-questions">
              ${wrongResults.map(r => this.renderWrongQuestion(r)).join('')}
            </div>
          ` : `
            <p class="perfect-score">全問正解です！おめでとうございます！</p>
          `}
        </div>

        <div class="action-buttons">
          <button id="back-to-setup-btn" class="primary-button">設定に戻る</button>
          ${wrongResults.length > 0 ? `
            <button id="retry-wrong-btn" class="secondary-button">間違えた問題を復習</button>
          ` : ''}
        </div>
      </div>
    `;

    this.attachResultEventListeners();
  }

  /**
   * 間違えた問題を表示
   */
  private renderWrongQuestion(result: ExamResult): string {
    const { question, userAnswer } = result;
    return `
      <div class="wrong-question-item">
        <div class="wrong-q-abbr">${question.entry.abbreviation}</div>
        <div class="wrong-q-correct">正解: ${question.correctAnswer}</div>
        <div class="wrong-q-user">あなたの回答: ${userAnswer}</div>
        <div class="wrong-q-meaning">${question.entry.english} / ${question.entry.japanese}</div>
      </div>
    `;
  }

  /**
   * イベントリスナーを設定（初期画面）
   */
  private attachEventListeners(): void {
    // タグボタン
    const tagButtons = this.container.querySelectorAll('.tag-filter-btn');
    tagButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (tag) {
          const index = this.selectedTags.indexOf(tag);
          if (index >= 0) {
            this.selectedTags.splice(index, 1);
          } else {
            this.selectedTags.push(tag);
          }
          this.applyFilters();
          this.render();
        }
      });
    });

    // 使用頻度チェックボックス
    const frequencyCheckboxes = this.container.querySelectorAll('.frequency-checkbox input');
    frequencyCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const freq = parseInt((e.target as HTMLInputElement).value, 10);
        if ((e.target as HTMLInputElement).checked) {
          this.selectedFrequencies.add(freq);
        } else {
          this.selectedFrequencies.delete(freq);
        }
        this.applyFilters();
        this.render();
      });
    });

    // 出題形式ボタン
    const questionTypeButtons = this.container.querySelectorAll('.question-type-btn');
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
    const questionCountButtons = this.container.querySelectorAll('.question-count-btn');
    questionCountButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.getAttribute('data-count') || '10', 10);
        this.questionCount = count;
        this.render();
      });
    });

    // 試験開始ボタン
    const startBtn = this.container.querySelector('#start-exam-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startExam());
    }
  }

  /**
   * イベントリスナーを設定（問題画面）
   */
  private attachQuestionEventListeners(): void {
    // 中止ボタン
    const quitBtn = this.container.querySelector('#quit-exam-btn');
    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        if (confirm('試験を中止しますか？')) {
          this.render();
        }
      });
    }

    // モールス再生ボタン
    const replayBtn = this.container.querySelector('#replay-morse-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        const question = this.questions[this.currentQuestionIndex];
        this.playMorse(question.entry.abbreviation);
      });
    }

    // 選択肢ボタン
    const choiceButtons = this.container.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      button.addEventListener('click', () => {
        const choice = button.getAttribute('data-choice');
        if (choice) {
          this.submitAnswer(choice);
        }
      });
    });
  }

  /**
   * イベントリスナーを設定（結果画面）
   */
  private attachResultEventListeners(): void {
    const backBtn = this.container.querySelector('#back-to-setup-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.render());
    }

    const retryBtn = this.container.querySelector('#retry-wrong-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // 間違えた問題だけで再試験
        const wrongEntries = this.results
          .filter(r => !r.isCorrect)
          .map(r => r.question.entry);

        this.filteredEntries = wrongEntries;
        this.questionCount = wrongEntries.length;
        this.startExam();
      });
    }
  }

  /**
   * 回答を提出
   */
  private submitAnswer(answer: string): void {
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = answer === question.correctAnswer;

    this.results.push({
      question,
      userAnswer: answer,
      isCorrect,
    });

    // フィードバックを表示
    this.showFeedback(isCorrect, question.correctAnswer);

    // 1.5秒後に次の問題へ
    setTimeout(() => {
      this.currentQuestionIndex++;
      this.renderQuestionView();
    }, 1500);
  }

  /**
   * フィードバックを表示
   */
  private showFeedback(isCorrect: boolean, correctAnswer: string): void {
    const feedbackArea = this.container.querySelector('#feedback-area');
    if (feedbackArea) {
      feedbackArea.className = `feedback-area ${isCorrect ? 'correct' : 'incorrect'}`;
      feedbackArea.innerHTML = isCorrect
        ? '<div class="feedback-text">✓ 正解！</div>'
        : `<div class="feedback-text">✗ 不正解<br>正解: ${correctAnswer}</div>`;
    }

    // 選択肢ボタンを無効化
    const choiceButtons = this.container.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      (button as HTMLButtonElement).disabled = true;
    });
  }

  /**
   * モールス符号を再生
   */
  private async playMorse(text: string): Promise<void> {
    try {
      AudioSystem.ensureAudioContext();
      const morseSequence = MorseCode.textToMorse(text);
      if (morseSequence) {
        await this.playMorseSequence(morseSequence);
      }
    } catch (error) {
      console.error('Error playing morse:', error);
    }
  }

  /**
   * モールスシーケンスを再生
   */
  private async playMorseSequence(morseSequence: string): Promise<void> {
    const context = (AudioSystem as any).audioContext;
    if (!context) return;

    const wpm = Settings.get('wpm');
    const unit = 1200 / wpm; // v2と同じ計算方式
    let currentTime = context.currentTime;

    for (const char of morseSequence) {
      if (char === '.') {
        AudioSystem.scheduleTone(currentTime, unit);
        currentTime += (unit + unit) / 1000;
      } else if (char === '-') {
        AudioSystem.scheduleTone(currentTime, unit * 3);
        currentTime += (unit * 3 + unit) / 1000;
      } else if (char === ' ') {
        currentTime += (unit * 3) / 1000;
      } else if (char === '/') {
        currentTime += (unit * 7) / 1000;
      }
    }
  }
}

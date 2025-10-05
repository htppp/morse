/**
 * フラッシュカードモード
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

interface CardProgress {
  known: Set<string>;      // 「わかる」とマークされた略語
  unknown: Set<string>;    // 「わからない」とマークされた略語
}

export class FlashcardMode {
  private allEntries: FlashcardEntry[] = [];
  private filteredEntries: FlashcardEntry[] = [];
  private selectedTags: string[] = [];
  private selectedFrequencies: Set<number> = new Set();

  private currentCards: FlashcardEntry[] = [];
  private currentIndex: number = 0;
  private isFlipped: boolean = false;
  private progress: CardProgress = { known: new Set(), unknown: new Set() };
  private reviewMode: boolean = false; // 復習モード
  private hideAbbreviation: boolean = false; // 略語を非表示

  constructor(private container: HTMLElement) {
    this.loadProgress();
  }

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

    // 使用頻度でフィルタ（選択されたもののみ）
    result = result.filter(entry => this.selectedFrequencies.has(entry.frequency));

    this.filteredEntries = result;
  }

  /**
   * カードをシャッフル
   */
  private shuffleCards(cards: FlashcardEntry[]): FlashcardEntry[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 学習を開始
   */
  private startLearning(): void {
    if (this.reviewMode) {
      // 復習モード: わからないカードのみ
      this.currentCards = this.filteredEntries.filter(e =>
        this.progress.unknown.has(e.abbreviation)
      );
    } else {
      // 通常モード: フィルタされた全カード
      this.currentCards = this.shuffleCards(this.filteredEntries);
    }

    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderLearningView();
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
      <div class="flashcard-mode">
        <div class="filter-section">
          <h2>フラッシュカードモード</h2>

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
              <label>モード:</label>
              <div class="mode-checkboxes">
                <label class="mode-checkbox">
                  <input type="checkbox" id="review-mode-checkbox" ${this.reviewMode ? 'checked' : ''}>
                  <span>復習モード（わからないカードのみ）</span>
                </label>
                <label class="mode-checkbox">
                  <input type="checkbox" id="hide-abbreviation-checkbox" ${this.hideAbbreviation ? 'checked' : ''}>
                  <span>略語を非表示（モールス再生のみ）</span>
                </label>
              </div>
            </div>
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

    this.attachEventListeners();
  }

  /**
   * カード数のテキストを取得
   */
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


  /**
   * 学習ビューをレンダリング
   */
  private renderLearningView(): void {
    if (this.currentCards.length === 0) {
      this.container.innerHTML = `
        <div class="flashcard-mode">
          <div class="no-cards">
            ${this.reviewMode ? '復習するカードがありません' : '学習するカードがありません'}
          </div>
          <button id="back-to-setup-btn" class="secondary-button">設定に戻る</button>
        </div>
      `;
      this.attachBackButton();
      return;
    }

    const card = this.currentCards[this.currentIndex];
    const currentNum = this.currentIndex + 1;
    const totalNum = this.currentCards.length;
    const prevNum = this.currentIndex > 0 ? this.currentIndex : null;
    const nextNum = this.currentIndex < this.currentCards.length - 1 ? this.currentIndex + 2 : null;

    // prosignの表示処理
    let displayAbbreviation = card.abbreviation;
    const prosignMatch = card.abbreviation.match(/^\[([A-Z]+)\]$/);
    if (prosignMatch) {
      displayAbbreviation = `<span style="text-decoration: overline;">${prosignMatch[1]}</span>`;
    }

    this.container.innerHTML = `
      <div class="flashcard-mode learning-view">
        <div class="learning-header">
          <button id="back-to-setup-btn" class="secondary-button">← 設定に戻る</button>
        </div>

        <div class="card-container">
          <div class="flashcard ${this.isFlipped ? 'flipped' : ''}" id="flashcard">
            <div class="card-front">
              ${this.hideAbbreviation ? '' : `
                <div class="card-label">略語</div>
                <div class="card-content">${displayAbbreviation}</div>
              `}
              <button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">♪ モールス再生</button>
            </div>
            <div class="card-back">
              <div class="card-label">意味</div>
              <div class="card-content-small">${displayAbbreviation}</div>
              <div class="card-content-small">${card.english}</div>
              <div class="card-content-small">${card.japanese}</div>
              <div class="card-tags">${card.tags.join(', ')} / 頻度:${'⭐'.repeat(card.frequency)}</div>
            </div>
          </div>
        </div>

        <div class="card-controls">
          <button id="flip-card-btn" class="control-button">
            ${this.isFlipped ? '問題に戻る' : '正解を確認する'} (Space)
          </button>
        </div>

        ${this.isFlipped ? this.renderJudgmentButtons() : ''}

        <div class="navigation-controls">
          <button id="prev-card-btn" class="nav-button" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ← 前のカード ${prevNum !== null ? `(${prevNum})` : ''}
          </button>
          <div class="progress-indicator-center">${currentNum} / ${totalNum}</div>
          <button id="next-card-btn" class="nav-button" ${this.currentIndex >= this.currentCards.length - 1 ? 'disabled' : ''}>
            次のカード ${nextNum !== null ? `(${nextNum})` : ''} →
          </button>
        </div>
      </div>
    `;

    this.attachLearningEventListeners();
  }

  /**
   * 判定ボタンをレンダリング
   */
  private renderJudgmentButtons(): string {
    const card = this.currentCards[this.currentIndex];
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

    // 復習モードチェックボックス
    const reviewModeCheckbox = this.container.querySelector('#review-mode-checkbox') as HTMLInputElement;
    if (reviewModeCheckbox) {
      reviewModeCheckbox.addEventListener('change', () => {
        this.reviewMode = reviewModeCheckbox.checked;
        this.render();
      });
    }

    // 略語非表示チェックボックス
    const hideAbbreviationCheckbox = this.container.querySelector('#hide-abbreviation-checkbox') as HTMLInputElement;
    if (hideAbbreviationCheckbox) {
      hideAbbreviationCheckbox.addEventListener('change', () => {
        this.hideAbbreviation = hideAbbreviationCheckbox.checked;
        this.render();
      });
    }

    // 学習開始ボタン
    const startBtn = this.container.querySelector('#start-learning-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startLearning());
    }

    // 進捗リセットボタン
    const clearBtn = this.container.querySelector('#clear-progress-btn');
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

  /**
   * イベントリスナーを設定（学習画面）
   */
  private attachLearningEventListeners(): void {
    // 戻るボタン
    this.attachBackButton();

    // カードめくり
    const flipBtn = this.container.querySelector('#flip-card-btn');
    if (flipBtn) {
      flipBtn.addEventListener('click', () => this.flipCard());
    }

    // モールス再生
    const playBtn = this.container.querySelector('#play-morse-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const card = this.currentCards[this.currentIndex];
        this.playMorse(card.abbreviation);
      });
    }

    // ナビゲーション
    const prevBtn = this.container.querySelector('#prev-card-btn');
    const nextBtn = this.container.querySelector('#next-card-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousCard());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextCard());
    }

    // 判定ボタン
    if (this.isFlipped) {
      const knownBtn = this.container.querySelector('#mark-known-btn');
      const unknownBtn = this.container.querySelector('#mark-unknown-btn');

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

  /**
   * 戻るボタンのイベントリスナー
   */
  private attachBackButton(): void {
    const backBtn = this.container.querySelector('#back-to-setup-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.render());
    }
  }

  /**
   * キーボードリスナーを設定
   */
  private attachKeyboardListeners(): void {
    const handler = (e: KeyboardEvent) => {
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

  /**
   * カードをめくる
   */
  private flipCard(): void {
    this.isFlipped = !this.isFlipped;
    this.renderLearningView();
  }

  /**
   * 次のカードへ
   */
  private nextCard(): void {
    if (this.currentIndex < this.currentCards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.renderLearningView();
    }
  }

  /**
   * 前のカードへ
   */
  private previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.renderLearningView();
    }
  }

  /**
   * 「わかる」とマーク
   */
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
    this.renderLearningView();
  }

  /**
   * 「わからない」とマーク
   */
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
    this.renderLearningView();
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

  /**
   * 進捗を保存
   */
  private saveProgress(): void {
    const data = {
      known: Array.from(this.progress.known),
      unknown: Array.from(this.progress.unknown),
    };
    localStorage.setItem('flashcard-progress', JSON.stringify(data));
  }

  /**
   * 進捗を読み込み
   */
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('flashcard-progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.progress = {
          known: new Set(data.known || []),
          unknown: new Set(data.unknown || []),
        };
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }
}

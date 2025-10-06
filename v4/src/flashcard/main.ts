/**
 * CW略語・Q符号学習ページ（一覧表示）
 */

import './style.css';

interface FlashcardEntry {
  tags: string;
  frequency: number;
  abbreviation: string;
  english: string;
  japanese: string;
}

type DisplayMode = 'card' | 'list';

class FlashcardApp {
  private entries: FlashcardEntry[] = [];
  private filteredEntries: FlashcardEntry[] = [];
  private selectedTags: Set<string> = new Set();
  private displayMode: DisplayMode = 'card';

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      // flashcard.tsvを読み込む（ビルド時にコピーされたファイルを使用）
      const response = await fetch('./flashcard.tsv');
      const text = await response.text();

      this.entries = text
        .trim()
        .split('\n')
        .slice(1) // ヘッダー行をスキップ
        .map((line) => {
          const [tags, frequency, abbreviation, english, japanese] = line.split('\t');
          return {
            tags,
            frequency: parseInt(frequency),
            abbreviation,
            english,
            japanese,
          };
        });

      this.filteredEntries = [...this.entries];
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

  private filterByTags(): void {
    if (this.selectedTags.size === 0) {
      this.filteredEntries = [...this.entries];
    } else {
      this.filteredEntries = this.entries.filter((entry) => {
        const entryTags = entry.tags.split(',').map((t) => t.trim());
        return Array.from(this.selectedTags).some((tag) => entryTags.includes(tag));
      });
    }
    this.renderEntries();
  }

  private toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.filterByTags();
    this.renderTags();
  }

  private toggleDisplayMode(): void {
    this.displayMode = this.displayMode === 'card' ? 'list' : 'card';
    this.renderEntries();
    this.renderModeToggle();
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>CW略語・Q符号</h1>
          <div class="mode-toggle" id="modeToggle"></div>
        </header>

        <div class="tags-container" id="tagsContainer"></div>

        <div class="entries-container" id="entriesContainer"></div>
      </div>
    `;

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = './index.html';
      });
    }

    this.renderModeToggle();
    this.renderTags();
    this.renderEntries();
  }

  private renderModeToggle(): void {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle) return;

    modeToggle.innerHTML = `
      <button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
        ${this.displayMode === 'card' ? '📋 リスト表示' : '🃏 カード表示'}
      </button>
    `;

    const toggleBtn = document.getElementById('toggleModeBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleDisplayMode());
    }
  }

  private renderTags(): void {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return;

    const allTags = this.getAllTags();

    tagsContainer.innerHTML = `
      <h2>タグでフィルター</h2>
      <div class="tags-list">
        ${allTags
          .map(
            (tag) => `
          <button class="tag-btn ${this.selectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}">
            ${tag}
          </button>
        `
          )
          .join('')}
      </div>
    `;

    tagsContainer.querySelectorAll('.tag-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (tag) this.toggleTag(tag);
      });
    });
  }

  private getFrequencyStars(frequency: number): string {
    // 使用頻度を星で表示（1-5の範囲）。
    const stars = '★'.repeat(frequency) + '☆'.repeat(5 - frequency);
    return stars;
  }

  private renderEntries(): void {
    const entriesContainer = document.getElementById('entriesContainer');
    if (!entriesContainer) return;

    if (this.displayMode === 'card') {
      this.renderCardView(entriesContainer);
    } else {
      this.renderListView(entriesContainer);
    }
  }

  private renderCardView(container: HTMLElement): void {
    container.innerHTML = `
      <h2>略語一覧（${this.filteredEntries.length}件）</h2>
      <div class="entries-list">
        ${this.filteredEntries
          .map(
            (entry) => `
          <div class="entry-card">
            <div class="entry-header">
              <div class="entry-abbr">${entry.abbreviation}</div>
              <div class="entry-frequency" title="使用頻度: ${entry.frequency}/5">${this.getFrequencyStars(entry.frequency)}</div>
            </div>
            <div class="entry-english">${entry.english}</div>
            <div class="entry-japanese">${entry.japanese}</div>
            <div class="entry-tags">${entry.tags}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderListView(container: HTMLElement): void {
    container.innerHTML = `
      <h2>略語一覧（${this.filteredEntries.length}件）</h2>
      <div class="list-table-container">
        <table class="list-table">
          <thead>
            <tr>
              <th>頻度</th>
              <th>略語</th>
              <th>英文</th>
              <th>和訳</th>
              <th>タグ</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredEntries
              .map(
                (entry) => `
              <tr>
                <td class="list-frequency" title="使用頻度: ${entry.frequency}/5">${this.getFrequencyStars(entry.frequency)}</td>
                <td class="list-abbr">${entry.abbreviation}</td>
                <td class="list-english">${entry.english}</td>
                <td class="list-japanese">${entry.japanese}</td>
                <td class="list-tags">${entry.tags}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
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

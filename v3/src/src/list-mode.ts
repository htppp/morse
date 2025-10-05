/**
 * 一覧表示モード
 */

import type { FlashcardEntry, SortKey, SortOrder } from './flashcard-data';
import {
  filterByTags,
  filterByFrequency,
  searchEntries,
  sortEntries,
  getAllTags,
} from './flashcard-data';
import { AudioSystem } from './audio-system';
import { MorseCode } from './morse-code';
import { Settings } from './settings';

export class ListMode {
  private allEntries: FlashcardEntry[] = [];
  private filteredEntries: FlashcardEntry[] = [];
  private selectedTags: string[] = [];
  private selectedFrequencies: Set<number> = new Set();
  private searchQuery: string = '';
  private sortKey: SortKey = 'abbreviation';
  private sortOrder: SortOrder = 'asc';
  private playingAbbreviation: string | null = null;

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

    // 検索でフィルタ
    result = searchEntries(result, this.searchQuery);

    // ソート
    result = sortEntries(result, this.sortKey, this.sortOrder);

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
      <div class="list-mode">
        <div class="filter-section">
          <h2>一覧表示モード</h2>

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
              <label>検索:</label>
              <input type="text" id="search-input" placeholder="略語、英文、和訳、タグで検索..." value="${this.searchQuery}" style="padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; width: 100%; max-width: 500px;">
            </div>
          </div>

          <div class="result-count">
            ${this.filteredEntries.length}件 / ${this.allEntries.length}件
          </div>
        </div>

        <div class="table-container">
          ${this.renderTable()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }


  /**
   * テーブルをレンダリング
   */
  private renderTable(): string {
    if (this.filteredEntries.length === 0) {
      return '<p class="no-results">該当する項目がありません</p>';
    }

    const rows = this.filteredEntries.map(entry => {
      const isPlaying = this.playingAbbreviation === entry.abbreviation;
      const buttonClass = isPlaying ? 'abbreviation-button playing' : 'abbreviation-button';

      // prosignの表示処理 ([AR] -> AR with overline)
      let displayText = entry.abbreviation;
      const prosignMatch = entry.abbreviation.match(/^\[([A-Z]+)\]$/);
      if (prosignMatch) {
        displayText = `<span style="text-decoration: overline;">${prosignMatch[1]}</span>`;
      }

      return `
      <tr>
        <td class="abbreviation-cell">
          <button class="${buttonClass}" data-abbreviation="${entry.abbreviation}" title="クリックでモールス符号を再生">${displayText}</button>
        </td>
        <td>${entry.english}</td>
        <td>${entry.japanese}</td>
        <td class="frequency-cell">${this.renderFrequency(entry.frequency)}</td>
        <td class="tags-cell">${entry.tags.join(', ')}</td>
      </tr>
    `;
    }).join('');

    const getSortIcon = (key: SortKey) => {
      if (this.sortKey !== key) return '';
      return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
    };

    return `
      <table class="flashcard-table">
        <thead>
          <tr>
            <th class="sortable-header" data-sort-key="abbreviation">略語${getSortIcon('abbreviation')}</th>
            <th class="sortable-header" data-sort-key="english">英文${getSortIcon('english')}</th>
            <th class="sortable-header" data-sort-key="japanese">和訳${getSortIcon('japanese')}</th>
            <th class="sortable-header" data-sort-key="frequency">使用頻度${getSortIcon('frequency')}</th>
            <th class="sortable-header" data-sort-key="tags">タグ${getSortIcon('tags')}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  /**
   * 使用頻度を星マークで表示
   */
  private renderFrequency(frequency: number): string {
    return '⭐'.repeat(frequency);
  }

  /**
   * イベントリスナーを設定
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

    // 検索
    const searchInput = this.container.querySelector('#search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value;
        this.applyFilters();
        this.render();
      });
    }

    // モールス再生ボタン
    const playButtons = this.container.querySelectorAll('.abbreviation-button');
    playButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const abbreviation = target.getAttribute('data-abbreviation');
        if (abbreviation) {
          this.playMorse(abbreviation);
        }
      });
    });

    // テーブルヘッダークリックでソート
    const sortableHeaders = this.container.querySelectorAll('.sortable-header');
    sortableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const sortKey = header.getAttribute('data-sort-key') as SortKey;
        if (sortKey) {
          // 同じ列をクリックした場合は順序を反転、違う列なら昇順
          if (this.sortKey === sortKey) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortKey = sortKey;
            this.sortOrder = 'asc';
          }
          this.applyFilters();
          this.render();
        }
      });
    });
  }

  /**
   * モールス符号を再生
   */
  private async playMorse(text: string): Promise<void> {
    // 再生中の場合は停止
    if (this.playingAbbreviation === text) {
      AudioSystem.stopAllScheduledTones();
      this.playingAbbreviation = null;
      this.render();
      return;
    }

    // 別の音声が再生中の場合は停止
    if (this.playingAbbreviation !== null) {
      AudioSystem.stopAllScheduledTones();
    }

    try {
      this.playingAbbreviation = text;
      this.render();

      AudioSystem.ensureAudioContext();
      const morseSequence = MorseCode.textToMorse(text);
      if (morseSequence) {
        // モールス符号を音声で再生
        await this.playMorseSequence(morseSequence);
      }

      // 再生完了
      this.playingAbbreviation = null;
      this.render();
    } catch (error) {
      console.error('Error playing morse:', error);
      this.playingAbbreviation = null;
      this.render();
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
    const startTime = currentTime;

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

    // 再生時間を計算して待機
    const duration = (currentTime - startTime) * 1000;
    await new Promise<void>(resolve => {
      setTimeout(resolve, duration);
    });
  }
}

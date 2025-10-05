/**
 * UI制御とタブ管理
 */

export type TabId = 'list' | 'flashcard' | 'exam';

export class UIControls {
  private currentTab: TabId = 'list';
  private tabChangeCallbacks: Map<TabId, () => void> = new Map();

  constructor(private container: HTMLElement) {}

  /**
   * タブUIを初期化
   */
  initialize(): void {
    this.renderTabs();
    this.attachEventListeners();

    // Restore last selected tab from localStorage (if any)
    try {
      const saved = localStorage.getItem('v3.currentTab') as TabId | null;
      if (saved === 'list' || saved === 'flashcard' || saved === 'exam') {
        // apply saved tab
        this.switchTab(saved);
      } else {
        // ensure default tab is applied
        this.switchTab(this.currentTab);
      }
    } catch (err) {
      // ignore localStorage errors
      this.switchTab(this.currentTab);
    }
  }

  /**
   * タブをレンダリング
   */
  private renderTabs(): void {
    const tabsHtml = `
      <div class="tabs">
        <button class="tab-button ${this.currentTab === 'list' ? 'active' : ''}" data-tab="list">
          一覧表示
        </button>
        <button class="tab-button ${this.currentTab === 'flashcard' ? 'active' : ''}" data-tab="flashcard">
          フラッシュカード
        </button>
        <button class="tab-button ${this.currentTab === 'exam' ? 'active' : ''}" data-tab="exam">
          試験モード
        </button>
      </div>
      <div id="tab-content" class="tab-content"></div>
    `;

    this.container.innerHTML = tabsHtml;
  }

  /**
   * イベントリスナーを設定
   */
  private attachEventListeners(): void {
    const tabButtons = this.container.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab') as TabId;
        if (tabId && !button.hasAttribute('disabled')) {
          this.switchTab(tabId);
        }
      });
    });
  }

  /**
   * タブを切り替え
   */
  switchTab(tabId: TabId): void {
    const previousTab = this.currentTab;
    this.currentTab = tabId;

    // タブボタンのアクティブ状態を更新
    const tabButtons = this.container.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      if (button.getAttribute('data-tab') === tabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // コールバックを実行（同じタブでも初回は実行する）
    const callback = this.tabChangeCallbacks.get(tabId);
    if (callback) {
      callback();
    }

    // persist selection
    try {
      localStorage.setItem('v3.currentTab', tabId);
    } catch (err) {
      // ignore storage errors
    }
  }

  /**
   * タブ変更時のコールバックを登録
   */
  onTabChange(tabId: TabId, callback: () => void): void {
    this.tabChangeCallbacks.set(tabId, callback);
  }

  /**
   * タブコンテンツのコンテナを取得
   */
  getContentContainer(): HTMLElement | null {
    return this.container.querySelector('#tab-content');
  }

  /**
   * 現在のタブIDを取得
   */
  getCurrentTab(): TabId {
    return this.currentTab;
  }
}

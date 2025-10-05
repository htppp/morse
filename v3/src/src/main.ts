/**
 * アプリケーションのエントリーポイント
 */

import { loadFlashcardData } from './flashcard-data';
import { UIControls } from './ui-controls';
import { ListMode } from './list-mode';
import { FlashcardMode } from './flashcard-mode';
import { ExamMode } from './exam-mode';
import { SettingsModal } from './settings-modal';
import '../style.css';

class App {
  private uiControls: UIControls | null = null;
  private listMode: ListMode | null = null;
  private flashcardMode: FlashcardMode | null = null;
  private examMode: ExamMode | null = null;
  private settingsModal: SettingsModal | null = null;

  async initialize(): Promise<void> {
    try {
      // ローディング表示
      this.showLoading();

      // データを読み込む
      const entries = await loadFlashcardData();
      console.log(`Loaded ${entries.length} flashcard entries`);

      // UI初期化
      const appContainer = document.getElementById('app');
      if (!appContainer) {
        throw new Error('App container not found');
      }

      // UIコントロールを初期化
      this.uiControls = new UIControls(appContainer);

      // タブ切り替えのコールバックを先に登録（initialize前に登録が必要）
      this.uiControls.onTabChange('list', () => {
        const contentContainer = this.uiControls!.getContentContainer();
        if (contentContainer && this.listMode) {
          this.listMode.setData(entries);
        }
      });

      this.uiControls.onTabChange('flashcard', () => {
        const contentContainer = this.uiControls!.getContentContainer();
        if (contentContainer && this.flashcardMode) {
          this.flashcardMode.setData(entries);
        }
      });

      this.uiControls.onTabChange('exam', () => {
        const contentContainer = this.uiControls!.getContentContainer();
        if (contentContainer && this.examMode) {
          this.examMode.setData(entries);
        }
      });

      // UIを初期化（コールバック登録後に実行）
      this.uiControls.initialize();

      // 一覧表示モードを初期化
      const contentContainer = this.uiControls.getContentContainer();
      if (!contentContainer) {
        throw new Error('Content container not found');
      }

      this.listMode = new ListMode(contentContainer);

      // フラッシュカードモードを初期化
      this.flashcardMode = new FlashcardMode(contentContainer);

      // 試験モードを初期化
      this.examMode = new ExamMode(contentContainer);

      // 設定モーダルを初期化
      this.settingsModal = new SettingsModal();

      // 設定アイコンにクリックイベントを設定
      const settingsIcon = document.getElementById('settingsIcon');
      if (settingsIcon && this.settingsModal) {
        settingsIcon.addEventListener('click', () => {
          this.settingsModal?.open();
        });
      }

      // ローディングを非表示
      this.hideLoading();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('アプリケーションの初期化に失敗しました。データファイルを確認してください。');
    }
  }

  private showLoading(): void {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '<div class="loading">読み込み中...</div>';
    }
  }

  private hideLoading(): void {
    const loading = document.querySelector('.loading');
    if (loading) {
      loading.remove();
    }
  }

  private showError(message: string): void {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `<div class="error">${message}</div>`;
    }
  }
}

// アプリケーションを起動
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();
});

/**
 * コッホ法トレーニングページ
 */

import { AudioSystem } from'../../core/audio-system';
import { MorseCode } from'../../core/morse-code';
import { KOCH_SEQUENCE, getCharsForLesson, generateRandomGroups } from'./koch-sequence';
import { KochSettings } from'./settings';
import'./style.css';
import { ModeController } from '../../core/router';

type ViewMode = 'learning' | 'custom';

interface LessonState {
  currentLesson: number;
  isPlaying: boolean;
  userInput: string;
  correctAnswer: string;
  groups: string[];
  currentGroupIndex: number;
}

interface CustomState {
  selectedChars: Set<string>;
  isCustomRunning: boolean;
  customUserInput: string;
  customCorrectAnswer: string;
  customGroups: string[];
  customCurrentGroupIndex: number;
  customIsPlaying: boolean;
}

export class KochTrainer implements ModeController {
  private audioSystem: AudioSystem;
  private viewMode: ViewMode = 'learning';
  private state: LessonState = {
    currentLesson: 1,
    isPlaying: false,
    userInput:'',
    correctAnswer:'',
    groups: [],
    currentGroupIndex: 0,
  };
  private customState: CustomState = {
    selectedChars: new Set(),
    isCustomRunning: false,
    customUserInput:'',
    customCorrectAnswer:'',
    customGroups: [],
    customCurrentGroupIndex: 0,
    customIsPlaying: false,
  };

  constructor() {
    KochSettings.load();
    const settings = KochSettings.getAll();
    this.audioSystem = new AudioSystem({
      frequency: settings.frequency,
      volume: settings.volume,
      wpm: settings.characterSpeed
    });
    this.loadProgress();
    this.loadViewMode();
    this.loadSelectedChars();
    this.render();
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('v4.koch.currentLesson');
      if (saved) {
        this.state.currentLesson = parseInt(saved);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  private saveProgress(): void {
    try {
      localStorage.setItem('v4.koch.currentLesson', this.state.currentLesson.toString());
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  private loadViewMode(): void {
    try {
      const saved = localStorage.getItem('v8.koch.viewMode') as ViewMode | null;
      if (saved && ['learning', 'custom'].includes(saved)) {
        this.viewMode = saved;
      }
    } catch (error) {
      console.error('Failed to load view mode:', error);
    }
  }

  private saveViewMode(): void {
    try {
      localStorage.setItem('v8.koch.viewMode', this.viewMode);
    } catch (error) {
      console.error('Failed to save view mode:', error);
    }
  }

  private loadSelectedChars(): void {
    try {
      const saved = localStorage.getItem('v8.koch.selectedChars');
      if (saved) {
        const chars = JSON.parse(saved) as string[];
        this.customState.selectedChars = new Set(chars);
      }
    } catch (error) {
      console.error('Failed to load selected chars:', error);
    }
  }

  private saveSelectedChars(): void {
    try {
      const chars = Array.from(this.customState.selectedChars);
      localStorage.setItem('v8.koch.selectedChars', JSON.stringify(chars));
    } catch (error) {
      console.error('Failed to save selected chars:', error);
    }
  }

  private async startLesson(): Promise<void> {
    const settings = KochSettings.getAll();
    const chars = getCharsForLesson(this.state.currentLesson);
    this.state.groups = generateRandomGroups(chars, 5, settings.practiceDuration);
    this.state.currentGroupIndex = 0;
    this.state.userInput ='';
    this.state.correctAnswer = this.state.groups.join('');
    this.state.isPlaying = false; // 自動再生を停止

    // AudioSystemの設定を更新
    this.audioSystem.updateSettings({
      frequency: settings.frequency,
      volume: settings.volume,
      wpm: settings.characterSpeed,
      effectiveWpm: settings.effectiveSpeed
    });

    this.renderPractice();
  }

  private async playMorse(): Promise<void> {
    if (this.state.isPlaying) return; // 既に再生中なら何もしない

    this.state.isPlaying = true;
    this.state.currentGroupIndex = 0;
    this.updateProgress();
    this.updatePlaybackButtons(); // ボタン状態を即座に更新

    // モールス信号を再生
    for (let i = 0; i < this.state.groups.length && this.state.isPlaying; i++) {
      const group = this.state.groups[i];
      const morse = MorseCode.textToMorse(group);
      await this.audioSystem.playMorseString(morse +' /'); // グループ間に単語区切り

      this.state.currentGroupIndex = i + 1;
      this.updateProgress();
    }

    this.state.isPlaying = false;
    this.updatePlaybackButtons(); // ボタン状態を更新
    if (this.state.currentGroupIndex >= this.state.groups.length) {
      this.showResult();
    }
  }

  private pauseMorse(): void {
    this.state.isPlaying = false;
    this.audioSystem.stopPlaying();
    this.updatePlaybackButtons();
  }

  private stopLesson(): void {
    this.state.isPlaying = false;
    this.audioSystem.stopPlaying();
    this.render();
  }

  private showResult(): void {
    const accuracy = this.calculateAccuracy();
    const passed = accuracy >= 90;

    const resultContainer = document.getElementById('resultContainer');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="result ${passed ?'passed' :'failed'}">
        <h2>${passed ?'合格！' :'不合格'}</h2>
        <div class="accuracy">正答率: ${accuracy.toFixed(1)}%</div>
        <div class="comparison">
          <div>送信: ${this.state.correctAnswer}</div>
          <div>入力: ${this.state.userInput ||'（未入力）'}</div>
        </div>
        <div class="actions">
          ${passed ? `<button class="btn primary" onclick="window.location.reload()">次のレッスンへ</button>` :''}
          <button class="btn" onclick="window.location.reload()">もう一度</button>
        </div>
      </div>
    `;

    if (passed && this.state.currentLesson < 40) {
      this.state.currentLesson++;
      this.saveProgress();
    }
  }

  private calculateAccuracy(): number {
    if (!this.state.userInput) return 0;

    const correct = this.state.correctAnswer.replace(/\s/g,'');
    const input = this.state.userInput.replace(/\s/g,'');
    const maxLen = Math.max(correct.length, input.length);

    let matches = 0;
    for (let i = 0; i < maxLen; i++) {
      if (correct[i] === input[i]) matches++;
    }

    return (matches / maxLen) * 100;
  }

  private updateProgress(): void {
    const progressEl = document.getElementById('lessonProgress');
    const progressBar = document.getElementById('progressBar');

    if (progressEl && progressBar) {
      const percent = (this.state.currentGroupIndex / this.state.groups.length) * 100;
      progressEl.textContent = `進行: ${this.state.currentGroupIndex}/${this.state.groups.length} (${percent.toFixed(0)}%)`;
      progressBar.style.width = `${percent}%`;
    }

    this.updatePlaybackButtons();
  }

  private showSettings(): void {
    // 現在の設定を保存（キャンセル時の復元用）
    const savedSettings = { ...KochSettings.getAll() };

    const settings = KochSettings.getAll();
    const modal = document.createElement('div');
    modal.className ='modal';
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

          <div class="setting-item">
            <label>練習時間 (秒):</label>
            <input type="number" id="practiceDuration" min="30" max="300" step="30" value="${settings.practiceDuration}">
          </div>

          <div class="setting-item">
            <label>グループサイズ (文字):</label>
            <input type="number" id="groupSize" min="3" max="10" step="1" value="${settings.groupSize}">
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="showInput" ${settings.showInput ?'checked' :''}>
              入力を表示
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button id="cancelSettings" class="btn">キャンセル</button>
          <button id="saveSettings" class="btn primary">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 音量のレンジと入力欄を連携
    const volumeRange = document.getElementById('volumeRange') as HTMLInputElement;
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;

    if (volumeRange && volumeInput) {
      volumeRange.oninput = (e) => {
        const value = (e.target as HTMLInputElement).value;
        volumeInput.value = value;
      };
      volumeInput.oninput = (e) => {
        const value = (e.target as HTMLInputElement).value;
        volumeRange.value = value;
      };
    }

    // 設定を復元する関数
    const restoreSettings = () => {
      KochSettings.set('characterSpeed', savedSettings.characterSpeed);
      KochSettings.set('effectiveSpeed', savedSettings.effectiveSpeed);
      KochSettings.set('frequency', savedSettings.frequency);
      KochSettings.set('volume', savedSettings.volume);
      KochSettings.set('practiceDuration', savedSettings.practiceDuration);
      KochSettings.set('groupSize', savedSettings.groupSize);
      KochSettings.set('showInput', savedSettings.showInput);

      // AudioSystemを元に戻す
      this.audioSystem.updateSettings({
        frequency: savedSettings.frequency,
        volume: savedSettings.volume,
        wpm: savedSettings.characterSpeed
      });
    };

    // OK（保存）
    document.getElementById('saveSettings')?.addEventListener('click', () => {
      const charSpeed = document.getElementById('characterSpeed') as HTMLInputElement;
      const effSpeed = document.getElementById('effectiveSpeed') as HTMLInputElement;
      const frequency = document.getElementById('frequency') as HTMLInputElement;
      const duration = document.getElementById('practiceDuration') as HTMLInputElement;
      const groupSize = document.getElementById('groupSize') as HTMLInputElement;
      const showInput = document.getElementById('showInput') as HTMLInputElement;

      const charSpeedValue = parseInt(charSpeed.value);
      let effSpeedValue = parseInt(effSpeed.value);

      // 実効速度は文字速度を上限とする
      if (effSpeedValue > charSpeedValue) {
        effSpeedValue = charSpeedValue;
        effSpeed.value = charSpeedValue.toString();
      }

      KochSettings.set('characterSpeed', charSpeedValue);
      KochSettings.set('effectiveSpeed', effSpeedValue);
      KochSettings.set('frequency', parseInt(frequency.value));
      KochSettings.set('volume', parseInt(volumeInput.value) / 100);
      KochSettings.set('practiceDuration', parseInt(duration.value));
      KochSettings.set('groupSize', parseInt(groupSize.value));
      KochSettings.set('showInput', showInput.checked);

      // AudioSystemを更新
      this.audioSystem.updateSettings({
        frequency: KochSettings.get('frequency'),
        volume: KochSettings.get('volume'),
        wpm: KochSettings.get('characterSpeed'),
        effectiveWpm: KochSettings.get('effectiveSpeed')
      });

      modal.remove();

      // キーボード表示を更新（練習中の場合）
      if (this.state.groups.length > 0) {
        this.renderPractice();
      }
    });

    // キャンセル
    document.getElementById('cancelSettings')?.addEventListener('click', () => {
      restoreSettings();
      modal.remove();
    });

    // ×ボタンで閉じる（キャンセル扱い）
    document.getElementById('closeSettings')?.addEventListener('click', () => {
      restoreSettings();
      modal.remove();
    });

    // モーダル外クリックで閉じる（キャンセル扱い）
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        restoreSettings();
        modal.remove();
      }
    });
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const chars = getCharsForLesson(this.state.currentLesson);

    // レッスン一覧の生成（40レッスンまで）
    const lessonList = KOCH_SEQUENCE.slice(0, 40).map((char, index) => {
      const lessonNum = index + 1;
      const lessonChars = getCharsForLesson(lessonNum);
      const isCurrent = lessonNum === this.state.currentLesson;
      const isPassed = lessonNum < this.state.currentLesson;
      return `
        <div class="lesson-item ${isCurrent ?'current' :''} ${isPassed ?'passed' :''}" data-lesson="${lessonNum}">
          <div class="lesson-num">L${lessonNum}</div>
          <div class="lesson-chars">${lessonChars.join('')}</div>
        </div>
      `;
    }).join('');

    app.innerHTML = `
      <div class="settings-icon" id="settingsIcon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>

      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>コッホ法トレーニング</h1>
        </header>

        <div class="tabs">
          <button class="tab-button ${this.viewMode === 'learning' ? 'active' : ''}" data-tab="learning">基本学習</button>
          <button class="tab-button ${this.viewMode === 'custom' ? 'active' : ''}" data-tab="custom">任意文字列練習</button>
        </div>

        ${this.renderModeContent()}
      </div>
    `;

    document.getElementById('backBtn')?.addEventListener('click', () => {
      window.location.href ='./index.html';
    });

    document.getElementById('settingsIcon')?.addEventListener('click', () => {
      this.showSettings();
    });

    // タブボタンのイベントリスナー
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as ViewMode;
        if (tab) {
          this.viewMode = tab;
          this.saveViewMode(); // タブ選択状態を保存
          this.render();
        }
      });
    });

    // モード別のイベントリスナーを設定
    this.setupModeEventListeners();
  }

  private renderModeContent(): string {
    switch (this.viewMode) {
      case 'learning':
        return this.renderLearningMode();
      case 'custom':
        return this.renderCustomMode();
      default:
        return this.renderLearningMode();
    }
  }

  private renderLearningMode(): string {
    const chars = getCharsForLesson(this.state.currentLesson);
    const lessonList = KOCH_SEQUENCE.slice(0, 40).map((char, index) => {
      const lessonNum = index + 1;
      const lessonChars = getCharsForLesson(lessonNum);
      const isCurrent = lessonNum === this.state.currentLesson;
      const isPassed = lessonNum < this.state.currentLesson;
      return `
        <div class="lesson-item ${isCurrent ?'current' :''} ${isPassed ?'passed' :''}" data-lesson="${lessonNum}">
          <div class="lesson-num">L${lessonNum}</div>
          <div class="lesson-chars">${lessonChars.join('')}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="lesson-info">
        <h2>レッスン ${this.state.currentLesson} / 40</h2>
        <div class="chars">学習文字: ${chars.join('')}</div>
        <button id="startBtn" class="btn primary">練習開始</button>
      </div>

      <div id="practiceContainer"></div>
      <div id="resultContainer"></div>

      <div class="instructions">
        <h3>使い方</h3>
        <ul>
          <li>「練習開始」をクリックしてモールス信号を聞く</li>
          <li>聞こえた文字を入力</li>
          <li>90%以上の正答率で次のレッスンへ</li>
        </ul>
      </div>

      <div class="lesson-list-section">
        <h3>レッスン一覧</h3>
        <div class="lesson-list">
          ${lessonList}
        </div>
      </div>
    `;
  }

  private renderCustomMode(): string {
    if (!this.customState.isCustomRunning) {
      // 文字選択画面（全41文字を表示）
      const availableChars = KOCH_SEQUENCE;
      const charButtons = availableChars.map(char => `
        <button class="char-select-btn ${this.customState.selectedChars.has(char) ? 'selected' : ''}" data-char="${char}">
          ${char}
        </button>
      `).join('');

      return `
        <div class="lesson-info">
          <h2>任意文字列練習モード</h2>
          <p>練習したい文字を選択してください（最低2文字）</p>
          <div class="char-selection">
            ${charButtons}
          </div>
          <button id="startCustomBtn" class="btn primary" ${this.customState.selectedChars.size < 2 ? 'disabled' : ''}>練習開始</button>
        </div>

        <div class="instructions">
          <h3>使い方</h3>
          <ul>
            <li>練習したい文字をクリックして選択</li>
            <li>2文字以上選択すると練習開始可能</li>
            <li>選択した文字のみでランダムな練習問題が生成されます</li>
          </ul>
        </div>
      `;
    } else {
      // 練習実行画面
      return `
        <div id="customPracticeContainer"></div>
        <div id="customResultContainer"></div>
      `;
    }
  }

  private setupModeEventListeners(): void {
    if (this.viewMode === 'learning') {
      document.getElementById('startBtn')?.addEventListener('click', () => {
        this.startLesson();
      });

      // レッスンアイテムのクリックイベント
      document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
          const lessonNum = parseInt(item.getAttribute('data-lesson') ||'1');
          this.state.currentLesson = lessonNum;
          this.saveProgress();
          this.render();
          // 画面トップにスクロール
          window.scrollTo({ top: 0, behavior:'smooth' });
        });
      });
    } else if (this.viewMode === 'custom') {
      if (!this.customState.isCustomRunning) {
        document.getElementById('startCustomBtn')?.addEventListener('click', () => {
          this.startCustom();
        });

        // 文字選択ボタン
        document.querySelectorAll('.char-select-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const char = btn.getAttribute('data-char');
            if (char) {
              if (this.customState.selectedChars.has(char)) {
                this.customState.selectedChars.delete(char);
              } else {
                this.customState.selectedChars.add(char);
              }
              this.saveSelectedChars(); // 文字選択状態を保存
              this.render();
            }
          });
        });
      }
    }
  }

  private renderPractice(): void {
    const practiceContainer = document.getElementById('practiceContainer');
    if (!practiceContainer) return;

    const settings = KochSettings.getAll();
    const chars = getCharsForLesson(this.state.currentLesson);

    practiceContainer.innerHTML = `
      <div class="practice-area">
        <div class="progress-section">
          <div class="progress-bar-container">
            <div id="progressBar" class="progress-bar" style="width: 0%"></div>
          </div>
          <div id="lessonProgress" class="progress-text">準備完了 - 再生ボタンを押してください</div>
        </div>

        <div class="playback-controls">
          <button id="playBtn" class="control-btn" title="再生">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button id="pauseBtn" class="control-btn" title="一時停止" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
          <button id="stopBtn" class="control-btn" title="停止">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          </button>
        </div>

        <textarea id="userInput" class="input-area" placeholder="聞こえた文字を入力..." ${settings.showInput ?'' :'style="opacity: 0.3; pointer-events: none;"'}></textarea>
        ${this.renderKeyboard(chars)}
      </div>
    `;

    const inputEl = document.getElementById('userInput') as HTMLTextAreaElement;
    if (inputEl) {
      inputEl.addEventListener('input', (e) => {
        this.state.userInput = (e.target as HTMLTextAreaElement).value.toUpperCase();
      });
    }

    document.getElementById('playBtn')?.addEventListener('click', () => {
      this.playMorse();
    });

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
      this.pauseMorse();
    });

    document.getElementById('stopBtn')?.addEventListener('click', () => {
      this.stopLesson();
    });

    // キーボードボタンのイベント設定
    this.setupKeyboardEvents(chars);
    this.updatePlaybackButtons();
  }

  private updatePlaybackButtons(): void {
    const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;

    if (playBtn && pauseBtn) {
      if (this.state.isPlaying) {
        playBtn.disabled = true;
        pauseBtn.disabled = false;
      } else {
        playBtn.disabled = false;
        pauseBtn.disabled = true;
      }
    }
  }

  private renderKeyboard(availableChars: string[]): string {
    const groupSize = KochSettings.get('groupSize');
    const groups: string[][] = [];

    // KOCH_SEQUENCEを groupSize ごとに分割
    for (let i = 0; i < KOCH_SEQUENCE.length; i += groupSize) {
      groups.push(KOCH_SEQUENCE.slice(i, i + groupSize));
    }

    return `
      <div class="keyboard">
        <div class="keyboard-header">
          <small>グループベースキーボード（学習済み文字のみ有効）</small>
        </div>
        <div class="keyboard-controls">
          <button id="spaceBtn" class="key-btn special">スペース</button>
          <button id="backspaceBtn" class="key-btn special">1字削除</button>
        </div>
        <div class="keyboard-groups-wrapper">
          <div class="keyboard-groups">
            ${groups.map((group, groupIndex) => `
              <div class="keyboard-group">
                <div class="group-label">G${groupIndex + 1}</div>
                <div class="group-keys">
                  ${group.map(char => {
                    const isLearned = availableChars.includes(char);
                    return `
                      <button class="key-btn ${isLearned ?'' :'disabled'}"
                              data-char="${char}"
                              ${isLearned ?'' :'disabled'}>
                        ${char}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private setupKeyboardEvents(availableChars: string[]): void {
    const inputEl = document.getElementById('userInput') as HTMLTextAreaElement;
    if (!inputEl) return;

    // 文字キー
    document.querySelectorAll('.key-btn:not(.special)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); // デフォルト動作を防止
        const char = (e.target as HTMLButtonElement).getAttribute('data-char');
        if (char && availableChars.includes(char)) {
          inputEl.value += char;
          this.state.userInput = inputEl.value.toUpperCase();
          // フォーカスしない（スマホでキーボードが出ないようにする）
        }
      });
    });

    // スペースキー
    document.getElementById('spaceBtn')?.addEventListener('click', (e) => {
      e.preventDefault(); // デフォルト動作を防止
      inputEl.value +=' '; // 空白文字を追加
      this.state.userInput = inputEl.value.toUpperCase();
      // フォーカスしない（スマホでキーボードが出ないようにする）
    });

    // バックスペースキー
    document.getElementById('backspaceBtn')?.addEventListener('click', (e) => {
      e.preventDefault(); // デフォルト動作を防止
      inputEl.value = inputEl.value.slice(0, -1);
      this.state.userInput = inputEl.value.toUpperCase();
      // フォーカスしない（スマホでキーボードが出ないようにする）
    });

    // 物理キーボード対応
    inputEl.addEventListener('keydown', (e) => {
      if (e.key ==='') {
        e.preventDefault();
        inputEl.value +='';
        this.state.userInput = inputEl.value.toUpperCase();
      }
    });
  }
  private async startCustom(): Promise<void> {
    const settings = KochSettings.getAll();
    const chars = Array.from(this.customState.selectedChars);
    this.customState.customGroups = generateRandomGroups(chars, 5, settings.practiceDuration);
    this.customState.customCurrentGroupIndex = 0;
    this.customState.customUserInput ='';
    this.customState.customCorrectAnswer = this.customState.customGroups.join('');
    this.customState.customIsPlaying = false;
    this.customState.isCustomRunning = true;

    // AudioSystemの設定を更新
    this.audioSystem.updateSettings({
      frequency: settings.frequency,
      volume: settings.volume,
      wpm: settings.characterSpeed,
      effectiveWpm: settings.effectiveSpeed
    });

    this.render();
    this.renderCustomPractice();
  }

  private renderCustomPractice(): void {
    const container = document.getElementById('customPracticeContainer');
    if (!container) return;

    const settings = KochSettings.getAll();

    container.innerHTML = `
      <div class="practice-area">
        <div class="progress-section">
          <div class="progress-bar-container">
            <div id="customProgressBar" class="progress-bar" style="width: 0%"></div>
          </div>
          <div id="customProgress" class="progress-text">準備完了 - 再生ボタンを押してください</div>
        </div>

        <div class="playback-controls">
          <button id="customPlayBtn" class="control-btn" title="再生">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button id="customPauseBtn" class="control-btn" title="一時停止" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
          <button id="customStopBtn" class="control-btn" title="停止">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          </button>
        </div>

        ${settings.showInput ? `
          <textarea id="customInputArea" class="input-area" placeholder="聞こえた文字を入力してください..."></textarea>
        ` :''}

        <button id="customEndBtn" class="btn primary">結果を見る</button>
      </div>
    `;

    this.setupCustomControls();
  }

  private setupCustomControls(): void {
    // 入力欄のイベントリスナー
    const inputEl = document.getElementById('customInputArea') as HTMLTextAreaElement;
    if (inputEl) {
      inputEl.addEventListener('input', (e) => {
        this.customState.customUserInput = (e.target as HTMLTextAreaElement).value.toUpperCase();
      });
    }

    // 再生ボタン
    document.getElementById('customPlayBtn')?.addEventListener('click', () => {
      this.playCustomMorse();
    });

    // 一時停止ボタン
    document.getElementById('customPauseBtn')?.addEventListener('click', () => {
      this.pauseCustomMorse();
    });

    // 停止ボタン
    document.getElementById('customStopBtn')?.addEventListener('click', () => {
      this.stopCustom();
    });

    // 練習終了ボタン
    document.getElementById('customEndBtn')?.addEventListener('click', () => {
      this.showCustomResult();
    });

    this.updateCustomPlaybackButtons();
  }

  private async playCustomMorse(): Promise<void> {
    if (this.customState.customIsPlaying) return;

    this.customState.customIsPlaying = true;
    this.customState.customCurrentGroupIndex = 0;
    this.updateCustomProgress();
    this.updateCustomPlaybackButtons();

    // モールス信号を再生
    for (let i = 0; i < this.customState.customGroups.length && this.customState.customIsPlaying; i++) {
      const group = this.customState.customGroups[i];
      const morse = MorseCode.textToMorse(group);
      await this.audioSystem.playMorseString(morse +' /');

      this.customState.customCurrentGroupIndex = i + 1;
      this.updateCustomProgress();
    }

    this.customState.customIsPlaying = false;
    this.updateCustomPlaybackButtons();
  }

  private pauseCustomMorse(): void {
    this.customState.customIsPlaying = false;
    this.audioSystem.stopPlaying();
    this.updateCustomPlaybackButtons();
  }

  private stopCustom(): void {
    this.customState.customIsPlaying = false;
    this.audioSystem.stopPlaying();
    this.customState.isCustomRunning = false;
    this.render();
  }

  private updateCustomProgress(): void {
    const progressEl = document.getElementById('customProgress');
    const progressBar = document.getElementById('customProgressBar');

    if (progressEl && progressBar) {
      const percent = (this.customState.customCurrentGroupIndex / this.customState.customGroups.length) * 100;
      progressEl.textContent = `進行: ${this.customState.customCurrentGroupIndex}/${this.customState.customGroups.length} (${percent.toFixed(0)}%)`;
      progressBar.style.width = `${percent}%`;
    }

    this.updateCustomPlaybackButtons();
  }

  private updateCustomPlaybackButtons(): void {
    const playBtn = document.getElementById('customPlayBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('customPauseBtn') as HTMLButtonElement;

    if (playBtn && pauseBtn) {
      if (this.customState.customIsPlaying) {
        playBtn.disabled = true;
        pauseBtn.disabled = false;
      } else {
        playBtn.disabled = false;
        pauseBtn.disabled = true;
      }
    }
  }

  private showCustomResult(): void {
    const resultContainer = document.getElementById('customResultContainer');
    if (!resultContainer) return;

    const userAnswer = this.customState.customUserInput.replace(/\s+/g,'');
    const correctAnswer = this.customState.customCorrectAnswer.replace(/\s+/g,'');

    let correct = 0;
    const maxLen = Math.max(userAnswer.length, correctAnswer.length);
    for (let i = 0; i < maxLen; i++) {
      if (userAnswer[i] === correctAnswer[i]) correct++;
    }
    const accuracy = maxLen > 0 ? Math.round((correct / maxLen) * 100) : 0;

    resultContainer.innerHTML = `
      <div class="result">
        <h2>練習結果</h2>
        <div class="accuracy">正答率: ${accuracy}%</div>
        <div class="comparison">
          <div>送信: ${correctAnswer}</div>
          <div>あなたの入力: ${userAnswer}</div>
        </div>
        <div class="actions">
          <button id="retryCustomBtn" class="btn">もう一度</button>
          <button id="backToCustomMenuBtn" class="btn primary">戻る</button>
        </div>
      </div>
    `;

    document.getElementById('retryCustomBtn')?.addEventListener('click', () => {
      this.customState.isCustomRunning = false;
      this.render();
      this.startCustom();
    });

    document.getElementById('backToCustomMenuBtn')?.addEventListener('click', () => {
      this.customState.isCustomRunning = false;
      this.render();
    });
  }

	/**
	 * クリーンアップ処理
	 */
	destroy(): void {
		// 音声を停止
		this.audioSystem.stopContinuousTone();
	}

}

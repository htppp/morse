/**
 * コッホ法トレーニングページ
 */

import { AudioSystem } from'../../core/audio-system';
import { MorseCode } from'../../core/morse-code';
import { KOCH_SEQUENCE, getCharsForLesson, generateRandomGroups } from'./koch-sequence';
import { KochSettings } from'./settings';
import'./style.css';
import { ModeController } from '../../core/router';

interface LessonState {
  currentLesson: number;
  isPlaying: boolean;
  userInput: string;
  correctAnswer: string;
  groups: string[];
  currentGroupIndex: number;
}

export class KochTrainer implements ModeController {
  private audioSystem: AudioSystem;
  private state: LessonState = {
    currentLesson: 1,
    isPlaying: false,
    userInput:'',
    correctAnswer:'',
    groups: [],
    currentGroupIndex: 0,
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
      wpm: settings.characterSpeed
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
            <label>文字速度 (Character Speed): <span id="charSpeedValue">${settings.characterSpeed}</span> WPM</label>
            <input type="range" id="characterSpeed" min="5" max="40" step="1" value="${settings.characterSpeed}">
          </div>

          <div class="setting-item">
            <label>実効速度 (Effective Speed): <span id="effSpeedValue">${settings.effectiveSpeed}</span> WPM</label>
            <input type="range" id="effectiveSpeed" min="5" max="40" step="1" value="${settings.effectiveSpeed}">
            <small>※現在は文字速度のみ実装。実効速度は将来実装予定</small>
          </div>

          <div class="setting-item">
            <label>周波数: <span id="frequencyValue">${settings.frequency}</span> Hz</label>
            <input type="range" id="frequency" min="400" max="1000" step="10" value="${settings.frequency}">
          </div>

          <div class="setting-item">
            <label>音量: <span id="volumeValue">${Math.round(settings.volume * 100)}</span>%</label>
            <input type="range" id="volume" min="0" max="100" step="5" value="${settings.volume * 100}">
          </div>

          <div class="setting-item">
            <label>練習時間: <span id="durationValue">${settings.practiceDuration}</span> 秒</label>
            <input type="range" id="practiceDuration" min="30" max="300" step="30" value="${settings.practiceDuration}">
          </div>

          <div class="setting-item">
            <label>グループサイズ: <span id="groupSizeValue">${settings.groupSize}</span> 文字</label>
            <input type="range" id="groupSize" min="3" max="10" step="1" value="${settings.groupSize}">
            <small>※キーボードUI実装時に有効化</small>
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

    // リアルタイム更新
    const charSpeedSlider = document.getElementById('characterSpeed') as HTMLInputElement;
    const effSpeedSlider = document.getElementById('effectiveSpeed') as HTMLInputElement;
    const frequencySlider = document.getElementById('frequency') as HTMLInputElement;
    const volumeSlider = document.getElementById('volume') as HTMLInputElement;
    const durationSlider = document.getElementById('practiceDuration') as HTMLInputElement;
    const groupSizeSlider = document.getElementById('groupSize') as HTMLInputElement;

    charSpeedSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('charSpeedValue')!.textContent = value;
    });

    effSpeedSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('effSpeedValue')!.textContent = value;
    });

    frequencySlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('frequencyValue')!.textContent = value;
    });

    volumeSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('volumeValue')!.textContent = value;
    });

    durationSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('durationValue')!.textContent = value;
    });

    groupSizeSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('groupSizeValue')!.textContent = value;
    });

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
      KochSettings.set('characterSpeed', parseInt(charSpeedSlider.value));
      KochSettings.set('effectiveSpeed', parseInt(effSpeedSlider.value));
      KochSettings.set('frequency', parseInt(frequencySlider.value));
      KochSettings.set('volume', parseInt(volumeSlider.value) / 100);
      KochSettings.set('practiceDuration', parseInt(durationSlider.value));
      KochSettings.set('groupSize', parseInt(groupSizeSlider.value));
      KochSettings.set('showInput', (document.getElementById('showInput') as HTMLInputElement).checked);

      // AudioSystemを更新
      this.audioSystem.updateSettings({
        frequency: KochSettings.get('frequency'),
        volume: KochSettings.get('volume'),
        wpm: KochSettings.get('characterSpeed')
      });

      modal.remove();
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
      </div>
    `;

    document.getElementById('backBtn')?.addEventListener('click', () => {
      window.location.href ='./index.html';
    });

    document.getElementById('settingsIcon')?.addEventListener('click', () => {
      this.showSettings();
    });

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
          <button id="backspaceBtn" class="key-btn special">←削除</button>
        </div>
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
    `;
  }

  private setupKeyboardEvents(availableChars: string[]): void {
    const inputEl = document.getElementById('userInput') as HTMLTextAreaElement;
    if (!inputEl) return;

    // 文字キー
    document.querySelectorAll('.key-btn:not(.special)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const char = (e.target as HTMLButtonElement).getAttribute('data-char');
        if (char && availableChars.includes(char)) {
          inputEl.value += char;
          this.state.userInput = inputEl.value.toUpperCase();
          inputEl.focus();
        }
      });
    });

    // スペースキー
    document.getElementById('spaceBtn')?.addEventListener('click', () => {
      inputEl.value +='';
      this.state.userInput = inputEl.value.toUpperCase();
      inputEl.focus();
    });

    // バックスペースキー
    document.getElementById('backspaceBtn')?.addEventListener('click', () => {
      inputEl.value = inputEl.value.slice(0, -1);
      this.state.userInput = inputEl.value.toUpperCase();
      inputEl.focus();
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
	/**
	 * クリーンアップ処理
	 */
	destroy(): void {
		// 音声を停止
		this.audioSystem.stopContinuousTone();
	}

}

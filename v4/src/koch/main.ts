/**
 * コッホ法トレーニングページ
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import { KOCH_SEQUENCE, getCharsForLesson, generateRandomGroups } from './koch-sequence';
import { KochSettings } from './settings';
import './style.css';

interface LessonState {
  currentLesson: number;
  isPlaying: boolean;
  userInput: string;
  correctAnswer: string;
  groups: string[];
  currentGroupIndex: number;
}

class KochTrainer {
  private audioSystem: AudioSystem;
  private state: LessonState = {
    currentLesson: 1,
    isPlaying: false,
    userInput: '',
    correctAnswer: '',
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
    this.state.userInput = '';
    this.state.correctAnswer = this.state.groups.join(' ');
    this.state.isPlaying = true;

    // AudioSystemの設定を更新
    this.audioSystem.updateSettings({
      frequency: settings.frequency,
      volume: settings.volume,
      wpm: settings.characterSpeed
    });

    this.renderPractice();

    // モールス信号を再生
    for (let i = 0; i < this.state.groups.length && this.state.isPlaying; i++) {
      const group = this.state.groups[i];
      const morse = MorseCode.textToMorse(group);
      await this.audioSystem.playMorseString(morse + ' /'); // グループ間に単語区切り

      this.state.currentGroupIndex = i + 1;
      this.updateProgress();
    }

    this.state.isPlaying = false;
    this.showResult();
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
      <div class="result ${passed ? 'passed' : 'failed'}">
        <h2>${passed ? '合格！' : '不合格'}</h2>
        <div class="accuracy">正答率: ${accuracy.toFixed(1)}%</div>
        <div class="comparison">
          <div>送信: ${this.state.correctAnswer}</div>
          <div>入力: ${this.state.userInput || '（未入力）'}</div>
        </div>
        <div class="actions">
          ${passed ? `<button class="btn primary" onclick="window.location.reload()">次のレッスンへ</button>` : ''}
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

    const correct = this.state.correctAnswer.replace(/\s/g, '');
    const input = this.state.userInput.replace(/\s/g, '');
    const maxLen = Math.max(correct.length, input.length);

    let matches = 0;
    for (let i = 0; i < maxLen; i++) {
      if (correct[i] === input[i]) matches++;
    }

    return (matches / maxLen) * 100;
  }

  private updateProgress(): void {
    const progressEl = document.getElementById('lessonProgress');
    if (progressEl) {
      const percent = (this.state.currentGroupIndex / this.state.groups.length) * 100;
      progressEl.textContent = `進行: ${this.state.currentGroupIndex}/${this.state.groups.length} (${percent.toFixed(0)}%)`;
    }
  }

  private showSettings(): void {
    const settings = KochSettings.getAll();
    const modal = document.createElement('div');
    modal.className = 'modal';
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
              <input type="checkbox" id="showInput" ${settings.showInput ? 'checked' : ''}>
              入力を表示
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button id="resetSettings" class="btn">デフォルトに戻す</button>
          <button id="saveSettings" class="btn primary">保存</button>
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

    // 保存
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

    // リセット
    document.getElementById('resetSettings')?.addEventListener('click', () => {
      if (confirm('設定をデフォルトに戻しますか？')) {
        KochSettings.reset();
        modal.remove();
        this.showSettings();
      }
    });

    // 閉じる
    document.getElementById('closeSettings')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const chars = getCharsForLesson(this.state.currentLesson);

    app.innerHTML = `
      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>コッホ法トレーニング</h1>
          <button id="settingsBtn" class="settings-btn">⚙️ 設定</button>
        </header>

        <div class="lesson-info">
          <h2>レッスン ${this.state.currentLesson} / 40</h2>
          <div class="chars">学習文字: ${chars.join(' ')}</div>
        </div>

        <div class="controls">
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
      </div>
    `;

    document.getElementById('backBtn')?.addEventListener('click', () => {
      window.location.href = './index.html';
    });

    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      this.showSettings();
    });

    document.getElementById('startBtn')?.addEventListener('click', () => {
      this.startLesson();
    });
  }

  private renderPractice(): void {
    const practiceContainer = document.getElementById('practiceContainer');
    if (!practiceContainer) return;

    const settings = KochSettings.getAll();
    const chars = getCharsForLesson(this.state.currentLesson);

    practiceContainer.innerHTML = `
      <div class="practice-area">
        <div id="lessonProgress" class="progress">準備中...</div>
        <textarea id="userInput" class="input-area" placeholder="聞こえた文字を入力..." ${settings.showInput ? '' : 'style="opacity: 0.3; pointer-events: none;"'}></textarea>
        ${this.renderKeyboard(chars)}
        <button id="stopBtn" class="btn">停止</button>
      </div>
    `;

    const inputEl = document.getElementById('userInput') as HTMLTextAreaElement;
    if (inputEl) {
      inputEl.addEventListener('input', (e) => {
        this.state.userInput = (e.target as HTMLTextAreaElement).value.toUpperCase();
      });
    }

    document.getElementById('stopBtn')?.addEventListener('click', () => {
      this.stopLesson();
    });

    // キーボードボタンのイベント設定
    this.setupKeyboardEvents(chars);
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
        <div class="keyboard-groups">
          ${groups.map((group, groupIndex) => `
            <div class="keyboard-group">
              <div class="group-label">G${groupIndex + 1}</div>
              <div class="group-keys">
                ${group.map(char => {
                  const isLearned = availableChars.includes(char);
                  return `
                    <button class="key-btn ${isLearned ? '' : 'disabled'}"
                            data-char="${char}"
                            ${isLearned ? '' : 'disabled'}>
                      ${char}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="keyboard-controls">
          <button id="spaceBtn" class="key-btn special">スペース</button>
          <button id="backspaceBtn" class="key-btn special">←削除</button>
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
      inputEl.value += ' ';
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
      if (e.key === ' ') {
        e.preventDefault();
        inputEl.value += ' ';
        this.state.userInput = inputEl.value.toUpperCase();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KochTrainer();
});

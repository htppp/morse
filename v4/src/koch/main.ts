/**
 * コッホ法トレーニングページ
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import { KOCH_SEQUENCE, getCharsForLesson, generateRandomGroups } from './koch-sequence';
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
    this.audioSystem = new AudioSystem({ frequency: 750, volume: 0.7, wpm: 20 });
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
    const chars = getCharsForLesson(this.state.currentLesson);
    this.state.groups = generateRandomGroups(chars, 5, 60);
    this.state.currentGroupIndex = 0;
    this.state.userInput = '';
    this.state.correctAnswer = this.state.groups.join(' ');
    this.state.isPlaying = true;

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

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const chars = getCharsForLesson(this.state.currentLesson);

    app.innerHTML = `
      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>コッホ法トレーニング</h1>
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

    document.getElementById('startBtn')?.addEventListener('click', () => {
      this.startLesson();
    });
  }

  private renderPractice(): void {
    const practiceContainer = document.getElementById('practiceContainer');
    if (!practiceContainer) return;

    practiceContainer.innerHTML = `
      <div class="practice-area">
        <div id="lessonProgress" class="progress">準備中...</div>
        <textarea id="userInput" class="input-area" placeholder="聞こえた文字を入力..."></textarea>
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KochTrainer();
});

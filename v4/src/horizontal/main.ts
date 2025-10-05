/**
 * 横振り電鍵練習ページ
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import './style.css';

class HorizontalKeyTrainer {
  private audioSystem: AudioSystem;
  private buffer: string = '';
  private sequence: string = '';
  private charTimer: number | null = null;
  private wordTimer: number | null = null;
  private wpm: number = 20;

  constructor() {
    this.audioSystem = new AudioSystem({ frequency: 750, volume: 0.7, wpm: this.wpm });
    this.render();
    this.setupEventListeners();
  }

  private getTimings() {
    const unit = 1200 / this.wpm;
    return {
      dot: unit,
      dash: unit * 3,
      charGap: unit * 4,
      wordGap: unit * 7,
    };
  }

  private clearTimers(): void {
    if (this.charTimer !== null) {
      clearTimeout(this.charTimer);
      this.charTimer = null;
    }
    if (this.wordTimer !== null) {
      clearTimeout(this.wordTimer);
      this.wordTimer = null;
    }
  }

  private setTimers(): void {
    this.clearTimers();
    const timings = this.getTimings();

    this.charTimer = window.setTimeout(() => {
      if (this.sequence) {
        this.buffer += this.sequence + ' ';
        this.sequence = '';
        this.updateDisplay();
      }
    }, timings.charGap);

    this.wordTimer = window.setTimeout(() => {
      if (this.sequence) {
        this.buffer += this.sequence + ' ';
        this.sequence = '';
      }
      if (!this.buffer.endsWith('/ ')) {
        this.buffer += '/ ';
      }
      this.updateDisplay();
    }, timings.wordGap);
  }

  private async sendDot(): Promise<void> {
    this.clearTimers();
    this.sequence += '.';
    this.updateDisplay();

    const timings = this.getTimings();
    await this.audioSystem.playMorseString('.');

    this.setTimers();
  }

  private async sendDash(): Promise<void> {
    this.clearTimers();
    this.sequence += '-';
    this.updateDisplay();

    const timings = this.getTimings();
    await this.audioSystem.playMorseString('-');

    this.setTimers();
  }

  private updateDisplay(): void {
    let display = '';
    if (this.buffer) {
      display = this.buffer.trim();
    }
    if (this.sequence) {
      if (display) display += ' ';
      display += `[${this.sequence}]`;
    }

    const morseDisplay = document.getElementById('morseDisplay');
    if (morseDisplay) {
      morseDisplay.textContent = display || '入力されたモールス信号';
    }

    this.updateDecoded();
  }

  private updateDecoded(): void {
    const sequences = this.buffer.trim().split(/\s+/);
    const decoded = MorseCode.morseSequencesToText(sequences);

    const decodedOutput = document.getElementById('decodedOutput');
    if (decodedOutput) {
      decodedOutput.textContent = decoded || '解読された文字';
    }
  }

  private clear(): void {
    this.buffer = '';
    this.sequence = '';
    this.clearTimers();
    this.updateDisplay();
  }

  private setupEventListeners(): void {
    // 左パドル（短点）
    const leftPaddle = document.getElementById('leftPaddle');
    if (leftPaddle) {
      leftPaddle.addEventListener('click', () => this.sendDot());
      leftPaddle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.sendDot();
      });
    }

    // 右パドル（長点）
    const rightPaddle = document.getElementById('rightPaddle');
    if (rightPaddle) {
      rightPaddle.addEventListener('click', () => this.sendDash());
      rightPaddle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.sendDash();
      });
    }

    // クリアボタン
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }

    // 戻るボタン
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = './index.html';
      });
    }

    // キーボードイベント
    document.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        this.sendDot();
      } else if (e.key === 'ArrowRight' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        this.sendDash();
      }
    });
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>横振り電鍵練習</h1>
        </header>

        <div class="paddle-container">
          <div id="leftPaddle" class="paddle left">
            <div class="paddle-label">左<br>（短点）</div>
          </div>
          <div class="paddle-divider"></div>
          <div id="rightPaddle" class="paddle right">
            <div class="paddle-label">右<br>（長点）</div>
          </div>
        </div>

        <div class="output-container">
          <div class="output-section">
            <h2>モールス信号</h2>
            <div id="morseDisplay" class="output-display">入力されたモールス信号</div>
          </div>

          <div class="output-section">
            <h2>解読された文字</h2>
            <div id="decodedOutput" class="output-display">解読された文字</div>
          </div>
        </div>

        <div class="controls">
          <button id="clearBtn" class="btn">クリア</button>
        </div>

        <div class="instructions">
          <h3>使い方</h3>
          <ul>
            <li>左パドル（または←キー、Zキー）: 短点「・」</li>
            <li>右パドル（または→キー、Xキー）: 長点「−」</li>
            <li>自動的にタイミング調整されます</li>
          </ul>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HorizontalKeyTrainer();
});

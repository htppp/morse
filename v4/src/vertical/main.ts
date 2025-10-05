/**
 * 縦振り電鍵練習ページ
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import './style.css';

class VerticalKeyTrainer {
  private audioSystem: AudioSystem;
  private keyDown: boolean = false;
  private keyDownTime: number = 0;
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

  private onKeyDown(): void {
    if (this.keyDown) return;

    this.keyDown = true;
    this.keyDownTime = Date.now();
    this.clearTimers();

    this.audioSystem.startContinuousTone();

    const keyElement = document.getElementById('morseKey');
    if (keyElement) {
      keyElement.classList.add('pressed');
    }
  }

  private onKeyUp(): void {
    if (!this.keyDown) return;

    this.keyDown = false;
    const duration = Date.now() - this.keyDownTime;

    this.audioSystem.stopContinuousTone();

    const timings = this.getTimings();
    const signal = duration < timings.dash ? '.' : '-';
    this.sequence += signal;
    this.updateDisplay();
    this.setTimers();

    const keyElement = document.getElementById('morseKey');
    if (keyElement) {
      keyElement.classList.remove('pressed');
    }
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
    // マウス/タッチイベント
    const morseKey = document.getElementById('morseKey');
    if (morseKey) {
      morseKey.addEventListener('mousedown', () => this.onKeyDown());
      morseKey.addEventListener('mouseup', () => this.onKeyUp());
      morseKey.addEventListener('mouseleave', () => {
        if (this.keyDown) {
          this.onKeyUp();
        }
      });

      morseKey.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onKeyDown();
      });
      morseKey.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.onKeyUp();
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
      if (e.repeat) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.onKeyDown();
      }
    });

    document.addEventListener('keyup', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.onKeyUp();
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
          <h1>縦振り電鍵練習</h1>
        </header>

        <div class="key-container">
          <div id="morseKey" class="morse-key">
            <div class="key-label">押す</div>
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
            <li>電鍵ボタンをクリック/タッチ、またはスペースキーを押して信号を送信</li>
            <li>短く押すと「・」（短点）、長く押すと「−」（長点）</li>
            <li>文字間は自動的に判定されます</li>
          </ul>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VerticalKeyTrainer();
});

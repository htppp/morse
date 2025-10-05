/**
 * 横振り電鍵練習ページ
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import { Settings } from '../shared/settings';
import './style.css';

class HorizontalKeyTrainer {
  private audioSystem: AudioSystem;
  private buffer: string = '';
  private sequence: string = '';
  private charTimer: number | null = null;
  private wordTimer: number | null = null;

  constructor() {
    Settings.load();
    const settings = Settings.getAll();
    this.audioSystem = new AudioSystem({
      frequency: settings.frequency,
      volume: settings.volume,
      wpm: settings.wpm
    });
    this.render();
    this.setupEventListeners();
    this.setupSettingsModal();
  }

  private getTimings() {
    const unit = 1200 / Settings.get('wpm');
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

  private setupSettingsModal(): void {
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsModal = document.getElementById('settingsModal');
    const settingsCancel = document.getElementById('settingsCancel');
    const settingsOK = document.getElementById('settingsOK');

    if (settingsIcon && settingsModal) {
      settingsIcon.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    if (settingsCancel && settingsModal) {
      settingsCancel.addEventListener('click', () => {
        settingsModal.classList.remove('active');
      });
    }

    if (settingsOK && settingsModal) {
      settingsOK.addEventListener('click', () => {
        this.applySettings();
        settingsModal.classList.remove('active');
      });
    }

    // モーダル外クリックで閉じる
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          settingsModal.classList.remove('active');
        }
      });
    }
  }

  private openSettingsModal(): void {
    const settings = Settings.getAll();

    const volumeRange = document.getElementById('volumeRange') as HTMLInputElement;
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
    const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;

    if (volumeRange) volumeRange.value = String(settings.volume * 100);
    if (volumeInput) volumeInput.value = String(Math.round(settings.volume * 100));
    if (frequencyInput) frequencyInput.value = String(settings.frequency);
    if (wpmInput) wpmInput.value = String(settings.wpm);

    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
      settingsModal.classList.add('active');
    }

    // イベントリスナー設定
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
  }

  private applySettings(): void {
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
    const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;

    if (volumeInput) {
      Settings.set('volume', parseInt(volumeInput.value) / 100);
    }
    if (frequencyInput) {
      Settings.set('frequency', parseInt(frequencyInput.value));
    }
    if (wpmInput) {
      Settings.set('wpm', parseInt(wpmInput.value));
    }

    // AudioSystemの設定を更新
    const settings = Settings.getAll();
    this.audioSystem.updateSettings({
      volume: settings.volume,
      frequency: settings.frequency,
      wpm: settings.wpm
    });
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const settings = Settings.getAll();

    app.innerHTML = `
      <div class="settings-icon" id="settingsIcon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>

      <div class="settings-modal" id="settingsModal">
        <div class="settings-content">
          <div class="settings-header">
            <h2>設定</h2>
          </div>
          <div class="settings-grid">
            <div class="setting-item">
              <label>音量</label>
              <div class="setting-row">
                <input type="range" id="volumeRange" min="0" max="100" value="${settings.volume * 100}">
                <input type="number" id="volumeInput" min="0" max="100" value="${Math.round(settings.volume * 100)}">
                <span>%</span>
              </div>
            </div>
            <div class="setting-item">
              <label>周波数 (Hz)</label>
              <div class="setting-row">
                <input type="number" id="frequencyInput" min="100" max="2000" value="${settings.frequency}" step="50">
              </div>
            </div>
            <div class="setting-item">
              <label>WPM (速度)</label>
              <div class="setting-row">
                <input type="number" id="wpmInput" min="1" max="999" value="${settings.wpm}">
              </div>
            </div>
          </div>
          <div class="settings-buttons">
            <button id="settingsCancel" class="btn btn-secondary">キャンセル</button>
            <button id="settingsOK" class="btn">OK</button>
          </div>
        </div>
      </div>

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
            <li>画面右上の設定アイコンから音量・周波数・速度を調整できます</li>
          </ul>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HorizontalKeyTrainer();
});

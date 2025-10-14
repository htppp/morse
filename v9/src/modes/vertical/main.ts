/**
 * 縦振り電鍵練習ページ（リファクタリング版）
 */

import { MorseCode } from '../../core/morse-code';
import { Settings } from '../../core/settings';
import { TrainerBase } from '../base/trainer-base';
import './style.css';

export class VerticalKeyTrainer extends TrainerBase {
  private keyDown: boolean = false;
  private keyDownTime: number = 0;

  constructor() {
    super();
    this.render();
    this.setupEventListeners();
    this.setupSettingsModal();
  }

  private onKeyDown(): void {
    if (this.keyDown) return;

    this.keyDown = true;
    this.keyDownTime = Date.now();
    this.clearAllTimers();

    this.audioSystem.startContinuousTone();

    const keyElement = this.getElement('morseKey');
    if (keyElement) {
      keyElement.classList.add('pressed');
    }
  }

  private onKeyUp(): void {
    if (!this.keyDown) return;

    this.keyDown = false;
    const duration = Date.now() - this.keyDownTime;

    this.audioSystem.stopContinuousTone();

    // dot/dashの判定（v8互換：dashを閾値として使用）
    const timings = this.getTimings(true);
    const signal = duration < timings.dash ? '.' : '-';
    this.bufferManager.addElement(signal);
    this.updateDisplay();
    this.setupCharWordTimers();

    const keyElement = this.getElement('morseKey');
    if (keyElement) {
      keyElement.classList.remove('pressed');
    }
  }

  /**
   * 文字確定・語間スペースタイマーを設定する
   */
  private setupCharWordTimers(): void {
    this.clearAllTimers();

    // 文字確定タイマー
    this.setCharTimer(() => {
      if (this.bufferManager.getSequence()) {
        this.bufferManager.commitSequence();
        this.updateDisplay();
      }
    });

    // 語間スペースタイマー
    this.setWordTimer(() => {
      if (this.bufferManager.getSequence()) {
        this.bufferManager.commitSequence();
      }
      this.bufferManager.addWordSeparator();
      this.updateDisplay();
    });
  }

  protected updateDisplay(): void {
    let display = '';
    const buffer = this.bufferManager.getBuffer();
    const sequence = this.bufferManager.getSequence();

    if (buffer) {
      display = buffer.trim();
    }
    if (sequence) {
      if (display) display += ' ';
      display += `[${sequence}]`;
    }

    const morseDisplay = this.getElement('morseDisplay');
    if (morseDisplay) {
      morseDisplay.textContent = display || '入力されたモールス信号';
    }

    this.updateDecoded();
  }

  private updateDecoded(): void {
    const buffer = this.bufferManager.getBuffer();
    const sequences = buffer.trim().split(/\s+/);
    const decoded = MorseCode.morseSequencesToText(sequences);

    const decodedOutput = this.getElement('decodedOutput');
    if (decodedOutput) {
      decodedOutput.textContent = decoded || '解読された文字';
    }
  }

  private clear(): void {
    this.clearBuffer();
    this.clearAllTimers();
    this.updateDisplay();
  }

  private setupEventListeners(): void {
    // マウス/タッチイベント
    const morseKey = this.getElement('morseKey');
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
    const clearBtn = this.getElement('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }

    // 戻るボタン
    const backBtn = this.getElement('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '#menu';
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

  private setupSettingsModal(): void {
    const settingsIcon = this.getElement('settingsIcon');
    const settingsModal = this.getElement('settingsModal');
    const settingsCancel = this.getElement('settingsCancel');
    const settingsOK = this.getElement('settingsOK');

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

    const volumeRange = this.getElement<HTMLInputElement>('volumeRange');
    const volumeInput = this.getElement<HTMLInputElement>('volumeInput');
    const frequencyInput = this.getElement<HTMLInputElement>('frequencyInput');
    const wpmInput = this.getElement<HTMLInputElement>('wpmInput');

    if (volumeRange) volumeRange.value = String(settings.volume * 100);
    if (volumeInput) volumeInput.value = String(Math.round(settings.volume * 100));
    if (frequencyInput) frequencyInput.value = String(settings.frequency);
    if (wpmInput) wpmInput.value = String(settings.wpm);

    const settingsModal = this.getElement('settingsModal');
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
    const volume = this.getInputNumber('volumeInput', 70) / 100;
    const frequency = this.getInputNumber('frequencyInput', 750);
    const wpm = this.getInputNumber('wpmInput', 20);

    Settings.set('volume', volume);
    Settings.set('frequency', frequency);
    Settings.set('wpm', wpm);

    // AudioSystemの設定を更新
    const settings = Settings.getAll();
    this.audioSystem.updateSettings({
      volume: settings.volume,
      frequency: settings.frequency,
      wpm: settings.wpm
    });
  }

  render(): void {
    const app = this.getElement('app');
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
            <li>画面右上の設定アイコンから音量・周波数・速度を調整できます</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * クリーンアップ処理
   */
  destroy(): void {
    // タイマーをクリア
    this.clearAllTimers();

    // イベントリスナーは自動的に削除される(要素がDOMから削除されるため)
    // AudioSystemは次のモードで再利用される可能性があるため、
    // ここでは音を停止するのみ
    this.audioSystem.stopContinuousTone();
  }
}

/**
 * 横振り電鍵練習ページ (v2からの完全移植)
 */

import { AudioSystem } from '../shared/audio-system';
import { MorseCode } from '../shared/morse-code';
import { Settings } from '../shared/settings';
import './style.css';

class HorizontalKeyTrainer {
  private audioSystem: AudioSystem;

  // パドル状態
  private leftDown: boolean = false;
  private rightDown: boolean = false;

  // バッファと表示
  private buffer: string = '';
  private sequence: string = '';

  // タイマー
  private charTimer: number | null = null;
  private wordTimer: number | null = null;

  // 自動送信状態
  private sending: boolean = false;
  private lastSent: '.' | '-' | null = null;
  private lastInputTime: number = 0;

  // Iambic B用の制御変数
  private dotReqCount: number = 0;
  private dashReqCount: number = 0;
  private forceNextElement: '.' | '-' | null = null;

  // Squeeze検出用
  private isSqueezing: boolean = false;
  private squeezeOccurred: boolean = false;
  private squeezeDetected: boolean = false;

  // 設定の一時保存用
  private savedSettings: any = null;

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
    this.updatePaddleLayout();
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

  /**
   * パドル要素を送信する
   */
  private sendPaddleElement(element: '.' | '-'): void {
    if (this.sending) return;

    this.sending = true;
    this.clearTimers();

    // 両方押されている場合、squeezeDetectedをリセット
    if (this.leftDown && this.rightDown) {
      this.squeezeDetected = false;
    }

    // 送信時間を計算
    const unit = 1200 / Settings.get('wpm');
    const duration = element === '.' ? unit : unit * 3;

    // 音を鳴らす
    this.audioSystem.scheduleTone(0, duration);

    // シーケンスに追加
    this.sequence += element;
    this.lastInputTime = Date.now();
    this.updateDisplay();

    this.lastSent = element;

    // Iambic B: 送信終了直前に次の要素を予約
    setTimeout(() => {
      const iambicMode = Settings.get('iambicMode');
      const bothPressed = this.leftDown && this.rightDown;

      // Iambic B: squeeze検出時、次の要素を予約
      if (iambicMode === 'B' && this.squeezeDetected && !this.forceNextElement) {
        if (element === '.') {
          this.forceNextElement = '-';
        } else if (element === '-') {
          this.forceNextElement = '.';
        }
      }

      // 両方押されている場合、次の要素を予約
      if (bothPressed && !this.forceNextElement) {
        if (element === '.') {
          this.forceNextElement = '-';
        } else if (element === '-') {
          this.forceNextElement = '.';
        }
      }
    }, duration - 5);

    // 送信終了後の処理
    setTimeout(() => {
      this.sending = false;

      // ボタンの状態を更新
      if (!this.leftDown) {
        const leftBtn = document.getElementById('paddleLeft');
        if (leftBtn) leftBtn.classList.remove('active');
      }
      if (!this.rightDown) {
        const rightBtn = document.getElementById('paddleRight');
        if (rightBtn) rightBtn.classList.remove('active');
      }

      // Squeezeインジケータを更新
      this.updateSqueezeIndicator();

      // 次の要素を送信
      if (this.forceNextElement) {
        this.scheduleNext();
      } else if (this.leftDown || this.rightDown) {
        this.scheduleNext();
      } else {
        this.setTimers();
      }
    }, duration + unit);
  }

  /**
   * 次の要素をスケジュールする
   */
  private scheduleNext(): void {
    const paddleLayout = Settings.get('paddleLayout');
    const isReversed = paddleLayout === 'reversed';

    if (this.forceNextElement) {
      const elem = this.forceNextElement;
      this.forceNextElement = null;
      this.sendPaddleElement(elem);
    } else if (this.leftDown && this.rightDown) {
      // 両方押されている場合、交互に送信
      const nextElem = this.lastSent === '.' ? '-' : '.';
      this.sendPaddleElement(nextElem);
    } else if (this.leftDown) {
      const elem = isReversed ? '-' : '.';
      this.sendPaddleElement(elem);
    } else if (this.rightDown) {
      const elem = isReversed ? '.' : '-';
      this.sendPaddleElement(elem);
    }
  }

  /**
   * Squeeze状態を更新
   */
  private updateSqueezeIndicator(): void {
    const squeezing = this.leftDown && this.rightDown;
    this.isSqueezing = squeezing;

    const indicator = document.getElementById('squeezeIndicator');
    if (indicator) {
      if (squeezing) {
        indicator.classList.add('active');
        this.squeezeOccurred = true;
      } else {
        indicator.classList.remove('active');
      }
    }
  }

  /**
   * 左パドル押下
   */
  private onLeftDown(): void {
    const iambicMode = Settings.get('iambicMode');
    this.leftDown = true;

    const leftBtn = document.getElementById('paddleLeft');
    if (leftBtn) leftBtn.classList.add('active');

    this.updateSqueezeIndicator();

    // Iambic B: 送信中に反対側が押されたら次の要素を予約
    if (iambicMode === 'B' && this.sending && this.rightDown) {
      const paddleLayout = Settings.get('paddleLayout');
      this.forceNextElement = paddleLayout === 'reversed' ? '-' : '.';
      this.squeezeDetected = true;
    }

    if (!this.sending) {
      const paddleLayout = Settings.get('paddleLayout');
      const elem = paddleLayout === 'reversed' ? '-' : '.';
      this.sendPaddleElement(elem);
    }
  }

  /**
   * 右パドル押下
   */
  private onRightDown(): void {
    const iambicMode = Settings.get('iambicMode');
    this.rightDown = true;

    const rightBtn = document.getElementById('paddleRight');
    if (rightBtn) rightBtn.classList.add('active');

    this.updateSqueezeIndicator();

    // Iambic B: 送信中に反対側が押されたら次の要素を予約
    if (iambicMode === 'B' && this.sending && this.leftDown) {
      const paddleLayout = Settings.get('paddleLayout');
      this.forceNextElement = paddleLayout === 'reversed' ? '.' : '-';
      this.squeezeDetected = true;
    }

    if (!this.sending) {
      const paddleLayout = Settings.get('paddleLayout');
      const elem = paddleLayout === 'reversed' ? '.' : '-';
      this.sendPaddleElement(elem);
    }
  }

  /**
   * 左パドル解放
   */
  private onLeftUp(): void {
    this.leftDown = false;
    this.dashReqCount = 0;

    const leftBtn = document.getElementById('paddleLeft');
    if (leftBtn) leftBtn.classList.remove('active');

    this.updateSqueezeIndicator();

    // Iambic B: squeeze中に片方を離した場合
    const iambicMode = Settings.get('iambicMode');
    if (iambicMode === 'B' && this.isSqueezing && this.rightDown && !this.sending) {
      setTimeout(() => {
        if (this.rightDown && !this.sending) {
          const paddleLayout = Settings.get('paddleLayout');
          const elem = paddleLayout === 'reversed' ? '.' : '-';
          this.sendPaddleElement(elem);
        }
      }, 10);
    }
  }

  /**
   * 右パドル解放
   */
  private onRightUp(): void {
    this.rightDown = false;
    this.dotReqCount = 0;

    const rightBtn = document.getElementById('paddleRight');
    if (rightBtn) rightBtn.classList.remove('active');

    this.updateSqueezeIndicator();

    const iambicMode = Settings.get('iambicMode');

    // Iambic B: squeeze中に片方を離した場合
    if (iambicMode === 'B' && this.isSqueezing && this.leftDown && !this.sending) {
      setTimeout(() => {
        if (this.leftDown && !this.sending) {
          const paddleLayout = Settings.get('paddleLayout');
          const elem = paddleLayout === 'reversed' ? '-' : '.';
          this.sendPaddleElement(elem);
        }
      }, 10);
    }

    // 両方離された場合
    if (!this.leftDown && !this.rightDown && this.squeezeOccurred) {
      // Iambic B: 長点の後に短点を追加
      if (iambicMode === 'B' && this.lastSent === '-') {
        if (this.sending) {
          this.dotReqCount++;
        } else {
          const paddleLayout = Settings.get('paddleLayout');
          const elem = paddleLayout === 'reversed' ? '-' : '.';
          this.sendPaddleElement(elem);
        }
      }
      this.squeezeOccurred = false;
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

    const morseDisplay = document.getElementById('paddleMorseDisplay');
    if (morseDisplay) {
      morseDisplay.textContent = display || '入力されたモールス信号';
    }

    this.updateDecoded();
  }

  private updateDecoded(): void {
    const sequences = this.buffer.trim().split(/\s+/);
    const decoded = MorseCode.morseSequencesToText(sequences);

    const decodedOutput = document.getElementById('paddleDecoded');
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

  /**
   * パドルレイアウトの表示を更新
   */
  private updatePaddleLayout(): void {
    const paddleLayout = Settings.get('paddleLayout');
    const leftBtn = document.getElementById('paddleLeft');
    const rightBtn = document.getElementById('paddleRight');

    if (!leftBtn || !rightBtn) return;

    if (paddleLayout === 'reversed') {
      leftBtn.innerHTML = '<div class="paddle-label">左<br>（長点）</div>';
      rightBtn.innerHTML = '<div class="paddle-label">右<br>（短点）</div>';
    } else {
      leftBtn.innerHTML = '<div class="paddle-label">左<br>（短点）</div>';
      rightBtn.innerHTML = '<div class="paddle-label">右<br>（長点）</div>';
    }
  }

  private setupEventListeners(): void {
    let mouseLeftDown = false;
    let mouseRightDown = false;
    let touchLeftDown = false;
    let touchRightDown = false;

    // 左パドル
    const leftPaddle = document.getElementById('paddleLeft');
    if (leftPaddle) {
      // マウスイベント
      leftPaddle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!mouseLeftDown) {
          mouseLeftDown = true;
          this.onLeftDown();
        }
      });
      leftPaddle.addEventListener('mouseup', (e) => {
        e.preventDefault();
        if (mouseLeftDown) {
          mouseLeftDown = false;
          this.onLeftUp();
        }
      });

      // タッチイベント
      leftPaddle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!touchLeftDown) {
          touchLeftDown = true;
          this.onLeftDown();
        }
      }, { passive: false });
      leftPaddle.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (touchLeftDown) {
          touchLeftDown = false;
          this.onLeftUp();
        }
      }, { passive: false });
    }

    // 右パドル
    const rightPaddle = document.getElementById('paddleRight');
    if (rightPaddle) {
      // マウスイベント
      rightPaddle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!mouseRightDown) {
          mouseRightDown = true;
          this.onRightDown();
        }
      });
      rightPaddle.addEventListener('mouseup', (e) => {
        e.preventDefault();
        if (mouseRightDown) {
          mouseRightDown = false;
          this.onRightUp();
        }
      });

      // タッチイベント
      rightPaddle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!touchRightDown) {
          touchRightDown = true;
          this.onRightDown();
        }
      }, { passive: false });
      rightPaddle.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (touchRightDown) {
          touchRightDown = false;
          this.onRightUp();
        }
      }, { passive: false });
    }

    // マウスが離れた場合
    document.addEventListener('mouseup', () => {
      if (mouseLeftDown) {
        mouseLeftDown = false;
        this.onLeftUp();
      }
      if (mouseRightDown) {
        mouseRightDown = false;
        this.onRightUp();
      }
    });

    // タッチが離れた場合
    document.addEventListener('touchend', () => {
      if (touchLeftDown) {
        touchLeftDown = false;
        this.onLeftUp();
      }
      if (touchRightDown) {
        touchRightDown = false;
        this.onRightUp();
      }
    }, { passive: false });

    // クリアボタン
    const clearBtn = document.getElementById('paddleClear');
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

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        this.onLeftDown();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        this.onRightDown();
      }
    });

    document.addEventListener('keyup', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        this.onLeftUp();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        this.onRightUp();
      }
    });
  }

  private setupSettingsModal(): void {
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsModal = document.getElementById('settingsModal');
    const settingsCancel = document.getElementById('settingsCancel');
    const settingsOK = document.getElementById('settingsOK');
    const closeBtn = document.getElementById('closeSettings');

    if (settingsIcon && settingsModal) {
      settingsIcon.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    if (settingsCancel && settingsModal) {
      settingsCancel.addEventListener('click', () => {
        this.restoreSettings();
        settingsModal.classList.remove('active');
      });
    }

    if (settingsOK && settingsModal) {
      settingsOK.addEventListener('click', () => {
        this.applySettings();
        settingsModal.classList.remove('active');
      });
    }

    if (closeBtn && settingsModal) {
      closeBtn.addEventListener('click', () => {
        this.restoreSettings();
        settingsModal.classList.remove('active');
      });
    }

    // モーダル外クリックで閉じる
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          this.restoreSettings();
          settingsModal.classList.remove('active');
        }
      });
    }
  }

  private openSettingsModal(): void {
    // 現在の設定を保存
    this.savedSettings = Settings.getAll();

    const settings = Settings.getAll();

    const volumeRange = document.getElementById('volumeRange') as HTMLInputElement;
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
    const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;
    const iambicMode = document.getElementById('iambicMode') as HTMLInputElement;
    const paddleLayout = document.getElementById('paddleLayout') as HTMLInputElement;

    if (volumeRange) volumeRange.value = String(settings.volume * 100);
    if (volumeInput) volumeInput.value = String(Math.round(settings.volume * 100));
    if (frequencyInput) frequencyInput.value = String(settings.frequency);
    if (wpmInput) wpmInput.value = String(settings.wpm);
    if (iambicMode) iambicMode.checked = settings.iambicMode === 'B';
    if (paddleLayout) paddleLayout.checked = settings.paddleLayout === 'reversed';

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

    // Iambic A/Bモードの変更イベント
    if (iambicMode) {
      iambicMode.onchange = () => {
        this.updateIambicModeStatus();
      };
    }

    // パドルレイアウトの変更イベント
    if (paddleLayout) {
      paddleLayout.onchange = () => {
        this.updatePaddleLayoutStatus();
      };
    }

    this.updateIambicModeStatus();
    this.updatePaddleLayoutStatus();
  }

  private restoreSettings(): void {
    if (this.savedSettings) {
      Settings.set('volume', this.savedSettings.volume);
      Settings.set('frequency', this.savedSettings.frequency);
      Settings.set('wpm', this.savedSettings.wpm);
      Settings.set('iambicMode', this.savedSettings.iambicMode);
      Settings.set('paddleLayout', this.savedSettings.paddleLayout);

      this.audioSystem.updateSettings({
        volume: this.savedSettings.volume,
        frequency: this.savedSettings.frequency,
        wpm: this.savedSettings.wpm
      });

      this.updatePaddleLayout();
      this.savedSettings = null;
    }
  }

  private applySettings(): void {
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    const frequencyInput = document.getElementById('frequencyInput') as HTMLInputElement;
    const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;
    const iambicMode = document.getElementById('iambicMode') as HTMLInputElement;
    const paddleLayout = document.getElementById('paddleLayout') as HTMLInputElement;

    if (volumeInput) {
      Settings.set('volume', parseInt(volumeInput.value) / 100);
    }
    if (frequencyInput) {
      Settings.set('frequency', parseInt(frequencyInput.value));
    }
    if (wpmInput) {
      Settings.set('wpm', parseInt(wpmInput.value));
    }
    if (iambicMode) {
      Settings.set('iambicMode', iambicMode.checked ? 'B' : 'A');
    }
    if (paddleLayout) {
      Settings.set('paddleLayout', paddleLayout.checked ? 'reversed' : 'normal');
    }

    // AudioSystemの設定を更新
    const settings = Settings.getAll();
    this.audioSystem.updateSettings({
      volume: settings.volume,
      frequency: settings.frequency,
      wpm: settings.wpm
    });

    // パドルレイアウトを更新
    this.updatePaddleLayout();

    this.savedSettings = null;
  }

  private updateIambicModeStatus(): void {
    const iambicMode = document.getElementById('iambicMode') as HTMLInputElement;
    const status = document.getElementById('iambicModeStatus');
    if (status && iambicMode) {
      status.textContent = iambicMode.checked ? '(現在: Iambic B)' : '(現在: Iambic A)';
    }
  }

  private updatePaddleLayoutStatus(): void {
    const paddleLayout = document.getElementById('paddleLayout') as HTMLInputElement;
    const status = document.getElementById('paddleLayoutStatus');
    if (status && paddleLayout) {
      status.textContent = paddleLayout.checked ? '(現在: 左:長点 / 右:短点)' : '(現在: 左:短点 / 右:長点)';
    }
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
            <button class="close-btn" id="closeSettings">×</button>
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
            <div class="setting-item">
              <label>Iambic A/B モード <span id="iambicModeStatus">(現在: Iambic ${settings.iambicMode})</span></label>
              <div class="setting-row">
                <div class="toggle-switch">
                  <input type="checkbox" id="iambicMode" class="toggle-input" ${settings.iambicMode === 'B' ? 'checked' : ''}>
                  <label for="iambicMode" class="toggle-label">
                    <span class="toggle-switch-handle"></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="setting-item">
              <label>横振りパドル配置 <span id="paddleLayoutStatus">(現在: ${settings.paddleLayout === 'reversed' ? '左:長点 / 右:短点' : '左:短点 / 右:長点'})</span></label>
              <div class="setting-row">
                <div class="toggle-switch">
                  <input type="checkbox" id="paddleLayout" class="toggle-input" ${settings.paddleLayout === 'reversed' ? 'checked' : ''}>
                  <label for="paddleLayout" class="toggle-label">
                    <span class="toggle-switch-handle"></span>
                  </label>
                </div>
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
          <button class="paddle-key paddle-left" id="paddleLeft">
            <div class="paddle-label">左<br>（短点）</div>
          </button>
          <button class="paddle-key paddle-right" id="paddleRight">
            <div class="paddle-label">右<br>（長点）</div>
          </button>
        </div>

        <div class="keyboard-hint">
          キーボード: J / K
        </div>

        <div class="squeeze-indicator" id="squeezeIndicator">
          ⚡squeeze⚡
        </div>

        <div class="morse-display" id="paddleMorseDisplay">入力されたモールス信号</div>
        <div class="decoded-output" id="paddleDecoded">解読された文字</div>

        <div style="text-align: center; margin-top: 20px;">
          <button id="paddleClear" class="btn">クリア</button>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HorizontalKeyTrainer();
});

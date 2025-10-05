/**
 * 設定モーダル
 */

import { Settings } from './settings';
import { AudioSystem } from './audio-system';
import { MorseCode } from './morse-code';

export class SettingsModal {
  private modal: HTMLElement | null = null;
  private isOpen: boolean = false;
  private isPlaying: boolean = false;
  private playbackTimeoutId: number | null = null;
  private savedSettings: { volume: number; frequency: number; wpm: number } | null = null;

  constructor() {
    this.createModal();
    this.attachEventListeners();

    // 設定変更時にUIを更新
    Settings.addListener(() => this.updateUI());
  }

  /**
   * モーダルを作成
   */
  private createModal(): void {
    // モーダル要素を作成
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'settingsModal';

    const settings = Settings.getAll();

    modal.innerHTML = `
      <div class="settings-content">
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-row">
              <label>音量</label>
              <span class="spacer"></span>
              <input type="range" id="volumeRange" min="0" max="100" value="${settings.volume * 100}" style="width: 50%;">
              <input type="number" id="volumeInput" min="0" max="100" value="${Math.round(settings.volume * 100)}">
              <span class="input-suffix">%</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-row">
              <label>周波数 (Hz)</label>
              <span class="spacer"></span>
              <span class="spacer"></span>
              <input type="number" id="globalFrequency" min="400" max="1200" value="${settings.frequency}" step="50">
              <span class="input-suffix"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-row">
              <label>WPM (速度: 5-40)</label>
              <span class="spacer"></span>
              <span class="spacer"></span>
              <input type="number" id="globalWPM" min="5" max="40" value="${settings.wpm}">
              <span class="input-suffix"></span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-row">
              <label>テスト再生</label>
              <span class="spacer"></span>
              <span class="spacer"></span>
              <button id="testMorseBtn" style="min-width: 100px;">再生</button>
              <span class="input-suffix"></span>
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
          <button id="settingsReset" style="min-width: 120px; padding: 10px 20px; background: linear-gradient(135deg, #888 0%, #666 100%); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; transition: all .3s ease;">Cancel</button>
          <button id="settingsOK" style="min-width: 120px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; transition: all .3s ease;">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  }

  /**
   * モーダルを開く
   */
  open(): void {
    if (this.modal) {
      // 現在の設定を保存
      const current = Settings.getAll();
      this.savedSettings = {
        volume: current.volume,
        frequency: current.frequency,
        wpm: current.wpm
      };

      this.modal.classList.add('active');
      this.isOpen = true;
      this.updateUI();
    }
  }

  /**
   * モーダルを閉じる
   */
  close(saveChanges: boolean = false): void {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.isOpen = false;

      if (saveChanges) {
        // OKボタンで閉じた場合のみ保存
        Settings.save();
      } else {
        // キャンセルの場合は設定を復元
        if (this.savedSettings) {
          Settings.set('volume', this.savedSettings.volume);
          Settings.set('frequency', this.savedSettings.frequency);
          Settings.set('wpm', this.savedSettings.wpm);
        }
      }

      this.savedSettings = null;

      // 再生中の場合は停止
      if (this.isPlaying) {
        AudioSystem.stopAllScheduledTones();

        // タイムアウトをキャンセル
        if (this.playbackTimeoutId !== null) {
          clearTimeout(this.playbackTimeoutId);
          this.playbackTimeoutId = null;
        }

        this.isPlaying = false;
        this.updateTestButton();
      }
    }
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    if (!this.modal || !this.isOpen) return;

    const settings = Settings.getAll();

    // 音量
    const volumeRange = this.modal.querySelector('#volumeRange') as HTMLInputElement;
    const volumeInput = this.modal.querySelector('#volumeInput') as HTMLInputElement;
    if (volumeRange && volumeInput) {
      volumeRange.value = String(settings.volume * 100);
      volumeInput.value = String(Math.round(settings.volume * 100));
    }

    // 周波数
    const frequencyInput = this.modal.querySelector('#globalFrequency') as HTMLInputElement;
    if (frequencyInput) {
      frequencyInput.value = String(settings.frequency);
    }

    // WPM
    const wpmInput = this.modal.querySelector('#globalWPM') as HTMLInputElement;
    if (wpmInput) {
      wpmInput.value = String(settings.wpm);
    }
  }

  /**
   * イベントリスナーを設定
   */
  private attachEventListeners(): void {
    if (!this.modal) return;

    // モーダル背景クリックで閉じる
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // 音量スライダー
    const volumeRange = this.modal.querySelector('#volumeRange') as HTMLInputElement;
    const volumeInput = this.modal.querySelector('#volumeInput') as HTMLInputElement;

    if (volumeRange) {
      volumeRange.addEventListener('input', () => {
        const value = parseInt(volumeRange.value, 10) / 100;
        Settings.set('volume', value);
        if (volumeInput) {
          volumeInput.value = volumeRange.value;
        }
      });
    }

    if (volumeInput) {
      volumeInput.addEventListener('input', () => {
        const value = parseInt(volumeInput.value, 10) / 100;
        Settings.set('volume', Math.max(0, Math.min(1, value)));
        if (volumeRange) {
          volumeRange.value = volumeInput.value;
        }
      });
    }

    // 周波数
    const frequencyInput = this.modal.querySelector('#globalFrequency') as HTMLInputElement;
    if (frequencyInput) {
      frequencyInput.addEventListener('input', () => {
        const value = parseInt(frequencyInput.value, 10);
        Settings.set('frequency', Math.max(400, Math.min(1200, value)));
      });
    }

    // WPM
    const wpmInput = this.modal.querySelector('#globalWPM') as HTMLInputElement;
    if (wpmInput) {
      wpmInput.addEventListener('input', () => {
        const value = parseInt(wpmInput.value, 10);
        Settings.set('wpm', Math.max(5, Math.min(40, value)));
      });
    }

    // テスト再生ボタン
    const testBtn = this.modal.querySelector('#testMorseBtn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.playTestMorse();
      });
    }

    // Cancelボタン
    const cancelBtn = this.modal.querySelector('#settingsReset');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // OKボタン
    const okBtn = this.modal.querySelector('#settingsOK');
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        this.close(true);
      });
    }
  }

  /**
   * テスト用モールス符号を再生/停止
   */
  private async playTestMorse(): Promise<void> {
    if (this.isPlaying) {
      // 再生中の場合は停止
      AudioSystem.stopAllScheduledTones();

      // タイムアウトをキャンセル
      if (this.playbackTimeoutId !== null) {
        clearTimeout(this.playbackTimeoutId);
        this.playbackTimeoutId = null;
      }

      this.isPlaying = false;
      this.updateTestButton();
      return;
    }

    try {
      this.isPlaying = true;
      this.updateTestButton();

      AudioSystem.ensureAudioContext();
      const morseSequence = MorseCode.textToMorse('CQ');
      if (morseSequence) {
        await this.playMorseSequence(morseSequence);
      }

      // 再生が正常終了した場合のみ停止状態に戻す
      if (this.isPlaying) {
        this.isPlaying = false;
        this.updateTestButton();
      }
    } catch (error) {
      console.error('Error playing test morse:', error);
      this.isPlaying = false;
      this.updateTestButton();
    }
  }

  /**
   * テストボタンのテキストと見た目を更新
   */
  private updateTestButton(): void {
    const testBtn = this.modal?.querySelector('#testMorseBtn');
    if (testBtn) {
      testBtn.textContent = this.isPlaying ? '停止' : '再生';
      if (this.isPlaying) {
        testBtn.classList.add('playing');
      } else {
        testBtn.classList.remove('playing');
      }
    }
  }

  /**
   * モールスシーケンスを再生
   */
  private async playMorseSequence(morseSequence: string): Promise<void> {
    const context = (AudioSystem as any).audioContext;
    if (!context) return;

    const wpm = Settings.get('wpm');
    const unit = 1200 / wpm; // v2と同じ計算方式
    let currentTime = context.currentTime;
    const startTime = currentTime;

    for (const char of morseSequence) {
      if (char === '.') {
        AudioSystem.scheduleTone(currentTime, unit);
        currentTime += (unit + unit) / 1000;
      } else if (char === '-') {
        AudioSystem.scheduleTone(currentTime, unit * 3);
        currentTime += (unit * 3 + unit) / 1000;
      } else if (char === ' ') {
        currentTime += (unit * 3) / 1000;
      } else if (char === '/') {
        currentTime += (unit * 7) / 1000;
      }
    }

    // 再生時間を計算して待機
    const duration = (currentTime - startTime) * 1000;
    await new Promise<void>(resolve => {
      this.playbackTimeoutId = window.setTimeout(() => {
        this.playbackTimeoutId = null;
        resolve();
      }, duration);
    });
  }
}

/**
 * 設定パネル
 */

import { Settings } from './settings';
import { AudioSystem } from './audio-system';
import { MorseCode } from './morse-code';

export class SettingsPanel {
  constructor(private container: HTMLElement) {
    this.render();
    this.attachEventListeners();

    // 設定変更時にUIを更新
    Settings.addListener(() => this.updateUI());
  }

  /**
   * UIをレンダリング
   */
  private render(): void {
    const settings = Settings.getAll();

    this.container.innerHTML = `
      <div class="settings-panel">
        <h2>設定</h2>

        <div class="settings-section">
          <h3>音声設定</h3>

          <div class="setting-item">
            <label for="volume-range">音量</label>
            <div class="setting-control">
              <input
                type="range"
                id="volume-range"
                min="0"
                max="100"
                value="${settings.volume * 100}"
                class="setting-range"
              >
              <input
                type="number"
                id="volume-input"
                min="0"
                max="100"
                value="${Math.round(settings.volume * 100)}"
                class="setting-number"
              >
              <span class="setting-unit">%</span>
            </div>
          </div>

          <div class="setting-item">
            <label for="frequency-input">周波数</label>
            <div class="setting-control">
              <input
                type="range"
                id="frequency-range"
                min="400"
                max="1200"
                step="50"
                value="${settings.frequency}"
                class="setting-range"
              >
              <input
                type="number"
                id="frequency-input"
                min="400"
                max="1200"
                step="50"
                value="${settings.frequency}"
                class="setting-number"
              >
              <span class="setting-unit">Hz</span>
            </div>
          </div>

          <div class="setting-item">
            <label for="wpm-input">速度 (WPM)</label>
            <div class="setting-control">
              <input
                type="range"
                id="wpm-range"
                min="5"
                max="40"
                step="1"
                value="${settings.wpm}"
                class="setting-range"
              >
              <input
                type="number"
                id="wpm-input"
                min="5"
                max="40"
                step="1"
                value="${settings.wpm}"
                class="setting-number"
              >
              <span class="setting-unit">WPM</span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>テスト再生</h3>
          <div class="test-section">
            <button id="test-morse-btn" class="control-button">
              ♪ テスト再生 (CQ)
            </button>
            <p class="test-description">
              現在の設定でモールス符号を再生します
            </p>
          </div>
        </div>

        <div class="settings-actions">
          <button id="reset-settings-btn" class="secondary-button">
            デフォルトに戻す
          </button>
          <button id="save-settings-btn" class="primary-button">
            設定を保存
          </button>
        </div>

        <div class="settings-info">
          <h3>設定について</h3>
          <ul>
            <li><strong>音量:</strong> モールス信号の音量を調整します (0-100%)</li>
            <li><strong>周波数:</strong> モールス信号の音の高さを調整します (400-1200Hz)</li>
            <li><strong>速度 (WPM):</strong> モールス符号の再生速度を調整します (5-40 WPM)</li>
          </ul>
          <p class="settings-note">
            設定は自動的にブラウザに保存されます。
          </p>
        </div>
      </div>
    `;
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    const settings = Settings.getAll();

    // 音量
    const volumeRange = this.container.querySelector('#volume-range') as HTMLInputElement;
    const volumeInput = this.container.querySelector('#volume-input') as HTMLInputElement;
    if (volumeRange && volumeInput) {
      volumeRange.value = String(settings.volume * 100);
      volumeInput.value = String(Math.round(settings.volume * 100));
    }

    // 周波数
    const frequencyRange = this.container.querySelector('#frequency-range') as HTMLInputElement;
    const frequencyInput = this.container.querySelector('#frequency-input') as HTMLInputElement;
    if (frequencyRange && frequencyInput) {
      frequencyRange.value = String(settings.frequency);
      frequencyInput.value = String(settings.frequency);
    }

    // WPM
    const wpmRange = this.container.querySelector('#wpm-range') as HTMLInputElement;
    const wpmInput = this.container.querySelector('#wpm-input') as HTMLInputElement;
    if (wpmRange && wpmInput) {
      wpmRange.value = String(settings.wpm);
      wpmInput.value = String(settings.wpm);
    }
  }

  /**
   * イベントリスナーを設定
   */
  private attachEventListeners(): void {
    // 音量スライダー
    const volumeRange = this.container.querySelector('#volume-range') as HTMLInputElement;
    const volumeInput = this.container.querySelector('#volume-input') as HTMLInputElement;

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

    // 周波数スライダー
    const frequencyRange = this.container.querySelector('#frequency-range') as HTMLInputElement;
    const frequencyInput = this.container.querySelector('#frequency-input') as HTMLInputElement;

    if (frequencyRange) {
      frequencyRange.addEventListener('input', () => {
        const value = parseInt(frequencyRange.value, 10);
        Settings.set('frequency', value);
        if (frequencyInput) {
          frequencyInput.value = String(value);
        }
      });
    }

    if (frequencyInput) {
      frequencyInput.addEventListener('input', () => {
        const value = parseInt(frequencyInput.value, 10);
        Settings.set('frequency', Math.max(400, Math.min(1200, value)));
        if (frequencyRange) {
          frequencyRange.value = String(value);
        }
      });
    }

    // WPMスライダー
    const wpmRange = this.container.querySelector('#wpm-range') as HTMLInputElement;
    const wpmInput = this.container.querySelector('#wpm-input') as HTMLInputElement;

    if (wpmRange) {
      wpmRange.addEventListener('input', () => {
        const value = parseInt(wpmRange.value, 10);
        Settings.set('wpm', value);
        if (wpmInput) {
          wpmInput.value = String(value);
        }
      });
    }

    if (wpmInput) {
      wpmInput.addEventListener('input', () => {
        const value = parseInt(wpmInput.value, 10);
        Settings.set('wpm', Math.max(5, Math.min(40, value)));
        if (wpmRange) {
          wpmRange.value = String(value);
        }
      });
    }

    // テスト再生ボタン
    const testBtn = this.container.querySelector('#test-morse-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.playTestMorse();
      });
    }

    // リセットボタン
    const resetBtn = this.container.querySelector('#reset-settings-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('設定をデフォルトに戻しますか？')) {
          Settings.reset();
        }
      });
    }

    // 保存ボタン
    const saveBtn = this.container.querySelector('#save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        Settings.save();
        this.showSaveMessage();
      });
    }
  }

  /**
   * テスト用モールス符号を再生
   */
  private async playTestMorse(): Promise<void> {
    try {
      AudioSystem.ensureAudioContext();
      const morseSequence = MorseCode.textToMorse('CQ');
      if (morseSequence) {
        await this.playMorseSequence(morseSequence);
      }
    } catch (error) {
      console.error('Error playing test morse:', error);
    }
  }

  /**
   * モールスシーケンスを再生
   */
  private async playMorseSequence(morseSequence: string): Promise<void> {
    const context = (AudioSystem as any).audioContext;
    if (!context) return;

    const wpm = Settings.get('wpm');
    const dotDuration = 60 / (wpm * 5); // WPMから1ドットの長さを計算
    let currentTime = context.currentTime;

    for (const char of morseSequence) {
      if (char === '.') {
        AudioSystem.scheduleTone(currentTime, dotDuration * 1000);
        currentTime += dotDuration + dotDuration * 0.3;
      } else if (char === '-') {
        AudioSystem.scheduleTone(currentTime, dotDuration * 3 * 1000);
        currentTime += dotDuration * 3 + dotDuration * 0.3;
      } else if (char === ' ') {
        currentTime += dotDuration * 3;
      } else if (char === '/') {
        currentTime += dotDuration * 7;
      }
    }
  }

  /**
   * 保存完了メッセージを表示
   */
  private showSaveMessage(): void {
    const saveBtn = this.container.querySelector('#save-settings-btn');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✓ 保存しました';
      saveBtn.classList.add('saved');

      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.classList.remove('saved');
      }, 2000);
    }
  }
}

/**
 * コッホ法トレーニング専用設定管理モジュール
 */

export interface KochSettingsData {
  // 速度設定
  characterSpeed: number;  // 文字速度 (WPM)
  effectiveSpeed: number;  // 実効速度 (WPM)

  // 音響設定
  frequency: number;       // 周波数 (Hz)
  volume: number;          // 音量 (0-1)

  // キーボード設定
  groupSize: number;       // グループサイズ (3-10文字)
  displayMode: 'fixed' | 'scroll';  // 表示方式

  // 練習設定
  practiceDuration: number; // 練習時間（秒）
  showInput: boolean;      // 入力表示
}

export class KochSettings {
  private static defaultSettings: KochSettingsData = {
    characterSpeed: 20,
    effectiveSpeed: 20,
    frequency: 750,
    volume: 0.7,
    groupSize: 9,
    displayMode: 'fixed',
    practiceDuration: 60,
    showInput: true,
  };

  private static settings: KochSettingsData = { ...KochSettings.defaultSettings };

  static get<K extends keyof KochSettingsData>(key: K): KochSettingsData[K] {
    return this.settings[key];
  }

  static set<K extends keyof KochSettingsData>(key: K, value: KochSettingsData[K]): void {
    this.settings[key] = value;
    this.save();
  }

  static load(): void {
    try {
      const saved = localStorage.getItem('v4.koch.settings');
      if (saved) {
        this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load Koch settings:', error);
    }
  }

  static save(): void {
    try {
      localStorage.setItem('v4.koch.settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save Koch settings:', error);
    }
  }

  static getAll(): KochSettingsData {
    return { ...this.settings };
  }

  static reset(): void {
    this.settings = { ...this.defaultSettings };
    this.save();
  }
}

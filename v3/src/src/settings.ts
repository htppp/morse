/**
 * 設定管理モジュール
 */

interface SettingsData {
  volume: number;      // 音量 (0.0 - 1.0)
  frequency: number;   // 周波数 (Hz)
  wpm: number;         // Words Per Minute
}

export class Settings {
  private static defaultSettings: SettingsData = {
    volume: 0.3,
    frequency: 800,
    wpm: 20,
  };

  private static settings: SettingsData = { ...Settings.defaultSettings };
  private static listeners: Set<() => void> = new Set();

  /**
   * 設定値の取得
   */
  static get<K extends keyof SettingsData>(key: K): SettingsData[K] {
    return this.settings[key];
  }

  /**
   * 設定値の設定
   */
  static set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    this.settings[key] = value;
    this.notifyListeners();
  }

  /**
   * 全設定を取得
   */
  static getAll(): SettingsData {
    return { ...this.settings };
  }

  /**
   * 設定の読み込み
   */
  static load(): void {
    try {
      const saved = localStorage.getItem('morseSettings');
      if (saved) {
        this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
      } else {
        this.settings = { ...this.defaultSettings };
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...this.defaultSettings };
    }
  }

  /**
   * 設定の保存
   */
  static save(): void {
    try {
      localStorage.setItem('morseSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * デフォルト設定にリセット
   */
  static reset(): void {
    this.settings = { ...this.defaultSettings };
    this.save();
    this.notifyListeners();
  }

  /**
   * 変更通知のリスナーを追加
   */
  static addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  /**
   * リスナーを削除
   */
  static removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 全リスナーに通知
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// アプリ起動時に設定を読み込む
Settings.load();

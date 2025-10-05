/**
 * 設定管理モジュール
 */

interface SettingsData {
  volume: number;
  frequency: number;
  wpm: number;
}

export class Settings {
  private static defaultSettings: SettingsData = {
    volume: 0.7,
    frequency: 750,
    wpm: 20,
  };

  private static settings: SettingsData = { ...Settings.defaultSettings };

  static get<K extends keyof SettingsData>(key: K): SettingsData[K] {
    return this.settings[key];
  }

  static set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    this.settings[key] = value;
    this.save();
  }

  static load(): void {
    try {
      const saved = localStorage.getItem('v4.settings');
      if (saved) {
        this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  static save(): void {
    try {
      localStorage.setItem('v4.settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getAll(): SettingsData {
    return { ...this.settings };
  }
}

/**
 * モールス信号聞き取り練習専用設定管理モジュール
 */

export interface ListeningSettingsData {
	// 速度設定
	characterSpeed: number; // 文字速度 (WPM)
	effectiveSpeed: number; // 実効速度 (WPM)

	// 音響設定
	frequency: number; // 周波数 (Hz)
	volume: number; // 音量 (0-1)
}

export class ListeningSettings {
	private static defaultSettings: ListeningSettingsData = {
		characterSpeed: 20,
		effectiveSpeed: 20,
		frequency: 600,
		volume: 0.5,
	};

	private static settings: ListeningSettingsData = { ...ListeningSettings.defaultSettings };

	static get<K extends keyof ListeningSettingsData>(key: K): ListeningSettingsData[K] {
		return this.settings[key];
	}

	static set<K extends keyof ListeningSettingsData>(key: K, value: ListeningSettingsData[K]): void {
		this.settings[key] = value;
		this.save();
	}

	static load(): void {
		try {
			const saved = localStorage.getItem('v8.listening.settings');
			if (saved) {
				this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
			}
		} catch (error) {
			console.error('Failed to load Listening settings:', error);
		}
	}

	static save(): void {
		try {
			localStorage.setItem('v8.listening.settings', JSON.stringify(this.settings));
		} catch (error) {
			console.error('Failed to save Listening settings:', error);
		}
	}

	static getAll(): ListeningSettingsData {
		return { ...this.settings };
	}

	static reset(): void {
		this.settings = { ...this.defaultSettings };
		this.save();
	}
}

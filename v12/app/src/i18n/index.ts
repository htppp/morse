/**
 * 国際化（i18n）システム
 */

import jaTranslations from './locales/ja.json';
import enTranslations from './locales/en.json';
import type { Translations, Language } from './types';

/**
 * サポートされている言語
 */
export const SUPPORTED_LANGUAGES: Language[] = ['ja', 'en'];

/**
 * デフォルト言語
 */
export const DEFAULT_LANGUAGE: Language = 'ja';

/**
 * LocalStorageのキー
 */
const STORAGE_KEY = 'morse-app-language';

/**
 * 翻訳データ
 */
const translations: Record<Language, Translations> = {
	ja: jaTranslations as Translations,
	en: enTranslations as Translations
};

/**
 * 現在の言語
 */
let currentLanguage: Language = DEFAULT_LANGUAGE;

/**
 * 言語変更時のコールバック
 */
type LanguageChangeCallback = (language: Language) => void;
const languageChangeCallbacks: LanguageChangeCallback[] = [];

/**
 * ブラウザの言語設定を検出
 */
function detectBrowserLanguage(): Language {
	const browserLang = navigator.language.toLowerCase();

	// 完全一致をチェック
	if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
		return browserLang as Language;
	}

	// 言語コードのプレフィックスをチェック（例: "en-US" -> "en"）
	const langPrefix = browserLang.split('-')[0];
	if (SUPPORTED_LANGUAGES.includes(langPrefix as Language)) {
		return langPrefix as Language;
	}

	return DEFAULT_LANGUAGE;
}

/**
 * 保存されている言語設定を読み込む
 */
function loadSavedLanguage(): Language {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
			return saved as Language;
		}
	} catch (e) {
		console.warn('Failed to load saved language:', e);
	}
	return detectBrowserLanguage();
}

/**
 * 言語設定を保存
 */
function saveLanguage(language: Language): void {
	try {
		localStorage.setItem(STORAGE_KEY, language);
	} catch (e) {
		console.warn('Failed to save language:', e);
	}
}

/**
 * i18nシステムを初期化
 */
export function initI18n(): void {
	currentLanguage = loadSavedLanguage();
}

/**
 * 現在の言語を取得
 */
export function getCurrentLanguage(): Language {
	return currentLanguage;
}

/**
 * 言語を設定
 */
export function setLanguage(language: Language): void {
	if (!SUPPORTED_LANGUAGES.includes(language)) {
		console.warn(`Unsupported language: ${language}`);
		return;
	}

	currentLanguage = language;
	saveLanguage(language);

	// コールバックを実行
	languageChangeCallbacks.forEach(callback => callback(language));
}

/**
 * 言語変更時のコールバックを登録
 */
export function onLanguageChange(callback: LanguageChangeCallback): void {
	languageChangeCallbacks.push(callback);
}

/**
 * 翻訳テキストを取得
 * @param key - ドット区切りのキー（例: "menu.items.vertical.title"）
 * @param params - テンプレート変数の置換パラメータ
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const keys = key.split('.');
	let value: any = translations[currentLanguage];

	// キーパスをたどる
	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k];
		} else {
			console.warn(`Translation key not found: ${key}`);
			return key;
		}
	}

	if (typeof value !== 'string') {
		console.warn(`Translation value is not a string: ${key}`);
		return key;
	}

	// パラメータを置換
	if (params) {
		return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
			return paramKey in params ? String(params[paramKey]) : match;
		});
	}

	return value;
}

/**
 * 言語名を取得
 */
export function getLanguageName(language: Language): string {
	const names: Record<Language, string> = {
		ja: '日本語',
		en: 'English'
	};
	return names[language] || language;
}

// 型をエクスポート
export type { Language, Translations } from './types';

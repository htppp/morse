# モールス練習アプリ v12 - 多言語対応版

## 概要

v11（タイミング評価版）の全機能を維持しつつ、国際化（i18n）対応を追加したバージョン。
日本語と英語をサポートし、他言語への拡張も容易な設計とする。

## v12の新機能

### 多言語対応（Internationalization - i18n）

**サポート言語**:
- 日本語（ja）- デフォルト
- 英語（en）

**実装方針**:
- v11の全機能を維持（タイミング評価、横振り電鍵のタイミング図など）
- 翻訳ファイルベースの多言語対応
- ブラウザの言語設定を自動検出
- 言語設定をLocalStorageに保存
- 各ビューに言語切り替えボタンを配置

## アーキテクチャ

### ディレクトリ構造

```
v12/
├── lib/                        # モールスエンジンライブラリ（v11から継承）
│   ├── src/
│   │   ├── core/              # コア機能
│   │   ├── trainers/          # トレーナー実装
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── app/                        # GUIアプリケーション（多言語対応）
│   ├── src/
│   │   ├── i18n/              # 国際化対応 (NEW)
│   │   │   ├── index.ts       # i18nシステムのメインファイル
│   │   │   ├── locales/       # 翻訳ファイル
│   │   │   │   ├── ja.json    # 日本語
│   │   │   │   └── en.json    # 英語
│   │   │   └── types.ts       # 型定義
│   │   ├── ui/
│   │   │   ├── components/    # UIコンポーネント
│   │   │   │   └── LanguageSwitcher.ts  # 言語切り替えボタン (NEW)
│   │   │   └── views/         # 各トレーナーのUIビュー
│   │   ├── router.ts
│   │   └── main.ts
│   ├── e2e/                   # E2Eテスト（多言語対応テスト追加）
│   ├── public/
│   │   └── flashcard.tsv
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
└── readme.md                   # このファイル
```

## 多言語対応の詳細仕様

### 1. 翻訳ファイル形式

**ファイル構成**:
- `v12/app/src/i18n/locales/ja.json` - 日本語翻訳
- `v12/app/src/i18n/locales/en.json` - 英語翻訳

**JSON構造**（階層的キー）:
```json
{
  "common": {
    "appName": "モールス練習アプリ",
    "version": "v12 - 多言語対応版",
    "backToMenu": "メニューに戻る",
    "settings": "設定",
    "start": "開始",
    "stop": "停止",
    "reset": "リセット",
    "download": "ダウンロード",
    "language": "言語"
  },
  "menu": {
    "title": "モールス練習アプリ",
    "subtitle": "メニュー",
    "items": {
      "vertical": {
        "title": "縦振り電鍵練習",
        "description": "上下に動かす電鍵（ストレートキー）の練習"
      },
      "horizontal": {
        "title": "横振り電鍵練習",
        "description": "左右に動かす電鍵（パドル）の練習（Iambic A/B対応）"
      },
      "flashcard": {
        "title": "CW略語・Q符号",
        "description": "CW通信で使用される略語とQ符号を学習"
      },
      "koch": {
        "title": "コッホ法トレーニング",
        "description": "段階的に文字を増やして学習する方式"
      },
      "listening": {
        "title": "モールス信号聞き取り練習",
        "description": "ランダムQSOや英文を聞いて練習"
      }
    }
  },
  "verticalKey": {
    "title": "縦振り電鍵練習",
    "instructions": "スペースキーまたは画面タップで練習",
    "timingEvaluation": "タイミング評価",
    "accuracy": "精度",
    "averageError": "平均誤差",
    "ditStats": "短点統計",
    "dahStats": "長点統計"
  },
  "horizontalKey": {
    "title": "横振り電鍵練習",
    "instructions": "左右のパドルを操作して練習",
    "leftPaddle": "左パドル",
    "rightPaddle": "右パドル",
    "mode": "モード",
    "modeA": "Iambic A",
    "modeB": "Iambic B",
    "spacingEvaluation": "スペーシング評価",
    "timingDiagram": "タイミング図",
    "debugInfo": "デバッグ情報"
  },
  "flashcard": {
    "title": "CW略語・Q符号",
    "modes": {
      "browse": "閲覧モード",
      "learn": "学習モード",
      "test": "試験モード"
    },
    "filters": {
      "all": "すべて",
      "common": "よく使う",
      "qCode": "Q符号"
    },
    "stats": {
      "total": "全",
      "learned": "学習済み",
      "remaining": "未学習"
    }
  },
  "koch": {
    "title": "コッホ法トレーニング",
    "lesson": "レッスン",
    "customCharacters": "カスタム文字選択",
    "speed": "速度",
    "wpm": "WPM",
    "characterSpacing": "文字間隔",
    "farnsworth": "Farnsworth"
  },
  "listening": {
    "title": "モールス信号聞き取り練習",
    "types": {
      "qso": "QSO練習",
      "text": "英文練習",
      "random": "ランダム文字列"
    },
    "generate": "生成",
    "play": "再生",
    "pause": "一時停止"
  },
  "settings": {
    "title": "設定",
    "audio": {
      "title": "音声設定",
      "frequency": "周波数",
      "volume": "音量",
      "wpm": "速度（WPM）"
    },
    "keybindings": {
      "title": "キーバインド",
      "leftPaddle": "左パドル",
      "rightPaddle": "右パドル",
      "straightKey": "縦振り電鍵"
    },
    "display": {
      "title": "表示設定",
      "theme": "テーマ",
      "fontSize": "フォントサイズ"
    }
  },
  "errors": {
    "audioContextFailed": "音声コンテキストの初期化に失敗しました",
    "fileLoadFailed": "ファイルの読み込みに失敗しました",
    "invalidInput": "無効な入力です"
  }
}
```

### 2. i18nシステムの実装

**v12/app/src/i18n/index.ts**:
```typescript
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
	ja: jaTranslations,
	en: enTranslations
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
```

**v12/app/src/i18n/types.ts**:
```typescript
/**
 * i18n型定義
 */

/**
 * サポートされている言語
 */
export type Language = 'ja' | 'en';

/**
 * 翻訳データの型
 */
export interface Translations {
	common: {
		appName: string;
		version: string;
		backToMenu: string;
		settings: string;
		start: string;
		stop: string;
		reset: string;
		download: string;
		language: string;
	};
	menu: {
		title: string;
		subtitle: string;
		items: {
			vertical: {
				title: string;
				description: string;
			};
			horizontal: {
				title: string;
				description: string;
			};
			flashcard: {
				title: string;
				description: string;
			};
			koch: {
				title: string;
				description: string;
			};
			listening: {
				title: string;
				description: string;
			};
		};
	};
	// その他のセクション...
}
```

### 3. 言語切り替えUIコンポーネント

**v12/app/src/ui/components/LanguageSwitcher.ts**:
```typescript
/**
 * 言語切り替えコンポーネント
 */

import { getCurrentLanguage, setLanguage, getLanguageName, SUPPORTED_LANGUAGES } from '../../i18n';
import type { Language } from '../../i18n/types';

/**
 * 言語切り替えボタンを生成
 */
export function createLanguageSwitcher(): string {
	const currentLang = getCurrentLanguage();

	return `
		<div class="language-switcher">
			<button class="language-switcher-button" id="languageSwitcherButton">
				🌐 ${getLanguageName(currentLang)}
			</button>
			<div class="language-switcher-dropdown" id="languageSwitcherDropdown">
				${SUPPORTED_LANGUAGES.map(lang => `
					<button
						class="language-option ${lang === currentLang ? 'active' : ''}"
						data-language="${lang}"
					>
						${getLanguageName(lang)}
					</button>
				`).join('')}
			</div>
		</div>
	`;
}

/**
 * 言語切り替えイベントを設定
 */
export function attachLanguageSwitcherEvents(onLanguageChanged: () => void): void {
	const button = document.getElementById('languageSwitcherButton');
	const dropdown = document.getElementById('languageSwitcherDropdown');

	if (!button || !dropdown) return;

	// ドロップダウンの表示/非表示を切り替え
	button.addEventListener('click', () => {
		dropdown.classList.toggle('show');
	});

	// ドロップダウン外をクリックしたら閉じる
	document.addEventListener('click', (e) => {
		if (!button.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
			dropdown.classList.remove('show');
		}
	});

	// 言語オプションをクリック
	dropdown.querySelectorAll('.language-option').forEach(option => {
		option.addEventListener('click', () => {
			const language = option.getAttribute('data-language') as Language;
			setLanguage(language);
			dropdown.classList.remove('show');
			onLanguageChanged();
		});
	});
}
```

### 4. 各ビューの多言語対応

各ビュー（MenuView、VerticalKeyView、HorizontalKeyViewなど）を以下のように修正:

```typescript
import { t } from '../../i18n';
import { createLanguageSwitcher, attachLanguageSwitcherEvents } from '../components/LanguageSwitcher';

export class MenuView implements View {
	render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="menu-header">
					${createLanguageSwitcher()}
					<h1>${t('common.appName')}</h1>
					<p class="version">${t('common.version')}</p>
				</header>

				<main class="menu-main">
					<div class="menu-grid">
						${this.renderMenuItem('vertical')}
						${this.renderMenuItem('horizontal')}
						${this.renderMenuItem('flashcard')}
						${this.renderMenuItem('koch')}
						${this.renderMenuItem('listening')}
					</div>
				</main>

				<footer class="menu-footer">
					<p>&copy; 2025 ${t('common.appName')}</p>
				</footer>
			</div>
		`;

		attachLanguageSwitcherEvents(() => {
			// 言語変更時にビューを再描画
			this.render();
		});

		this.attachEventListeners();
	}

	private renderMenuItem(id: string): string {
		return `
			<div class="menu-item" data-route="${id}">
				<h2 class="menu-item-title">${t(`menu.items.${id}.title`)}</h2>
				<p class="menu-item-description">${t(`menu.items.${id}.description`)}</p>
			</div>
		`;
	}

	// ...
}
```

### 5. CSSスタイル（言語切り替えボタン）

```css
/* 言語切り替えボタン */
.language-switcher {
	position: absolute;
	top: 20px;
	right: 20px;
}

.language-switcher-button {
	background: white;
	border: 2px solid #667eea;
	border-radius: 8px;
	padding: 8px 16px;
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.3s ease;
}

.language-switcher-button:hover {
	background: #667eea;
	color: white;
}

.language-switcher-dropdown {
	display: none;
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 8px;
	background: white;
	border: 2px solid #667eea;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	min-width: 150px;
	z-index: 1000;
}

.language-switcher-dropdown.show {
	display: block;
}

.language-option {
	display: block;
	width: 100%;
	padding: 12px 16px;
	border: none;
	background: white;
	text-align: left;
	cursor: pointer;
	transition: background 0.2s ease;
}

.language-option:hover {
	background: #f5f5f5;
}

.language-option.active {
	background: #667eea;
	color: white;
	font-weight: 600;
}

.language-option:first-child {
	border-radius: 6px 6px 0 0;
}

.language-option:last-child {
	border-radius: 0 0 6px 6px;
}
```

## 実装フェーズ

### Phase 1: i18nシステムの構築 ✅予定
1. v11のコードベースをv12にコピー
2. i18nディレクトリとファイル構造の作成
3. 日本語翻訳ファイル（ja.json）の作成
   - v11の全テキストを抽出して翻訳キーに変換
4. i18nシステムの実装（index.ts、types.ts）
5. 単体テストの作成

### Phase 2: 英語翻訳の追加 ✅予定
1. 英語翻訳ファイル（en.json）の作成
2. すべてのUIテキストを英訳
3. モールス符号関連の専門用語の確認

### Phase 3: UIコンポーネントの実装 ✅予定
1. LanguageSwitcherコンポーネントの実装
2. CSSスタイルの追加
3. 各ビューへの統合

### Phase 4: 各ビューの多言語対応 ✅予定
1. MenuViewの多言語対応
2. VerticalKeyViewの多言語対応
3. HorizontalKeyViewの多言語対応
4. FlashcardViewの多言語対応
5. KochViewの多言語対応
6. ListeningViewの多言語対応

### Phase 5: テストとデバッグ ✅予定
1. E2Eテストに多言語対応テストを追加
2. 各言語での動作確認
3. 翻訳の品質チェック
4. パフォーマンス測定

### Phase 6: ドキュメント更新 ✅予定
1. README.mdの更新（多言語対応機能の説明）
2. 英語版README.md（README.en.md）の作成
3. 開発者向けドキュメントの更新

## 翻訳ガイドライン

### 専門用語の扱い

**モールス信号関連**:
- 短点（dit） → Dit / Dot
- 長点（dah/dash） → Dah / Dash
- 縦振り電鍵 → Straight Key
- 横振り電鍵 → Paddle / Iambic Key
- スクイーズ → Squeeze
- CW略語 → CW Abbreviations
- Q符号 → Q Code

**トレーニング関連**:
- コッホ法 → Koch Method
- レッスン → Lesson
- 精度 → Accuracy
- 平均誤差 → Average Error

### 翻訳の一貫性

- ボタンやアクション: 動詞形を使用（例: "開始" → "Start"）
- 設定項目: 名詞形を使用（例: "音量" → "Volume"）
- 説明文: 完全な文章形式（ピリオド付き）

## 技術仕様

### 依存関係

v11と同じ依存関係を維持:
- TypeScript 5.3.3
- Vite 7.1.10
- Vitest 3.2.4
- Playwright 1.56.1

### ブラウザサポート

- Chrome/Edge: 最新版
- Firefox: 最新版
- Safari: 最新版
- モバイルブラウザ: iOS Safari、Chrome for Android

### パフォーマンス目標

- 言語切り替え: 100ms以内
- 初期ロード時の言語検出: 50ms以内
- 翻訳ファイルのサイズ: 各言語50KB以下

## 品質保証

### ユニットテスト

- i18nシステムのテスト
  - 言語検出機能
  - 翻訳キーの解決
  - パラメータ置換
  - LocalStorage連携

### E2Eテスト

- 各言語での画面表示テスト
- 言語切り替え機能のテスト
- ブラウザ言語設定の検出テスト

### カバレッジ目標

- ユニットテスト: 95%以上
- E2Eテスト: 全主要フロー

## 将来の拡張性

### 追加言語のサポート

新しい言語を追加する手順:
1. `v12/app/src/i18n/locales/{lang}.json`を作成
2. `SUPPORTED_LANGUAGES`配列に言語コードを追加
3. `getLanguageName()`に言語名を追加
4. 翻訳ファイルを作成

### RTL言語のサポート

将来的にアラビア語やヘブライ語などのRTL（右から左）言語をサポートする場合:
- CSSに`dir`属性の対応を追加
- レイアウトの調整

## ライセンス

CC0 1.0 Universal (パブリックドメイン)

## 開発状況

- [x] 仕様策定
- [ ] Phase 1: i18nシステムの構築
- [ ] Phase 2: 英語翻訳の追加
- [ ] Phase 3: UIコンポーネントの実装
- [ ] Phase 4: 各ビューの多言語対応
- [ ] Phase 5: テストとデバッグ
- [ ] Phase 6: ドキュメント更新

# Step 02: Viteの理解とホットリロード

## 🎯 学習目標

- Viteの仕組みを深く理解する
- ホットモジュールリプレースメント(HMR)を体験する
- 開発サーバーの設定をカスタマイズする
- ビルドプロセスを理解する

## 🤔 まず最初に: なぜViteなのか

### Viteとは何か

**Vite = 超高速なフロントエンド開発ツール**

「ヴィート」と読みます(フランス語で「速い」という意味)。

### なぜViteが必要なのか

**従来のツール(webpack)の問題点**:

```
プロジェクト起動時:
1. 全ファイルを読み込む
2. 全ファイルをバンドル(結合)
3. ようやく開発サーバー起動
→ 大規模プロジェクトでは数分かかることも...
```

**Viteの解決策**:

```
プロジェクト起動時:
1. 必要なファイルだけを読み込む
2. バンドル不要(ブラウザが直接モジュールを読む)
3. 即座に開発サーバー起動
→ 数秒で起動完了！
```

### なぜViteは速いのか

**1. ネイティブESモジュールの活用**

モダンブラウザは`import`を直接理解できます:

```typescript
// ブラウザがこれを直接実行できる
import { greet } from './utils.js';
```

Viteはこれを利用:
- 開発時: ファイルをそのままブラウザに送る(変換最小限)
- 本番時: 最適化してバンドル

**2. esbuildの採用**

- Go言語で書かれた超高速バンドラー
- JavaScriptベースのツールより**10〜100倍速い**
- TypeScript→JavaScriptの変換が爆速

**3. オンデマンドコンパイル**

- アクセスされたファイルのみを処理
- 使わないファイルは変換しない
- 差分のみを更新

### ホットモジュールリプレースメント(HMR)とは

**HMR = ファイルを保存すると即座にブラウザに反映される仕組み**

**従来の開発**:
```
1. コード修正
2. ブラウザをリロード
3. アプリの状態がリセット
4. また最初から操作し直し...
```

**Viteのプロジェクト構造**:
```
1. コード修正
2. 変更部分だけがブラウザに送られる
3. アプリの状態を保ったまま更新
4. すぐに動作確認できる！
```

**なぜこれが重要か**:
- フォームに入力した内容が消えない
- モーダルを開いた状態が保たれる
- 開発速度が劇的に向上

## 📚 このステップで学ぶこと

Step 01の環境をベースに:
1. vite.config.tsを作成してViteの設定を理解
2. CSSファイルを追加してHMRを体験
3. ビルドを実行して本番ファイルを生成
4. プレビューで本番環境をシミュレート

## 📝 実装手順

### 前提: Step 01の環境

このステップはStep 01の環境を引き継ぎます。

**Step 01のディレクトリをコピー**:

```bash
# step01をベースにstep02を作成
cp -r ../step01/* .
```

または、新規で環境構築する場合:

```bash
npm init -y
npm install -D typescript vite
```

必要なファイル:
- `package.json` (scriptsにdev/build/preview)
- `tsconfig.json`
- `index.html`
- `src/main.ts`

### 1. Vite設定ファイルの作成

プロジェクトのルートに`vite.config.ts`を作成します:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
	// 開発サーバーの設定
	server: {
		port: 3000,           // ポート番号を3000に変更
		open: true,           // サーバー起動時に自動的にブラウザを開く
		strictPort: false,    // ポートが使用中なら次の空きポートを探す
	},
	// ビルドの設定
	build: {
		outDir: 'dist',       // 出力ディレクトリ
		sourcemap: true,      // ソースマップを生成(デバッグ用)
		minify: 'esbuild',    // esbuildで圧縮
	},
	// ベースパス(通常は'/')
	base: './',
});
```

**何が起こるか**: Viteの動作をカスタマイズできる

**なぜこの作業が必要なのか**:

1. **開発体験のカスタマイズ**
   - ポート番号の変更: 他のプロジェクトと競合しない
   - 自動ブラウザ起動: 手動で開く手間を省く
   - エラー時の挙動: 厳格なチェックか柔軟な対応か

2. **本番ビルドの最適化**
   - 出力先の指定: デプロイしやすい構成
   - ソースマップ: 本番環境でもデバッグ可能
   - 圧縮方法: サイズと速度のトレードオフ

3. **プロジェクトの要件に合わせる**
   - サブディレクトリでの公開: `base`を設定
   - CORSの設定: 外部APIとの通信
   - プロキシ設定: バックエンドAPIとの連携

**各オプションの意味とその理由**:

| オプション | 設定値 | なぜこの設定が必要か |
|----------|--------|-------------------|
| `server.port` | `3000` | デフォルト5173より覚えやすい。Reactなどと同じ3000にすると統一感がある |
| `server.open` | `true` | サーバー起動後に手動でブラウザを開く手間を省く |
| `server.strictPort` | `false` | ポートが使用中でも自動で空きポートを探す。開発時の柔軟性 |
| `build.outDir` | `'dist'` | ビルド成果物の出力先。distは業界標準の名前 |
| `build.sourcemap` | `true` | 本番環境でエラーが出たときにデバッグできる |
| `build.minify` | `'esbuild'` | esbuildは高速。'terser'は圧縮率が高いが遅い |
| `base` | `'./'` | 相対パスで動作。file://で開いても動く(今回のプロジェクト向け) |

**Viteの設定のベストプラクティス**:
- 開発時は開発者体験を優先(自動リロード、詳細なエラー)
- 本番時はパフォーマンスを優先(圧縮、最適化)

### 2. CSSファイルの追加

`src/style.css`を作成します:

```css
/* 基本スタイル */
body {
	margin: 0;
	padding: 20px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	background: linear-gradient(to bottom right, #667eea, #764ba2);
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
}

#app {
	background: white;
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
	color: #667eea;
	margin: 0 0 1rem 0;
}
```

**なぜCSSファイルを分離するのか**:
- HTMLに直接書くと管理が大変
- 再利用しやすい
- Viteが自動的に最適化してくれる

### 3. main.tsでCSSをインポート

`src/main.ts`を更新:

```typescript
//! アプリケーションのエントリーポイント。
import './style.css';  // CSSをインポート

/**
 * アプリケーションを初期化する。
 */
function main(): void {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = `
			<h1>Hello, Vite + TypeScript!</h1>
			<p>ファイルを編集して保存すると、即座に反映されます。</p>
			<p class="counter">カウント: <span id="count">0</span></p>
			<button id="incrementBtn">+1</button>
		`;

		// カウンターの実装
		let count = 0;
		const countElement = document.getElementById('count');
		const button = document.getElementById('incrementBtn');

		if (button && countElement) {
			button.addEventListener('click', () => {
				count++;
				countElement.textContent = String(count);
			});
		}
	}
}

// DOMContentLoadedイベントでmain関数を実行。
document.addEventListener('DOMContentLoaded', main);
```

**コード解説とその理由**:

```typescript
import './style.css';
```
- **なぜCSSをimportできるのか**: Viteが自動的に処理
- **何が起こるか**: CSSが`<style>`タグとしてHTMLに挿入される
- **HMRの恩恵**: CSSを変更すると即座に反映(リロード不要)

```typescript
let count = 0;
```
- **なぜletを使うのか**: 値を変更するため(constは不可)
- **スコープ**: main関数内のみで有効

```typescript
countElement.textContent = String(count);
```
- **なぜString()が必要か**: textContentは文字列を期待
- **型安全性**: TypeScriptが型エラーを防ぐ

### 4. 開発サーバーの起動とHMR体験

```bash
npm run dev
```

**何が起こるか**:
1. Viteが開発サーバーを起動
2. ポート3000で待機(設定により)
3. ブラウザが自動的に開く
4. アプリケーションが表示される

**HMRを体験してみよう**:

1. **CSSの変更**
   - `src/style.css`の色を変更: `color: #667eea;` → `color: #e74c3c;`
   - 保存
   - ブラウザが**リロードせずに**色が変わる！

2. **カウンターで試す**
   - ブラウザでボタンを何回かクリック(カウントを増やす)
   - `src/main.ts`の文字列を変更
   - 保存
   - **カウントはそのまま**で文字列だけが更新される！

**なぜHMRが重要か**:
- フォームに入力した内容が消えない
- アプリの状態を保ったままデバッグできる
- 開発速度が劇的に向上

### 5. ビルドの実行

本番用のファイルを生成します:

```bash
npm run build
```

**何が起こるか**:

```
vite v7.1.9 building for production...
✓ 15 modules transformed.
dist/index.html                0.45 kB │ gzip: 0.30 kB
dist/assets/index-CO4KPQR2.js  1.25 kB │ gzip: 0.68 kB
dist/assets/index-B2qP8xhT.css 0.23 kB │ gzip: 0.18 kB
✓ built in 234ms
```

**なぜビルドが必要なのか**:

1. **TypeScript → JavaScript変換**
   - ブラウザは.tsを理解できない
   - .jsに変換する必要がある

2. **最適化**
   - コードの圧縮(minify): ファイルサイズ削減
   - Tree shaking: 使っていないコードを削除
   - コード分割: 必要な部分だけ読み込む

3. **本番環境向けの調整**
   - ソースマップの生成: デバッグ用
   - ハッシュ付きファイル名: キャッシュ対策

**dist/ディレクトリの中身**:

```
dist/
├── index.html           # HTMLファイル(最適化済み)
├── assets/
│   ├── index-[hash].js  # JavaScriptファイル(圧縮済み)
│   └── index-[hash].css # CSSファイル(圧縮済み)
```

**ハッシュ([hash])の意味**:
- ファイル内容が変わるとハッシュも変わる
- ブラウザのキャッシュ問題を解決
- 更新時に確実に新しいファイルが読み込まれる

### 6. プレビューの実行

ビルド後のファイルをローカルで確認:

```bash
npm run preview
```

**何が起こるか**:
- dist/ディレクトリの内容を配信
- 本番環境に近い状態でテスト
- ポート4173で起動(デフォルト)

**なぜプレビューが必要なのか**:

1. **本番環境のシミュレーション**
   - 開発モードと本番モードは動作が異なる
   - デプロイ前に問題を発見できる

2. **最適化の確認**
   - 圧縮が正しく行われたか
   - ファイルサイズは適切か
   - 読み込み速度は問題ないか

3. **バグの早期発見**
   - 開発モードで動いても本番で動かないケースがある
   - CORSの問題、パスの問題など

## 🔍 詳しい学習ポイント

### Viteの内部動作

**開発モード(`npm run dev`)**:

```
1. ブラウザがindex.htmlをリクエスト
   ↓
2. Viteがファイルを返す
   ↓
3. ブラウザがmain.tsをリクエスト
   ↓
4. Viteが.ts→.jsに変換して返す(キャッシュする)
   ↓
5. ブラウザが実行
```

**ファイル変更時**:

```
1. main.tsを編集して保存
   ↓
2. Viteが変更を検知
   ↓
3. WebSocketでブラウザに通知
   ↓
4. ブラウザが変更部分のみ再読み込み(HMR)
   ↓
5. アプリの状態を保ったまま更新
```

**本番モード(`npm run build`)**:

```
1. 全ファイルを解析
   ↓
2. 依存関係グラフを構築
   ↓
3. 不要なコードを削除(Tree Shaking)
   ↓
4. TypeScript → JavaScript変換
   ↓
5. コードを圧縮(minify)
   ↓
6. dist/に出力
```

### 開発モードと本番モードの違い

| 項目 | 開発モード | 本番モード |
|-----|----------|----------|
| 速度 | 超高速(変換最小限) | 遅い(最適化に時間) |
| ファイルサイズ | 大きい(読みやすさ優先) | 小さい(圧縮) |
| エラー表示 | 詳細 | 最小限 |
| ソースマップ | 常に有効 | 設定次第 |
| ホットリロード | 有効 | 無効 |
| コード分割 | なし | あり |

### webpackとViteの比較

**webpack (従来のツール)**:

```
起動時:
1. エントリーポイントから全依存を解析
2. 全ファイルをバンドル
3. サーバー起動
→ プロジェクト増大で遅くなる
```

**Vite (モダンなツール)**:

```
起動時:
1. 必要なファイルのみ処理
2. ブラウザが直接モジュールを読む
3. 即座にサーバー起動
→ プロジェクトサイズの影響を受けにくい
```

| 項目 | webpack | Vite |
|-----|---------|------|
| 起動時間 | 10〜60秒 | 1〜3秒 |
| HMR | 1〜5秒 | 0.1〜0.5秒 |
| 設定の複雑さ | 高い | 低い |
| 学習コスト | 高い | 低い |
| エコシステム | 成熟 | 急成長中 |

**なぜViteが速いのか(技術的詳細)**:

1. **ESモジュールの活用**
   - バンドル不要
   - 変更ファイルのみ送信

2. **esbuildの採用**
   - Go言語実装(並列処理に強い)
   - JavaScriptより10〜100倍速

3. **賢いキャッシュ**
   - 変更されていないファイルは再処理しない
   - ブラウザキャッシュとHTTP/2を活用

### ホットモジュールリプレースメント(HMR)の仕組み

**ViteのHMR**:

```
1. ファイル保存
   ↓
2. Viteが変更を検知(chokidar使用)
   ↓
3. 影響範囲を特定(依存関係グラフから)
   ↓
4. WebSocketでブラウザに通知
   ↓
5. ブラウザが変更モジュールのみ再インポート
   ↓
6. 状態を保ったまま再レンダリング
```

**なぜ状態が保たれるのか**:
- モジュール単位で更新
- グローバル変数は影響を受けない
- Reactなどは専用のHMR APIで状態を保持

**HMRが効かない場合**:
- エントリーポイント(main.ts)の大幅変更
- 型定義ファイルの変更
- この場合は自動的にフルリロード

## ✅ 動作確認チェックリスト

- [ ] `npm run dev`でサーバーが起動する
- [ ] ブラウザが自動的に開く(server.open: true)
- [ ] CSSを変更して保存すると即座に反映される
- [ ] カウンターで数を増やした状態でコードを変更しても数が保たれる
- [ ] `npm run build`でdist/が生成される
- [ ] dist/内にHTML/JS/CSSが圧縮されて出力される
- [ ] `npm run preview`でビルド後のファイルが表示される

## 🐛 トラブルシューティング

### ブラウザが自動的に開かない

**原因**: 環境変数やセキュリティ設定

**解決策**: vite.config.tsで`open: false`に変更し、手動で開く

### HMRが効かない

**原因**: ファイル監視の問題、WSL環境など

**解決策**:
```typescript
export default defineConfig({
	server: {
		watch: {
			usePolling: true,  // WSLなどで必要
		}
	}
});
```

### ビルドエラーが出る

**よくあるエラー**:
```
Error: Cannot find module './missing-file'
```

**原因**: 存在しないファイルをインポート

**解決策**: インポートパスを確認、ファイルが存在するか確認

## 📁 完成後のディレクトリ構成

```
step02/
├── node_modules/          # パッケージ
├── dist/                  # ビルド成果物(gitignore対象)
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
├── src/
│   ├── main.ts           # TypeScript
│   └── style.css         # CSS
├── .gitignore
├── index.html            # エントリーHTML
├── package.json
├── tsconfig.json
└── vite.config.ts        # Vite設定(新規追加)
```

## 🎓 課題

### 基本課題 1: ポート番号を変更してみよう

vite.config.tsの`port: 3000`を別の番号に変更し、サーバーを再起動してみましょう。

**学べること**: Vite設定の反映方法

### 基本課題 2: CSSを変更してHMRを体験しよう

style.cssの色やサイズを変更し、リロードなしで反映されることを確認しましょう。

**期待される結果**: カウンターの数値が保たれたまま、見た目だけが変わる

### 応用課題 1: ビルドサイズを確認しよう

```bash
npm run build
ls -lh dist/assets/
```

ファイルサイズを確認し、gzip圧縮でどれくらい小さくなるか調べましょう。

**ヒント**: ブラウザの開発者ツールのNetworkタブでも確認できる

### 応用課題 2: ソースマップを無効化してみよう

vite.config.tsで`sourcemap: false`にして、ビルドサイズの違いを比較しましょう。

**学べること**:
- ソースマップの役割
- サイズとデバッグ容易性のトレードオフ

## 💡 補足: Viteの高度な機能

```typescript
// vite.config.tsの高度な設定例

export default defineConfig({
	// プロキシ設定(バックエンドAPI連携)
	server: {
		proxy: {
			'/api': 'http://localhost:8080'
		}
	},

	// 環境変数の設定
	define: {
		__APP_VERSION__: JSON.stringify('1.0.0')
	},

	// CSSの設定
	css: {
		modules: {
			localsConvention: 'camelCase'
		}
	}
});
```

**次のステップで学ぶこと**:
- これらの高度な機能の実践
- 実際のプロジェクトでの活用方法

## 🔗 次のステップ

Viteの理解が深まったら、[Step 03: 基本的なUI構築](../step03/README.md)に進みましょう。

実際にモールスアプリのUIを作り始めます。

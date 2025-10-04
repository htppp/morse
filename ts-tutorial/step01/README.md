# Step 01: 環境構築とHello World

## 🎯 学習目標

- Node.js/npmの基本を理解する
- TypeScriptプロジェクトを初期化する
- Viteの基本設定を行う
- 最初のTypeScriptファイルを実行する

## 🤔 まず最初に: なぜこれらの技術が必要なのか

### なぜTypeScriptを使うのか

**TypeScript = JavaScript + 型**

JavaScriptだけでWebアプリケーションは作れます。しかし、TypeScriptを使うことで以下の問題を解決できます:

**JavaScriptの問題点**:
```javascript
// こんなコードを書いたとします
function calculateTotal(price, quantity) {
  return price * quantity;
}

// 数ヶ月後、別の人が使います
calculateTotal("100", 5);  // "100100100100100" (文字列の繰り返しになる！)
```

実行するまでバグに気づかない。大規模なアプリケーションではこれが致命的です。

**TypeScriptでは**:
```typescript
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

calculateTotal("100", 5);  // エラー: 文字列は渡せません(保存した瞬間にエディタが警告)
```

**TypeScriptを使う理由**:
1. **バグを早期発見**: コードを書いた瞬間にエラーが分かる
2. **開発効率が上がる**: エディタの補完が充実
3. **保守性が高い**: 他の人が書いたコードも型を見れば理解できる
4. **リファクタリングが安全**: 関数名を変えても、呼び出し箇所全てでエラー表示

**なぜ今すぐTypeScriptを学ぶべきか**:
- 現代のWeb開発では標準的な選択肢
- React、Vue、Angularなど、主要フレームワークが全てサポート
- 多くの企業が採用(求人でも必須スキル)

### なぜNode.jsを使うのか

**Node.js = JavaScriptをブラウザの外で実行できる環境**

「ブラウザで動くJavaScriptアプリを作るのに、なぜNode.jsが必要？」と思うかもしれません。

**なぜNode.jsが必要なのか**:

1. **開発ツールを動かすため**
   - TypeScriptをJavaScriptに変換するコンパイラ
   - Vite(開発サーバー)
   - これらのツールはNode.js上で動作する

2. **ブラウザにはできないことをするため**
   - ファイルの読み書き
   - パッケージのダウンロードと管理
   - 本番用のファイル生成(ビルド)

3. **開発効率を上げるため**
   - ファイルを保存すると自動的にブラウザに反映
   - TypeScriptを自動的に変換
   - エラーを即座に表示

**例**: こんなことができるようになります
```bash
npm run dev        # 開発サーバー起動、ファイル変更を自動検知
npm run build      # 本番用に最適化されたファイルを生成
```

**なぜNode.jsなのか**:
- JavaScriptで書かれているので、Web開発者にとって学習コストが低い
- npmという巨大なパッケージエコシステムがある
- 事実上の業界標準

## Node.js以外の代替手段

学習や試験的利用では、Node.js以外の実行環境を使うことも可能です。

1. **CDN + ブラウザ直接実行**
   * [TypeScript公式Playground](https://www.typescriptlang.org/play)や[esm.sh](https://esm.sh/)を利用すれば、ブラウザだけでTS→JS変換を試せます。
   * 小さなサンプルや学習には便利ですが、依存関係管理や本番ビルドはできません。

2. **Deno**
   * Node.jsの後発ランタイムで**TypeScriptをネイティブサポート**します。
   * 追加ツールなしで直接TSファイルを実行可能です。

   ```bash
   deno run main.ts
   ```

   * デフォルトでファイル・ネットワークアクセスが禁止されるなど、セキュリティが強化されています。
   * ただしnpmとの互換性は限定的です。

3. **Bun**
   * 高速実行・ビルド・パッケージ管理を目指す新しいランタイム。
   * まだ発展途上ですが、将来的に有力な選択肢になる可能性があります。

**まとめ**:
学習や小規模なコード試験ならDenoやCDNでも十分ですが、**チーム開発や本番運用を前提とするならNode.jsが最も安定しており、業界標準**です。


# TypeScriptファイルの作成

`src/`ディレクトリを作成し、`src/main.ts`を作成します:

```bash
mkdir src
```

**なぜ`src/`ディレクトリを作るのか**:

* ソースコード(source)を一か所にまとめる慣習
* 設定ファイル(`tsconfig.json`など)とコードを分離
* プロジェクトが大きくなっても整理しやすい

---

## サンプルコード

`src/main.ts`:

```typescript
//! アプリケーションのエントリーポイント。

/**
 * アプリケーションを初期化する。
 */
function main(): void {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = '<h1>Hello, Morse!</h1>';
	}
}

// DOMContentLoadedイベントでmain関数を実行。
document.addEventListener('DOMContentLoaded', main);
```

---


### package.jsonとは何か

**package.json = プロジェクトの設計図**

プロジェクトに関する全ての情報が記録されたファイルです。

**何が書かれているのか**:

```json
{
  "name": "my-project",           // プロジェクト名
  "version": "1.0.0",              // バージョン
  "scripts": {                     // よく使うコマンドの定義
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {             // 開発時に必要なパッケージ
    "typescript": "^5.9.3",
    "vite": "^7.1.9"
  }
}
```

**なぜpackage.jsonが必要なのか**:

1. **依存パッケージの記録**
   - このプロジェクトに必要なパッケージ(TypeScript、Viteなど)のリスト
   - バージョン情報も記録
   - 他の人が`npm install`一発で同じ環境を構築できる

2. **スクリプトの管理**
   - 長いコマンドを短い名前で実行
   - `npm run dev` → `vite`が実行される
   - チーム内でコマンドを統一できる

3. **プロジェクト情報の一元管理**
   - プロジェクト名、バージョン、作者、ライセンスなど
   - npmに公開する場合の基本情報

**例えで理解する**:

料理のレシピに例えると:
- **package.json** = レシピ本(材料リストと手順が書いてある)
- **npm install** = 材料を買いに行く
- **node_modules/** = 買ってきた材料(実際のパッケージファイル)
- **npm run dev** = レシピに従って料理する

誰がこのレシピを見ても、同じ材料を買って、同じ手順で料理できる。

**なぜ最初に`npm init`をするのか**:
- package.jsonを作成するため
- プロジェクトの「土台」を作る最初の一歩
- これがないと、パッケージをインストールできない

### npmとは何か

**npm = Node Package Manager (パッケージ管理ツール)**

「パッケージ」とは、他の人が作った便利なプログラムの集まりです。

**なぜnpmが必要なのか**:

1. **車輪の再発明を避ける**
   ```bash
   # TypeScriptコンパイラを自分で作る必要はない
   npm install -D typescript  # 完成品を使う
   ```

2. **バージョン管理が自動化**
   - パッケージの更新を追跡
   - 互換性のあるバージョンを自動選択
   - セキュリティの脆弱性を警告

3. **依存関係を自動解決**
   - あるパッケージが別のパッケージを必要とする場合、自動的にインストール
   - 複雑な依存関係を手動で管理する必要がない

**数字で見るnpmのすごさ**:
- 200万以上のパッケージが公開されている
- 週に100億回以上ダウンロードされている
- ほとんどのWeb開発プロジェクトが使用

**よく使うコマンド**:
```bash
npm install <package>    # パッケージをインストール
npm uninstall <package>  # パッケージを削除
npm update              # パッケージを更新
npm run <script>        # package.jsonのスクリプトを実行
```

### これらの技術がどう連携するのか

**全体像**:

```
1. あなた(開発者)
   ↓ コードを書く
2. TypeScript (.ts ファイル)
   ↓ Node.js上で動くViteが変換
3. JavaScript (.js ファイル)
   ↓ ブラウザで実行
4. Webアプリケーション
```

**それぞれの役割**:

| 技術 | 役割 | なぜ必要か |
|------|------|----------|
| **TypeScript** | 型安全なコードを書く | バグを減らし、開発効率を上げる |
| **Node.js** | 開発ツールを動かす | TypeScriptの変換、開発サーバーの起動 |
| **package.json** | プロジェクトの設計図 | 環境を再現可能にする |
| **npm** | パッケージを管理 | 必要なツールを簡単にインストール |
| **Vite** | 開発環境を提供 | 高速な開発サーバー、自動リロード |

**実際の開発フロー**:

1. `npm init -y` → package.json作成(プロジェクトの土台)
2. `npm install -D typescript vite` → 必要なツールをインストール
3. TypeScriptでコードを書く
4. `npm run dev` → Viteが自動変換してブラウザで表示
5. コード修正 → 即座にブラウザに反映(リロード不要)

**なぜこの組み合わせなのか**:
- TypeScript: 型安全性
- Node.js: ツールの実行環境
- npm: パッケージ管理の事実上の標準
- Vite: 最速の開発体験

この組み合わせは現代のWeb開発における**ベストプラクティス**です。

## 📚 事前準備

このステップを始める前に、以下がインストールされていることを確認してください:

### Node.jsのインストール確認

```bash
node --version  # v18以上を推奨
npm --version   # v9以上を推奨
```

インストールされていない場合は、[Node.js公式サイト](https://nodejs.org/)からダウンロードしてください。

### エディタの準備

- **推奨**: Visual Studio Code
- TypeScript用の拡張機能をインストールすると便利です

## 📝 実装手順

このステップでは、TypeScript + Viteの開発環境を構築し、シンプルな"Hello, Morse!"を表示します。

### 1. プロジェクトの初期化

まず、このステップのディレクトリに移動します:

```bash
cd ts-tutorial/step01
```

次に、`npm init`コマンドでプロジェクトを初期化します:

```bash
npm init -y
```

**何が起こるか**: `package.json`ファイルが作成されます。

**なぜこの作業が必要なのか**:

1. **依存関係の記録と管理**
   - TypeScriptやViteなど、外部パッケージのバージョンを記録
   - 誰がいつ開発を引き継いでも、同じバージョンのパッケージをインストールできる
   - パッケージの更新履歴を追跡できる

2. **チーム開発の基盤**
   - 他の開発者が`npm install`一発で同じ環境を構築できる
   - 「私の環境では動くのに...」という問題を防げる

3. **スクリプトの一元管理**
   - 開発、ビルド、テストなどのコマンドを統一
   - 複雑なコマンドを`npm run dev`のような短いコマンドで実行可能

4. **プロジェクトのメタデータ保存**
   - プロジェクト名、バージョン、作者、ライセンスなどの情報を一か所に集約
   - npmに公開する場合の基礎情報になる

**`-y`フラグとは**: 通常、`npm init`は名前やバージョンなどを対話的に聞いてきますが、`-y`を付けるとすべてデフォルト値で自動的に設定されます。学習目的ではこれで十分です。

### 2. 必要なパッケージのインストール

TypeScriptとViteをインストールします:

```bash
npm install -D typescript vite
```

**何が起こるか**:
- `node_modules/`ディレクトリにパッケージがダウンロードされる
- `package.json`の`devDependencies`にパッケージ情報が追記される
- `package-lock.json`が作成され、正確なバージョン情報が記録される

**なぜこの作業が必要なのか**:

1. **TypeScriptをインストールする理由**
   - ブラウザはTypeScriptを直接実行できない
   - TypeScript→JavaScriptに変換(トランスパイル)するコンパイラが必要
   - 型チェック機能を使うためにも必要

2. **Viteをインストールする理由**
   - 開発サーバーを提供(ファイルを編集すると即座にブラウザに反映)
   - TypeScriptを自動的にJavaScriptに変換
   - 本番用の最適化されたファイルを生成
   - 従来のツール(webpack)より圧倒的に高速

3. **`-D`(--save-dev)フラグを使う理由**
   - これらは開発時にのみ必要なツール
   - 本番環境では不要(ビルド後のJavaScriptのみあればよい)
   - `devDependencies`に分類することで、本番環境のパッケージサイズを削減

**インストールされるもの**:
```json
"devDependencies": {
  "typescript": "^5.9.3",  // TypeScriptコンパイラ
  "vite": "^7.1.9"          // 開発ツール
}
```

**`^`(キャレット)の意味**: マイナーバージョンとパッチバージョンの更新を許可
- `^5.9.3` = `5.9.3`以上`6.0.0`未満のバージョン

### 3. TypeScript設定ファイルの作成

プロジェクトのルートに`tsconfig.json`を作成します:

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"module": "ESNext",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"moduleResolution": "bundler",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true
	},
	"include": ["src"]
}
```

**なぜこの作業が必要なのか**:

1. **TypeScriptコンパイラの動作を制御するため**
   - 設定がないと、TypeScriptはデフォルト設定で動作(古いJavaScriptに変換される)
   - モダンなブラウザ向けに最適化したい
   - 開発者の意図通りの型チェックを行いたい

2. **型安全性を最大化するため**
   - `strict: true`で厳格な型チェックを有効化
   - バグの早期発見につながる
   - リファクタリング時の安全性が向上

3. **開発体験を向上させるため**
   - DOM APIの型定義を読み込むことで、`document.getElementById()`などの補完が効く
   - エディタがエラーを即座に表示してくれる

**各オプションの意味とその理由**:

| オプション | 設定値 | なぜこの設定が必要か |
|----------|--------|-------------------|
| `target` | `ES2020` | モダンなブラウザ向けのコードを生成。古いブラウザ向けなら`ES5`にする必要があるが、今回は不要 |
| `module` | `ESNext` | 最新のESモジュール形式を使用。Viteと相性が良い |
| `lib` | `["ES2020", "DOM", ...]` | DOM API(`document`、`window`など)の型定義を含める。これがないとDOM操作でエラーになる |
| `moduleResolution` | `bundler` | Viteのようなバンドラー向けのモジュール解決。より柔軟なimportが可能 |
| `strict` | `true` | すべての厳格な型チェックを有効化。nullチェックの強制など、バグを防ぐ |
| `esModuleInterop` | `true` | CommonJSモジュールをimportする際の互換性を向上。一部のnpmパッケージで必要 |
| `skipLibCheck` | `true` | 外部ライブラリの型定義ファイルのチェックをスキップ。コンパイル速度が向上 |
| `forceConsistentCasingInFileNames` | `true` | `import './File.ts'`と`import './file.ts'`を区別。Windows/Mac/Linuxでの動作を統一 |

**`include`の役割**:
- TypeScriptがコンパイルする対象ディレクトリを指定
- `src`のみを指定することで、テストファイルや設定ファイルをコンパイル対象外にできる

### 4. HTMLファイルの作成

プロジェクトのルートに`index.html`を作成します:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>モールス体験 - Step 01</title>
</head>
<body>
	<div id="app"></div>
	<script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**なぜこの作業が必要なのか**:

1. **Webアプリケーションのエントリーポイント**
   - ブラウザが最初に読み込むファイル
   - JavaScriptを読み込む役割
   - アプリケーションの構造を定義

2. **TypeScriptファイルを直接読み込めるのはViteのおかげ**
   - 通常、ブラウザは`.ts`ファイルを理解できない
   - Viteが開発サーバー上で自動的に`.ts`→`.js`に変換
   - 開発者は`.ts`ファイルを直接指定できる

**各要素の意味とその理由**:

```html
<meta charset="UTF-8">
```
- 文字エンコーディングの指定
- これがないと日本語が文字化けする可能性がある

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- レスポンシブデザインの基本設定
- モバイルデバイスでも適切に表示されるようにする

```html
<div id="app"></div>
```
- アプリケーションのコンテンツを挿入する場所
- JavaScriptから`getElementById('app')`で取得して内容を書き換える
- 「マウントポイント」と呼ばれる

```html
<script type="module" src="/src/main.ts"></script>
```
- `type="module"`: ES6モジュールとして読み込む
  - これにより`import`/`export`が使える
  - `defer`属性と同じ効果(DOM読み込み後に実行)
- `src="/src/main.ts"`: TypeScriptファイルを直接指定(Viteが変換)

### 5. TypeScriptファイルの作成

`src/`ディレクトリを作成し、`src/main.ts`を作成します:

```bash
mkdir src
```

**なぜ`src/`ディレクトリを作るのか**:
- ソースコード(source)を一か所にまとめる慣習
- 設定ファイル(`tsconfig.json`など)とコードを分離
- プロジェクトが大きくなっても整理しやすい

`src/main.ts`:

```typescript
//! アプリケーションのエントリーポイント。

/**
 * アプリケーションを初期化する。
 */
function main(): void {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = '<h1>Hello, Morse!</h1>';
	}
}

// DOMContentLoadedイベントでmain関数を実行。
document.addEventListener('DOMContentLoaded', main);
```

**コード解説とその理由**:

```typescript
function main(): void {
```

* **なぜ関数に分けるのか**:

  * コードを構造化して読みやすくする
  * 後で再利用・テストしやすくなる
* **なぜ`: void`を付けるのか**:

  * 戻り値がないことを明示
  * 誤って戻り値を利用しようとしたときにエラーになる

```typescript
const app = document.getElementById('app');
```

* **なぜ`const`を使うのか**:

  * 再代入を防ぐ（バグ防止）
* **型は何か**: `HTMLElement | null`

```typescript
if (app) {
```

* **なぜnullチェックが必要なのか**:

  * 要素が見つからない場合に`null.innerHTML`を防ぐ
  * `strict`モードでは必須

```typescript
app.innerHTML = '<h1>Hello, Morse!</h1>';
```

* **注意点 (XSSリスク)**

  * innerHTMLは文字列をHTMLとして解釈するため、ユーザー入力を直接渡すと危険です。
  * 例:

    ```typescript
    const userInput = "<img src=x onerror=alert('XSS')>";
    app.innerHTML = userInput; // 悪意あるスクリプトが実行される
    ```
  * **安全な代替**:

    * HTMLとして解釈させたくない場合は`textContent`を使う。

    ```typescript
    app.textContent = userInput;
    ```

    * 信頼できない入力を扱う場合は**DOMPurifyなどのライブラリでサニタイズ**する。
  * 学習用途の`Hello, Morse!`のような固定文字列なら問題なし。

```typescript
document.addEventListener('DOMContentLoaded', main);
```

* **なぜ必要か**:

  * HTML解析が終わってからコードを実行できるようにするため。
  * `<script>`が`<div id="app">`より前にある場合でも安全に動作する。
  * `type="module"`を使っている場合は実際には不要ですが、書いておくと明示的で安全性が高い。

### 6. package.jsonにスクリプトを追加

`package.json`を開き、`scripts`セクションを以下のように編集します:

```json
{
	"scripts": {
		"dev": "vite",
		"build": "vite build",
		"preview": "vite preview"
	}
}
```

**なぜこの作業が必要なのか**:

1. **コマンドの統一と簡略化**
   - `npx vite`と毎回打つのは面倒
   - `npm run dev`で統一することで、他のプロジェクトでも同じコマンドが使える
   - チームメンバーが覚えるコマンドを減らせる

2. **環境による差異の吸収**
   - Windows/Mac/Linuxで同じコマンドが動く
   - グローバルインストール不要(プロジェクト内のパッケージを使う)

3. **複雑なコマンドの抽象化**
   - ビルドオプションなどの複雑な設定を隠蔽
   - 将来的にコマンドが複雑化しても、`npm run dev`は変わらない

**各スクリプトの役割とその理由**:

| スクリプト | コマンド | なぜこれが必要か |
|-----------|---------|---------------|
| `dev` | `vite` | 開発サーバー起動。ファイル変更を即座に反映(HMR)。開発中は常に使う |
| `build` | `vite build` | 本番用にビルド。コードを最適化・圧縮して、`dist/`に出力 |
| `preview` | `vite preview` | ビルド後のファイルをローカルで確認。本番環境に近い状態でテスト |

### 7. 開発サーバーの起動

```bash
npm run dev
```

**なぜ開発サーバーが必要なのか**:

1. **ファイルを直接開くだけでは不十分**
   - `file:///path/to/index.html`で開くと、セキュリティ制限でモジュールが読み込めない
   - ブラウザのCORS(Cross-Origin Resource Sharing)制限に引っかかる

2. **開発効率の向上**
   - ファイルを保存すると即座にブラウザに反映(HMR)
   - リロード不要で開発できる
   - TypeScriptを自動的にJavaScriptに変換

3. **本番環境に近い状態でテスト**
   - HTTPサーバー経由でアクセス(本番環境と同じ)
   - モジュールの読み込みが正しく動作する

**表示されるメッセージ**:
```
  VITE v7.1.9  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

- `Local`: 自分のPC内からアクセスするURL
- `Network`: 同じネットワーク内の他のデバイスからアクセスする場合(デフォルトでは無効)

ブラウザで http://localhost:5173 を開くと、"Hello, Morse!"が表示されます。

**サーバーを停止するには**: ターミナルで`Ctrl + C`を押します。

## 🔍 詳しい学習ポイント

### なぜNode.jsとnpmが必要なのか

**Node.js**: JavaScriptをブラウザ外で実行できる環境

**なぜ必要か**:
- ビルドツール(Vite)を動かすため
- TypeScriptをJavaScriptに変換するため
- 開発サーバーを起動するため
- パッケージ管理ツール(npm)を使うため

**npm (Node Package Manager)**: JavaScriptのパッケージ管理ツール

**なぜ必要か**:
- 何万ものオープンソースパッケージを利用できる
- バージョン管理が自動化される
- 依存関係を自動解決してくれる
- チーム開発で環境を統一できる

### なぜTypeScriptを使うのか

JavaScriptに**型システム**を追加した言語です。

**なぜJavaScriptだけでは不十分なのか**:

1. **型エラーの実行時検出は遅すぎる**
```javascript
// JavaScript: 実行して初めてエラーになる
function add(a, b) {
  return a + b;
}
add(1, "2");  // "12" (意図しない結果)
```

2. **大規模開発では保守が困難**
- 関数の引数に何を渡せばいいか分からない
- リファクタリング時にバグを埋め込みやすい
- エディタの補完が効かない

**TypeScriptのメリット**:

```typescript
// TypeScript: コード書いた時点でエラー検出
function add(a: number, b: number): number {
  return a + b;
}
add(1, "2");  // エラー: 型が合わない(保存した瞬間にエディタが警告)
```

- **早期エラー検出**: 実行前にバグを発見
- **リファクタリング支援**: 関数名変更時に全ての呼び出し箇所でエラー表示
- **ドキュメント代わり**: 型定義が仕様書の役割を果たす
- **チーム開発**: 型が契約となり、他の人が書いたコードも安心して使える

### なぜViteを使うのか

モダンなフロントエンド開発ツールです。

**なぜwebpackではなくViteなのか**:

| 項目 | webpack | Vite |
|-----|---------|------|
| 起動速度 | 遅い(すべてバンドル) | 超高速(必要なファイルのみ) |
| HMR速度 | プロジェクト増大で遅くなる | 常に高速 |
| 設定 | 複雑 | ほぼ不要 |
| TypeScript | 別途設定必要 | 標準対応 |

**Viteが高速な理由**:

1. **ネイティブESモジュールを活用**
   - モダンブラウザはES modulesを直接実行可能
   - 開発時は変換不要で即座に実行

2. **esbuildの採用**
   - Go言語で書かれた超高速バンドラー
   - JavaScriptベースのツールより10〜100倍高速

3. **必要な部分のみ処理**
   - 変更したファイルとその依存関係のみを再処理
   - プロジェクト全体をバンドルし直さない

**なぜ開発ツールが必要なのか**:
- ブラウザはTypeScriptを理解できない→変換が必要
- モジュール分割したコードを統合する必要がある
- 本番環境では圧縮・最適化が必須

### なぜES6モジュールを使うのか

JavaScriptのモジュールシステムです。

**モジュール化しないとどうなるか**:

```html
<!-- 全部グローバル変数になる -->
<script src="utils.js"></script>
<script src="main.js"></script>
<script src="app.js"></script>
```

**問題点**:
- 名前が衝突する(utils.jsとmain.jsで同じ変数名を使うとバグ)
- 依存関係が不明確(どのファイルがどれに依存しているか分からない)
- 読み込み順序を間違えるとエラー

**ES6モジュールを使うと**:

```typescript
// utils.ts
export function greet(name: string) {
  return `Hello, ${name}!`;
}

// main.ts
import { greet } from './utils.js';
console.log(greet('World'));
```

**メリット**:
- スコープが分離される(変数の衝突がない)
- 依存関係が明確(`import`を見れば分かる)
- 必要な部分だけを読み込める(Tree Shaking)
- コードの再利用性が向上

## ✅ 動作確認チェックリスト

- [ ] `npm run dev`を実行してエラーが出ない
- [ ] ブラウザで http://localhost:5173 を開ける
- [ ] "Hello, Morse!"が表示される
- [ ] `src/main.ts`の文字列を変更して保存
- [ ] ブラウザが自動的にリロードされる(HMRの動作確認)
- [ ] 変更した文字列が表示される

## 🐛 トラブルシューティング

### `npm: command not found`

**原因**: Node.jsがインストールされていない

**なぜこのエラーが出るのか**: npmはNode.jsに含まれているため、Node.js未インストールだと使えない

**解決策**: [Node.js公式サイト](https://nodejs.org/)からインストール

### `Port 5173 is already in use`

**原因**: ポート5173が既に使われている

**なぜこのエラーが出るのか**:
- 別のViteプロジェクトが既に起動している
- 他のアプリケーションが同じポートを使用している

**解決策1**: 別のViteサーバーを停止する
**解決策2**: 別のポートを使う: `npm run dev -- --port 3000`

### ブラウザに何も表示されない

**原因の可能性**:
1. 開発サーバーが起動していない
2. URLが間違っている
3. JavaScriptエラーが発生している

**なぜ何も表示されないのか**:
- DOM要素がない状態でJavaScriptが実行された
- HTMLの読み込みが完了していない
- TypeScriptのコンパイルエラー

**解決策**:
- ターミナルのエラーメッセージを確認
- `Ctrl + Shift + I`でDevToolsを開きConsoleタブでエラーを確認
- Networkタブでファイルが正しく読み込まれているか確認

### TypeScriptのエラーが出る

**よくあるエラー**:

```
Cannot find name 'document'
```

**原因**: `tsconfig.json`の`lib`に`DOM`が含まれていない

**なぜこのエラーが出るのか**: TypeScriptはデフォルトでDOM APIの型定義を持っていない

**解決策**: `tsconfig.json`に`"lib": ["ES2020", "DOM", "DOM.Iterable"]`を追加

## 📁 完成後のディレクトリ構成

```
step01/
├── node_modules/          # インストールされたパッケージ (gitignore対象)
│                          # なぜ: 巨大で、package.jsonから再生成可能
├── src/
│   └── main.ts           # TypeScriptのエントリーポイント
│                          # なぜsrc/: ソースコードを一か所にまとめる慣習
├── .gitignore            # Git除外設定
│                          # なぜ: node_modules/などの不要ファイルをGitに含めない
├── index.html            # HTMLファイル
│                          # なぜroot: Viteはrootのindex.htmlをエントリーポイントとする
├── package.json          # プロジェクト設定
│                          # なぜ: 依存関係とスクリプトの定義
├── package-lock.json     # 依存関係のロックファイル
│                          # なぜ: 正確なバージョンを記録し、環境を再現可能にする
└── tsconfig.json         # TypeScript設定
                          # なぜ: コンパイラの動作を制御
```

## 🎓 課題

### 基本課題 1: 文字列を変更してみよう

`src/main.ts`の`"Hello, Morse!"`を別の文字列に変更してみましょう。

**期待される結果**: ブラウザの表示が自動的に更新される(HMRの体験)

**学べること**: Viteのホットモジュールリプレースメント(HMR)の仕組み

### 基本課題 2: スタイルを追加してみよう

`<h1>`タグに`style`属性を追加して、色やサイズを変更してみましょう。

```typescript
app.innerHTML = '<h1 style="color: blue; font-size: 48px;">Hello, Morse!</h1>';
```

**学べること**: TypeScript内でHTMLとCSSを扱う方法

### 応用課題 1: 現在時刻を表示しよう

`main.ts`に新しい関数を追加して、現在時刻も表示してみましょう。

**ヒント**:

```typescript
/**
 * 現在時刻を取得する。
 */
function getCurrentTime(): string {
	const now = new Date();
	return now.toLocaleTimeString('ja-JP');
}

function main(): void {
	const app = document.getElementById('app');
	if (app) {
		const time = getCurrentTime();
		app.innerHTML = `
			<h1>Hello, Morse!</h1>
			<p>現在時刻: ${time}</p>
		`;
	}
}
```

**学べること**:
- 関数の分割と再利用
- テンプレートリテラル(バッククォート)の使い方
- Date オブジェクトの使い方

### 応用課題 2: ボタンを追加しよう

クリックすると時刻が更新されるボタンを追加してみましょう。

**ヒント**:

```typescript
function updateTime(): void {
	const timeElement = document.getElementById('time');
	if (timeElement) {
		timeElement.textContent = getCurrentTime();
	}
}

function main(): void {
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = `
			<h1>Hello, Morse!</h1>
			<p>現在時刻: <span id="time">${getCurrentTime()}</span></p>
			<button id="updateButton">時刻を更新</button>
		`;

		const button = document.getElementById('updateButton');
		if (button) {
			button.addEventListener('click', updateTime);
		}
	}
}
```

**学べること**:
- イベントリスナーの登録
- DOM要素の動的な更新
- ユーザーインタラクションの処理

## 💡 補足: よく使うnpmコマンド

```bash
npm install <package>        # パッケージをインストール
                              # なぜ: 新しい機能を追加したいとき

npm install -D <package>     # 開発用パッケージをインストール
                              # なぜ: ビルドツールなど開発時のみ必要なもの

npm uninstall <package>      # パッケージを削除
                              # なぜ: 不要になったパッケージを整理

npm list                     # インストール済みパッケージ一覧
                              # なぜ: 何が入っているか確認

npm outdated                 # 古いパッケージを確認
                              # なぜ: セキュリティ更新を見逃さないため

npm update                   # パッケージを更新
                              # なぜ: バグ修正や新機能を取り込む
```

## 🔗 次のステップ

環境構築ができたら、[Step 02: Viteの理解とホットリロード](../step02/README.md)に進みましょう。

Viteの仕組みをより深く理解し、開発効率を高める方法を学びます。

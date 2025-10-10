# モールス体験

モールス信号の学習・練習を支援するWebアプリケーション

## 公開URL

- https://morse.hato.life/

## 概要

アマチュア無線のモールス通信(CW)を学習するためのWebアプリケーションです。
ブラウザだけで、コッホ法によるモールス符号の習得、電鍵操作の練習、CW略語・Q符号の学習、実践的なQSO聞き取り練習ができます。

## 主な機能

- **コッホ法トレーニング**: 41文字を段階的に習得
- **電鍵練習**: 縦振り・横振り電鍵シミュレーター
- **CW略語・Q符号学習**: フラッシュカード・試験モード、全295語収録
- **QSO聞き取り練習**: ラバースタンプQSO、ランダムQSO生成、英文聞き取り
- **PWA対応**: オフライン動作、アプリとしてインストール可能

## バージョン

### 最新版
- **[v8 - PWA版](https://morse.hato.life/v8/)** - Progressive Web App、オフライン対応、インストール可能
  - [メニューページ](https://morse.hato.life/v8/) - 5つの練習モードへのアクセス
  - [コッホ法トレーニング](https://morse.hato.life/v8/#koch) - 41文字を段階的に習得
  - [CW略語・Q符号学習](https://morse.hato.life/v8/#flashcard) - フラッシュカード・試験モード
  - [モールス信号聞き取り練習](https://morse.hato.life/v8/#listening) - QSO聞き取り、英文聞き取り
  - [縦振り電鍵練習](https://morse.hato.life/v8/#vertical) - 縦振り電鍵シミュレーター
  - [横振り電鍵練習](https://morse.hato.life/v8/#horizontal) - 横振り電鍵シミュレーター

### 過去バージョン
- **[v7 - モールス信号聞き取り練習版](https://morse.hato.life/v7/)** - SPA形式、QSO聞き取り機能追加
- **[v6 - コッホ法マルチモード版](https://morse.hato.life/v6/)** - SPA形式、モードルーティング実装
- **[v5 - QSO聞き取り練習版](https://morse.hato.life/v5/)** - ラバースタンプQSO機能追加

- **[v4 - 単一HTML版](https://morse.hato.life/v4/)** - 単一HTMLファイル形式
- **[v3](https://morse.hato.life/v3/)** - v2の改良版
- **[v2 - TypeScript再実装版](https://morse.hato.life/v2/)** - [README](v2/README.md)
- **[v1 - 初期実装版](https://morse.hato.life/v1/)** - [README](v1/README.md)

## 技術スタック

- **フロントエンド**: TypeScript + Vite
- **PWA**: Service Worker（vite-plugin-pwa）
- **音声生成**: Web Audio API
- **状態管理**: LocalStorage
- **UI/UX**: レスポンシブデザイン、モバイル対応
- **セキュリティ**: XSS保護（HTMLエスケープ）

## 開発

詳細は [.claude/context.md](.claude/context.md) を参照してください。

### セットアップ (v8)

```bash
cd v8/src
npm install
```

### 開発サーバー起動

```bash
cd v8/src
npm run dev
```

### ビルド

```bash
cd v8/src
npm run build
```

ビルド成果物は `v8/dist/` に出力されます（SPAアプリ + Service Worker）。

## データファイル

- `flashcard.tsv` - CW略語・Q符号データ (295語)
  - タブ区切り形式
  - タグ、使用頻度、略語、英文、和訳、説明、具体例を収録

## ライセンス

MIT

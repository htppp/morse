# モールス体験

モールス信号の学習・練習を支援するWebアプリケーション

## 公開URL

- https://morse.hato.life/

## 概要

アマチュア無線のモールス通信(CW)を学習するためのWebアプリケーションです。
ブラウザだけで、コッホ法によるモールス符号の習得、電鍵操作の練習、CW略語・Q符号の学習、実践的なQSO聞き取り練習ができます。

## 主な機能

- **コッホ法トレーニング**: 40文字を段階的に習得
- **電鍵練習**: 縦振り・横振り電鍵シミュレーター
- **CW略語・Q符号学習**: フラッシュカード・試験モード、全295語収録
- **QSO聞き取り練習**: ラバースタンプQSO、ランダムQSO生成、英文聞き取り

## バージョン

### 最新版
- **[v7 - モールス信号聞き取り練習版](https://morse.hato.life/v7/)** - SPA形式、QSO聞き取り機能追加
  - [メニューページ](https://morse.hato.life/v7/) - 5つの練習モードへのアクセス
  - [コッホ法トレーニング](https://morse.hato.life/v7/#koch) - 40文字を段階的に習得
  - [CW略語・Q符号学習](https://morse.hato.life/v7/#flashcard) - フラッシュカード・試験モード
  - [モールス信号聞き取り練習](https://morse.hato.life/v7/#listening) - QSO聞き取り、英文聞き取り
  - [縦振り電鍵練習](https://morse.hato.life/v7/#vertical) - 縦振り電鍵シミュレーター
  - [横振り電鍵練習](https://morse.hato.life/v7/#horizontal) - 横振り電鍵シミュレーター

### 開発中バージョン
- **[v6 - コッホ法マルチモード版](https://morse.hato.life/v6/)** - SPA形式、モードルーティング実装
- **[v5 - QSO聞き取り練習版](https://morse.hato.life/v5/)** - ラバースタンプQSO機能追加

### 過去バージョン
- **[v4 - 単一HTML版](https://morse.hato.life/v4/)** - 単一HTMLファイル形式
- **[v3](https://morse.hato.life/v3/)** - v2の改良版
- **[v2 - TypeScript再実装版](https://morse.hato.life/v2/)** - [README](v2/README.md)
- **[v1 - 初期実装版](https://morse.hato.life/v1/)** - [README](v1/README.md)

## 技術スタック

- **フロントエンド**: TypeScript + Vite
- **音声生成**: Web Audio API
- **状態管理**: LocalStorage
- **UI/UX**: レスポンシブデザイン、モバイル対応

## 開発

詳細は [.claude/context.md](.claude/context.md) を参照してください。

### セットアップ (v7)

```bash
cd v7/src
npm install
```

### 開発サーバー起動

```bash
cd v7/src
npm run dev
```

### ビルド

```bash
cd v7/src
npm run build
```

ビルド成果物は `v7/*.html` に出力されます。

## データファイル

- `flashcard.tsv` - CW略語・Q符号データ (295語)
  - タブ区切り形式
  - タグ、使用頻度、略語、英文、和訳、説明、具体例を収録

## ライセンス

MIT

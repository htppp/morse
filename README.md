# モールス体験

モールス信号の学習・練習を支援するWebアプリケーション

## 公開URL

- https://morse.hato.life/

## バージョン

### 開発中
- **[v4 - 最新版](https://morse.hato.life/v4/)** - 単一HTMLファイル形式、TypeScript + Vite
  - [コッホ法訓練](https://morse.hato.life/v4/koch.html) - 段階的モールス学習
  - [CW略語・Q符号学習](https://morse.hato.life/v4/flashcard.html) - フラッシュカード形式
  - [縦振り電鍵練習](https://morse.hato.life/v4/vertical.html) - 縦振り電鍵シミュレーター
  - [横振り電鍵練習](https://morse.hato.life/v4/horizontal.html) - 横振り電鍵シミュレーター
  - [実装状況・TODO](v4/TODO.md)

### 過去バージョン
- **[v3](https://morse.hato.life/v3/)** - v2の改良版
- **[v2 - TypeScriptでの再実装版](https://morse.hato.life/v2/)** - [README](v2/README.md)
- **[v1 - 初期実装版](https://morse.hato.life/v1/)** - [README](v1/README.md)

## v4の特徴

- **単一HTMLファイル**: 各ページが独立した単一HTMLファイルとして動作
- **Web Audio API**: 高精度なモールス音生成
- **レスポンシブ対応**: モバイル・タブレット・デスクトップに対応
- **LocalStorage**: 設定の永続化と学習進捗の保存（実装中）
- **TypeScript + Vite**: 型安全な開発とモダンなビルドシステム

## 開発

詳細は [.claude/context.md](.claude/context.md) を参照してください。

### セットアップ

```bash
cd v4/src
npm install
```

### 開発サーバー起動

```bash
cd v4/src
npm run dev
```

### ビルド

```bash
cd v4/src
npm run build
```

ビルド成果物は `v4/*.html` に出力されます。

## ライセンス

MIT

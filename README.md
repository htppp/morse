# モールス体験

モールス信号の学習・練習を支援するWebアプリケーション

## 公開URL

- https://morse.hato.life/

## 概要

アマチュア無線のモールス通信(CW)を学習するためのWebアプリケーションです。
ブラウザだけで、コッホ法によるモールス符号の習得、電鍵操作の練習、CW略語・Q符号の学習、実践的なQSO聞き取り練習ができます。

[LCWO (Learn CW Online)](https://lcwo.net/)の機能の一部をスマートフォンでも利用しやすくする目的で実装されています。

## 主な機能

- **コッホ法トレーニング**: レッスン1-40（標準コッホシーケンス）、カスタム文字選択対応
- **電鍵練習**: 縦振り・横振り電鍵シミュレーター、Iambic A/B対応、キーバインド設定可能
- **CW略語・Q符号学習**: フラッシュカード・試験モード、全500語以上収録、CSV/TSVエクスポート
- **QSO聞き取り練習**: ラバースタンプQSO、ランダムQSO生成、カテゴリ別テンプレート、音声ダウンロード
- **ライブラリ化**: `morse-engine`として独立したライブラリを提供、他プロジェクトから再利用可能
- **高品質**: 344テスト、98.94%カバレッジ達成

## バージョン

### 最新版
- **[v10 - GUI/エンジン分離版](https://morse.hato.life/v10/)** - モールス信号エンジンのライブラリ化、全機能v9互換
  - [README](v10/README.md) - アーキテクチャ設計とライブラリAPI仕様
  - **アーキテクチャ**: GUI層とエンジン層を分離、`morse-engine`として独立したライブラリを提供
  - **再利用性**: 他のプロジェクトから簡単に利用可能なUI非依存のエンジン
  - **テスタビリティ**: 344テスト、98.94%カバレッジ達成
  - [メニューページ](https://morse.hato.life/v10/) - 5つの練習モードへのアクセス
  - [CW略語・Q符号学習](https://morse.hato.life/v10/#flashcard) - 500語以上、閲覧/学習/試験モード
  - [コッホ法トレーニング](https://morse.hato.life/v10/#koch) - レッスン1-40、カスタム文字選択
  - [モールス信号聞き取り練習](https://morse.hato.life/v10/#listening) - QSO生成、音声ダウンロード
  - [横振り電鍵練習](https://morse.hato.life/v10/#horizontal-key) - Iambic A/B、パドルレイアウト切替
  - [縦振り電鍵練習](https://morse.hato.life/v10/#vertical-key) - 縦振り電鍵シミュレーター

### 過去バージョン
- **[v9 - v10開発前の安定版](https://morse.hato.life/v9/)** - v8の機能を維持した最終モノリス版
- **[v8 - PWA版](https://morse.hato.life/v8/)** - Progressive Web App、オフライン対応、インストール可能
- **[v7 - モールス信号聞き取り練習版](https://morse.hato.life/v7/)** - SPA形式、QSO聞き取り機能追加
- **[v6 - コッホ法マルチモード版](https://morse.hato.life/v6/)** - SPA形式、モードルーティング実装
- **[v5 - QSO聞き取り練習版](https://morse.hato.life/v5/)** - ラバースタンプQSO機能追加
- **[v4 - 単一HTML版](https://morse.hato.life/v4/)** - 単一HTMLファイル形式
- **[v3](https://morse.hato.life/v3/)** - v2の改良版
- **[v2 - TypeScript再実装版](https://morse.hato.life/v2/)** - [README](v2/README.md)
- **[v1 - 初期実装版](https://morse.hato.life/v1/)** - [README](v1/README.md)

## 技術スタック

- **フロントエンド**: TypeScript + Vite
- **アーキテクチャ**: GUI層とエンジン層を分離（v10）
- **ライブラリ**: morse-engine（UI非依存のモールス信号処理エンジン）
- **テスト**: Vitest、344テスト、98.94%カバレッジ
- **音声生成**: Web Audio API
- **状態管理**: LocalStorage
- **UI/UX**: レスポンシブデザイン、モバイル対応
- **セキュリティ**: XSS保護（HTMLエスケープ）

## 開発

詳細は [.claude/context.md](.claude/context.md) を参照してください。

### セットアップ (v10)

```bash
# ライブラリ（morse-engine）
cd v10/lib
npm install

# アプリケーション（GUI）
cd v10/app
npm install
```

### 開発サーバー起動

```bash
# アプリケーション（GUI）
cd v10/app
npm run dev
```

### テスト

```bash
# ライブラリのテスト（344テスト、98.94%カバレッジ）
cd v10/lib
npm test

# カバレッジ確認
npm run test:coverage
```

### ビルド

```bash
# ライブラリ
cd v10/lib
npm run build

# アプリケーション
cd v10/app
npm run build
```

ビルド成果物は `v10/lib/dist/` と `v10/app/dist/` に出力されます。

## データファイル

- `flashcard.tsv` - CW略語・Q符号データ (500語以上)
  - タブ区切り形式
  - タグ、使用頻度、略語、英文、和訳、説明、具体例を収録
  - v10ではCSV/TSVエクスポート機能を追加

## ライセンス

MIT

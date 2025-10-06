# モールス練習アプリ v5 - 完全SPA版

v4の機能を維持しながら、完全なSingle Page Application (SPA)として再設計したバージョンです。

## 🎯 v5の主な特徴

### 1. 完全なSPA化
- **単一HTMLファイル**: 全モードが1つのHTMLファイル（index.html）から読み込まれます
- **ページリロードなし**: モード間の遷移時にページがリロードされず、シームレスな切り替えが可能
- **状態の維持**: AudioSystemなどの共有リソースが初期化1回のみで済み、効率的

### 2. 改善されたアーキテクチャ
- **ModeControllerパターン**: 各モードが統一されたインターフェースを実装
- **適切なライフサイクル管理**: destroy()メソッドによる確実なリソース解放
- **明確なモジュール構造**: core, modes, components, stylesに分離

### 3. ビルドの最適化
- **単一エントリーポイント**: シンプルなビルドプロセス
- **コード分割**: 動的インポートによる初期ロード高速化
- **バンドルサイズ**: 約116KB（gzip: 25KB）

## 📁 ディレクトリ構造

```
v5/src/
├── index.html          # 単一エントリーポイント
├── main.ts             # アプリケーション起動ファイル
├── core/               # 共有モジュール
│   ├── router.ts       # ルーティングシステム
│   ├── audio-system.ts # 音声システム
│   ├── morse-code.ts   # モールス符号変換
│   └── settings.ts     # 設定管理
├── modes/              # 各モード
│   ├── menu/           # メニュー画面
│   ├── vertical/       # 縦振り電鍵練習
│   ├── horizontal/     # 横振り電鍵練習
│   ├── flashcard/      # CW略語・Q符号学習
│   └── koch/           # コッホ法トレーニング
├── components/         # 再利用可能なコンポーネント
└── styles/             # グローバルスタイル
    └── global.css
```

## 🚀 開発とビルド

### 開発サーバーの起動
```bash
cd v5/src
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### プロダクションビルド
```bash
cd v5/src
npm run build
```

ビルドされたファイルは `v5/dist/index.html` に出力されます。

### プレビュー
```bash
cd v5/src
npm run preview
```

## 🎓 4つの練習モード

### 1. 縦振り電鍵練習 (#vertical)
縦振り電鍵（ストレートキー）の操作を練習します。

### 2. 横振り電鍵練習 (#horizontal)
横振り電鍵（パドル）の操作を練習します。
- Iambic A/Bモード対応
- パドルレイアウト切り替え可能

### 3. CW略語・Q符号学習 (#flashcard)
無線通信で使用する略語とQ符号を学習します。
- フラッシュカードモード
- 試験モード

### 4. コッホ法トレーニング (#koch)
系統的にモールス符号を学習します。
- 40文字を段階的に習得
- レッスン別の練習

## 🔄 v4からの主な変更点

### アーキテクチャ
- **v4**: 各モードが別々のHTMLファイル（menu.html, vertical.html, など）
- **v5**: 単一HTML + ハッシュルーティング（#menu, #vertical, など）

### ナビゲーション
- **v4**: `window.location.href = './vertical.html'`
- **v5**: `window.location.hash = '#vertical'`

### モードの初期化
- **v4**: DOMContentLoadedイベントで各モードが自動実行
- **v5**: Router経由で動的にインポート・インスタンス化

### クリーンアップ
- **v4**: クリーンアップ処理なし（ページリロードで自動解放）
- **v5**: destroy()メソッドによる明示的なリソース解放

## 📝 技術スタック

- **TypeScript**: 型安全性とコード品質の向上
- **Vite**: 高速なビルドツール
- **vite-plugin-singlefile**: 単一HTMLファイル生成
- **Web Audio API**: 音声生成

## 🔧 設定可能な項目

- 音量（0-100%）
- 周波数（100-2000Hz）
- WPM（送信速度）
- Iambic A/Bモード
- パドルレイアウト（normal/reversed）

## 📱 対応環境

- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- デスクトップとモバイル対応
- Web Audio API対応必須

## 🐛 既知の問題

- 一部のブラウザでは初回音声再生時にユーザージェスチャーが必要
- iOS Safariでは音声の自動再生に制限あり

## 📄 ライセンス

ISC

## 👤 Author

モールス練習アプリ v5 - 完全SPA版

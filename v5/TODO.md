# v5 完全SPA化プロジェクト TODO

## 🎯 プロジェクトの目的

### 現在の作業: 完全なSPA(Single Page Application)化の実装
v4では各モードが別々のHTMLファイルとして存在し、モード間の遷移時にページがリロードされていました。
v5では、これを1つのHTMLファイルに統合し、ハッシュベースのルーティングでシームレスなモード切り替えを実現します。

### 達成すべきゴール
1. **ユーザー体験の向上**
   - ページリロードなしの高速なモード切り替え
   - 状態の維持(AudioSystemの初期化が1回のみで済む)
   - よりネイティブアプリに近い操作感

2. **技術的な改善**
   - 適切なライフサイクル管理(ModeControllerパターン)
   - コードの重複削減と保守性向上
   - モジュール構造の明確化(core, modes, components, styles)

3. **ビルドの最適化**
   - 単一エントリーポイントによるシンプルなビルドプロセス
   - コード分割による初期ロードの高速化
   - バンドルサイズの削減

---

## 完了したタスク

- [x] v4ディレクトリをv5にコピー
- [x] ディレクトリ構造の再構築
  - [x] modesディレクトリ作成 (vertical, horizontal, flashcard, koch, menu)
  - [x] sharedディレクトリをcoreに変更
  - [x] componentsディレクトリ作成
  - [x] stylesディレクトリ作成
- [x] ルーティングシステムの実装
  - [x] core/router.ts作成
  - [x] ModeController インターフェース定義
  - [x] ハッシュベースのルーティング実装
- [x] 各モードのコンポーネント化
  - [x] vertical: VerticalKeyTrainer をModeController化
  - [x] horizontal: HorizontalKeyTrainer をModeController化
  - [x] flashcard: FlashcardTrainer をModeController化
  - [x] koch: KochTrainer をModeController化
  - [x] menu: MenuPage をModeController化
- [x] 各モードの修正
  - [x] import pathを ../shared/ から ../../core/ に変更
  - [x] class を export class に変更
  - [x] ModeController implements追加
  - [x] window.location.href を window.location.hash に変更
  - [x] DOMContentLoaded イベントリスナー削除
  - [x] destroy() メソッド追加
- [x] メインアプリケーションファイルの作成
  - [x] index.html作成
  - [x] main.ts作成
  - [x] ルーターの設定と各モードの登録
- [x] グローバルスタイルの整理
  - [x] styles/global.css作成
- [x] Vite設定の更新
  - [x] vite.config.ts を単一エントリーポイントに変更
  - [x] package.jsonのビルドスクリプト簡略化
- [x] TypeScriptコンパイルエラーの修正
  - [x] クラス名の統一（FlashcardTrainer, KochTrainer）
  - [x] import文の修正
  - [x] destroyメソッドの重複削除
  - [x] 構文エラーの修正

## 進行中のタスク

- [ ] ビルドとテスト
  - [ ] 開発サーバーでの動作確認
  - [ ] プロダクションビルドのテスト
  - [ ] 各モード間の遷移テスト
  - [ ] 音声システムの動作確認

## 残りのタスク

- [ ] ドキュメント更新
  - [ ] README.md更新
  - [ ] v5の特徴と利点を記載

## メモ

### v5の主な改善点
1. **完全なSPA化**: 全モードが単一HTMLから読み込まれる
2. **統一されたルーティング**: ハッシュベースのシンプルなルーター
3. **適切なライフサイクル管理**: ModeControllerパターンで各モードのクリーンアップが確実
4. **モジュール構造の最適化**: core, modes, components, stylesに明確に分離
5. **ページリロードなし**: 全モード間の遷移がスムーズ

### 技術的な変更点
- DOMContentLoadedに依存しない各モードの初期化
- destroy()メソッドによる適切なリソース解放
- import pathの統一 (../../core/)
- ハッシュナビゲーション (#menu, #vertical, など)
- 動的インポートによるコード分割
- 単一エントリーポイント（index.html）でのビルド

### 次のステップ
1. 開発サーバーを起動して動作確認
2. 各モードが正しく表示され、遷移できることを確認
3. 問題があれば修正してコミット・push
4. プロダクションビルドを実行

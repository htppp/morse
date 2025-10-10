# v9 - リファクタリング版

## 目的

v8の機能を維持しつつ、コード品質を向上させるためのリファクタリングバージョン。

### v8との関係
- v8の全機能を維持（PWA、オフライン対応、状態永続化など）
- v8の動作を正として、その動作を保証するユニットテストを実装
- テストカバレッジを確保した上でリファクタリングを実施

## v8のコード品質評価（現状）

- **総合評価**: 68/100 (B)
- **改善が必要な項目**:
  - テスト: 2/10 ← **v9で重点的に改善**
  - アクセシビリティ: 3/10
  - セキュリティ: 6/10

## v9の実装方針

### Phase 1: ユニットテスト実装（現在）
v8の動作を正として、既存コードにユニットテストを追加。

### Phase 2: リファクタリング（Phase 1完了後）
テストで動作を保証しながら、段階的にリファクタリングを実施。

## ユニットテスト実装計画

### テストフレームワーク選定

#### 候補1: Vitest（推奨）
- **利点**:
  - Viteと統合されているため設定が簡単
  - Jest互換のAPI
  - TypeScriptネイティブサポート
  - ESMサポート
  - 高速な実行速度
- **欠点**:
  - 比較的新しいため情報が少ない

#### 候補2: Jest
- **利点**:
  - 成熟したフレームワーク
  - 豊富な情報とプラグイン
  - スナップショットテスト
- **欠点**:
  - TypeScript設定が複雑
  - ESM対応が不完全

**選定結果**: Vitest（Viteとの親和性、TypeScript/ESMサポート、実行速度を重視）

### テスト対象モジュールと優先度

#### 優先度: 高（ロジックが複雑、重要度が高い）
1. **morse-code.ts** (shared/)
   - モールス符号変換ロジック
   - textToMorse(), morseToText(), morseSequencesToText()
   - 文字種変換、prosign処理

2. **audio-system.ts** (shared/)
   - Web Audio API制御
   - モールス音生成
   - タイミング制御

3. **settings.ts** (shared/)
   - LocalStorage管理
   - 設定値のバリデーション

4. **html-sanitizer.ts** (core/)
   - XSS保護
   - HTMLエスケープロジック

#### 優先度: 中（モード固有のロジック）
5. **flashcard/main.ts**
   - TSV解析
   - フィルタリングロジック
   - 学習/試験ロジック

6. **koch/main.ts**
   - コッホ法レッスン管理
   - ランダム文字列生成

7. **listening/main.ts**
   - QSO生成ロジック
   - 文章生成

#### 優先度: 低（UI中心、統合テストで対応）
8. **router.ts** (core/)
   - ルーティングロジック（統合テストで対応）

9. **各モードのUI** (modes/)
   - DOMレンダリング（E2Eテストで対応）

### テスト戦略

#### 1. ユニットテスト（Vitest）
- **対象**: ロジック層（変換、計算、バリデーション）
- **モック対象**:
  - LocalStorage（vi.stubGlobal）
  - Web Audio API（vi.mock）
  - DOM API（JSDOM or happy-dom）

#### 2. 統合テスト（Vitest）
- **対象**: モジュール間連携
- **例**:
  - settings + localStorage
  - audio-system + morse-code

#### 3. E2Eテスト（将来実装）
- **候補**: Playwright or Cypress
- **対象**: ユーザーフロー全体
- **優先度**: v9では実装しない（Phase 3以降）

### テスト環境セットアップ

```bash
# Vitestとテストユーティリティのインストール
npm install -D vitest @vitest/ui happy-dom @testing-library/dom

# テストカバレッジツール
npm install -D @vitest/coverage-v8
```

### vitest.config.ts設定方針

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
        'src/main.ts', // エントリーポイント
      ]
    }
  }
})
```

### テストファイル構成

```
src/
├── shared/
│   ├── morse-code.ts
│   ├── morse-code.test.ts          # ユニットテスト
│   ├── audio-system.ts
│   ├── audio-system.test.ts
│   └── settings.ts
│       └── settings.test.ts
├── core/
│   ├── html-sanitizer.ts
│   ├── html-sanitizer.test.ts
│   └── router.ts
│       └── router.integration.test.ts  # 統合テスト
└── modes/
    └── flashcard/
        ├── main.ts
        └── main.test.ts
```

### テストカバレッジ目標

- **Phase 1完了時**:
  - shared/: 90%以上
  - core/: 80%以上
  - modes/: 60%以上（ロジック部分のみ）

- **Phase 2完了時**:
  - 全体: 70%以上

## リファクタリング方針（Phase 2）

### 改善項目

#### 1. アーキテクチャ改善
- **現状**: 各モードが肥大化（flashcard/main.ts: 1700行超）
- **改善**:
  - Presentation層とLogic層の分離
  - カスタムフック的なロジック抽出
  - 状態管理の整理

#### 2. 型安全性向上
- **現状**: 一部型アサーションやany使用
- **改善**:
  - 厳格な型定義
  - ユーザー定義型ガード
  - Zodなどのバリデーションライブラリ導入検討

#### 3. エラーハンドリング統一
- **現状**: エラー処理が散在
- **改善**:
  - エラーバウンダリパターン
  - 統一的なエラー処理機構

#### 4. パフォーマンス最適化
- **現状**: 一部再レンダリングが多い
- **改善**:
  - 不要な再レンダリング削減
  - メモ化の活用

### リファクタリング手順

1. テストで動作を保証
2. 1機能ずつリファクタリング
3. テスト実行で動作確認
4. コミット

## 考慮事項

### 1. v8との互換性
- **LocalStorageキー**: v8と共通（`v8.*`）を使用
- **データ移行**: 不要（同じキーを使用）
- **PWA**: manifest等も同じ設定を維持

### 2. テスト実装の課題

#### Web Audio API
- **課題**: ブラウザAPIのモック化が必要
- **対応**: vi.mockでAudioContextをモック

#### LocalStorage
- **課題**: テスト間でクリアが必要
- **対応**: beforeEach/afterEachでクリア

#### DOM操作
- **課題**: happy-domの制約
- **対応**: 必要に応じてjsdomに切り替え

### 3. CI/CD統合
- **GitHub Actions**でテスト自動実行
- **カバレッジレポート**の自動生成
- **PRマージ条件**にテスト成功を追加

### 4. 段階的な実装
- **Phase 1**: テスト実装（1-2週間）
  - shared/モジュールから開始
  - 1モジュールずつ確実にテスト

- **Phase 2**: リファクタリング（2-3週間）
  - テストカバレッジ確認しながら実施
  - 1ファイルずつ段階的に

- **Phase 3**: 追加改善（将来）
  - E2Eテスト
  - アクセシビリティ改善
  - パフォーマンス最適化

## 開発環境

### セットアップ

```bash
cd v9/src
npm install
npm install -D vitest @vitest/ui happy-dom @testing-library/dom @vitest/coverage-v8
```

### テスト実行

```bash
# テスト実行
npm run test

# Watch mode
npm run test:watch

# カバレッジ計測
npm run test:coverage

# UIモード
npm run test:ui
```

### ビルド

```bash
# 開発サーバー
npm run dev

# プロダクションビルド
npm run build
```

## 参考資料

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Web Audio API Test Patterns](https://github.com/web-audio-components/web-audio-test-api)
- [LocalStorage Testing Patterns](https://kentcdodds.com/blog/how-to-test-code-that-uses-local-storage)

## 進捗管理

- [ ] Phase 1: ユニットテスト実装
  - [ ] Vitest環境構築
  - [ ] shared/morse-code.tsのテスト
  - [ ] shared/audio-system.tsのテスト
  - [ ] shared/settings.tsのテスト
  - [ ] core/html-sanitizer.tsのテスト
  - [ ] modes/flashcard/のテスト（ロジック部分）
  - [ ] modes/koch/のテスト（ロジック部分）
  - [ ] modes/listening/のテスト（ロジック部分）

- [ ] Phase 2: リファクタリング
  - [ ] アーキテクチャ改善
  - [ ] 型安全性向上
  - [ ] エラーハンドリング統一
  - [ ] パフォーマンス最適化

---

**作成日**: 2025-10-10
**ベース**: v8（PWA版）
**目標**: テストカバレッジ70%以上、コード品質A評価

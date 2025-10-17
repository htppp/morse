# モールス練習アプリ v10

モールス信号の練習アプリケーション - 縦振り電鍵、横振り電鍵、コッホ法、聞き取り練習、CW略語学習

## 開発環境セットアップ

### 必要な環境

- Node.js 18以降
- npm

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

### ビルド

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

## テスト

### 単体テスト (lib側)

```bash
cd ../lib
npm test
```

### E2Eテスト

#### 初回セットアップ

E2Eテストを実行するには、Chromiumブラウザと依存ライブラリのインストールが必要です:

```bash
# Chromiumブラウザのインストール
npx playwright install chromium

# システム依存ライブラリのインストール（管理者権限が必要）
npx playwright install-deps chromium
```

**注意**: `npx playwright install-deps chromium`は管理者権限が必要です。
Linuxの場合はsudoで実行してください:

```bash
sudo npx playwright install-deps chromium
```

#### WSL環境での制限事項

現在、WSL (Windows Subsystem for Linux) 環境では、Playwrightのページ作成処理に制約があり、E2Eテストが正常に動作しません。

**確認された問題**:
- ブラウザ起動: ✓ 正常
- コンテキスト作成: ✓ 正常
- ページ作成: ✗ `browserContext.newPage()`が3秒以上かかる

**試行した対策** (効果なし):
- `--use-gl=swiftshader`, `--disable-gpu`, `--disable-dev-shm-usage`, `--no-sandbox`の追加
- ブラウザのインストール場所確認 (既にext4上に配置済み)

WSL環境では`browserContext.newPage()`の処理が異常に遅く、実用的なテスト実行ができません。これはGPUレンダリングの問題ではなく、WSLのプロセス間通信やカーネル機能の制約によるものと考えられます。

**推奨される実行環境**:
- ネイティブLinux環境 (Ubuntu等)
- Windowsネイティブ環境 (Node.jsとPlaywrightをWindows上に直接インストール)
- CI/CD環境 (GitHub Actions等) - リポジトリルートの`.github/workflows/e2e-test.yml`で自動実行

**参考**: playwright.config.ts (playwright.config.ts:62-69)にはWSL環境用の最適化設定が含まれていますが、根本的な問題の解決には至りませんでした。

#### テスト実行

```bash
npm run test:e2e
```

特定のテストファイルのみ実行:

```bash
npx playwright test e2e/menu.spec.ts
```

### CI/CD (GitHub Actions)

GitHub Actionsで自動的にE2Eテストを実行できます。ワークフローは以下のタイミングで実行されます:

- `master`または`main`ブランチへのpush
- Pull Request作成時
- 手動実行 (Actions タブから)

**ワークフロー設定**: リポジトリルートの`.github/workflows/e2e-test.yml`

ワークフローは以下を実行します:
1. Node.js 20のセットアップ
2. 依存関係のインストール
3. Chromiumブラウザとシステム依存関係のインストール
4. デバッグテストの実行 (e2e/debug.spec.ts)
5. 全E2Eテストの実行
6. テストレポートのアップロード (失敗時も含む)

**手動実行方法**:
1. GitHubリポジトリの「Actions」タブを開く
2. 「E2E Tests」ワークフローを選択
3. 「Run workflow」ボタンをクリック

これにより、WSL環境の制約を回避して、ネイティブUbuntu環境でのE2Eテスト結果を確認できます。

## プロジェクト構造

```
v10/
├── lib/          # コアロジック（モールスエンジン、トレーナー等）
│   ├── src/
│   └── tests/
└── app/          # UIアプリケーション
    ├── src/
    ├── e2e/      # E2Eテスト
    └── dist/     # ビルド出力
```

## ライセンス

MIT

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

現在、WSL (Windows Subsystem for Linux) 環境では、Playwrightのブラウザ起動に制約があり、E2Eテストが正常に動作しない場合があります。

症状:
- `browserContext.newPage`がタイムアウト
- テストが3秒でタイムアウト

この場合は、ネイティブLinux環境またはWindowsネイティブ環境での実行をお試しください。

#### テスト実行

```bash
npm run test:e2e
```

特定のテストファイルのみ実行:

```bash
npx playwright test e2e/menu.spec.ts
```

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

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',

	//! テストタイムアウト設定。
	timeout: 30 * 1000,
	expect: {
		timeout: 5000
	},

	//! 並列実行設定。
	fullyParallel: true,

	//! CIで失敗時のリトライ設定。
	retries: process.env.CI ? 2 : 0,

	//! ワーカー数設定。
	workers: process.env.CI ? 1 : undefined,

	//! レポーター設定。
	reporter: [
		['html', { outputFolder: 'playwright-report' }],
		['list']
	],

	//! 共通設定。
	use: {
		//! ベースURL（開発サーバー）。
		baseURL: 'http://localhost:3000',

		//! トレース設定。
		trace: 'on-first-retry',

		//! スクリーンショット設定。
		screenshot: 'only-on-failure',

		//! ビデオ設定。
		video: 'retain-on-failure',
	},

	//! テスト対象ブラウザ設定。
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},

		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},

		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},

		//! モバイルブラウザ。
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		},
	],

	//! 開発サーバー設定。
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});

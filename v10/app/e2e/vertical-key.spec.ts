import { test, expect } from '@playwright/test';

test.describe('縦振り電鍵練習', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/#vertical');
		//! ページが完全に読み込まれるまで待機。
		await page.waitForLoadState('networkidle');
	});

	test('画面の基本要素が表示される', async ({ page }) => {
		//! タイトル。
		await expect(page.locator('h1')).toContainText('縦振り電鍵練習');

		//! 電鍵ボタン。
		await expect(page.locator('#morse-key')).toBeVisible();

		//! モールス信号表示エリア。
		await expect(page.locator('#morse-buffer')).toBeVisible();

		//! デコード結果表示エリア。
		await expect(page.locator('#decoded-text')).toBeVisible();

		//! クリアボタン。
		await expect(page.locator('#clear-btn')).toBeVisible();

		//! 設定アイコン。
		await expect(page.locator('#settingsIcon')).toBeVisible();
	});

	test('メニューに戻るボタンが機能する', async ({ page }) => {
		await page.click('.back-btn');
		await expect(page).toHaveURL(/#menu/);
	});

	test('設定モーダルが開ける', async ({ page }) => {
		//! 設定アイコンをクリック。
		await page.click('#settingsIcon');

		//! モーダルが表示されるまで待機。
		await page.waitForSelector('.settings-modal', { state: 'visible', timeout: 10000 });
		await expect(page.locator('.settings-modal')).toBeVisible();

		//! 設定項目が表示される。
		await expect(page.locator('text=音量')).toBeVisible();
		await expect(page.locator('text=周波数')).toBeVisible();
		await expect(page.locator('text=速度 (WPM)')).toBeVisible();
	});

	test('クリアボタンが機能する', async ({ page }) => {
		//! クリアボタンをクリック。
		await page.click('#clear-btn');

		//! バッファがクリアされる（プレースホルダーテキストが表示される）。
		const morseBuffer = page.locator('#morse-buffer');
		await expect(morseBuffer).toContainText('ここにモールス符号が表示されます');
	});
});

import { test, expect } from '@playwright/test';

test.describe('メニュー画面', () => {
	test.beforeEach(async ({ page }) => {
		//! アプリケーションのルートにアクセス。
		await page.goto('/');
	});

	test('メニュー画面が表示される', async ({ page }) => {
		//! タイトルを確認。
		await expect(page.locator('h1')).toContainText('モールス信号練習アプリ');

		//! 5つの練習モードボタンが表示される。
		await expect(page.locator('.menu-item')).toHaveCount(5);
	});

	test('縦振り電鍵練習画面に遷移できる', async ({ page }) => {
		//! 縦振り電鍵練習ボタンをクリック。
		await page.click('text=縦振り電鍵練習');

		//! URLが変更される。
		await expect(page).toHaveURL(/#vertical-key/);

		//! 画面タイトルを確認。
		await expect(page.locator('h1')).toContainText('縦振り電鍵練習');
	});

	test('横振り電鍵練習画面に遷移できる', async ({ page }) => {
		await page.click('text=横振り電鍵練習');
		await expect(page).toHaveURL(/#horizontal-key/);
		await expect(page.locator('h1')).toContainText('横振り電鍵練習');
	});

	test('CW略語・Q符号学習画面に遷移できる', async ({ page }) => {
		await page.click('text=CW略語・Q符号学習');
		await expect(page).toHaveURL(/#flashcard/);
		await expect(page.locator('h1')).toContainText('CW略語・Q符号学習');
	});

	test('コッホ法トレーニング画面に遷移できる', async ({ page }) => {
		await page.click('text=コッホ法トレーニング');
		await expect(page).toHaveURL(/#koch/);
		await expect(page.locator('h1')).toContainText('コッホ法トレーニング');
	});

	test('モールス信号聞き取り練習画面に遷移できる', async ({ page }) => {
		await page.click('text=モールス信号聞き取り練習');
		await expect(page).toHaveURL(/#listening/);
		await expect(page.locator('h1')).toContainText('モールス信号聞き取り練習');
	});
});

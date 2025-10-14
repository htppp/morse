/**
 * listening/settings.ts のユニットテスト
 * 聞き取り練習専用設定管理のLocalStorage操作をテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ListeningSettings } from './settings';

describe('ListeningSettings', () => {
	let originalGetItem: typeof localStorage.getItem;
	let originalSetItem: typeof localStorage.setItem;

	beforeEach(() => {
		// 元のメソッドを保存
		originalGetItem = localStorage.getItem;
		originalSetItem = localStorage.setItem;
		// LocalStorageをクリア
		localStorage.clear();
		// 設定をリセット（デフォルト値に戻す）
		ListeningSettings.reset();
		// reset()で保存された内容もクリア
		localStorage.clear();
	});

	afterEach(() => {
		// LocalStorageを復元
		localStorage.getItem = originalGetItem;
		localStorage.setItem = originalSetItem;
		localStorage.clear();
	});

	describe('デフォルト値', () => {
		it('load()でデフォルト設定が読み込まれる（保存データなし）', () => {
			ListeningSettings.load();

			expect(ListeningSettings.get('characterSpeed')).toBe(20);
			expect(ListeningSettings.get('effectiveSpeed')).toBe(20);
			expect(ListeningSettings.get('frequency')).toBe(600);
			expect(ListeningSettings.get('volume')).toBe(0.5);
		});

		it('getAll()でデフォルト設定オブジェクトが取得できる', () => {
			ListeningSettings.load();
			const all = ListeningSettings.getAll();

			expect(all).toEqual({
				characterSpeed: 20,
				effectiveSpeed: 20,
				frequency: 600,
				volume: 0.5,
			});
		});
	});

	describe('LocalStorageからの読み込み', () => {
		it('保存された設定を読み込める', () => {
			const savedData = JSON.stringify({
				characterSpeed: 25,
				effectiveSpeed: 15,
				frequency: 750,
				volume: 0.8,
			});
			localStorage.setItem('v8.listening.settings', savedData);

			ListeningSettings.load();

			expect(ListeningSettings.get('characterSpeed')).toBe(25);
			expect(ListeningSettings.get('effectiveSpeed')).toBe(15);
			expect(ListeningSettings.get('frequency')).toBe(750);
			expect(ListeningSettings.get('volume')).toBe(0.8);
		});

		it('部分的な保存データでもマージされる', () => {
			const savedData = JSON.stringify({
				characterSpeed: 30,
				frequency: 500,
			});
			localStorage.setItem('v8.listening.settings', savedData);

			ListeningSettings.load();

			// 保存された値
			expect(ListeningSettings.get('characterSpeed')).toBe(30);
			expect(ListeningSettings.get('frequency')).toBe(500);

			// デフォルト値が保持される
			expect(ListeningSettings.get('effectiveSpeed')).toBe(20);
			expect(ListeningSettings.get('volume')).toBe(0.5);
		});

		it('不正なJSON形式の場合はデフォルト値を使用する', () => {
			localStorage.setItem('v8.listening.settings', 'invalid json');

			ListeningSettings.load();

			// デフォルト値が使われる
			expect(ListeningSettings.get('characterSpeed')).toBe(20);
			expect(ListeningSettings.get('frequency')).toBe(600);
		});
	});

	describe('設定の保存', () => {
		it('set()で設定を更新して保存できる', () => {
			ListeningSettings.load();

			ListeningSettings.set('characterSpeed', 25);

			expect(ListeningSettings.get('characterSpeed')).toBe(25);

			// LocalStorageに保存されているか確認
			const saved = localStorage.getItem('v8.listening.settings');
			expect(saved).not.toBeNull();
			const parsed = JSON.parse(saved!);
			expect(parsed.characterSpeed).toBe(25);
		});

		it('複数の設定を更新して保存できる', () => {
			ListeningSettings.load();

			ListeningSettings.set('characterSpeed', 30);
			ListeningSettings.set('frequency', 800);
			ListeningSettings.set('volume', 0.9);

			expect(ListeningSettings.get('characterSpeed')).toBe(30);
			expect(ListeningSettings.get('frequency')).toBe(800);
			expect(ListeningSettings.get('volume')).toBe(0.9);

			// LocalStorageに保存されているか確認
			const saved = localStorage.getItem('v8.listening.settings');
			const parsed = JSON.parse(saved!);
			expect(parsed.characterSpeed).toBe(30);
			expect(parsed.frequency).toBe(800);
			expect(parsed.volume).toBe(0.9);
		});
	});

	describe('設定のリセット', () => {
		it('reset()でデフォルト値に戻る', () => {
			ListeningSettings.load();

			// 設定を変更
			ListeningSettings.set('characterSpeed', 50);
			ListeningSettings.set('frequency', 500);
			expect(ListeningSettings.get('characterSpeed')).toBe(50);

			// リセット
			ListeningSettings.reset();

			expect(ListeningSettings.get('characterSpeed')).toBe(20);
			expect(ListeningSettings.get('frequency')).toBe(600);
		});

		it('reset()後もLocalStorageに保存される', () => {
			ListeningSettings.load();
			ListeningSettings.set('characterSpeed', 50);

			ListeningSettings.reset();

			const saved = localStorage.getItem('v8.listening.settings');
			const parsed = JSON.parse(saved!);
			expect(parsed.characterSpeed).toBe(20);
		});
	});

	describe('エラーハンドリング', () => {
		it('LocalStorageが無効な場合でもエラーにならない（load）', () => {
			// LocalStorageをモック
			localStorage.getItem = () => {
				throw new Error('LocalStorage disabled');
			};

			expect(() => {
				ListeningSettings.load();
			}).not.toThrow();

			// デフォルト値が使われる
			expect(ListeningSettings.get('characterSpeed')).toBe(20);
		});

		it('LocalStorageが無効な場合でもエラーにならない（save）', () => {
			ListeningSettings.load();

			// LocalStorageをモック
			localStorage.setItem = () => {
				throw new Error('LocalStorage disabled');
			};

			expect(() => {
				ListeningSettings.set('characterSpeed', 25);
			}).not.toThrow();

			// メモリ上の値は更新される
			expect(ListeningSettings.get('characterSpeed')).toBe(25);
		});
	});

	describe('型安全性', () => {
		it('数値型プロパティに正しく値を設定できる', () => {
			ListeningSettings.load();

			ListeningSettings.set('characterSpeed', 25);
			ListeningSettings.set('effectiveSpeed', 15);
			ListeningSettings.set('frequency', 700);
			ListeningSettings.set('volume', 0.6);

			expect(ListeningSettings.get('characterSpeed')).toBe(25);
			expect(ListeningSettings.get('effectiveSpeed')).toBe(15);
			expect(ListeningSettings.get('frequency')).toBe(700);
			expect(ListeningSettings.get('volume')).toBe(0.6);
		});
	});
});

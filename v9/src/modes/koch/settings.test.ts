/**
 * koch/settings.ts のユニットテスト
 * コッホ法専用設定管理のLocalStorage操作をテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KochSettings } from './settings';

describe('KochSettings', () => {
	let originalGetItem: typeof localStorage.getItem;
	let originalSetItem: typeof localStorage.setItem;

	beforeEach(() => {
		// 元のメソッドを保存
		originalGetItem = localStorage.getItem;
		originalSetItem = localStorage.setItem;
		// LocalStorageをクリア
		localStorage.clear();
		// 設定をリセット（デフォルト値に戻す）
		KochSettings.reset();
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
			KochSettings.load();

			expect(KochSettings.get('characterSpeed')).toBe(20);
			expect(KochSettings.get('effectiveSpeed')).toBe(20);
			expect(KochSettings.get('frequency')).toBe(750);
			expect(KochSettings.get('volume')).toBe(0.7);
			expect(KochSettings.get('groupSize')).toBe(9);
			expect(KochSettings.get('displayMode')).toBe('fixed');
			expect(KochSettings.get('practiceDuration')).toBe(60);
			expect(KochSettings.get('showInput')).toBe(true);
		});

		it('getAll()でデフォルト設定オブジェクトが取得できる', () => {
			KochSettings.load();
			const all = KochSettings.getAll();

			expect(all).toEqual({
				characterSpeed: 20,
				effectiveSpeed: 20,
				frequency: 750,
				volume: 0.7,
				groupSize: 9,
				displayMode: 'fixed',
				practiceDuration: 60,
				showInput: true,
			});
		});
	});

	describe('LocalStorageからの読み込み', () => {
		it('保存された設定を読み込める', () => {
			const savedData = JSON.stringify({
				characterSpeed: 25,
				effectiveSpeed: 15,
				frequency: 600,
				volume: 0.8,
				groupSize: 5,
				displayMode: 'scroll',
				practiceDuration: 120,
				showInput: false,
			});
			localStorage.setItem('v4.koch.settings', savedData);

			KochSettings.load();

			expect(KochSettings.get('characterSpeed')).toBe(25);
			expect(KochSettings.get('effectiveSpeed')).toBe(15);
			expect(KochSettings.get('frequency')).toBe(600);
			expect(KochSettings.get('volume')).toBe(0.8);
			expect(KochSettings.get('groupSize')).toBe(5);
			expect(KochSettings.get('displayMode')).toBe('scroll');
			expect(KochSettings.get('practiceDuration')).toBe(120);
			expect(KochSettings.get('showInput')).toBe(false);
		});

		it('部分的な保存データでもマージされる', () => {
			const savedData = JSON.stringify({
				characterSpeed: 30,
				frequency: 500,
			});
			localStorage.setItem('v4.koch.settings', savedData);

			KochSettings.load();

			// 保存された値
			expect(KochSettings.get('characterSpeed')).toBe(30);
			expect(KochSettings.get('frequency')).toBe(500);

			// デフォルト値が保持される
			expect(KochSettings.get('effectiveSpeed')).toBe(20);
			expect(KochSettings.get('volume')).toBe(0.7);
		});

		it('不正なJSON形式の場合はデフォルト値を使用する', () => {
			localStorage.setItem('v4.koch.settings', 'invalid json');

			KochSettings.load();

			// デフォルト値が使われる
			expect(KochSettings.get('characterSpeed')).toBe(20);
			expect(KochSettings.get('frequency')).toBe(750);
		});
	});

	describe('設定の保存', () => {
		it('set()で設定を更新して保存できる', () => {
			KochSettings.load();

			KochSettings.set('characterSpeed', 25);

			expect(KochSettings.get('characterSpeed')).toBe(25);

			// LocalStorageに保存されているか確認
			const saved = localStorage.getItem('v4.koch.settings');
			expect(saved).not.toBeNull();
			const parsed = JSON.parse(saved!);
			expect(parsed.characterSpeed).toBe(25);
		});

		it('複数の設定を更新して保存できる', () => {
			KochSettings.load();

			KochSettings.set('characterSpeed', 30);
			KochSettings.set('frequency', 600);
			KochSettings.set('groupSize', 7);

			expect(KochSettings.get('characterSpeed')).toBe(30);
			expect(KochSettings.get('frequency')).toBe(600);
			expect(KochSettings.get('groupSize')).toBe(7);

			// LocalStorageに保存されているか確認
			const saved = localStorage.getItem('v4.koch.settings');
			const parsed = JSON.parse(saved!);
			expect(parsed.characterSpeed).toBe(30);
			expect(parsed.frequency).toBe(600);
			expect(parsed.groupSize).toBe(7);
		});
	});

	describe('設定のリセット', () => {
		it('reset()でデフォルト値に戻る', () => {
			KochSettings.load();

			// 設定を変更
			KochSettings.set('characterSpeed', 50);
			KochSettings.set('frequency', 500);
			expect(KochSettings.get('characterSpeed')).toBe(50);

			// リセット
			KochSettings.reset();

			expect(KochSettings.get('characterSpeed')).toBe(20);
			expect(KochSettings.get('frequency')).toBe(750);
		});

		it('reset()後もLocalStorageに保存される', () => {
			KochSettings.load();
			KochSettings.set('characterSpeed', 50);

			KochSettings.reset();

			const saved = localStorage.getItem('v4.koch.settings');
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
				KochSettings.load();
			}).not.toThrow();

			// デフォルト値が使われる
			expect(KochSettings.get('characterSpeed')).toBe(20);
		});

		it('LocalStorageが無効な場合でもエラーにならない（save）', () => {
			KochSettings.load();

			// LocalStorageをモック
			localStorage.setItem = () => {
				throw new Error('LocalStorage disabled');
			};

			expect(() => {
				KochSettings.set('characterSpeed', 25);
			}).not.toThrow();

			// メモリ上の値は更新される
			expect(KochSettings.get('characterSpeed')).toBe(25);
		});
	});

	describe('型安全性', () => {
		it('displayModeはfixedまたはscrollのみ受け付ける', () => {
			KochSettings.load();

			KochSettings.set('displayMode', 'fixed');
			expect(KochSettings.get('displayMode')).toBe('fixed');

			KochSettings.set('displayMode', 'scroll');
			expect(KochSettings.get('displayMode')).toBe('scroll');
		});

		it('数値型プロパティに正しく値を設定できる', () => {
			KochSettings.load();

			KochSettings.set('characterSpeed', 25);
			KochSettings.set('effectiveSpeed', 15);
			KochSettings.set('frequency', 600);
			KochSettings.set('volume', 0.5);
			KochSettings.set('groupSize', 5);
			KochSettings.set('practiceDuration', 120);

			expect(KochSettings.get('characterSpeed')).toBe(25);
			expect(KochSettings.get('effectiveSpeed')).toBe(15);
			expect(KochSettings.get('frequency')).toBe(600);
			expect(KochSettings.get('volume')).toBe(0.5);
			expect(KochSettings.get('groupSize')).toBe(5);
			expect(KochSettings.get('practiceDuration')).toBe(120);
		});

		it('boolean型プロパティに正しく値を設定できる', () => {
			KochSettings.load();

			KochSettings.set('showInput', false);
			expect(KochSettings.get('showInput')).toBe(false);

			KochSettings.set('showInput', true);
			expect(KochSettings.get('showInput')).toBe(true);
		});
	});
});

/**
 * settings.ts のユニットテスト
 * LocalStorage操作と設定管理のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Settings } from './settings';

describe('Settings', () => {
	// 各テストの前にLocalStorageとSettingsをクリア
	beforeEach(() => {
		localStorage.clear();
		// Settingsの内部状態をリセット（デフォルト値に戻す）
		Settings.reset();
	});

	describe('デフォルト値', () => {
		it('volumeのデフォルト値は0.7である', () => {
			expect(Settings.get('volume')).toBe(0.7);
		});

		it('frequencyのデフォルト値は750である', () => {
			expect(Settings.get('frequency')).toBe(750);
		});

		it('wpmのデフォルト値は20である', () => {
			expect(Settings.get('wpm')).toBe(20);
		});

		it('iambicModeのデフォルト値はBである', () => {
			expect(Settings.get('iambicMode')).toBe('B');
		});

		it('paddleLayoutのデフォルト値はnormalである', () => {
			expect(Settings.get('paddleLayout')).toBe('normal');
		});
	});

	describe('get()', () => {
		it('設定値を取得できる', () => {
			const volume = Settings.get('volume');
			expect(volume).toBeDefined();
			expect(typeof volume).toBe('number');
		});

		it('各設定項目を個別に取得できる', () => {
			expect(Settings.get('volume')).toBe(0.7);
			expect(Settings.get('frequency')).toBe(750);
			expect(Settings.get('wpm')).toBe(20);
			expect(Settings.get('iambicMode')).toBe('B');
			expect(Settings.get('paddleLayout')).toBe('normal');
		});

		it('設定変更後の値を取得できる', () => {
			Settings.set('volume', 0.5);
			expect(Settings.get('volume')).toBe(0.5);
		});
	});

	describe('set()', () => {
		it('設定値を更新できる', () => {
			Settings.set('volume', 0.5);
			expect(Settings.get('volume')).toBe(0.5);
		});

		it('複数の設定値を順次更新できる', () => {
			Settings.set('volume', 0.5);
			Settings.set('frequency', 600);
			Settings.set('wpm', 25);

			expect(Settings.get('volume')).toBe(0.5);
			expect(Settings.get('frequency')).toBe(600);
			expect(Settings.get('wpm')).toBe(25);
		});

		it('iambicModeをAに設定できる', () => {
			Settings.set('iambicMode', 'A');
			expect(Settings.get('iambicMode')).toBe('A');
		});

		it('iambicModeをBに設定できる', () => {
			Settings.set('iambicMode', 'B');
			expect(Settings.get('iambicMode')).toBe('B');
		});

		it('paddleLayoutをreversedに設定できる', () => {
			Settings.set('paddleLayout', 'reversed');
			expect(Settings.get('paddleLayout')).toBe('reversed');
		});

		it('設定変更時に自動的にsave()が呼ばれる', () => {
			const saveSpy = vi.spyOn(Settings, 'save');
			Settings.set('volume', 0.8);
			expect(saveSpy).toHaveBeenCalled();
			saveSpy.mockRestore();
		});
	});

	describe('save()', () => {
		it('設定をLocalStorageに保存できる', () => {
			Settings.set('volume', 0.3);
			Settings.save();

			const saved = localStorage.getItem('v4.settings');
			expect(saved).toBeDefined();
			expect(saved).not.toBeNull();
		});

		it('保存されたデータがJSON形式である', () => {
			Settings.set('volume', 0.3);
			Settings.save();

			const saved = localStorage.getItem('v4.settings');
			expect(() => JSON.parse(saved!)).not.toThrow();
		});

		it('保存されたデータに設定値が含まれる', () => {
			Settings.set('volume', 0.3);
			Settings.set('frequency', 600);
			Settings.save();

			const saved = localStorage.getItem('v4.settings');
			const parsed = JSON.parse(saved!);
			expect(parsed.volume).toBe(0.3);
			expect(parsed.frequency).toBe(600);
		});

		it('エラー時にコンソールエラーを出力する', () => {
			// LocalStorageのsetItemをエラーをthrowするようにモック
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
				throw new Error('Storage quota exceeded');
			});

			Settings.save();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to save settings:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
			setItemSpy.mockRestore();
		});
	});

	describe('load()', () => {
		it('LocalStorageから設定を読み込める', () => {
			// 事前にデータを保存
			const testData = {
				volume: 0.4,
				frequency: 800,
				wpm: 25,
				iambicMode: 'A' as const,
				paddleLayout: 'reversed' as const,
			};
			localStorage.setItem('v4.settings', JSON.stringify(testData));

			// 読み込み
			Settings.load();

			expect(Settings.get('volume')).toBe(0.4);
			expect(Settings.get('frequency')).toBe(800);
			expect(Settings.get('wpm')).toBe(25);
			expect(Settings.get('iambicMode')).toBe('A');
			expect(Settings.get('paddleLayout')).toBe('reversed');
		});

		it('LocalStorageにデータがない場合デフォルト値を使用する', () => {
			localStorage.clear();
			Settings.load();

			expect(Settings.get('volume')).toBe(0.7);
			expect(Settings.get('frequency')).toBe(750);
			expect(Settings.get('wpm')).toBe(20);
		});

		it('部分的なデータの場合、デフォルト値で補完する', () => {
			// volumeのみ保存されている
			localStorage.setItem('v4.settings', JSON.stringify({ volume: 0.5 }));
			Settings.load();

			expect(Settings.get('volume')).toBe(0.5); // 保存された値
			expect(Settings.get('frequency')).toBe(750); // デフォルト値
			expect(Settings.get('wpm')).toBe(20); // デフォルト値
		});

		it('不正なJSON形式の場合エラーハンドリングする', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			localStorage.setItem('v4.settings', 'invalid json');

			Settings.load();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to load settings:',
				expect.any(Error)
			);

			// デフォルト値が使われるべき
			expect(Settings.get('volume')).toBe(0.7);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('getAll()', () => {
		it('全設定値を取得できる', () => {
			const all = Settings.getAll();
			expect(all).toBeDefined();
			expect(typeof all).toBe('object');
		});

		it('全設定項目が含まれる', () => {
			const all = Settings.getAll();
			expect(all).toHaveProperty('volume');
			expect(all).toHaveProperty('frequency');
			expect(all).toHaveProperty('wpm');
			expect(all).toHaveProperty('iambicMode');
			expect(all).toHaveProperty('paddleLayout');
		});

		it('設定変更後の全設定値を取得できる', () => {
			Settings.set('volume', 0.6);
			Settings.set('frequency', 900);

			const all = Settings.getAll();
			expect(all.volume).toBe(0.6);
			expect(all.frequency).toBe(900);
		});

		it('返されるオブジェクトは元のオブジェクトのコピーである', () => {
			const all1 = Settings.getAll();
			all1.volume = 0.1; // 変更してみる

			const all2 = Settings.getAll();
			expect(all2.volume).not.toBe(0.1); // 元の値は変更されていない
		});
	});

	describe('統合テスト', () => {
		it('save()とload()でデータを永続化・復元できる', () => {
			// データを設定して保存
			Settings.set('volume', 0.2);
			Settings.set('frequency', 500);
			Settings.set('wpm', 30);
			Settings.set('iambicMode', 'A');
			Settings.set('paddleLayout', 'reversed');
			Settings.save();

			// 読み込み
			Settings.load();

			// 設定が復元される
			expect(Settings.get('volume')).toBe(0.2);
			expect(Settings.get('frequency')).toBe(500);
			expect(Settings.get('wpm')).toBe(30);
			expect(Settings.get('iambicMode')).toBe('A');
			expect(Settings.get('paddleLayout')).toBe('reversed');
		});

		it('複数回の設定変更と保存・読み込みを繰り返せる', () => {
			// 1回目
			Settings.set('volume', 0.5);
			Settings.save();
			Settings.load();
			expect(Settings.get('volume')).toBe(0.5);

			// 2回目
			Settings.set('volume', 0.8);
			Settings.save();
			Settings.load();
			expect(Settings.get('volume')).toBe(0.8);

			// 3回目
			Settings.set('volume', 0.3);
			Settings.save();
			Settings.load();
			expect(Settings.get('volume')).toBe(0.3);
		});

		it('設定のリセット（デフォルト値への復元）ができる', () => {
			// カスタム設定
			Settings.set('volume', 0.1);
			Settings.set('frequency', 1000);

			// LocalStorageをクリアしてリセット
			localStorage.clear();
			Settings.reset();

			// デフォルト値に戻る
			expect(Settings.get('volume')).toBe(0.7);
			expect(Settings.get('frequency')).toBe(750);
		});
	});

	describe('エッジケース', () => {
		it('極端な値も設定できる（バリデーションはない）', () => {
			Settings.set('volume', 999 as any);
			expect(Settings.get('volume')).toBe(999);
		});

		it('負の値も設定できる', () => {
			Settings.set('frequency', -100);
			expect(Settings.get('frequency')).toBe(-100);
		});

		it('0も設定できる', () => {
			Settings.set('volume', 0);
			expect(Settings.get('volume')).toBe(0);
		});
	});
});

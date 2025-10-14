/**
 * listening/templates.ts のユニットテスト
 * QSO生成ロジックとテンプレート管理をテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	Template,
	generateRandomQSO,
	getAllBuiltinTemplates,
	getTemplatesByCategory,
	getCustomTemplates,
	saveCustomTemplates,
	addCustomTemplate,
	updateCustomTemplate,
	deleteCustomTemplate,
	getTemplateById,
} from './templates';

describe('templates', () => {
	let originalGetItem: typeof localStorage.getItem;
	let originalSetItem: typeof localStorage.setItem;

	beforeEach(() => {
		// LocalStorageをクリア
		originalGetItem = localStorage.getItem;
		originalSetItem = localStorage.setItem;
		localStorage.clear();
	});

	afterEach(() => {
		// LocalStorageを復元
		localStorage.getItem = originalGetItem;
		localStorage.setItem = originalSetItem;
		localStorage.clear();
	});

	describe('generateRandomQSO()', () => {
		it('ランダムQSOを生成できる', () => {
			const qso = generateRandomQSO();

			expect(qso).toBeDefined();
			expect(qso.category).toBe('qso');
			expect(qso.title).toBe('ランダムQSO');
			expect(qso.content).not.toBe('');
		});

		it('生成されたQSOにコールサインが含まれる', () => {
			const qso = generateRandomQSO();

			// コールサインの形式（例: JA0AAA）を含むか確認
			expect(qso.content).toMatch(/J[A-R]\d[A-Z]{3}/);
		});

		it('生成されたQSOにCQが含まれる', () => {
			const qso = generateRandomQSO();

			expect(qso.content).toContain('CQ CQ CQ DE');
		});

		it('生成されたQSOにRSTレポートが含まれる', () => {
			const qso = generateRandomQSO();

			// RSTレポート（例: 599, 589など）
			expect(qso.content).toMatch(/\d{3}/);
		});

		it('生成されたQSOに挨拶が含まれる', () => {
			const qso = generateRandomQSO();

			// GM, GA, GE, GNのいずれか
			const hasGreeting =
				qso.content.includes(' GM ') ||
				qso.content.includes(' GA ') ||
				qso.content.includes(' GE ') ||
				qso.content.includes(' GN ');

			expect(hasGreeting).toBe(true);
		});

		it('idが正しい形式で生成される', () => {
			const qso = generateRandomQSO();

			expect(qso.id).toMatch(/^qso-random-\d+$/);
			expect(qso.id).toContain('qso-random-');
		});

		it('複数回呼び出しても異なるQSOが生成される可能性がある', () => {
			const qsos = new Set<string>();

			// 10回生成して、少なくとも2種類以上の異なるQSOが生成されることを確認
			for (let i = 0; i < 10; i++) {
				const qso = generateRandomQSO();
				qsos.add(qso.content);
			}

			// ランダム性により、10回中少なくとも2種類以上は異なるはず
			expect(qsos.size).toBeGreaterThan(1);
		});
	});

	describe('getAllBuiltinTemplates()', () => {
		it('すべてのビルトインテンプレートを取得できる', () => {
			const templates = getAllBuiltinTemplates();

			expect(templates).toBeDefined();
			expect(templates).toBeInstanceOf(Array);
		});

		it('合計14個のテンプレートが返される（QSO:7, 100:3, 200:2, 300:2）', () => {
			const templates = getAllBuiltinTemplates();

			expect(templates).toHaveLength(14);
		});

		it('すべてのテンプレートが正しい構造を持つ', () => {
			const templates = getAllBuiltinTemplates();

			templates.forEach((template) => {
				expect(template).toHaveProperty('id');
				expect(template).toHaveProperty('category');
				expect(template).toHaveProperty('title');
				expect(template).toHaveProperty('content');
			});
		});

		it('カテゴリーごとの件数が正しい', () => {
			const templates = getAllBuiltinTemplates();

			const qsoTemplates = templates.filter((t) => t.category === 'qso');
			const text100Templates = templates.filter((t) => t.category === 'text100');
			const text200Templates = templates.filter((t) => t.category === 'text200');
			const text300Templates = templates.filter((t) => t.category === 'text300');

			expect(qsoTemplates).toHaveLength(7);
			expect(text100Templates).toHaveLength(3);
			expect(text200Templates).toHaveLength(2);
			expect(text300Templates).toHaveLength(2);
		});
	});

	describe('getTemplatesByCategory()', () => {
		it('qsoカテゴリーのテンプレートを取得できる（ランダム生成ボタン含む）', () => {
			const templates = getTemplatesByCategory('qso');

			// ランダム生成ボタン（1個）+ QSOサンプル（7個）= 8個
			expect(templates).toHaveLength(8);
			expect(templates[0].id).toBe('qso-random-generate');
			expect(templates[0].title).toContain('ランダムQSO');
		});

		it('text100カテゴリーのテンプレートを取得できる', () => {
			const templates = getTemplatesByCategory('text100');

			expect(templates).toHaveLength(3);
			templates.forEach((template) => {
				expect(template.category).toBe('text100');
			});
		});

		it('text200カテゴリーのテンプレートを取得できる', () => {
			const templates = getTemplatesByCategory('text200');

			expect(templates).toHaveLength(2);
			templates.forEach((template) => {
				expect(template.category).toBe('text200');
			});
		});

		it('text300カテゴリーのテンプレートを取得できる', () => {
			const templates = getTemplatesByCategory('text300');

			expect(templates).toHaveLength(2);
			templates.forEach((template) => {
				expect(template.category).toBe('text300');
			});
		});

		it('customカテゴリーはLocalStorageから読み込む', () => {
			// カスタムテンプレートを保存
			const customTemplates: Template[] = [
				{
					id: 'custom-1',
					category: 'custom',
					title: 'カスタム1',
					content: 'TEST CONTENT 1',
				},
				{
					id: 'custom-2',
					category: 'custom',
					title: 'カスタム2',
					content: 'TEST CONTENT 2',
				},
			];
			localStorage.setItem('v8.listening.customTemplates', JSON.stringify(customTemplates));

			const templates = getTemplatesByCategory('custom');

			expect(templates).toHaveLength(2);
			expect(templates[0].id).toBe('custom-1');
			expect(templates[1].id).toBe('custom-2');
		});

		it('存在しないカテゴリーの場合は空配列を返す', () => {
			// @ts-expect-error 存在しないカテゴリーでテスト
			const templates = getTemplatesByCategory('unknown');

			expect(templates).toEqual([]);
		});
	});

	describe('getCustomTemplates()', () => {
		it('LocalStorageからカスタムテンプレートを読み込める', () => {
			const customTemplates: Template[] = [
				{
					id: 'custom-1',
					category: 'custom',
					title: 'カスタム1',
					content: 'TEST CONTENT 1',
				},
			];
			localStorage.setItem('v8.listening.customTemplates', JSON.stringify(customTemplates));

			const templates = getCustomTemplates();

			expect(templates).toHaveLength(1);
			expect(templates[0].id).toBe('custom-1');
		});

		it('保存データがない場合は空配列を返す', () => {
			const templates = getCustomTemplates();

			expect(templates).toEqual([]);
		});

		it('不正なJSON形式の場合は空配列を返す', () => {
			localStorage.setItem('v8.listening.customTemplates', 'invalid json');

			const templates = getCustomTemplates();

			expect(templates).toEqual([]);
		});

		it('LocalStorageが無効な場合でもエラーにならない', () => {
			// LocalStorageをモック
			localStorage.getItem = () => {
				throw new Error('LocalStorage disabled');
			};

			expect(() => {
				getCustomTemplates();
			}).not.toThrow();

			const templates = getCustomTemplates();
			expect(templates).toEqual([]);
		});
	});

	describe('saveCustomTemplates()', () => {
		it('カスタムテンプレートをLocalStorageに保存できる', () => {
			const templates: Template[] = [
				{
					id: 'custom-1',
					category: 'custom',
					title: 'カスタム1',
					content: 'TEST CONTENT 1',
				},
			];

			saveCustomTemplates(templates);

			const saved = localStorage.getItem('v8.listening.customTemplates');
			expect(saved).not.toBeNull();
			const parsed = JSON.parse(saved!);
			expect(parsed).toHaveLength(1);
			expect(parsed[0].id).toBe('custom-1');
		});

		it('LocalStorageが無効な場合でもエラーにならない', () => {
			// LocalStorageをモック
			localStorage.setItem = () => {
				throw new Error('LocalStorage disabled');
			};

			const templates: Template[] = [
				{
					id: 'custom-1',
					category: 'custom',
					title: 'カスタム1',
					content: 'TEST',
				},
			];

			expect(() => {
				saveCustomTemplates(templates);
			}).not.toThrow();
		});
	});

	describe('addCustomTemplate()', () => {
		it('新しいカスタムテンプレートを追加できる', () => {
			addCustomTemplate('新しいテンプレート', 'TEST CONTENT');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(1);
			expect(templates[0].title).toBe('新しいテンプレート');
			expect(templates[0].content).toBe('TEST CONTENT');
			expect(templates[0].category).toBe('custom');
		});

		it('追加されたテンプレートのIDが正しい形式で生成される', () => {
			addCustomTemplate('テンプレート1', 'CONTENT 1');
			addCustomTemplate('テンプレート2', 'CONTENT 2');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(2);
			expect(templates[0].id).toMatch(/^custom-\d+$/);
			expect(templates[1].id).toMatch(/^custom-\d+$/);
		});

		it('既存のテンプレートに追加される', () => {
			// 既存のテンプレートを保存
			saveCustomTemplates([
				{
					id: 'custom-existing',
					category: 'custom',
					title: '既存',
					content: 'EXISTING',
				},
			]);

			addCustomTemplate('新規', 'NEW');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(2);
			expect(templates[0].id).toBe('custom-existing');
			expect(templates[1].title).toBe('新規');
		});
	});

	describe('updateCustomTemplate()', () => {
		it('カスタムテンプレートを更新できる', () => {
			// テンプレートを追加
			addCustomTemplate('元のタイトル', '元のコンテンツ');
			const templates = getCustomTemplates();
			const id = templates[0].id;

			// 更新
			updateCustomTemplate(id, '新しいタイトル', '新しいコンテンツ');

			const updated = getCustomTemplates();
			expect(updated).toHaveLength(1);
			expect(updated[0].id).toBe(id);
			expect(updated[0].title).toBe('新しいタイトル');
			expect(updated[0].content).toBe('新しいコンテンツ');
		});

		it('存在しないIDの場合は何もしない', () => {
			addCustomTemplate('テスト', 'TEST');

			updateCustomTemplate('non-existent-id', '更新', '更新');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(1);
			expect(templates[0].title).toBe('テスト');
		});
	});

	describe('deleteCustomTemplate()', () => {
		it('カスタムテンプレートを削除できる', () => {
			addCustomTemplate('削除対象', 'DELETE ME');
			const templates = getCustomTemplates();
			const id = templates[0].id;

			deleteCustomTemplate(id);

			const afterDelete = getCustomTemplates();
			expect(afterDelete).toHaveLength(0);
		});

		it('複数のテンプレートから特定のものだけ削除できる', () => {
			vi.useFakeTimers();

			addCustomTemplate('テンプレート1', 'CONTENT 1');
			vi.advanceTimersByTime(1); // IDを変えるため
			addCustomTemplate('テンプレート2', 'CONTENT 2');
			vi.advanceTimersByTime(1); // IDを変えるため
			addCustomTemplate('テンプレート3', 'CONTENT 3');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(3); // 3つ追加されていることを確認
			const idToDelete = templates[1].id; // 2番目を削除

			deleteCustomTemplate(idToDelete);

			const afterDelete = getCustomTemplates();
			expect(afterDelete).toHaveLength(2);
			expect(afterDelete[0].title).toBe('テンプレート1');
			expect(afterDelete[1].title).toBe('テンプレート3');

			vi.useRealTimers();
		});

		it('存在しないIDの場合は何もしない', () => {
			addCustomTemplate('テスト', 'TEST');

			deleteCustomTemplate('non-existent-id');

			const templates = getCustomTemplates();
			expect(templates).toHaveLength(1);
		});
	});

	describe('getTemplateById()', () => {
		it('ビルトインテンプレートをIDで取得できる', () => {
			const template = getTemplateById('qso-1');

			expect(template).toBeDefined();
			expect(template?.id).toBe('qso-1');
			expect(template?.category).toBe('qso');
		});

		it('カスタムテンプレートをIDで取得できる', () => {
			addCustomTemplate('カスタム', 'CUSTOM CONTENT');
			const templates = getCustomTemplates();
			const id = templates[0].id;

			const template = getTemplateById(id);

			expect(template).toBeDefined();
			expect(template?.id).toBe(id);
			expect(template?.category).toBe('custom');
		});

		it('存在しないIDの場合はundefinedを返す', () => {
			const template = getTemplateById('non-existent-id');

			expect(template).toBeUndefined();
		});

		it('text100カテゴリーのテンプレートを取得できる', () => {
			const template = getTemplateById('text100-1');

			expect(template).toBeDefined();
			expect(template?.category).toBe('text100');
		});

		it('text200カテゴリーのテンプレートを取得できる', () => {
			const template = getTemplateById('text200-1');

			expect(template).toBeDefined();
			expect(template?.category).toBe('text200');
		});

		it('text300カテゴリーのテンプレートを取得できる', () => {
			const template = getTemplateById('text300-1');

			expect(template).toBeDefined();
			expect(template?.category).toBe('text300');
		});
	});

	describe('統合テスト', () => {
		it('カスタムテンプレートの完全なライフサイクル（追加→更新→削除）', () => {
			// 追加
			addCustomTemplate('初期タイトル', '初期コンテンツ');
			let templates = getCustomTemplates();
			expect(templates).toHaveLength(1);
			const id = templates[0].id;

			// 更新
			updateCustomTemplate(id, '更新タイトル', '更新コンテンツ');
			templates = getCustomTemplates();
			expect(templates[0].title).toBe('更新タイトル');

			// 削除
			deleteCustomTemplate(id);
			templates = getCustomTemplates();
			expect(templates).toHaveLength(0);
		});

		it('すべてのカテゴリーのテンプレートを正しく取得できる', () => {
			const qso = getTemplatesByCategory('qso');
			const text100 = getTemplatesByCategory('text100');
			const text200 = getTemplatesByCategory('text200');
			const text300 = getTemplatesByCategory('text300');

			expect(qso.length + text100.length + text200.length + text300.length).toBeGreaterThan(0);
		});

		it('ランダムQSO生成を複数回実行できる', () => {
			const qso1 = generateRandomQSO();
			const qso2 = generateRandomQSO();
			const qso3 = generateRandomQSO();

			expect(qso1).toBeDefined();
			expect(qso2).toBeDefined();
			expect(qso3).toBeDefined();

			// すべてqsoカテゴリーであることを確認
			expect(qso1.category).toBe('qso');
			expect(qso2.category).toBe('qso');
			expect(qso3.category).toBe('qso');

			// IDが正しい形式であることを確認
			expect(qso1.id).toMatch(/^qso-random-\d+$/);
			expect(qso2.id).toMatch(/^qso-random-\d+$/);
			expect(qso3.id).toMatch(/^qso-random-\d+$/);
		});
	});
});

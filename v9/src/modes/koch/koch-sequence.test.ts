/**
 * koch/koch-sequence.ts のユニットテスト
 * コッホ法の文字シーケンスとランダムグループ生成をテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KOCH_SEQUENCE, getCharsForLesson, generateRandomGroups } from './koch-sequence';

describe('KOCH_SEQUENCE', () => {
	it('41文字が含まれている', () => {
		expect(KOCH_SEQUENCE).toHaveLength(41);
	});

	it('最初の2文字はKとM', () => {
		expect(KOCH_SEQUENCE[0]).toBe('K');
		expect(KOCH_SEQUENCE[1]).toBe('M');
	});

	it('全ての要素が文字列', () => {
		KOCH_SEQUENCE.forEach((char) => {
			expect(typeof char).toBe('string');
		});
	});

	it('重複した文字が含まれていない', () => {
		const uniqueChars = new Set(KOCH_SEQUENCE);
		expect(uniqueChars.size).toBe(KOCH_SEQUENCE.length);
	});
});

describe('getCharsForLesson', () => {
	it('レッスン1はKとMの2文字', () => {
		const chars = getCharsForLesson(1);
		expect(chars).toEqual(['K', 'M']);
		expect(chars).toHaveLength(2);
	});

	it('レッスン2は3文字（K,M,U）', () => {
		const chars = getCharsForLesson(2);
		expect(chars).toEqual(['K', 'M', 'U']);
		expect(chars).toHaveLength(3);
	});

	it('レッスン5は6文字', () => {
		const chars = getCharsForLesson(5);
		expect(chars).toHaveLength(6);
		expect(chars).toEqual(['K', 'M', 'U', 'R', 'E', 'S']);
	});

	it('レッスン10は11文字', () => {
		const chars = getCharsForLesson(10);
		expect(chars).toHaveLength(11);
		expect(chars[0]).toBe('K');
		expect(chars[10]).toBe('L'); // K,M,U,R,E,S,N,A,P,T,L
	});

	it('レッスン40は全41文字', () => {
		const chars = getCharsForLesson(40);
		expect(chars).toHaveLength(41);
		expect(chars).toEqual(KOCH_SEQUENCE);
	});

	it('レッスン番号が0の場合は1文字（K）', () => {
		const chars = getCharsForLesson(0);
		expect(chars).toEqual(['K']);
		expect(chars).toHaveLength(1);
	});

	it('レッスン番号が負の場合は空配列', () => {
		const chars = getCharsForLesson(-1);
		expect(chars).toEqual([]);
		expect(chars).toHaveLength(0);
	});

	it('レッスン番号が41以上の場合は全41文字', () => {
		const chars = getCharsForLesson(50);
		expect(chars).toHaveLength(41);
		expect(chars).toEqual(KOCH_SEQUENCE);
	});

	it('連続するレッスンでは1文字ずつ増える', () => {
		for (let lesson = 1; lesson < 40; lesson++) {
			const chars = getCharsForLesson(lesson);
			expect(chars).toHaveLength(lesson + 1);
		}
	});
});

describe('generateRandomGroups', () => {
	beforeEach(() => {
		// 乱数をモック（再現性のあるテスト）
		let callCount = 0;
		vi.spyOn(Math, 'random').mockImplementation(() => {
			callCount++;
			return (callCount % 10) / 10; // 0, 0.1, 0.2, ..., 0.9, 0, 0.1, ...
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('指定された文字群からグループを生成する', () => {
		const chars = ['K', 'M'];
		const groups = generateRandomGroups(chars, 5, 60);

		expect(groups).not.toHaveLength(0);
		// 各グループは5文字
		groups.forEach((group) => {
			expect(group).toHaveLength(5);
		});
	});

	it('グループサイズを指定できる', () => {
		const chars = ['K', 'M', 'U'];
		const groups = generateRandomGroups(chars, 3, 60);

		groups.forEach((group) => {
			expect(group).toHaveLength(3);
		});
	});

	it('生成された文字は指定された文字セットに含まれる', () => {
		const chars = ['A', 'B', 'C'];
		const groups = generateRandomGroups(chars, 5, 60);

		groups.forEach((group) => {
			for (const char of group) {
				expect(chars).toContain(char);
			}
		});
	});

	it('duration（練習時間）が長いほど多くのグループが生成される', () => {
		const chars = ['K', 'M'];

		const groups30 = generateRandomGroups(chars, 5, 30);
		const groups60 = generateRandomGroups(chars, 5, 60);
		const groups120 = generateRandomGroups(chars, 5, 120);

		expect(groups60.length).toBeGreaterThan(groups30.length);
		expect(groups120.length).toBeGreaterThan(groups60.length);
	});

	it('groupSizeが大きいほどグループ数が少なくなる', () => {
		const chars = ['K', 'M', 'U'];

		const groups5 = generateRandomGroups(chars, 5, 60);
		const groups10 = generateRandomGroups(chars, 10, 60);

		expect(groups5.length).toBeGreaterThan(groups10.length);
	});

	it('空の文字配列でもエラーにならない', () => {
		const chars: string[] = [];

		expect(() => {
			generateRandomGroups(chars, 5, 60);
		}).not.toThrow();
	});

	it('duration=0の場合はグループ数が0', () => {
		const chars = ['K', 'M'];
		const groups = generateRandomGroups(chars, 5, 0);

		expect(groups).toHaveLength(0);
	});

	it('groupSize=1の場合も正しく動作する（最小サイズ）', () => {
		const chars = ['K', 'M'];
		const groups = generateRandomGroups(chars, 1, 10);

		expect(groups.length).toBeGreaterThan(0);
		groups.forEach((group) => {
			expect(group).toHaveLength(1);
			expect(chars).toContain(group);
		});
	});

	it('1文字の文字セットから正しくグループが生成される', () => {
		const chars = ['X'];
		const groups = generateRandomGroups(chars, 5, 60);

		groups.forEach((group) => {
			expect(group).toBe('XXXXX');
		});
	});

	it('デフォルト値（groupSize=5, duration=60）が機能する', () => {
		const chars = ['K', 'M'];
		const groups = generateRandomGroups(chars);

		expect(groups.length).toBeGreaterThan(0);
		groups.forEach((group) => {
			expect(group).toHaveLength(5);
		});
	});
});

describe('generateRandomGroups（実際の乱数）', () => {
	it('実際の乱数でも正しく動作する', () => {
		const chars = ['K', 'M', 'U', 'R', 'E'];
		const groups = generateRandomGroups(chars, 5, 60);

		expect(groups.length).toBeGreaterThan(0);

		// 各グループが指定サイズで、指定文字セットのみを含む
		groups.forEach((group) => {
			expect(group).toHaveLength(5);
			for (const char of group) {
				expect(chars).toContain(char);
			}
		});

		// ランダム性の確認：全グループが同じではない
		const uniqueGroups = new Set(groups);
		expect(uniqueGroups.size).toBeGreaterThan(1);
	});
});

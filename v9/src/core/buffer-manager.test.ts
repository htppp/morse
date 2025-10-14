/**
 * buffer-manager.ts のユニットテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BufferManager } from './buffer-manager';

describe('BufferManager', () => {
	let manager: BufferManager;

	beforeEach(() => {
		manager = new BufferManager();
	});

	describe('初期状態', () => {
		it('初期状態でバッファとシーケンスが空である', () => {
			expect(manager.getBuffer()).toBe('');
			expect(manager.getSequence()).toBe('');
			expect(manager.isEmpty()).toBe(true);
		});
	});

	describe('addElement()', () => {
		it('dotをシーケンスに追加できる', () => {
			manager.addElement('.');
			expect(manager.getSequence()).toBe('.');
		});

		it('dashをシーケンスに追加できる', () => {
			manager.addElement('-');
			expect(manager.getSequence()).toBe('-');
		});

		it('複数の要素を連続して追加できる', () => {
			manager.addElement('.');
			manager.addElement('.');
			manager.addElement('-');
			expect(manager.getSequence()).toBe('..-');
		});
	});

	describe('commitSequence()', () => {
		it('シーケンスをバッファに確定できる', () => {
			manager.addElement('.');
			manager.addElement('.');
			manager.commitSequence();

			expect(manager.getBuffer()).toBe('.. ');
			expect(manager.getSequence()).toBe('');
		});

		it('addSpace=falseの場合スペースを追加しない', () => {
			manager.addElement('.');
			manager.commitSequence(false);

			expect(manager.getBuffer()).toBe('.');
			expect(manager.getSequence()).toBe('');
		});

		it('シーケンスが空の場合は何もしない', () => {
			manager.commitSequence();

			expect(manager.getBuffer()).toBe('');
			expect(manager.getSequence()).toBe('');
		});

		it('複数回確定できる', () => {
			manager.addElement('.');
			manager.commitSequence();

			manager.addElement('-');
			manager.addElement('-');
			manager.commitSequence();

			expect(manager.getBuffer()).toBe('. -- ');
			expect(manager.getSequence()).toBe('');
		});
	});

	describe('addWordSeparator()', () => {
		it('語間スペース（/）を追加できる', () => {
			manager.addWordSeparator();
			expect(manager.getBuffer()).toBe('/ ');
		});

		it('シーケンスがある場合は確定してから語間スペースを追加する', () => {
			manager.addElement('.');
			manager.addElement('.');
			manager.addWordSeparator();

			expect(manager.getBuffer()).toBe('.. / ');
			expect(manager.getSequence()).toBe('');
		});

		it('すでに"/ "で終わっている場合は追加しない', () => {
			manager.addWordSeparator();
			manager.addWordSeparator();

			expect(manager.getBuffer()).toBe('/ ');
		});

		it('他のバッファがある場合に語間スペースを追加できる', () => {
			manager.addElement('.');
			manager.commitSequence();
			manager.addWordSeparator();

			expect(manager.getBuffer()).toBe('. / ');
		});
	});

	describe('clear()', () => {
		it('バッファとシーケンスをクリアできる', () => {
			manager.addElement('.');
			manager.addElement('-');
			manager.commitSequence();
			manager.addElement('.');

			manager.clear();

			expect(manager.getBuffer()).toBe('');
			expect(manager.getSequence()).toBe('');
			expect(manager.isEmpty()).toBe(true);
		});
	});

	describe('endsWith()', () => {
		it('バッファの末尾をチェックできる', () => {
			manager.addElement('.');
			manager.commitSequence();

			expect(manager.endsWith('. ')).toBe(true);
			expect(manager.endsWith('.')).toBe(false);
		});

		it('語間スペースで終わっているかチェックできる', () => {
			manager.addWordSeparator();

			expect(manager.endsWith('/ ')).toBe(true);
			expect(manager.endsWith('/')).toBe(false);
		});
	});

	describe('getBufferLength(), getSequenceLength()', () => {
		it('バッファの長さを取得できる', () => {
			manager.addElement('.');
			manager.commitSequence();

			expect(manager.getBufferLength()).toBe(2); // '. '
			expect(manager.getSequenceLength()).toBe(0);
		});

		it('シーケンスの長さを取得できる', () => {
			manager.addElement('.');
			manager.addElement('-');

			expect(manager.getBufferLength()).toBe(0);
			expect(manager.getSequenceLength()).toBe(2); // '.-'
		});
	});

	describe('isEmpty()', () => {
		it('バッファとシーケンスが両方空の場合trueを返す', () => {
			expect(manager.isEmpty()).toBe(true);
		});

		it('シーケンスがある場合falseを返す', () => {
			manager.addElement('.');
			expect(manager.isEmpty()).toBe(false);
		});

		it('バッファがある場合falseを返す', () => {
			manager.addElement('.');
			manager.commitSequence();
			expect(manager.isEmpty()).toBe(false);
		});
	});

	describe('統合テスト', () => {
		it('SOSを入力するシナリオ', () => {
			// S = ...
			manager.addElement('.');
			manager.addElement('.');
			manager.addElement('.');
			manager.commitSequence();

			// O = ---
			manager.addElement('-');
			manager.addElement('-');
			manager.addElement('-');
			manager.commitSequence();

			// S = ...
			manager.addElement('.');
			manager.addElement('.');
			manager.addElement('.');
			manager.commitSequence();

			expect(manager.getBuffer()).toBe('... --- ... ');
		});

		it('語間スペースを含む入力シナリオ', () => {
			// CQ
			manager.addElement('-');
			manager.addElement('.');
			manager.addElement('-');
			manager.addElement('.');
			manager.commitSequence();

			manager.addElement('-');
			manager.addElement('-');
			manager.addElement('.');
			manager.addElement('-');
			manager.commitSequence();

			// 語間スペース
			manager.addWordSeparator();

			// DE
			manager.addElement('-');
			manager.addElement('.');
			manager.addElement('.');
			manager.commitSequence();

			manager.addElement('.');
			manager.commitSequence();

			expect(manager.getBuffer()).toBe('-.-. --.- / -.. . ');
		});
	});
});

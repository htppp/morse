/**
 * morse-code.ts のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { MorseCode } from './morse-code';

describe('MorseCode', () => {
	describe('textToMorse()', () => {
		describe('アルファベット変換', () => {
			it('大文字アルファベットA-Zを正しく変換できる', () => {
				expect(MorseCode.textToMorse('A')).toBe('.-');
				expect(MorseCode.textToMorse('B')).toBe('-...');
				expect(MorseCode.textToMorse('C')).toBe('-.-.');
				expect(MorseCode.textToMorse('D')).toBe('-..');
				expect(MorseCode.textToMorse('E')).toBe('.');
				expect(MorseCode.textToMorse('Z')).toBe('--..');
			});

			it('小文字アルファベットを大文字に正規化して変換できる', () => {
				expect(MorseCode.textToMorse('a')).toBe('.-');
				expect(MorseCode.textToMorse('b')).toBe('-...');
				expect(MorseCode.textToMorse('hello')).toBe('.... . .-.. .-.. ---');
			});

			it('大文字小文字混在の文字列を正しく変換できる', () => {
				expect(MorseCode.textToMorse('HeLLo')).toBe('.... . .-.. .-.. ---');
			});

			it('複数のアルファベットをスペース区切りで変換できる', () => {
				expect(MorseCode.textToMorse('SOS')).toBe('... --- ...');
				expect(MorseCode.textToMorse('CQ')).toBe('-.-. --.-');
			});
		});

		describe('数字変換', () => {
			it('数字0-9を正しく変換できる', () => {
				expect(MorseCode.textToMorse('0')).toBe('-----');
				expect(MorseCode.textToMorse('1')).toBe('.----');
				expect(MorseCode.textToMorse('2')).toBe('..---');
				expect(MorseCode.textToMorse('3')).toBe('...--');
				expect(MorseCode.textToMorse('4')).toBe('....-');
				expect(MorseCode.textToMorse('5')).toBe('.....');
				expect(MorseCode.textToMorse('6')).toBe('-....');
				expect(MorseCode.textToMorse('7')).toBe('--...');
				expect(MorseCode.textToMorse('8')).toBe('---..');
				expect(MorseCode.textToMorse('9')).toBe('----.');
			});

			it('複数の数字を正しく変換できる', () => {
				expect(MorseCode.textToMorse('123')).toBe('.---- ..--- ...--');
				expect(MorseCode.textToMorse('599')).toBe('..... ----. ----.');
			});
		});

		describe('特殊文字変換', () => {
			it('ピリオド(.)を正しく変換できる', () => {
				expect(MorseCode.textToMorse('.')).toBe('.-.-.-');
			});

			it('カンマ(,)を正しく変換できる', () => {
				expect(MorseCode.textToMorse(',')).toBe('--..--');
			});

			it('コロン(:)を正しく変換できる', () => {
				expect(MorseCode.textToMorse(':')).toBe('---...');
			});

			it('クエスチョンマーク(?)を正しく変換できる', () => {
				expect(MorseCode.textToMorse('?')).toBe('..--..');
			});

			it('アンダースコア(_)を正しく変換できる', () => {
				expect(MorseCode.textToMorse('_')).toBe('..--.-');
			});

			it('スラッシュ(/)を正しく変換できる', () => {
				expect(MorseCode.textToMorse('/')).toBe('-..-.');
			});

			it('アットマーク(@)を正しく変換できる', () => {
				expect(MorseCode.textToMorse('@')).toBe('.--.-.');
			});

			it('括弧()を正しく変換できる', () => {
				expect(MorseCode.textToMorse('(')).toBe('-.--.');
				expect(MorseCode.textToMorse(')')).toBe('-.--.-');
			});

			it('引用符を正しく変換できる', () => {
				expect(MorseCode.textToMorse('"')).toBe('.-..-.');
				expect(MorseCode.textToMorse("'")).toBe('.----.');
			});
		});

		describe('スペース処理', () => {
			it('スペースを/に変換できる', () => {
				expect(MorseCode.textToMorse('A B')).toBe('.- / -...');
			});

			it('複数のスペースを含む文字列を正しく変換できる', () => {
				expect(MorseCode.textToMorse('CQ CQ')).toBe('-.-. --.- / -.-. --.-');
			});
		});

		describe('prosign処理', () => {
			it('[AR]を空白なしで結合して変換できる', () => {
				// A = .-, R = .-.
				// 空白なしで結合すると .-.-.
				expect(MorseCode.textToMorse('[AR]')).toBe('.-.-.');
			});

			it('[SK]を空白なしで結合して変換できる', () => {
				// S = ..., K = -.-
				// 空白なしで結合すると ...-.-
				expect(MorseCode.textToMorse('[SK]')).toBe('...-.-');
			});

			it('prosignとテキストの混在を正しく処理できる', () => {
				// "CQ [AR]" → "CQ" + prosign[AR]
				const result = MorseCode.textToMorse('CQ [AR]');
				expect(result).toBe('-.-. --.- / .-.-.');
			});

			it('複数のprosignを含む文字列を正しく処理できる', () => {
				const result = MorseCode.textToMorse('[AR] TEST [SK]');
				expect(result).toContain('.-.-.');
				expect(result).toContain('...-.-');
			});
		});

		describe('エッジケース', () => {
			it('空文字列は空文字列を返す', () => {
				expect(MorseCode.textToMorse('')).toBe('');
			});

			it('未対応文字はそのまま残す', () => {
				// 例: 日本語など対応していない文字
				const result = MorseCode.textToMorse('A あ B');
				expect(result).toContain('.-'); // A
				expect(result).toContain('-...'); // B
				expect(result).toContain('あ'); // 未対応文字はそのまま
			});

			it('記号のみの文字列も正しく変換できる', () => {
				expect(MorseCode.textToMorse('...')).toBe('.-.-.- .-.-.- .-.-.-');
			});
		});

		describe('複合パターン', () => {
			it('アルファベット+数字+記号の混在を正しく変換できる', () => {
				const result = MorseCode.textToMorse('SOS 599 BT');
				expect(result).toContain('... --- ...');
				expect(result).toContain('..... ----. ----.');
			});

			it('実際のCQ呼び出し形式を正しく変換できる', () => {
				const result = MorseCode.textToMorse('CQ CQ CQ DE JA1ABC JA1ABC [AR]');
				expect(result).toContain('-.-. --.-');
				expect(result).toContain('.-.-.');
			});
		});
	});

	describe('morseSequencesToText()', () => {
		describe('基本的なデコード', () => {
			it('モールス符号を文字に変換できる', () => {
				expect(MorseCode.morseSequencesToText(['.-'])).toBe('A');
				expect(MorseCode.morseSequencesToText(['-...'])).toBe('B');
				expect(MorseCode.morseSequencesToText(['...'])).toBe('S');
			});

			it('複数のモールス符号を連続して変換できる', () => {
				const result = MorseCode.morseSequencesToText(['...', '---', '...']);
				expect(result).toBe('SOS');
			});

			it('数字のモールス符号を変換できる', () => {
				const result = MorseCode.morseSequencesToText(['.....', '----.', '----.']);
				expect(result).toBe('599');
			});
		});

		describe('スペース処理', () => {
			it('/をスペースに変換できる', () => {
				const result = MorseCode.morseSequencesToText(['.-', '/', '-...']);
				expect(result).toBe('A B');
			});

			it('複数の/を含む配列を正しく変換できる', () => {
				const result = MorseCode.morseSequencesToText([
					'-.-.',
					'--.-',
					'/',
					'-.-.',
					'--.-'
				]);
				expect(result).toBe('CQ CQ');
			});
		});

		describe('不明なパターン処理', () => {
			it('未知のモールス符号を?に変換する', () => {
				const result = MorseCode.morseSequencesToText(['........']);
				expect(result).toBe('?');
			});

			it('複数の未知パターンをそれぞれ?に変換する', () => {
				const result = MorseCode.morseSequencesToText([
					'.-',
					'........',
					'-...',
					'........'
				]);
				expect(result).toBe('A?B?');
			});
		});

		describe('エッジケース', () => {
			it('空配列は空文字列を返す', () => {
				expect(MorseCode.morseSequencesToText([])).toBe('');
			});

			it('空文字列要素をスキップする', () => {
				const result = MorseCode.morseSequencesToText(['.-', '', '-...']);
				expect(result).toBe('AB');
			});

			it('/のみの配列はスペースを返す', () => {
				expect(MorseCode.morseSequencesToText(['/'])).toBe(' ');
			});

			it('連続する/を複数スペースとして処理する', () => {
				const result = MorseCode.morseSequencesToText(['.-', '/', '/', '-...']);
				expect(result).toBe('A  B');
			});
		});
	});

	describe('charToMorse()', () => {
		it('大文字アルファベットを変換できる', () => {
			expect(MorseCode.charToMorse('A')).toBe('.-');
			expect(MorseCode.charToMorse('Z')).toBe('--..');
		});

		it('小文字アルファベットを大文字に正規化して変換できる', () => {
			expect(MorseCode.charToMorse('a')).toBe('.-');
			expect(MorseCode.charToMorse('z')).toBe('--..');
		});

		it('数字を変換できる', () => {
			expect(MorseCode.charToMorse('0')).toBe('-----');
			expect(MorseCode.charToMorse('5')).toBe('.....');
		});

		it('特殊文字を変換できる', () => {
			expect(MorseCode.charToMorse('.')).toBe('.-.-.-');
			expect(MorseCode.charToMorse('?')).toBe('..--..');
		});

		it('未対応文字はundefinedを返す', () => {
			expect(MorseCode.charToMorse('あ')).toBeUndefined();
			expect(MorseCode.charToMorse('#')).toBeUndefined();
		});
	});

	describe('getMorseMap()', () => {
		it('モールス符号マップを取得できる', () => {
			const map = MorseCode.getMorseMap();
			expect(map).toBeDefined();
			expect(typeof map).toBe('object');
		});

		it('マップに基本的な文字が含まれている', () => {
			const map = MorseCode.getMorseMap();
			expect(map['A']).toBe('.-');
			expect(map['S']).toBe('...');
			expect(map['O']).toBe('---');
		});

		it('マップに数字が含まれている', () => {
			const map = MorseCode.getMorseMap();
			expect(map['0']).toBe('-----');
			expect(map['5']).toBe('.....');
			expect(map['9']).toBe('----.');
		});

		it('マップに特殊文字が含まれている', () => {
			const map = MorseCode.getMorseMap();
			expect(map['.']).toBe('.-.-.-');
			expect(map['?']).toBe('..--..');
			expect(map[' ']).toBe('/');
		});
	});

	describe('エンドツーエンドテスト', () => {
		it('textToMorse()とmorseSequencesToText()が相互変換できる', () => {
			const originalText = 'SOS';
			const morse = MorseCode.textToMorse(originalText);
			const sequences = morse.split(' ');
			const decodedText = MorseCode.morseSequencesToText(sequences);
			expect(decodedText).toBe(originalText);
		});

		it('複雑な文字列で相互変換できる', () => {
			const originalText = 'CQ DE JA1ABC';
			const morse = MorseCode.textToMorse(originalText);
			const sequences = morse.split(' ');
			const decodedText = MorseCode.morseSequencesToText(sequences);
			expect(decodedText).toBe(originalText);
		});

		it('数字を含む文字列で相互変換できる', () => {
			const originalText = 'RST 599';
			const morse = MorseCode.textToMorse(originalText);
			const sequences = morse.split(' ');
			const decodedText = MorseCode.morseSequencesToText(sequences);
			expect(decodedText).toBe(originalText);
		});
	});
});

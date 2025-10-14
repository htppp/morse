/**
 * html-sanitizer.ts のユニットテスト
 * XSS攻撃パターンを含むセキュリティテスト
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeAttribute, isSafeUrl, escapeWithBreaks } from './html-sanitizer';

describe('html-sanitizer', () => {
	describe('escapeHtml()', () => {
		describe('基本的なエスケープ', () => {
			it('小なり記号(<)をエスケープする', () => {
				const result = escapeHtml('<');
				expect(result).toBe('&lt;');
			});

			it('大なり記号(>)をエスケープする', () => {
				const result = escapeHtml('>');
				expect(result).toBe('&gt;');
			});

			it('アンパサンド(&)をエスケープする', () => {
				const result = escapeHtml('&');
				expect(result).toBe('&amp;');
			});

			it('ダブルクォート(")をエスケープする', () => {
				const result = escapeHtml('"');
				expect(result).toBe('&quot;');
			});

			it('シングルクォート(\')をエスケープする', () => {
				const result = escapeHtml("'");
				// ブラウザによって &#39; または &#x27; になる
				expect(result).toMatch(/&#(39|x27);/);
			});
		});

		describe('XSS攻撃パターンの防御', () => {
			it('<script>タグを無害化する', () => {
				const result = escapeHtml('<script>alert("XSS")</script>');
				expect(result).toContain('&lt;script&gt;');
				expect(result).toContain('&lt;/script&gt;');
				expect(result).not.toContain('<script>');
			});

			it('<img>タグのonerrorを無害化する', () => {
				const result = escapeHtml('<img src=x onerror=alert("XSS")>');
				expect(result).toContain('&lt;img');
				expect(result).toContain('&gt;');
				expect(result).not.toContain('<img');
			});

			it('<iframe>タグを無害化する', () => {
				const result = escapeHtml('<iframe src="http://evil.com"></iframe>');
				expect(result).toContain('&lt;iframe');
				expect(result).toContain('&lt;/iframe&gt;');
				expect(result).not.toContain('<iframe');
			});

			it('<a>タグのonclickを無害化する', () => {
				const result = escapeHtml('<a href="#" onclick="alert(1)">Click</a>');
				expect(result).toContain('&lt;a');
				expect(result).toContain('&gt;');
				expect(result).not.toContain('<a');
			});

			it('複数のHTMLタグを無害化する', () => {
				const result = escapeHtml('<div><script>alert(1)</script></div>');
				expect(result).not.toContain('<div>');
				expect(result).not.toContain('<script>');
				expect(result).toContain('&lt;');
				expect(result).toContain('&gt;');
			});
		});

		describe('エッジケース', () => {
			it('空文字列は空文字列を返す', () => {
				expect(escapeHtml('')).toBe('');
			});

			it('通常のテキストはそのまま返す', () => {
				expect(escapeHtml('Hello World')).toBe('Hello World');
			});

			it('日本語テキストはそのまま返す', () => {
				expect(escapeHtml('こんにちは世界')).toBe('こんにちは世界');
			});

			it('改行文字を含むテキストを処理する', () => {
				const result = escapeHtml('Line1\nLine2');
				// 改行はそのまま残る(escapeWithBreaksとは異なる)
				expect(result).toBe('Line1\nLine2');
			});

			it('複数の特殊文字が混在するテキストを処理する', () => {
				const result = escapeHtml('<div>&"test"</div>');
				expect(result).toContain('&lt;');
				expect(result).toContain('&gt;');
				expect(result).toContain('&amp;');
				expect(result).toContain('&quot;');
			});
		});
	});

	describe('escapeAttribute()', () => {
		describe('基本的なエスケープ', () => {
			it('ダブルクォート(")をエスケープする', () => {
				const result = escapeAttribute('"');
				expect(result).toBe('&quot;');
			});

			it('シングルクォート(\')をエスケープする', () => {
				const result = escapeAttribute("'");
				expect(result).toBe('&#x27;');
			});

			it('アンパサンド(&)をエスケープする', () => {
				const result = escapeAttribute('&');
				expect(result).toBe('&amp;');
			});

			it('小なり記号(<)をエスケープする', () => {
				const result = escapeAttribute('<');
				expect(result).toBe('&lt;');
			});

			it('大なり記号(>)をエスケープする', () => {
				const result = escapeAttribute('>');
				expect(result).toBe('&gt;');
			});
		});

		describe('XSS攻撃パターンの防御', () => {
			it('属性値からの脱出を防ぐ', () => {
				const result = escapeAttribute('" onclick="alert(1)"');
				expect(result).toContain('&quot;');
				expect(result).not.toContain('" onclick="');
			});

			it('シングルクォートによる脱出を防ぐ', () => {
				const result = escapeAttribute("' onclick='alert(1)'");
				expect(result).toContain('&#x27;');
				expect(result).not.toContain("' onclick='");
			});

			it('javascript:スキームを含む値を無害化する', () => {
				const result = escapeAttribute('javascript:alert(1)');
				// javascript:自体は無害化されないが、属性値として安全にエスケープされる
				expect(result).not.toContain('<');
				expect(result).not.toContain('>');
			});
		});

		describe('エッジケース', () => {
			it('空文字列は空文字列を返す', () => {
				expect(escapeAttribute('')).toBe('');
			});

			it('通常のテキストはそのまま返す', () => {
				expect(escapeAttribute('hello')).toBe('hello');
			});

			it('複数の特殊文字を含む文字列を処理する', () => {
				const result = escapeAttribute('<script>&"test"</script>');
				expect(result).toContain('&lt;');
				expect(result).toContain('&gt;');
				expect(result).toContain('&amp;');
				expect(result).toContain('&quot;');
			});
		});
	});

	describe('isSafeUrl()', () => {
		describe('安全なURL', () => {
			it('http://で始まるURLは安全', () => {
				expect(isSafeUrl('http://example.com')).toBe(true);
			});

			it('https://で始まるURLは安全', () => {
				expect(isSafeUrl('https://example.com')).toBe(true);
			});

			it('相対パス(/path/to/file)は安全', () => {
				expect(isSafeUrl('/path/to/file')).toBe(true);
			});

			it('mailto:リンクは安全', () => {
				expect(isSafeUrl('mailto:test@example.com')).toBe(true);
			});

			it('tel:リンクは安全', () => {
				expect(isSafeUrl('tel:+1234567890')).toBe(true);
			});

			it('ftp://で始まるURLは安全', () => {
				expect(isSafeUrl('ftp://example.com')).toBe(true);
			});
		});

		describe('危険なURL', () => {
			it('javascript:スキームは危険', () => {
				expect(isSafeUrl('javascript:alert(1)')).toBe(false);
			});

			it('JavaScript:（大文字）スキームも危険', () => {
				expect(isSafeUrl('JavaScript:alert(1)')).toBe(false);
			});

			it('data:スキームは危険', () => {
				expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
			});

			it('vbscript:スキームは危険', () => {
				expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
			});
		});

		describe('エッジケース', () => {
			it('空文字列は安全', () => {
				expect(isSafeUrl('')).toBe(true);
			});

			it('スペースを含むjavascript:スキームも検出する', () => {
				expect(isSafeUrl(' javascript:alert(1)')).toBe(false);
			});

			it('前後のスペースがあっても正しく判定する', () => {
				expect(isSafeUrl('  https://example.com  ')).toBe(true);
				expect(isSafeUrl('  javascript:alert(1)  ')).toBe(false);
			});

			it('ハッシュ(#)のみのアンカーは安全', () => {
				expect(isSafeUrl('#anchor')).toBe(true);
			});

			it('クエリパラメータを含むURLは安全', () => {
				expect(isSafeUrl('https://example.com?param=value')).toBe(true);
			});
		});
	});

	describe('escapeWithBreaks()', () => {
		it('改行文字を<br>タグに変換する', () => {
			const result = escapeWithBreaks('Line1\nLine2');
			expect(result).toBe('Line1<br>Line2');
		});

		it('複数の改行を複数の<br>タグに変換する', () => {
			const result = escapeWithBreaks('Line1\nLine2\nLine3');
			expect(result).toBe('Line1<br>Line2<br>Line3');
		});

		it('改行とHTML特殊文字を同時に処理する', () => {
			const result = escapeWithBreaks('<script>\nalert(1)\n</script>');
			expect(result).toContain('&lt;script&gt;');
			expect(result).toContain('<br>');
			expect(result).toContain('&lt;/script&gt;');
		});

		it('改行のみの文字列を処理する', () => {
			const result = escapeWithBreaks('\n');
			expect(result).toBe('<br>');
		});

		it('連続する改行を連続する<br>タグに変換する', () => {
			const result = escapeWithBreaks('Line1\n\nLine2');
			expect(result).toBe('Line1<br><br>Line2');
		});

		it('改行なしのテキストはそのまま（特殊文字はエスケープ）', () => {
			const result = escapeWithBreaks('<div>test</div>');
			expect(result).toContain('&lt;div&gt;');
			expect(result).not.toContain('<br>');
		});

		it('空文字列は空文字列を返す', () => {
			expect(escapeWithBreaks('')).toBe('');
		});
	});

	describe('統合テスト', () => {
		it('escapeHtmlとescapeAttributeの組み合わせで完全なHTML要素を構築できる', () => {
			const content = '<script>alert(1)</script>';
			const attrValue = '" onclick="alert(2)"';

			const escapedContent = escapeHtml(content);
			const escapedAttr = escapeAttribute(attrValue);

			// HTMLとして安全に埋め込める
			const html = `<div title="${escapedAttr}">${escapedContent}</div>`;

			expect(html).not.toContain('<script>');
			expect(html).not.toContain('onclick="alert');
			expect(html).toContain('&lt;script&gt;');
			expect(html).toContain('&quot;');
		});

		it('ユーザー入力をHTMLに安全に埋め込める', () => {
			const userInput = '<img src=x onerror=alert(1)>';
			const escaped = escapeHtml(userInput);

			// <と>がエスケープされているため、HTMLタグとして解釈されない
			expect(escaped).not.toContain('<img');
			expect(escaped).toContain('&lt;');
			expect(escaped).toContain('&gt;');
			// 文字列としての'onerror='は残るが、HTMLタグ内ではないため無害
			expect(escaped).toContain('onerror=');
		});
	});
});

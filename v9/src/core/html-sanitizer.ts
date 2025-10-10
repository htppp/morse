/**
 * HTML文字列をサニタイズ（無害化）するユーティリティ
 */

/**
 * テキストをHTMLエスケープする関数
 *
 * @param text - エスケープするテキスト
 * @returns エスケープされたHTML安全な文字列
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // → '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * HTML属性値として安全にエスケープする関数
 *
 * @param value - エスケープする属性値
 * @returns エスケープされた属性値
 *
 * @example
 * escapeAttribute('" onclick="alert(1)"')
 * // → '&quot; onclick=&quot;alert(1)&quot;'
 */
export function escapeAttribute(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * URLとして安全かチェックする関数
 *
 * @param url - チェックするURL
 * @returns 安全なURLのみtrue
 */
export function isSafeUrl(url: string): boolean {
	// javascript:, data:, vbscript: などの危険なスキームを禁止
	const dangerousSchemes = /^(javascript|data|vbscript):/i;
	return !dangerousSchemes.test(url.trim());
}

/**
 * 複数行テキストをHTMLの<br>タグ付きでエスケープ
 *
 * @param text - エスケープするテキスト
 * @returns エスケープされた改行付きHTML
 */
export function escapeWithBreaks(text: string): string {
	return escapeHtml(text).replace(/\n/g, '<br>');
}

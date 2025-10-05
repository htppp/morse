//! モールス符号マッピングと変換機能。

//! モールス符号のマッピング型定義。
type MorseMap = Record<string, string>;

//! 欧文モールス符号マップ。
const MORSE_CODE_MAP: MorseMap = {
	'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
	'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
	'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
	'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
	'Y': '-.--', 'Z': '--..',
	'0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
	'5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
	' ': '/', // 特殊。プログラムの都合上でしか使用しない。
	'.': '.-.-.-',
	',': '--..--',
	':': '---...',
	'?': '..--..',
	'_': '..--.-',
	'+': '.-.-.',
	'-': '-....-',
	'×': '-..-',
	'^': '......',
	'/': '-..-.',
	'@': '.--.-.',
	'(': '-.--.',
	')': '-.--.-',
	'"': '.-..-.',
	"'": '.----.',
	'HH': '........', // 送信開始。
	'=': '-...-', // = or 送信終了。
	'VA': '...-.-', // 送信要求。
	'AS': '.-...', // 待機要求。
	'VE': '...-.', // 了解。
};

//! 和文モールス符号マップ。
const JAPANESE_MORSE_CODE_MAP: MorseMap = {
	'ア': '--.--', 'イ': '.-', 'ウ': '..-', 'エ': '-.---', 'オ': '.-...',
	'カ': '.-..', 'キ': '-.-..', 'ク': '...-', 'ケ': '-.--', 'コ': '----',
	'サ': '-.-.-', 'シ': '--.-.', 'ス': '---.-', 'セ': '.---.', 'ソ': '---.',
	'タ': '-.', 'チ': '..-.', 'ツ': '.--.', 'テ': '.-.--', 'ト': '..-..',
	'ナ': '.-.', 'ニ': '-.-.', 'ヌ': '....', 'ネ': '--.-', 'ノ': '..--',
	'ハ': '-...', 'ヒ': '--..-', 'フ': '--..', 'ヘ': '.', 'ホ': '-..',
	'マ': '-..-', 'ミ': '..-.-', 'ム': '-', 'メ': '-...-', 'モ': '-..-.',
	'ヤ': '.--', 'ユ': '-..--', 'ヨ': '--',
	'ラ': '...', 'リ': '--.', 'ル': '-.--.', 'レ': '---', 'ロ': '.-.-',
	'ワ': '-.-', 'ヲ': '.---', 'ン': '.-.-.',
	'ヱ': '.--..', 'ヰ': '.-..-.',
	'゛': '..', // 濁点。
	'゜': '..--.', // 半濁点。
	'ー': '.--.-', // 長音。
	'、': '.-.-.-.-', // 区切点。
	'」': '.-.-..', // 段落。
	'（': '-.--.-', // 下向き括弧。
	'）': '.-..-.-', // 上向き括弧。
	'ホレ': '-..----', // 本文。
	'ラタ': '...-.-', // 訂正・終了。
	'(': '-.--.', ')': '-.--.-',
	' ': '/', // 特殊。プログラムの都合上でしか使用しない。
	'0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
	'5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

//! モールス符号モジュール。
export class MorseCode {
	//! 現在のモードに応じたモールス符号マップを取得。
	static getCurrentMorseMap(): MorseMap {
		const checkbox = document.getElementById('japaneseMode') as HTMLInputElement | null;
		return checkbox?.checked ? JAPANESE_MORSE_CODE_MAP : MORSE_CODE_MAP;
	}

	//! 現在のモードに応じたモールス符号から文字への変換マップを取得。
	static getCurrentMorseToCharMap(): MorseMap {
		const map = this.getCurrentMorseMap();
		return Object.fromEntries(
			Object.entries(map).map(([char, morse]) => [morse, char])
		);
	}

	//! テキストをモールス符号に変換。
	static textToMorse(text: string): string {
		const map = this.getCurrentMorseMap();
		const upperText = text.toUpperCase();

		// prosign ([AR], [SK]など) を処理
		const prosignRegex = /\[([A-Z]+)\]/g;
		const parts: string[] = [];
		let lastIndex = 0;
		let match;

		while ((match = prosignRegex.exec(upperText)) !== null) {
			// prosignの前のテキストを処理
			if (match.index > lastIndex) {
				const beforeText = upperText.substring(lastIndex, match.index);
				const morseChars = Array.from(beforeText).map(char => map[char] || char);
				parts.push(morseChars.join(' '));
			}

			// prosign内の文字を空白なしで結合
			const prosignChars = Array.from(match[1]);
			const morseCodes = prosignChars.map(char => map[char] || char);
			parts.push(morseCodes.join(''));

			lastIndex = prosignRegex.lastIndex;
		}

		// 残りのテキストを処理
		if (lastIndex < upperText.length) {
			const remainingText = upperText.substring(lastIndex);
			const morseChars = Array.from(remainingText).map(char => map[char] || char);
			parts.push(morseChars.join(' '));
		}

		return parts.filter(p => p).join(' ');
	}

	//! モールス符号シーケンスを文字に変換。
	static morseSequencesToText(sequences: string[]): string {
		const morseToCharMap = this.getCurrentMorseToCharMap();
		let decoded = '';
		for (const seq of sequences) {
			if (seq === '/') {
				decoded += ' ';
			} else if (seq && seq !== '') {
				decoded += morseToCharMap[seq] || '?';
			}
		}
		return decoded;
	}

	//! 濁点・半濁点の合成処理（和文モード用）。
	static combineDakutenHandakuten(text: string): string {
		// 実装は必要に応じて追加。
		return text;
	}
}

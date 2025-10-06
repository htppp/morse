/**
 * モールス符号マッピングと変換機能
 */

type MorseMap = Record<string, string>;

/**
 * 欧文モールス符号マップ
 */
const MORSE_CODE_MAP: MorseMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  ' ': '/',
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
  '=': '-...-',
};

/**
 * モールス符号から文字への変換マップ
 */
const MORSE_TO_CHAR_MAP: MorseMap = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([char, morse]) => [morse, char])
);

/**
 * モールス符号モジュール
 */
export class MorseCode {
  /**
   * テキストをモールス符号に変換
   */
  static textToMorse(text: string): string {
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
        const morseChars = Array.from(beforeText).map(char => MORSE_CODE_MAP[char] || char);
        parts.push(morseChars.join(' '));
      }

      // prosign内の文字を空白なしで結合
      const prosignChars = Array.from(match[1]);
      const morseCodes = prosignChars.map(char => MORSE_CODE_MAP[char] || char);
      parts.push(morseCodes.join(''));

      lastIndex = prosignRegex.lastIndex;
    }

    // 残りのテキストを処理
    if (lastIndex < upperText.length) {
      const remainingText = upperText.substring(lastIndex);
      const morseChars = Array.from(remainingText).map(char => MORSE_CODE_MAP[char] || char);
      parts.push(morseChars.join(' '));
    }

    return parts.filter(p => p).join(' ');
  }

  /**
   * モールス符号シーケンスを文字に変換
   */
  static morseSequencesToText(sequences: string[]): string {
    let decoded = '';
    for (const seq of sequences) {
      if (seq === '/') {
        decoded += ' ';
      } else if (seq && seq !== '') {
        decoded += MORSE_TO_CHAR_MAP[seq] || '?';
      }
    }
    return decoded;
  }

  /**
   * モールス符号マップを取得
   */
  static getMorseMap(): MorseMap {
    return MORSE_CODE_MAP;
  }

  /**
   * 文字からモールス符号を取得
   */
  static charToMorse(char: string): string | undefined {
    return MORSE_CODE_MAP[char.toUpperCase()];
  }
}

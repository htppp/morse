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
    return Array.from(upperText).map(char => MORSE_CODE_MAP[char] || char).join(' ');
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

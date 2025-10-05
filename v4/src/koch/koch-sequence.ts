/**
 * コッホ法の40文字学習順序
 * レッスン1はKとMの2文字から開始
 */

export const KOCH_SEQUENCE = 'K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X'.split(' ');

/**
 * レッスンnで学習する文字を取得（レッスンnは累計n文字）
 */
export function getCharsForLesson(lessonNum: number): string[] {
  return KOCH_SEQUENCE.slice(0, lessonNum);
}

/**
 * ランダムな文字グループを生成（5文字単位）
 */
export function generateRandomGroups(chars: string[], groupSize: number = 5, duration: number = 60): string[] {
  const groups: string[] = [];
  const numGroups = Math.floor((duration * 20) / (groupSize * 5)); // 20WPMで1分あたりの文字数を計算

  for (let i = 0; i < numGroups; i++) {
    let group = '';
    for (let j = 0; j < groupSize; j++) {
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      group += randomChar;
    }
    groups.push(group);
  }

  return groups;
}

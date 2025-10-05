/**
 * フラッシュカードデータの読み込みと管理
 */

export interface FlashcardEntry {
  tags: string[];          // タグ（カンマ区切りをパース）
  frequency: number;       // 使用頻度 (1-5)
  abbreviation: string;    // 略語
  english: string;         // 英文
  japanese: string;        // 和訳
}

export type SortKey = 'abbreviation' | 'frequency' | 'tags' | 'english' | 'japanese';
export type SortOrder = 'asc' | 'desc';

/**
 * TSVファイルを読み込んでFlashcardEntryの配列に変換
 */
export async function loadFlashcardData(): Promise<FlashcardEntry[]> {
  try {
  // Use relative path so the file can be loaded when the app is served from /v3/ on GitHub Pages
  const response = await fetch('data/flashcard.tsv');
    if (!response.ok) {
      throw new Error(`Failed to load flashcard data: ${response.statusText}`);
    }
    const text = await response.text();
    return parseTSV(text);
  } catch (error) {
    console.error('Error loading flashcard data:', error);
    throw error;
  }
}

/**
 * TSVテキストをパース
 */
export function parseTSV(tsvText: string): FlashcardEntry[] {
  const lines = tsvText.trim().split('\n');

  // ヘッダー行をスキップ
  const dataLines = lines.slice(1);

  const entries: FlashcardEntry[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;

    const fields = line.split('\t');
    if (fields.length < 5) {
      console.warn('Invalid line (insufficient fields):', line);
      continue;
    }

    const [tagsStr, frequencyStr, abbreviation, english, japanese] = fields;

    // タグをカンマ区切りで分割してトリム
    const tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // 使用頻度を数値に変換
    const frequency = parseInt(frequencyStr, 10);
    if (isNaN(frequency)) {
      console.warn('Invalid frequency value:', frequencyStr);
      continue;
    }

    entries.push({
      tags,
      frequency,
      abbreviation: abbreviation.trim(),
      english: english.trim(),
      japanese: japanese.trim(),
    });
  }

  return entries;
}

/**
 * タグでフィルタ（指定された全てのタグを含むエントリーのみ）
 */
export function filterByTags(entries: FlashcardEntry[], tags: string[]): FlashcardEntry[] {
  if (tags.length === 0) return entries;

  return entries.filter(entry => {
    // 指定された全てのタグが含まれているかチェック
    return tags.every(tag => entry.tags.includes(tag));
  });
}

/**
 * 使用頻度でフィルタ（指定された頻度以上）
 */
export function filterByFrequency(entries: FlashcardEntry[], minFrequency: number): FlashcardEntry[] {
  if (minFrequency <= 1) return entries;

  return entries.filter(entry => entry.frequency >= minFrequency);
}

/**
 * テキスト検索（略語、英文、和訳、タグを対象）
 */
export function searchEntries(entries: FlashcardEntry[], query: string): FlashcardEntry[] {
  if (!query.trim()) return entries;

  const lowerQuery = query.toLowerCase();

  return entries.filter(entry => {
    return (
      entry.abbreviation.toLowerCase().includes(lowerQuery) ||
      entry.english.toLowerCase().includes(lowerQuery) ||
      entry.japanese.includes(query) || // 日本語は大文字小文字変換しない
      entry.tags.some(tag => tag.includes(query))
    );
  });
}

/**
 * ソート
 */
export function sortEntries(
  entries: FlashcardEntry[],
  key: SortKey,
  order: SortOrder = 'asc'
): FlashcardEntry[] {
  const sorted = [...entries];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (key) {
      case 'abbreviation':
        comparison = a.abbreviation.localeCompare(b.abbreviation);
        break;
      case 'frequency':
        comparison = a.frequency - b.frequency;
        break;
      case 'tags':
        // タグの最初の要素で比較
        const tagA = a.tags[0] || '';
        const tagB = b.tags[0] || '';
        comparison = tagA.localeCompare(tagB);
        break;
      case 'english':
        comparison = a.english.localeCompare(b.english);
        break;
      case 'japanese':
        comparison = a.japanese.localeCompare(b.japanese);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * 全てのユニークなタグを取得
 */
export function getAllTags(entries: FlashcardEntry[]): string[] {
  const tagSet = new Set<string>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * 頻度の範囲を取得
 */
export function getFrequencyRange(entries: FlashcardEntry[]): { min: number; max: number } {
  if (entries.length === 0) {
    return { min: 1, max: 5 };
  }

  const frequencies = entries.map(e => e.frequency);
  return {
    min: Math.min(...frequencies),
    max: Math.max(...frequencies),
  };
}

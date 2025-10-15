# morse-engine API仕様書

**バージョン**: 1.0.0
**最終更新**: 2025-10-15

---

## 目次

- [概要](#概要)
- [インストール](#インストール)
- [基本的な使い方](#基本的な使い方)
- [コアモジュール](#コアモジュール)
  - [MorseCodec](#morsecodec)
  - [TimingCalculator](#timingcalculator)
  - [MorseBuffer](#morsebuffer)
  - [TimerManager](#timermanager)
  - [AudioGenerator](#audiogenerator)
- [型定義](#型定義)
- [エラーハンドリング](#エラーハンドリング)

---

## 概要

`morse-engine`は、モールス信号処理のためのUI非依存のTypeScriptライブラリです。モールス符号の変換、音声生成、タイミング計算などの機能を提供します。

### 特徴
- ✅ UI非依存のピュアロジック
- ✅ TypeScript完全対応
- ✅ 99.17%のテストカバレッジ
- ✅ Web Audio API統合
- ✅ 型安全なAPI設計

---

## インストール

```bash
npm install morse-engine
```

または、ローカルビルドから：

```bash
cd v10/lib
npm install
npm run build
```

---

## 基本的な使い方

```typescript
import {
  MorseCodec,
  TimingCalculator,
  MorseBuffer,
  AudioGenerator
} from 'morse-engine';

// モールス符号に変換
const morse = MorseCodec.textToMorse('SOS');
console.log(morse); // '... --- ...'

// タイミング計算
const timings = TimingCalculator.calculate(20); // 20 WPM
console.log(timings.dot); // 60ms

// 音声生成
const audio = new AudioGenerator({
  frequency: 750,
  volume: 0.7,
  wpm: 20
});
audio.playMorseString('... --- ...');
```

---

## コアモジュール

### MorseCodec

モールス符号のエンコード/デコードを行うクラス。

#### `textToMorse(text: string): string`

テキストをモールス符号に変換します。

**パラメータ**:
- `text` (string): 変換するテキスト（英数字、特殊文字）

**戻り値**:
- (string): スペース区切りのモールス符号文字列

**例**:
```typescript
MorseCodec.textToMorse('HELLO');
// '.... . .-.. .-.. ---'

MorseCodec.textToMorse('SOS');
// '... --- ...'

MorseCodec.textToMorse('CQ [AR]');
// '-.-. --.- / .-.-.'
```

**対応文字**:
- アルファベット: A-Z（大文字小文字自動変換）
- 数字: 0-9
- 特殊文字: `. , : ? _ + - × ^ / @ ( ) " ' =`
- スペース: `/`（語間スペース）
- Prosign: `[AR]`, `[SK]`, `[AS]`, `[BT]` など

---

#### `morseToText(sequences: string[]): string`

モールス符号の配列をテキストに変換します。

**パラメータ**:
- `sequences` (string[]): モールス符号の配列（例: `['.-', '-...', '-.-.']`）

**戻り値**:
- (string): デコードされたテキスト

**例**:
```typescript
MorseCodec.morseToText(['...', '---', '...']);
// 'SOS'

MorseCodec.morseToText(['.-', '/', '-...']);
// 'A B'

// 未知のパターンは'?'に変換
MorseCodec.morseToText(['.-', '.......', '-...']);
// 'A?B'
```

---

#### `charToMorse(char: string): string | undefined`

1文字をモールス符号に変換します。

**パラメータ**:
- `char` (string): 変換する1文字

**戻り値**:
- (string | undefined): モールス符号、または未対応文字の場合は`undefined`

**例**:
```typescript
MorseCodec.charToMorse('A'); // '.-'
MorseCodec.charToMorse('0'); // '-----'
MorseCodec.charToMorse('☆'); // undefined
```

---

#### `getMorseMap(): Record<string, string>`

モールス符号マップのコピーを取得します。

**戻り値**:
- (Record<string, string>): 文字→モールス符号のマップ

**例**:
```typescript
const map = MorseCodec.getMorseMap();
console.log(map['A']); // '.-'
console.log(map['B']); // '-...'
```

---

### TimingCalculator

WPM（Words Per Minute）ベースのタイミング計算を行うクラス。

#### `calculate(wpm: number, options?: TimingOptions): MorseTimings`

WPMからモールス信号のタイミングを計算します。

**パラメータ**:
- `wpm` (number): Words Per Minute（1分間あたりの単語数、1以上）
- `options` (TimingOptions, optional): タイミング計算オプション
  - `shortenGaps` (boolean): ギャップを10%短縮するか（デフォルト: false）

**戻り値**:
- (MorseTimings): タイミング情報オブジェクト

**例外**:
- WPMが0以下の場合、Errorをthrow

**例**:
```typescript
// 基本的な使用
const timings = TimingCalculator.calculate(20);
console.log(timings);
// {
//   dot: 60,           // 60ms
//   dash: 180,         // 180ms (dot * 3)
//   elementGap: 60,    // 60ms
//   charGap: 180,      // 180ms (dot * 3)
//   wordGap: 420       // 420ms (dot * 7)
// }

// ギャップ短縮オプション
const timings2 = TimingCalculator.calculate(20, { shortenGaps: true });
console.log(timings2.charGap); // 162ms (180 * 0.9)
console.log(timings2.wordGap); // 378ms (420 * 0.9)

// エラーケース
TimingCalculator.calculate(0);  // Error: Invalid WPM value: 0
TimingCalculator.calculate(-5); // Error: Invalid WPM value: -5
```

**タイミング計算式**:
- `unit = 1200 / wpm`
- `dot = unit`
- `dash = unit * 3`
- `elementGap = unit` （符号要素間）
- `charGap = unit * 3 * shortenFactor` （文字間、element gap含めるとunit * 4相当）
- `wordGap = unit * 7 * shortenFactor` （語間）

---

#### `getCharGapDelay(timings: MorseTimings): number`

文字確定までの待機時間を計算します。

**パラメータ**:
- `timings` (MorseTimings): タイミング情報

**戻り値**:
- (number): 待機時間（ミリ秒）

**例**:
```typescript
const timings = TimingCalculator.calculate(20);
const delay = TimingCalculator.getCharGapDelay(timings);
console.log(delay); // 240ms (unit * 4)
```

---

#### `getWordGapDelay(timings: MorseTimings): number`

語間スペース確定までの待機時間を計算します。

**パラメータ**:
- `timings` (MorseTimings): タイミング情報

**戻り値**:
- (number): 待機時間（ミリ秒）

**例**:
```typescript
const timings = TimingCalculator.calculate(20);
const delay = TimingCalculator.getWordGapDelay(timings);
console.log(delay); // 420ms
```

---

#### `classifyElement(pressDuration: number, dotDuration: number): '.' | '-'`

押下時間からdot/dashを判定します。

**パラメータ**:
- `pressDuration` (number): キー押下時間（ミリ秒）
- `dotDuration` (number): dot時間（ミリ秒）

**戻り値**:
- ('.' | '-'): dotまたはdash

**判定ロジック**:
- 閾値 = `dotDuration * 1.5`
- `pressDuration < 閾値` → `.` (dot)
- `pressDuration >= 閾値` → `-` (dash)

**例**:
```typescript
const dotDuration = 60; // 60ms (WPM=20)

TimingCalculator.classifyElement(50, dotDuration);  // '.'
TimingCalculator.classifyElement(89, dotDuration);  // '.'
TimingCalculator.classifyElement(90, dotDuration);  // '-' (閾値=90ms)
TimingCalculator.classifyElement(150, dotDuration); // '-'
```

---

### MorseBuffer

モールス信号のバッファとシーケンスを管理するクラス。

#### `constructor()`

新しいMorseBufferインスタンスを作成します。

**例**:
```typescript
const buffer = new MorseBuffer();
```

---

#### `addElement(element: '.' | '-'): void`

入力中のシーケンスに符号要素を追加します。

**パラメータ**:
- `element` ('.' | '-'): 追加する符号要素

**例**:
```typescript
buffer.addElement('.');
buffer.addElement('.');
buffer.addElement('-');
console.log(buffer.getSequence()); // '..-'
```

---

#### `commitSequence(addSpace?: boolean): void`

入力中のシーケンスを確定してバッファに追加します。

**パラメータ**:
- `addSpace` (boolean, optional): 確定後にスペースを追加するか（デフォルト: true）

**例**:
```typescript
buffer.addElement('.');
buffer.addElement('.');
buffer.commitSequence(); // スペース付きで確定
console.log(buffer.getBuffer()); // '.. '

buffer.addElement('-');
buffer.commitSequence(false); // スペースなしで確定
console.log(buffer.getBuffer()); // '.. -'
```

---

#### `addWordSeparator(): void`

語間スペース（'/'）を追加します。既に語間スペースで終わっている場合は追加しません。

**例**:
```typescript
buffer.addElement('.');
buffer.addWordSeparator();
console.log(buffer.getBuffer()); // '. / '

buffer.addWordSeparator(); // 重複しない
console.log(buffer.getBuffer()); // '. / ' (変わらず)
```

---

#### `clear(): void`

バッファとシーケンスをクリアします。

**例**:
```typescript
buffer.clear();
console.log(buffer.isEmpty()); // true
```

---

#### `getSequence(): string`

入力中のシーケンスを取得します。

**戻り値**:
- (string): 入力中のモールス符号シーケンス

---

#### `getBuffer(): string`

確定済みのバッファを取得します。

**戻り値**:
- (string): 確定済みのモールス符号バッファ

---

#### `endsWith(suffix: string): boolean`

バッファの末尾が指定の文字列で終わっているかチェックします。

**パラメータ**:
- `suffix` (string): チェックする末尾文字列

**戻り値**:
- (boolean): 末尾が一致する場合true

---

#### `getBufferLength(): number` / `getSequenceLength(): number`

バッファまたはシーケンスの長さを取得します。

**戻り値**:
- (number): 長さ

---

#### `isEmpty(): boolean`

バッファとシーケンスが両方空かどうかをチェックします。

**戻り値**:
- (boolean): 両方空の場合true

---

### TimerManager

複数のタイマーを型安全に管理するクラス。

#### `constructor()`

新しいTimerManagerインスタンスを作成します。

**例**:
```typescript
const timers = new TimerManager();
```

---

#### `set(name: string, callback: () => void, delay: number): void`

タイマーを設定します。同じ名前のタイマーが存在する場合は上書きされます。

**パラメータ**:
- `name` (string): タイマーの識別名
- `callback` (() => void): タイマー実行時のコールバック
- `delay` (number): 遅延時間（ミリ秒）

**例**:
```typescript
timers.set('charGap', () => {
  console.log('Character committed');
}, 200);
```

---

#### `clear(name: string): void`

指定したタイマーをクリアします。

**パラメータ**:
- `name` (string): タイマーの識別名

**例**:
```typescript
timers.clear('charGap');
```

---

#### `clearAll(): void`

全てのタイマーをクリアします。

**例**:
```typescript
timers.clearAll();
```

---

#### `has(name: string): boolean`

指定したタイマーが存在するかチェックします。

**パラメータ**:
- `name` (string): タイマーの識別名

**戻り値**:
- (boolean): 存在する場合true

---

#### `count(): number`

管理中のタイマー数を取得します。

**戻り値**:
- (number): タイマー数

---

### AudioGenerator

Web Audio APIを使用してモールス信号音を生成するクラス。

#### `constructor(settings?: AudioSettings)`

新しいAudioGeneratorインスタンスを作成します。

**パラメータ**:
- `settings` (AudioSettings, optional): 音声設定
  - `frequency` (number): 周波数（Hz、デフォルト: 750）
  - `volume` (number): 音量（0-1、デフォルト: 0.7）
  - `wpm` (number): WPM（デフォルト: 20）
  - `effectiveWpm` (number, optional): 実効WPM

**例**:
```typescript
// デフォルト設定
const audio1 = new AudioGenerator();

// カスタム設定
const audio2 = new AudioGenerator({
  frequency: 600,
  volume: 0.5,
  wpm: 25
});
```

---

#### `updateSettings(settings: Partial<AudioSettings>): void`

設定を更新します（部分更新可能）。

**パラメータ**:
- `settings` (Partial<AudioSettings>): 更新する設定

**例**:
```typescript
audio.updateSettings({ frequency: 800 });
audio.updateSettings({ volume: 0.5, wpm: 30 });
```

---

#### `getSettings(): AudioSettings`

現在の設定を取得します。

**戻り値**:
- (AudioSettings): 現在の音声設定

---

#### `scheduleTone(startTime: number, durationMs: number): void`

指定された時間に音をスケジュールします（横振り電鍵用）。

**パラメータ**:
- `startTime` (number): 開始時刻（AudioContext時刻）
- `durationMs` (number): 音の長さ（ミリ秒）

**例**:
```typescript
const context = audio.getAudioContext();
if (context) {
  const now = context.currentTime;
  audio.scheduleTone(now, 60);      // dot
  audio.scheduleTone(now + 0.12, 180); // dash
}
```

---

#### `startContinuousTone(): void`

連続音を開始します（縦振り電鍵用）。

**例**:
```typescript
audio.startContinuousTone();
```

---

#### `stopContinuousTone(): void`

連続音を停止します。

**例**:
```typescript
audio.stopContinuousTone();
```

---

#### `playMorseString(morse: string): Promise<boolean>`

モールス符号文字列を再生します。

**パラメータ**:
- `morse` (string): モールス符号文字列（'.', '-', ' ', '/' を含む）

**戻り値**:
- (Promise<boolean>): 正常完了の場合true、中断された場合false

**例**:
```typescript
// 基本的な使用
const completed = await audio.playMorseString('... --- ...');
console.log(completed); // true

// 空文字列
const result = await audio.playMorseString('');
console.log(result); // false
```

---

#### `stopPlaying(): void`

再生を停止します。

**例**:
```typescript
audio.playMorseString('... --- ...');
// 途中で停止
audio.stopPlaying();
```

---

#### `isCurrentlyPlaying(): boolean`

再生中かどうかを確認します。

**戻り値**:
- (boolean): 再生中の場合true

---

#### 音量・周波数・WPMの取得/設定

```typescript
// 音量（0-1の範囲に自動クランプ）
audio.setVolume(0.8);
const volume = audio.getVolume();

// 周波数（400-1200Hzの範囲に自動クランプ）
audio.setFrequency(600);
const freq = audio.getFrequency();

// WPM（5-40の範囲に自動クランプ）
audio.setWPM(25);
const wpm = audio.getWPM();
```

---

## 型定義

### MorseTimings

```typescript
interface MorseTimings {
  dot: number;        // dot（短点）の長さ（ms）
  dash: number;       // dash（長点）の長さ（ms）
  elementGap: number; // 符号要素間の間隔（ms）
  charGap: number;    // 文字間の間隔（ms）
  wordGap: number;    // 語間の間隔（ms）
}
```

### TimingOptions

```typescript
interface TimingOptions {
  shortenGaps?: boolean; // ギャップを10%短縮するか
}
```

### AudioSettings

```typescript
interface AudioSettings {
  frequency: number;      // 周波数（Hz）
  volume: number;         // 音量（0-1）
  wpm?: number;           // 文字速度（WPM）
  effectiveWpm?: number;  // 実効速度（語間スペースの速度）
}
```

### TimerCallback

```typescript
type TimerCallback = () => void;
```

---

## エラーハンドリング

### WPM範囲エラー

```typescript
try {
  TimingCalculator.calculate(0);
} catch (error) {
  console.error(error.message); // "Invalid WPM value: 0. WPM must be greater than 0."
}
```

### Web Audio API エラー

```typescript
const audio = new AudioGenerator();

// エラーは内部でcatchされ、console.errorに出力される
audio.startContinuousTone(); // エラー時も例外はthrowされない
```

---

## 使用例

### 縦振り電鍵のシミュレーション

```typescript
import { MorseBuffer, TimingCalculator, AudioGenerator, MorseCodec } from 'morse-engine';

const buffer = new MorseBuffer();
const timings = TimingCalculator.calculate(20);
const audio = new AudioGenerator({ frequency: 750, volume: 0.7, wpm: 20 });

// キー押下
function onKeyDown() {
  audio.startContinuousTone();
  // 押下時刻を記録
}

// キー解放
function onKeyUp(pressDuration: number) {
  audio.stopContinuousTone();

  // dot/dashを判定
  const element = TimingCalculator.classifyElement(pressDuration, timings.dot);
  buffer.addElement(element);

  // 文字確定タイマーを設定（240ms後）
  setTimeout(() => {
    buffer.commitSequence();

    // デコード
    const morse = buffer.getBuffer();
    const sequences = morse.trim().split(' ');
    const text = MorseCodec.morseToText(sequences);
    console.log('Decoded:', text);
  }, TimingCalculator.getCharGapDelay(timings));
}
```

### モールス符号の再生

```typescript
import { MorseCodec, AudioGenerator } from 'morse-engine';

const audio = new AudioGenerator({ wpm: 20 });

async function playText(text: string) {
  const morse = MorseCodec.textToMorse(text);
  console.log('Playing:', morse);

  const completed = await audio.playMorseString(morse);
  console.log('Completed:', completed);
}

playText('SOS');
```

---

## ライセンス

MIT

---

**更新履歴**:
- 2025-10-15: 初版作成（Phase 1完了時点）

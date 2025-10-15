# v10: モールス練習アプリ - GUI/エンジン分離版

**作成日**: 2025-10-14
**基盤**: v9の完全な機能を維持しつつアーキテクチャを再設計

---

## プロジェクト概要

v10は、v9の全機能を維持しながら、**GUIとエンジンを分離**し、モールス信号処理エンジンを**再利用可能なライブラリ**として提供します。

### v9からの主な変更点

- ✅ **機能の完全性**: v9の全機能を維持
- ✅ **アーキテクチャ刷新**: GUI層とエンジン層を明確に分離
- ✅ **ライブラリ化**: `morse-engine`として独立したライブラリを提供
- ✅ **再利用性**: 他のプロジェクトから簡単に利用可能
- ✅ **テスタビリティ**: UI依存のないテストが可能

---

## アーキテクチャ設計

### レイヤー構造

```
┌─────────────────────────────────────┐
│      Application Layer (GUI)       │  ← DOM操作、UI、ルーティング
├─────────────────────────────────────┤
│      Engine Layer (Library)        │  ← モールス信号処理ロジック
└─────────────────────────────────────┘
```

### パッケージ構成

```
v10/
├── lib/                      # ライブラリ（morse-engine）
│   ├── src/
│   │   ├── core/            # コア機能
│   │   │   ├── morse-codec.ts        # モールス符号変換
│   │   │   ├── audio-generator.ts    # オーディオ生成
│   │   │   ├── timing.ts             # タイミング計算
│   │   │   ├── buffer.ts             # バッファ管理
│   │   │   └── timer.ts              # タイマー管理
│   │   ├── trainers/        # トレーナーロジック
│   │   │   ├── vertical-key.ts       # 縦振り電鍵ロジック
│   │   │   ├── horizontal-key.ts     # 横振り電鍵ロジック
│   │   │   ├── koch-trainer.ts       # コッホ法ロジック
│   │   │   └── listening-trainer.ts  # 聞き取り練習ロジック
│   │   ├── types/           # TypeScript型定義
│   │   └── index.ts         # エクスポートエントリポイント
│   ├── test/                # ユニットテスト
│   ├── package.json
│   └── tsconfig.json
│
├── app/                      # アプリケーション（GUI）
│   ├── src/
│   │   ├── ui/              # UIコンポーネント
│   │   │   ├── components/
│   │   │   └── views/
│   │   ├── router/          # ルーティング
│   │   ├── state/           # 状態管理
│   │   └── main.ts          # エントリポイント
│   ├── public/              # 静的ファイル
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                 # このファイル
```

---

## ライブラリ（morse-engine）設計

### 設計思想

1. **UI非依存**: DOM、イベントリスナーへの直接的な依存を排除
2. **状態管理の明確化**: 内部状態と外部状態を明確に分離
3. **イベント駆動**: コールバックベースのイベント通知
4. **設定の分離**: 設定データとロジックを分離

### コアモジュール

#### 1. morse-codec (モールス符号変換)
**v9のmorse-code.tsから移行**

```typescript
export class MorseCodec {
  // テキスト → モールス符号
  static textToMorse(text: string): string;

  // モールス符号 → テキスト
  static morseToText(sequences: string[]): string;

  // 1文字 → モールス符号
  static charToMorse(char: string): string | undefined;

  // マップ取得
  static getMorseMap(): Record<string, string>;
}
```

#### 2. audio-generator (オーディオ生成)
**v9のaudio-system.tsから移行（UI依存部分を除去）**

```typescript
export interface AudioConfig {
  frequency: number;  // 周波数 (Hz)
  volume: number;     // 音量 (0-1)
  wpm: number;        // WPM
}

export class AudioGenerator {
  constructor(config: AudioConfig);

  // 音をスケジュール
  scheduleTone(startTime: number, duration: number): void;

  // 連続音の開始・停止
  startContinuousTone(): void;
  stopContinuousTone(): void;

  // モールス符号文字列を再生
  playMorseString(morseString: string): Promise<boolean>;

  // 設定更新
  updateConfig(config: Partial<AudioConfig>): void;

  // クリーンアップ
  dispose(): void;
}
```

#### 3. timing (タイミング計算)
**v9のtiming-calculator.tsから移行**

```typescript
export interface MorseTimings {
  dot: number;           // dot長 (ms)
  dash: number;          // dash長 (ms)
  elementGap: number;    // 要素間ギャップ (ms)
  charGap: number;       // 文字間ギャップ (ms)
  wordGap: number;       // 語間ギャップ (ms)
}

export class TimingCalculator {
  // WPMからタイミングを計算
  static calculate(wpm: number, options?: { shortenGaps?: boolean }): MorseTimings;

  // 押下時間からdot/dash判定
  static classifyElement(duration: number, dotDuration: number): '.' | '-';

  // 文字確定待機時間
  static getCharGapDelay(timings: MorseTimings): number;

  // 語間スペース確定待機時間
  static getWordGapDelay(timings: MorseTimings): number;
}
```

#### 4. buffer (バッファ管理)
**v9のbuffer-manager.tsから移行**

```typescript
export class MorseBuffer {
  // 要素追加（dot/dash）
  addElement(element: '.' | '-'): void;

  // シーケンス確定
  commitSequence(addSpace?: boolean): void;

  // 語間スペース追加
  addWordSeparator(): void;

  // クリア
  clear(): void;

  // 状態取得
  getBuffer(): string;
  getSequence(): string;
  isEmpty(): boolean;
}
```

#### 5. timer (タイマー管理)
**v9のtimer-manager.tsから移行**

```typescript
export class TimerManager {
  // タイマー設定
  set(name: string, callback: () => void, delay: number): void;

  // タイマークリア
  clear(name: string): void;
  clearAll(): void;

  // 状態確認
  has(name: string): boolean;
  count(): number;
}
```

### トレーナーモジュール

#### 1. vertical-key (縦振り電鍵)
**v9のmodes/vertical/main.tsから移行（ロジックのみ）**

```typescript
export interface VerticalKeyConfig {
  wpm: number;
  onElementDetected?: (element: '.' | '-') => void;
  onCharacterComplete?: (morseCode: string, character: string) => void;
  onWordComplete?: () => void;
}

export class VerticalKeyTrainer {
  constructor(config: VerticalKeyConfig);

  // キー押下開始
  onKeyDown(): void;

  // キー押下終了
  onKeyUp(): void;

  // バッファ取得
  getBuffer(): string;
  getDecodedText(): string;

  // クリア
  clear(): void;

  // クリーンアップ
  dispose(): void;
}
```

#### 2. horizontal-key (横振り電鍵)
**v9のmodes/horizontal/main.tsから移行（ロジックのみ）**

```typescript
export interface HorizontalKeyConfig {
  wpm: number;
  iambicMode: 'A' | 'B';
  paddleLayout: 'normal' | 'reversed';
  onElementGenerated?: (element: '.' | '-') => void;
  onCharacterComplete?: (morseCode: string, character: string) => void;
}

export class HorizontalKeyTrainer {
  constructor(config: HorizontalKeyConfig);

  // パドル操作
  onLeftPaddleDown(): void;
  onLeftPaddleUp(): void;
  onRightPaddleDown(): void;
  onRightPaddleUp(): void;

  // バッファ取得
  getBuffer(): string;
  getDecodedText(): string;

  // クリア
  clear(): void;

  // クリーンアップ
  dispose(): void;
}
```

#### 3. koch-trainer (コッホ法)
**v9のmodes/koch/から移行（ロジックのみ）**

```typescript
export interface KochConfig {
  characterSpeed: number;  // 文字速度 (WPM)
  effectiveSpeed: number;  // 実効速度 (WPM)
  groupSize: number;       // グループサイズ
}

export class KochTrainer {
  constructor(config: KochConfig);

  // レッスン文字取得
  getCharsForLesson(lesson: number): string[];

  // ランダムグループ生成
  generateRandomGroups(chars: string[], groupSize: number, duration: number): string[];

  // 練習テキスト生成
  generatePracticeText(lesson: number, duration: number): string;
}
```

#### 4. listening-trainer (聞き取り練習)
**v9のmodes/listening/から移行（ロジックのみ）**

```typescript
export interface ListeningConfig {
  characterSpeed: number;
  effectiveSpeed: number;
}

export class ListeningTrainer {
  constructor(config: ListeningConfig);

  // QSO生成
  generateRandomQSO(): { title: string; content: string };

  // テンプレート管理
  getTemplatesByCategory(category: string): Template[];
}
```

---

## アプリケーション（GUI）設計

### UIコンポーネント設計

```typescript
// ベースコンポーネント
abstract class Component {
  abstract render(): HTMLElement;
  abstract destroy(): void;
}

// 電鍵UIコンポーネント
class VerticalKeyView extends Component {
  private trainer: VerticalKeyTrainer;  // ライブラリから使用
  private audio: AudioGenerator;        // ライブラリから使用

  constructor() {
    // ライブラリを初期化
    this.trainer = new VerticalKeyTrainer({
      wpm: 20,
      onElementDetected: (element) => this.updateDisplay(element),
      onCharacterComplete: (morse, char) => this.showCharacter(char),
    });
  }

  render(): HTMLElement {
    // DOM生成
  }

  destroy(): void {
    this.trainer.dispose();
  }
}
```

### 状態管理

```typescript
// 設定状態管理
class SettingsStore {
  private settings: Settings;

  get(key: string): any;
  set(key: string, value: any): void;
  save(): void;
  load(): void;
}
```

---

## 実装計画

### Phase 1: ライブラリ基盤構築（Week 1-2）

#### 1.1 プロジェクト構造作成
- [x] v10ディレクトリ作成
- [ ] lib/パッケージセットアップ
- [ ] app/パッケージセットアップ
- [ ] TypeScript設定

#### 1.2 コアモジュール移行
- [ ] morse-codec.ts（v9/morse-code.tsから）
- [ ] timing.ts（v9/timing-calculator.tsから）
- [ ] buffer.ts（v9/buffer-manager.tsから）
- [ ] timer.ts（v9/timer-manager.tsから）
- [ ] audio-generator.ts（v9/audio-system.tsから、UI依存を除去）

#### 1.3 テスト環境構築
- [ ] Vitest設定
- [ ] コアモジュールのテスト移行

### Phase 2: トレーナーモジュール移行（Week 3-4）

#### 2.1 電鍵トレーナー
- [ ] vertical-key.ts（v9/modes/vertical/main.tsから、ロジックのみ抽出）
- [ ] horizontal-key.ts（v9/modes/horizontal/main.tsから、ロジックのみ抽出）
- [ ] テスト作成

#### 2.2 学習トレーナー
- [ ] koch-trainer.ts（v9/modes/koch/から、ロジックのみ抽出）
- [ ] listening-trainer.ts（v9/modes/listening/から、ロジックのみ抽出）
- [ ] flashcard-trainer.ts（v9/modes/flashcard/から、ロジックのみ抽出）
- [ ] テスト作成

### Phase 3: アプリケーション構築（Week 5-6）

#### 3.1 UIフレームワーク
- [ ] Component基底クラス
- [ ] Router実装
- [ ] 状態管理（SettingsStore）

#### 3.2 ビューコンポーネント
- [ ] MenuView
- [ ] VerticalKeyView
- [ ] HorizontalKeyView
- [ ] FlashcardView
- [ ] KochView
- [ ] ListeningView

#### 3.3 統合
- [ ] ライブラリとGUIの統合
- [ ] イベントハンドリング
- [ ] LocalStorage連携

### Phase 4: テストとドキュメント（Week 7-8）

#### 4.1 テスト
- [ ] ライブラリのユニットテスト（目標: 80%以上）
- [ ] アプリケーションの統合テスト
- [ ] E2Eテスト（Playwright）

#### 4.2 ドキュメント
- [ ] ライブラリAPI仕様書
- [ ] 使用例・チュートリアル
- [ ] アーキテクチャドキュメント

#### 4.3 品質保証
- [ ] 全機能のv9との動作比較
- [ ] パフォーマンステスト
- [ ] セキュリティ監査

---

## ライブラリ利用例

### 基本的な使用方法

```typescript
import { MorseCodec, AudioGenerator, VerticalKeyTrainer } from 'morse-engine';

// オーディオ生成器を初期化
const audio = new AudioGenerator({
  frequency: 750,
  volume: 0.7,
  wpm: 20,
});

// 縦振り電鍵トレーナーを初期化
const trainer = new VerticalKeyTrainer({
  wpm: 20,
  onElementDetected: (element) => {
    console.log('Detected:', element);
  },
  onCharacterComplete: (morseCode, character) => {
    console.log('Character:', character, 'Morse:', morseCode);
    // オーディオ再生
    audio.playMorseString(morseCode);
  },
});

// キーイベントを接続
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') trainer.onKeyDown();
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') trainer.onKeyUp();
});
```

### 他のプロジェクトでの使用

```typescript
// Node.jsでモールス符号を生成
import { MorseCodec } from 'morse-engine';

const text = 'HELLO WORLD';
const morse = MorseCodec.textToMorse(text);
console.log(morse); // ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."

// コッホ法の練習テキストを生成
import { KochTrainer } from 'morse-engine';

const koch = new KochTrainer({
  characterSpeed: 20,
  effectiveSpeed: 15,
  groupSize: 5,
});

const practiceText = koch.generatePracticeText(5, 60);
console.log(practiceText); // "KMURE EKMRU URMEK ..."
```

---

## 技術スタック

### ライブラリ（lib/）
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite
- **テスト**: Vitest
- **パッケージマネージャー**: npm

### アプリケーション（app/）
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite
- **テスト**: Vitest + Playwright (E2E)
- **スタイル**: CSS (v9と同じスタイルを移行)

---

## マイルストーン

| マイルストーン | 期間 | 成果物 |
|--------------|------|--------|
| M1: ライブラリ基盤 | Week 1-2 | コアモジュール完成、テスト70%+ |
| M2: トレーナー実装 | Week 3-4 | 全トレーナーモジュール完成、テスト80%+ |
| M3: GUI実装 | Week 5-6 | アプリケーション完成、v9機能完全移植 |
| M4: 品質保証 | Week 7-8 | テスト完了、ドキュメント完成、リリース準備 |

---

## 品質目標

| 項目 | 目標 |
|------|------|
| テストカバレッジ（ライブラリ） | 80%以上 |
| テストカバレッジ（アプリケーション） | 70%以上 |
| 全テスト成功率 | 100% |
| ビルドサイズ（ライブラリ） | 50KB以下（gzip圧縮後） |
| ビルドサイズ（アプリケーション） | 200KB以下（gzip圧縮後） |
| v9との機能互換性 | 100% |

---

## 移行時の注意点

### 1. UI依存の排除
- `document.getElementById()`などのDOM操作を使用しない
- イベントリスナーの直接的な登録を避ける
- コールバック関数で外部通知する

### 2. 状態管理の明確化
- 内部状態（タイマー、バッファ）: ライブラリ内で管理
- 外部状態（設定、進捗）: アプリケーション側で管理
- LocalStorageへの直接アクセスを避ける

### 3. 非同期処理
- Promise/async-awaitを適切に使用
- タイマー処理の適切なクリーンアップ

### 4. メモリ管理
- `dispose()`メソッドで確実にクリーンアップ
- イベントリスナーの削除
- タイマーのクリア

---

## v9との互換性

### 保持される機能
- ✅ 縦振り電鍵練習（2dot閾値）
- ✅ 横振り電鍵練習（Iambic A/B）
- ✅ CW略語・Q符号学習
- ✅ コッホ法トレーニング
- ✅ モールス信号聞き取り練習
- ✅ 設定の永続化（LocalStorage）
- ✅ 後方互換性（v8キーを維持）

### アーキテクチャ上の変更
- GUI層とエンジン層の分離
- ライブラリとしての独立性
- イベント駆動モデルの採用

---

## 実装状況

### ✅ Phase 1: コアモジュール実装完了（2025-10-15）

#### 実装済みモジュール
- **morse-codec.ts**: モールス符号のエンコード/デコード（100%カバレッジ）
- **timing.ts**: WPMベースのタイミング計算（100%カバレッジ）
- **buffer.ts**: モールス信号バッファ管理（100%カバレッジ）
- **timer.ts**: 型安全なタイマー管理（100%カバレッジ）
- **audio-generator.ts**: Web Audio APIによる音声生成（97.97%カバレッジ）
- **index.ts**: ライブラリのエクスポート定義

#### テスト統計
- **総テスト数**: 119テスト
- **成功率**: 100%（119/119 passing）
- **全体カバレッジ**: **99.17%**
- **テストフレームワーク**: Vitest 1.6.1 + happy-dom
- **ビルドツール**: Vite 5.4 + TypeScript 5.3

#### カバレッジ詳細

| ファイル | Statements | Branch | Functions | Lines | 未カバー箇所 |
|---------|-----------|--------|-----------|-------|------------|
| **All files** | **99.17%** | **88.23%** | **100%** | **99.17%** | - |
| audio-generator.ts | 97.97% | 79.16% | 100% | 97.97% | 133-134, 154-155 |
| buffer.ts | 100% | 100% | 100% | 100% | - |
| morse-codec.ts | 100% | 90.47% | 100% | 100% | 67-73 |
| timer.ts | 100% | 100% | 100% | 100% | - |
| timing.ts | 100% | 100% | 100% | 100% | - |

---

### ✅ Phase 2: トレーナーモジュール実装完了（2025-10-15）

#### 実装済みモジュール
- **vertical-key.ts**: 縦振り電鍵トレーナーロジック（98.03%カバレッジ、35テスト）
- **horizontal-key.ts**: 横振り電鍵トレーナーロジック（96.93%カバレッジ、35テスト）
- **koch-trainer.ts**: コッホ法トレーナーロジック（100%カバレッジ、49テスト）
- **listening-trainer.ts**: 聞き取り練習トレーナーロジック（99.68%カバレッジ、41テスト）
- **flashcard-trainer.ts**: フラッシュカード学習トレーナーロジック（100%カバレッジ、65テスト）

#### テスト統計（Phase 1 + Phase 2）
- **総テスト数**: 344テスト（Phase 1: 119 + Phase 2: 225）
- **成功率**: 100%（344/344 passing）
- **全体カバレッジ**: **98.94%**

#### カバレッジ詳細（全体）

| カテゴリ | Statements | Branch | Functions | Lines |
|---------|-----------|--------|-----------|-------|
| **All files** | **98.94%** | **91.4%** | **100%** | **98.94%** |
| core/ | 99.17% | 88.23% | 100% | 99.17% |
| trainers/ | 98.83% | 92.92% | 100% | 98.83% |

#### 個別ファイルカバレッジ（トレーナー）

| ファイル | Statements | Branch | Functions | Lines | 未カバー箇所 |
|---------|-----------|--------|-----------|-------|------------|
| flashcard-trainer.ts | 100% | 100% | 100% | 100% | - |
| horizontal-key.ts | 96.93% | 86.48% | 100% | 96.93% | 258-260, 291-294 |
| koch-trainer.ts | 100% | 96.87% | 100% | 100% | 126 |
| listening-trainer.ts | 99.68% | 91.66% | 100% | 99.68% | 251 |
| vertical-key.ts | 98.03% | 92.3% | 100% | 98.03% | 134-137 |

### 未達成カバレッジの理由

#### audio-generator.ts: 97.97%（未カバー: 133-134, 154-155行）

**未カバー箇所**:
```typescript
// 133-134行: startContinuousTone()のcatchブロック
} catch (error) {
    console.error('連続音開始エラー:', error);
}

// 154-155行: stopContinuousTone()のcatchブロック
} catch (error) {
    console.error('連続音停止エラー:', error);
}
```

**未達成の理由**:
1. **Web Audio APIモックの制約**: Web Audio APIは複雑なブラウザAPIであり、エラーパスを確実に発火させるモックの作成が困難
2. **テストの複雑化とのトレードオフ**: エラーを発生させるためにモックを深くネストさせると、テストの可読性と保守性が低下
3. **実用上の重要性**: これらのcatchブロックはフォールバック処理であり、正常系の動作確認が優先される
4. **カバレッジと品質のバランス**: 97.97%は実用上十分に高いカバレッジであり、残り2.03%のコストパフォーマンスが低い

**対処方針**:
- 現状の97.97%を許容範囲として受け入れる
- エラーハンドリングコードは手動テスト（実際のブラウザでの動作確認）で補完
- 将来的にE2Eテストで実際のブラウザ環境でのエラーケースをカバー

#### morse-codec.ts: 100%（Branch 90.47%、未カバー: 67-73行）

**未カバー箇所**:
```typescript
// 67-73行: prosign処理の一部分岐
const beforeText = upperText.substring(lastIndex, match.index);
const morseChars = Array.from(beforeText).map(char => MORSE_CODE_MAP[char] || char);
parts.push(morseChars.join(' '));
```

**未達成の理由**:
1. **prosign前テキストのエッジケース**: prosignの直前にテキストがない場合の分岐
2. **テストケースの組み合わせ**: 既存のテストで主要な使用パターンはカバー済み
3. **Statement Coverage 100%達成**: 行カバレッジは100%であり、実用上の問題はない

**対処方針**:
- Statement Coverageが100%であることを重視
- Branch Coverageの残り9.53%は極端なエッジケースであり、実用上の影響は小さい

---

## 次のステップ

### Phase 2: トレーナーモジュール実装 ✅ 完了（2025-10-15）
- [x] vertical-key.ts: 縦振り電鍵ロジック ✅ 完了（98.03%カバレッジ）
- [x] horizontal-key.ts: 横振り電鍵ロジック ✅ 完了（96.93%カバレッジ）
- [x] koch-trainer.ts: コッホ法ロジック ✅ 完了（100%カバレッジ）
- [x] listening-trainer.ts: 聞き取り練習ロジック ✅ 完了（99.68%カバレッジ）
- [x] flashcard-trainer.ts: フラッシュカード学習ロジック ✅ 完了（100%カバレッジ）

### Phase 3: GUIアプリケーション実装 🚧 進行中（2025-10-15）
- [x] app/パッケージセットアップ ✅ 完了
- [x] UIフレームワーク選定（Vanilla TypeScript + Vite） ✅ 完了
- [x] ルーティング実装（Hash-based SPA） ✅ 完了
- [x] morse-engineとの統合 ✅ 完了
- [x] MenuView実装 ✅ 完了
- [x] VerticalKeyView実装（縦振り電鍵練習） ✅ 完了
  - スペースキー/クリック/タップ対応
  - AudioGenerator統合（音声出力）
  - リアルタイムモールス信号表示
  - WPM/周波数/音量調整
- [ ] HorizontalKeyView実装（横振り電鍵練習）
- [ ] FlashcardView実装（CW略語・Q符号学習）
- [ ] KochView実装（コッホ法トレーニング）
- [ ] ListeningView実装（モールス信号聞き取り練習）
- [ ] 状態管理実装（LocalStorage連携）

### Phase 4: 品質保証・リリース（予定）
- [ ] E2Eテスト実装
- [ ] パフォーマンス最適化
- [ ] ドキュメント整備
- [ ] デプロイ設定

---

## ビルド・テスト

### ライブラリ（morse-engine）

```bash
cd v10/lib

# 依存関係インストール
npm install

# テスト実行
npm test

# カバレッジ確認
npm run test:coverage

# ビルド
npm run build

# 型チェック
npm run type-check
```

---

**プロジェクトステータス**: ✅ **Phase 1完了** → ✅ **Phase 2完了** → 🚧 **Phase 3進行中**

**最終更新**: 2025-10-15（VerticalKeyView実装完了）

---

## 開発サーバー起動

### GUIアプリケーション
```bash
cd v10/app

# 依存関係インストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000/ にアクセス
```

### 実装済み機能
- ✅ メニュー画面（5つの練習モード選択）
- ✅ 縦振り電鍵練習
  - スペースキー/マウス/タッチ操作
  - Web Audio APIによる音声出力
  - リアルタイムモールス信号表示・デコード
  - WPM（5-40）調整
  - 周波数（400-1200Hz）調整
  - 音量（0-100%）調整

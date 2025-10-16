/**
 * morse-engine - モールス信号エンジンライブラリ
 *
 * UI非依存のモールス信号処理エンジン
 * 各種モールス信号練習機能のコアロジックを提供
 *
 * @packageDocumentation
 */

// コアモジュール
export { MorseCodec } from './core/morse-codec';
export { TimingCalculator } from './core/timing';
export type { MorseTimings, TimingOptions } from './core/timing';
export { MorseBuffer } from './core/buffer';
export { TimerManager } from './core/timer';
export type { TimerCallback } from './core/timer';
export { AudioGenerator } from './core/audio-generator';
export type { AudioSettings } from './core/audio-generator';

// トレーナーモジュール
export { VerticalKeyTrainer } from './trainers/vertical-key';
export type { VerticalKeyCallbacks } from './trainers/vertical-key';
export { HorizontalKeyTrainer } from './trainers/horizontal-key';
export type {
	HorizontalKeyCallbacks,
	HorizontalKeySettings,
	IambicMode,
	PaddleLayout,
} from './trainers/horizontal-key';
export { KochTrainer, KOCH_SEQUENCE } from './trainers/koch-trainer';
export type { PracticeSettings } from './trainers/koch-trainer';
export { ListeningTrainer } from './trainers/listening-trainer';
export type { ListeningTemplate, TemplateCategory } from './trainers/listening-trainer';
export { FlashcardTrainer } from './trainers/flashcard-trainer';
export type {
	FlashcardEntry,
	QuestionType,
	ExamQuestion,
	ExamResult,
	ScoreInfo,
} from './trainers/flashcard-trainer';
export { FlashcardState } from './trainers/flashcard-state';
export type {
	ViewMode,
	DisplayMode,
	SortColumn,
	SortDirection,
	LearnQuestionType,
	Progress,
	FilterState,
	ViewState,
} from './trainers/flashcard-state';

/**
 * Vitestセットアップファイル
 * グローバルなモックの設定
 */

import { vi } from 'vitest';

// LocalStorageのモック
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (index: number) => {
			const keys = Object.keys(store);
			return keys[index] || null;
		}
	};
})();

global.localStorage = localStorageMock as Storage;

// AudioContextのモック
const mockOscillator = {
	connect: vi.fn(),
	start: vi.fn(),
	stop: vi.fn(),
	disconnect: vi.fn(),
	frequency: { value: 0 },
	type: 'sine' as OscillatorType,
	onended: null
};

const mockGainNode = {
	connect: vi.fn(),
	disconnect: vi.fn(),
	gain: {
		value: 0,
		setValueAtTime: vi.fn(),
		linearRampToValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn(),
		setTargetAtTime: vi.fn(),
		setValueCurveAtTime: vi.fn(),
		cancelScheduledValues: vi.fn(),
		cancelAndHoldAtTime: vi.fn()
	}
};

const mockAudioContext = {
	createOscillator: vi.fn(() => ({ ...mockOscillator })),
	createGain: vi.fn(() => ({ ...mockGainNode })),
	destination: {},
	currentTime: 0,
	resume: vi.fn().mockResolvedValue(undefined),
	suspend: vi.fn().mockResolvedValue(undefined),
	close: vi.fn().mockResolvedValue(undefined),
	state: 'running' as AudioContextState,
	sampleRate: 44100,
	baseLatency: 0,
	outputLatency: 0,
	onstatechange: null
};

// AudioContextのグローバルモック
global.AudioContext = vi.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = vi.fn(() => mockAudioContext);

// Date.now()のモック用ヘルパー
export function mockDateNow(timestamp: number) {
	vi.spyOn(Date, 'now').mockReturnValue(timestamp);
}

export function restoreDateNow() {
	vi.restoreAllMocks();
}

// エクスポート（テストで使用するため）
export { localStorageMock, mockAudioContext, mockOscillator, mockGainNode };

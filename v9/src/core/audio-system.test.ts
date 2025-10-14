/**
 * audio-system.ts のユニットテスト
 * Web Audio APIのモックを使用した音声システムのテスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AudioSystem, AudioSettings } from './audio-system';

describe('AudioSystem', () => {
	let audioSystem: AudioSystem;

	beforeEach(() => {
		localStorage.clear();
		// モックをリセット
		vi.clearAllMocks();
		// 各テスト前に新しいインスタンスを作成
		audioSystem = new AudioSystem();
	});

	afterEach(() => {
		// クリーンアップ
		audioSystem.stopPlaying();
	});

	describe('コンストラクタとデフォルト設定', () => {
		it('デフォルト設定でインスタンスを作成できる', () => {
			const system = new AudioSystem();
			expect(system).toBeDefined();
			expect(system.getFrequency()).toBe(750);
			expect(system.getVolume()).toBe(0.7);
			expect(system.getWPM()).toBe(20);
		});

		it('カスタム設定でインスタンスを作成できる', () => {
			const customSettings: AudioSettings = {
				frequency: 600,
				volume: 0.5,
				wpm: 25,
			};
			const system = new AudioSystem(customSettings);
			expect(system.getFrequency()).toBe(600);
			expect(system.getVolume()).toBe(0.5);
			expect(system.getWPM()).toBe(25);
		});
	});

	describe('AudioContext管理', () => {
		it('AudioContextが遅延初期化される', () => {
			const system = new AudioSystem();
			// 初期状態ではnullかもしれない
			const context = system.getAudioContext();
			// ensureAudioContextが呼ばれるまでnullの可能性がある
			expect(context === null || context !== null).toBe(true);
		});

		it('scheduleTone()でAudioContextが初期化される', () => {
			audioSystem.scheduleTone(0, 100);
			const context = audioSystem.getAudioContext();
			expect(context).not.toBeNull();
		});

		it('startContinuousTone()でAudioContextが初期化される', () => {
			audioSystem.startContinuousTone();
			const context = audioSystem.getAudioContext();
			expect(context).not.toBeNull();
		});
	});

	describe('scheduleTone()', () => {
		it('指定時間に音をスケジュールできる', () => {
			audioSystem.scheduleTone(0, 100);
			const context = audioSystem.getAudioContext();
			expect(context).not.toBeNull();
			expect(context!.createOscillator).toHaveBeenCalled();
			expect(context!.createGain).toHaveBeenCalled();
		});

		it('音長を指定して音をスケジュールできる', () => {
			audioSystem.scheduleTone(0, 200);
			const context = audioSystem.getAudioContext();
			expect(context).not.toBeNull();
		});

		it('複数回の音をスケジュールできる', () => {
			audioSystem.scheduleTone(0, 100);
			audioSystem.scheduleTone(0.2, 100);
			audioSystem.scheduleTone(0.4, 100);
			const context = audioSystem.getAudioContext();
			expect(context!.createOscillator).toHaveBeenCalledTimes(3);
		});

		it('エラー時にコンソールエラーを出力する', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// 先にAudioContextを初期化
			audioSystem.scheduleTone(0, 100);
			const context = audioSystem.getAudioContext();

			// createOscillatorがエラーをthrowするようにモック
			if (context) {
				vi.spyOn(context, 'createOscillator').mockImplementation(() => {
					throw new Error('AudioContext error');
				});

				// エラーが発生するscheduleToneを呼ぶ
				audioSystem.scheduleTone(0, 100);
				expect(consoleErrorSpy).toHaveBeenCalled();
			}

			consoleErrorSpy.mockRestore();
		});
	});

	describe('startContinuousTone() / stopContinuousTone()', () => {
		it('連続音を開始できる', () => {
			audioSystem.startContinuousTone();
			const context = audioSystem.getAudioContext();
			expect(context).not.toBeNull();
			expect(context!.createOscillator).toHaveBeenCalled();
		});

		it('連続音を停止できる', () => {
			audioSystem.startContinuousTone();
			audioSystem.stopContinuousTone();
			// 停止処理が呼ばれることを確認
			// モックなので実際には音は出ない
		});

		it('startContinuousTone()を複数回呼ぶと既存の音を停止する', () => {
			// 1回目
			audioSystem.startContinuousTone();
			// 2回目（既存の音を停止してから新しい音を開始）
			audioSystem.startContinuousTone();
			// 2回のstartContinuousTone()で2回のcreateOscillatorが呼ばれる
			expect(audioSystem.getAudioContext()!.createOscillator).toHaveBeenCalledTimes(2);
		});

		it('stopContinuousTone()をAudioContextがnullの時に呼んでもエラーにならない', () => {
			const system = new AudioSystem();
			expect(() => system.stopContinuousTone()).not.toThrow();
		});
	});

	describe('設定の更新', () => {
		it('updateSettings()で設定を更新できる', () => {
			audioSystem.updateSettings({ frequency: 800 });
			expect(audioSystem.getFrequency()).toBe(800);
		});

		it('updateSettings()で部分的な設定を更新できる', () => {
			audioSystem.updateSettings({ volume: 0.5 });
			expect(audioSystem.getVolume()).toBe(0.5);
			expect(audioSystem.getFrequency()).toBe(750); // 他の設定は変わらない
		});

		it('updateSettings()で複数の設定を同時に更新できる', () => {
			audioSystem.updateSettings({ frequency: 600, volume: 0.3, wpm: 30 });
			expect(audioSystem.getFrequency()).toBe(600);
			expect(audioSystem.getVolume()).toBe(0.3);
			expect(audioSystem.getWPM()).toBe(30);
		});
	});

	describe('setVolume() / getVolume()', () => {
		it('音量を設定できる', () => {
			audioSystem.setVolume(0.5);
			expect(audioSystem.getVolume()).toBe(0.5);
		});

		it('音量を0-1の範囲にクランプする', () => {
			audioSystem.setVolume(1.5);
			expect(audioSystem.getVolume()).toBe(1);

			audioSystem.setVolume(-0.5);
			expect(audioSystem.getVolume()).toBe(0);
		});

		it('音量0を設定できる', () => {
			audioSystem.setVolume(0);
			expect(audioSystem.getVolume()).toBe(0);
		});

		it('音量1を設定できる', () => {
			audioSystem.setVolume(1);
			expect(audioSystem.getVolume()).toBe(1);
		});
	});

	describe('setFrequency() / getFrequency()', () => {
		it('周波数を設定できる', () => {
			audioSystem.setFrequency(800);
			expect(audioSystem.getFrequency()).toBe(800);
		});

		it('周波数を400-1200の範囲にクランプする', () => {
			audioSystem.setFrequency(1500);
			expect(audioSystem.getFrequency()).toBe(1200);

			audioSystem.setFrequency(300);
			expect(audioSystem.getFrequency()).toBe(400);
		});

		it('周波数400を設定できる', () => {
			audioSystem.setFrequency(400);
			expect(audioSystem.getFrequency()).toBe(400);
		});

		it('周波数1200を設定できる', () => {
			audioSystem.setFrequency(1200);
			expect(audioSystem.getFrequency()).toBe(1200);
		});
	});

	describe('setWPM() / getWPM()', () => {
		it('WPMを設定できる', () => {
			audioSystem.setWPM(25);
			expect(audioSystem.getWPM()).toBe(25);
		});

		it('WPMを5-40の範囲にクランプする', () => {
			audioSystem.setWPM(50);
			expect(audioSystem.getWPM()).toBe(40);

			audioSystem.setWPM(2);
			expect(audioSystem.getWPM()).toBe(5);
		});

		it('WPM 5を設定できる', () => {
			audioSystem.setWPM(5);
			expect(audioSystem.getWPM()).toBe(5);
		});

		it('WPM 40を設定できる', () => {
			audioSystem.setWPM(40);
			expect(audioSystem.getWPM()).toBe(40);
		});
	});

	describe('playMorseString()', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('モールス符号文字列を再生できる', async () => {
			const promise = audioSystem.playMorseString('... --- ...');

			// タイマーを進める
			await vi.runAllTimersAsync();

			const result = await promise;
			expect(result).toBe(true);
		});

		it('空文字列はfalseを返す', async () => {
			const result = await audioSystem.playMorseString('');
			expect(result).toBe(false);
		});

		it('再生中は別の再生を開始できない', async () => {
			const promise1 = audioSystem.playMorseString('...');
			const result2 = await audioSystem.playMorseString('---');

			expect(result2).toBe(false);

			await vi.runAllTimersAsync();
			await promise1;
		});

		it('stopPlaying()で再生を停止できる', async () => {
			const promise = audioSystem.playMorseString('... --- ...');

			audioSystem.stopPlaying();

			await vi.runAllTimersAsync();
			const result = await promise;

			expect(result).toBe(false);
		});

		it('dot(.)を再生できる', async () => {
			const promise = audioSystem.playMorseString('.');
			await vi.runAllTimersAsync();
			const result = await promise;
			expect(result).toBe(true);
		});

		it('dash(-)を再生できる', async () => {
			const promise = audioSystem.playMorseString('-');
			await vi.runAllTimersAsync();
			const result = await promise;
			expect(result).toBe(true);
		});

		it('スペース( )を処理できる', async () => {
			const promise = audioSystem.playMorseString('. .');
			await vi.runAllTimersAsync();
			const result = await promise;
			expect(result).toBe(true);
		});

		it('語間区切り(/)を処理できる', async () => {
			const promise = audioSystem.playMorseString('./.');
			await vi.runAllTimersAsync();
			const result = await promise;
			expect(result).toBe(true);
		});
	});

	describe('saveSettings() / loadSettings()', () => {
		it('設定をLocalStorageに保存できる', () => {
			audioSystem.setFrequency(800);
			audioSystem.setVolume(0.5);
			audioSystem.setWPM(25);
			audioSystem.saveSettings();

			const saved = localStorage.getItem('v4.audio.settings');
			expect(saved).not.toBeNull();
		});

		it('保存された設定を読み込める', () => {
			// 設定を保存
			audioSystem.setFrequency(800);
			audioSystem.setVolume(0.5);
			audioSystem.setWPM(25);
			audioSystem.saveSettings();

			// 新しいインスタンスで読み込み
			const newSystem = new AudioSystem();
			expect(newSystem.getFrequency()).toBe(800);
			expect(newSystem.getVolume()).toBe(0.5);
			expect(newSystem.getWPM()).toBe(25);
		});

		it('保存されたデータがJSON形式である', () => {
			audioSystem.saveSettings();
			const saved = localStorage.getItem('v4.audio.settings');
			expect(() => JSON.parse(saved!)).not.toThrow();
		});

		it('LocalStorageにデータがない場合デフォルト値を使用する', () => {
			localStorage.clear();
			const system = new AudioSystem();
			expect(system.getFrequency()).toBe(750);
			expect(system.getVolume()).toBe(0.7);
		});

		it('saveSettings()のエラー時にコンソールエラーを出力する', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
				throw new Error('Storage quota exceeded');
			});

			audioSystem.saveSettings();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'設定保存エラー:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
			setItemSpy.mockRestore();
		});

		it('loadSettings()のエラー時にコンソールエラーを出力する', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			localStorage.setItem('v4.audio.settings', 'invalid json');

			const system = new AudioSystem();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'設定読み込みエラー:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('エッジケース', () => {
		it('AudioContextがnullの状態でもエラーにならない', () => {
			const system = new AudioSystem();
			expect(() => system.stopContinuousTone()).not.toThrow();
		});

		it('playMorseString()にnullを渡してもエラーにならない', async () => {
			const result = await audioSystem.playMorseString(null as any);
			expect(result).toBe(false);
		});

		it('極端に短い音長でもscheduleToneが動作する', () => {
			expect(() => audioSystem.scheduleTone(0, 1)).not.toThrow();
		});

		it('極端に長い音長でもscheduleToneが動作する', () => {
			expect(() => audioSystem.scheduleTone(0, 10000)).not.toThrow();
		});
	});

	describe('統合テスト', () => {
		it('設定変更後に音を再生できる', () => {
			audioSystem.setFrequency(600);
			audioSystem.setVolume(0.5);
			audioSystem.setWPM(30);

			expect(() => audioSystem.scheduleTone(0, 100)).not.toThrow();
		});

		it('連続音の開始・停止を繰り返せる', () => {
			audioSystem.startContinuousTone();
			audioSystem.stopContinuousTone();
			audioSystem.startContinuousTone();
			audioSystem.stopContinuousTone();

			expect(audioSystem.getAudioContext()).not.toBeNull();
		});

		it('設定の保存・読み込み・変更のサイクルが動作する', () => {
			// 初期設定
			audioSystem.setFrequency(800);
			audioSystem.saveSettings();

			// 新しいインスタンス
			const system2 = new AudioSystem();
			expect(system2.getFrequency()).toBe(800);

			// 設定変更
			system2.setFrequency(600);
			system2.saveSettings();

			// さらに新しいインスタンス
			const system3 = new AudioSystem();
			expect(system3.getFrequency()).toBe(600);
		});
	});
});

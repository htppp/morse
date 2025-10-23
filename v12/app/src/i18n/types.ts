/**
 * i18n型定義
 */

/**
 * サポートされている言語
 */
export type Language = 'ja' | 'en';

/**
 * 翻訳データの型
 */
export interface Translations {
	common: {
		appName: string;
		version: string;
		backToMenu: string;
		settings: string;
		start: string;
		stop: string;
		reset: string;
		download: string;
		language: string;
		close: string;
		save: string;
		cancel: string;
		copyright: string;
	};
	menu: {
		title: string;
		subtitle: string;
		items: {
			vertical: {
				title: string;
				description: string;
			};
			horizontal: {
				title: string;
				description: string;
			};
			flashcard: {
				title: string;
				description: string;
			};
			koch: {
				title: string;
				description: string;
			};
			listening: {
				title: string;
				description: string;
			};
		};
	};
	verticalKey: {
		title: string;
		instructions: string;
		keyLabel: string;
		morseSignal: string;
		morseBufferPlaceholder: string;
		decodedResult: string;
		decodedTextPlaceholder: string;
		currentSpeed: string;
		keyState: string;
		released: string;
		pressed: string;
		charCount: string;
		timingEvaluation: string;
		latestInput: string;
		waitingForInput: string;
		overallStats: string;
		noStatsData: string;
		ditStats: string;
		dahStats: string;
		dit: string;
		dah: string;
		noData: string;
		howToUse: string;
		instruction1: string;
		instruction2: string;
		instruction3: string;
		instruction4: string;
		instruction5: string;
		instruction6: string;
		element: string;
		expected: string;
		actual: string;
		accuracy: string;
		error: string;
		longer: string;
		shorter: string;
		perfect: string;
		avgAccuracy: string;
		maxAccuracy: string;
		minAccuracy: string;
		avgError: string;
		count: string;
		avgDuration: string;
		inputCount: string;
		times: string;
	};
	horizontalKey: {
		title: string;
		instructions: string;
		leftPaddle: string;
		rightPaddle: string;
		dit: string;
		dah: string;
		ditLabel: string;
		dahLabel: string;
		jKey: string;
		kKey: string;
		morseSignal: string;
		morseBufferPlaceholder: string;
		decodedResult: string;
		decodedTextPlaceholder: string;
		clear: string;
		currentSpeed: string;
		iambicMode: string;
		charCount: string;
		timingDiagramTitle: string;
		timingDiagramPlaceholder: string;
		mode: string;
		modeA: string;
		modeB: string;
		spacingEvaluation: string;
		avgAccuracy: string;
		avgError: string;
		evaluationCount: string;
		charSpacing: string;
		wordSpacing: string;
		expected: string;
		accuracy: string;
		error: string;
		count: string;
		howToUse: string;
		instruction1: string;
		instruction2: string;
		instruction3: string;
		instruction4: string;
		timingDiagram: string;
		debugInfo: string;
		paddleInput: string;
		ditInput: string;
		dahInput: string;
		output: string;
		squeezeZone: string;
		gapZone: string;
		press: string;
		release: string;
		squeezeOn: string;
		squeezeOff: string;
		gapOn: string;
		gapOff: string;
	};
	flashcard: {
		title: string;
		modes: {
			browse: string;
			learn: string;
			test: string;
		};
		filters: {
			all: string;
			common: string;
			qCode: string;
			abbreviation: string;
		};
		stats: {
			total: string;
			learned: string;
			remaining: string;
		};
		fields: {
			abbreviation: string;
			english: string;
			japanese: string;
			description: string;
			example: string;
		};
		showAnswer: string;
		nextCard: string;
		previousCard: string;
		shuffle: string;
		export: string;
		markAsLearned: string;
		markAsUnlearned: string;
	};
	koch: {
		title: string;
		lesson: string;
		customCharacters: string;
		speed: string;
		wpm: string;
		characterSpacing: string;
		farnsworth: string;
		characters: string;
		selectCharacters: string;
		generateText: string;
		textLength: string;
		playbackSpeed: string;
		practice: string;
	};
	listening: {
		title: string;
		types: {
			qso: string;
			text: string;
			random: string;
		};
		generate: string;
		play: string;
		pause: string;
		stop: string;
		showText: string;
		hideText: string;
		downloadAudio: string;
		qsoType: {
			rubberStamp: string;
			random: string;
		};
		textType: {
			news: string;
			literature: string;
			technical: string;
		};
	};
	settings: {
		title: string;
		audio: {
			title: string;
			frequency: string;
			frequencyValue: string;
			volume: string;
			volumeValue: string;
			wpm: string;
			wpmValue: string;
		};
		keybindings: {
			title: string;
			leftPaddle: string;
			rightPaddle: string;
			straightKey: string;
			pressKey: string;
		};
		display: {
			title: string;
			theme: string;
			fontSize: string;
			light: string;
			dark: string;
		};
		saveSuccess: string;
		resetToDefault: string;
	};
	errors: {
		audioContextFailed: string;
		fileLoadFailed: string;
		invalidInput: string;
		networkError: string;
		unknownError: string;
	};
}

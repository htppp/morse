/**
 * 共通設定モーダルコンポーネント
 * 各画面で共通利用できる設定画面を生成
 */

//! 画面の種類。
export type ScreenType = 'flashcard' | 'listening' | 'koch' | 'horizontal-key' | 'vertical-key';

//! 入力タイプ。
export type SettingInputType = 'number' | 'range-with-number' | 'button';

//! 設定項目の定義。
export interface SettingItemDef {
	/** この設定が表示される画面 */
	screens: ScreenType[];
	/** 表示順序（小さいほど上） */
	priority: number;
	/** 設定のキー名 */
	key: string;
	/** 表示ラベル */
	label: string;
	/** 入力タイプ */
	inputType: SettingInputType;
	/** 最小値 */
	min?: number;
	/** 最大値 */
	max?: number;
	/** ステップ */
	step?: number;
	/** 単位（%, Hz, WPMなど） */
	unit?: string;
	/** ボタンの場合のテキスト */
	buttonText?: string;
	/** ボタンの場合のクラス */
	buttonClass?: string;
}

//! 設定値の型。
export interface SettingValues {
	[key: string]: number | string;
}

//! モーダルのコールバック関数。
export interface SettingsModalCallbacks {
	/** 保存時のコールバック */
	onSave: (values: SettingValues) => void;
	/** キャンセル時のコールバック */
	onCancel: () => void;
	/** テスト再生時のコールバック */
	onTestPlay?: () => void;
}

/**
 * 共通設定モーダルクラス
 */
export class SettingsModal {
	private modalId: string;
	private items: SettingItemDef[];
	private callbacks: SettingsModalCallbacks;
	private currentValues: SettingValues;
	private initialValues: SettingValues;

	/**
	 * コンストラクタ
	 *
	 * @param modalId - モーダルのID（重複を避けるため）
	 * @param items - 設定項目の配列
	 * @param currentValues - 現在の設定値
	 * @param callbacks - コールバック関数
	 */
	constructor(
		modalId: string,
		items: SettingItemDef[],
		currentValues: SettingValues,
		callbacks: SettingsModalCallbacks
	) {
		this.modalId = modalId;
		this.items = items;
		this.currentValues = { ...currentValues };
		this.initialValues = { ...currentValues };
		this.callbacks = callbacks;
	}

	/**
	 * モーダルを表示する
	 *
	 * @param screenType - 表示する画面の種類
	 */
	show(screenType: ScreenType): void {
		//! この画面用の設定項目をフィルタリングして優先度順にソート。
		const filteredItems = this.items
			.filter(item => item.screens.includes(screenType))
			.sort((a, b) => a.priority - b.priority);

		//! モーダルのHTMLを生成。
		const modalHTML = this.generateModalHTML(filteredItems);

		//! DOMに追加。
		document.body.insertAdjacentHTML('beforeend', modalHTML);

		//! イベントリスナーを設定。
		this.attachEventListeners(filteredItems);
	}

	/**
	 * モーダルのHTMLを生成する
	 *
	 * @param items - 表示する設定項目
	 * @returns モーダルのHTML
	 */
	private generateModalHTML(items: SettingItemDef[]): string {
		//! FlashcardかListeningかで使い分ける。
		const isFlashcard = this.modalId.includes('flashcard');

		if (isFlashcard) {
			//! Flashcard用のモーダル（.settings-modal）。
			return `
				<div class="settings-modal active" id="${this.modalId}">
					<div class="settings-content">
						<h2>設定</h2>
						<div class="settings-grid">
							${items.map(item => this.generateSettingItemHTML(item)).join('')}
						</div>
						<div class="settings-buttons">
							<button id="${this.modalId}-cancel" class="secondary-button">キャンセル</button>
							<button id="${this.modalId}-save" class="primary-button">OK</button>
						</div>
					</div>
				</div>
			`;
		} else {
			//! Listening用のモーダル（.modal）。
			return `
				<div class="modal" id="${this.modalId}">
					<div class="modal-content">
						<div class="modal-header">
							<h2>設定</h2>
							<button id="${this.modalId}-close" class="close-btn">×</button>
						</div>
						<div class="modal-body">
							${items.map(item => this.generateSettingItemHTML(item)).join('')}
						</div>
						<div class="modal-footer">
							<button id="${this.modalId}-cancel" class="btn">キャンセル</button>
							<button id="${this.modalId}-save" class="btn primary">OK</button>
						</div>
					</div>
				</div>
			`;
		}
	}

	/**
	 * 設定項目のHTMLを生成する
	 *
	 * @param item - 設定項目
	 * @returns 設定項目のHTML
	 */
	private generateSettingItemHTML(item: SettingItemDef): string {
		const value = this.currentValues[item.key];

		switch (item.inputType) {
			case 'number':
				return `
					<div class="setting-item">
						<label for="${this.modalId}-${item.key}">${item.label}</label>
						<input type="number" id="${this.modalId}-${item.key}"
							min="${item.min}" max="${item.max}" step="${item.step || 1}"
							value="${value}" data-key="${item.key}">
					</div>
				`;

			case 'range-with-number':
				return `
					<div class="setting-item">
						<label for="${this.modalId}-${item.key}-range">${item.label}</label>
						<input type="range" id="${this.modalId}-${item.key}-range"
							min="${item.min}" max="${item.max}" step="${item.step || 1}"
							value="${value}" data-key="${item.key}">
						<input type="number" id="${this.modalId}-${item.key}-number"
							min="${item.min}" max="${item.max}" step="${item.step || 1}"
							value="${value}" data-key="${item.key}">
						${item.unit ? `<span>${item.unit}</span>` : ''}
					</div>
				`;

			case 'button':
				return `
					<div class="setting-item">
						<span>${item.label}</span>
						<button id="${this.modalId}-${item.key}" class="${item.buttonClass || 'test-button'}">${item.buttonText || '再生'}</button>
					</div>
				`;

			default:
				return '';
		}
	}

	/**
	 * イベントリスナーを設定する
	 *
	 * @param items - 表示する設定項目
	 */
	private attachEventListeners(items: SettingItemDef[]): void {
		const modal = document.getElementById(this.modalId);
		if (!modal) return;

		//! 各設定項目のイベントリスナー。
		items.forEach(item => {
			if (item.inputType === 'range-with-number') {
				//! レンジとナンバーの同期。
				const rangeInput = document.getElementById(`${this.modalId}-${item.key}-range`) as HTMLInputElement;
				const numberInput = document.getElementById(`${this.modalId}-${item.key}-number`) as HTMLInputElement;

				rangeInput?.addEventListener('input', () => {
					numberInput.value = rangeInput.value;
					this.currentValues[item.key] = parseFloat(rangeInput.value);
				});

				numberInput?.addEventListener('input', () => {
					rangeInput.value = numberInput.value;
					this.currentValues[item.key] = parseFloat(numberInput.value);
				});
			} else if (item.inputType === 'number') {
				const input = document.getElementById(`${this.modalId}-${item.key}`) as HTMLInputElement;
				input?.addEventListener('input', () => {
					this.currentValues[item.key] = parseFloat(input.value);
				});
			} else if (item.inputType === 'button' && item.key === 'testPlay') {
				//! テスト再生ボタン。
				const button = document.getElementById(`${this.modalId}-${item.key}`);
				button?.addEventListener('click', () => {
					this.callbacks.onTestPlay?.();
				});
			}
		});

		//! 保存ボタン。
		const saveBtn = document.getElementById(`${this.modalId}-save`);
		saveBtn?.addEventListener('click', () => {
			this.callbacks.onSave(this.currentValues);
			this.close();
		});

		//! キャンセルボタン。
		const cancelBtn = document.getElementById(`${this.modalId}-cancel`);
		cancelBtn?.addEventListener('click', () => {
			this.currentValues = { ...this.initialValues };
			this.callbacks.onCancel();
			this.close();
		});

		//! 閉じるボタン（×）。
		const closeBtn = document.getElementById(`${this.modalId}-close`);
		closeBtn?.addEventListener('click', () => {
			this.currentValues = { ...this.initialValues };
			this.callbacks.onCancel();
			this.close();
		});

		//! モーダル外クリックで閉じる。
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.currentValues = { ...this.initialValues };
				this.callbacks.onCancel();
				this.close();
			}
		});
	}

	/**
	 * モーダルを閉じる
	 */
	private close(): void {
		const modal = document.getElementById(this.modalId);
		modal?.remove();
	}
}

/**
 * 全設定項目の定義（グローバル）
 */
export const ALL_SETTING_ITEMS: SettingItemDef[] = [
	//! Flashcard, Koch, 電鍵練習用の設定。
	{
		screens: ['flashcard', 'koch', 'horizontal-key', 'vertical-key'],
		priority: 10,
		key: 'volume',
		label: '音量',
		inputType: 'range-with-number',
		min: 0,
		max: 100,
		step: 1,
		unit: '%'
	},
	{
		screens: ['flashcard', 'koch', 'horizontal-key', 'vertical-key'],
		priority: 20,
		key: 'frequency',
		label: '周波数 (Hz)',
		inputType: 'number',
		min: 400,
		max: 1200,
		step: 50
	},
	{
		screens: ['flashcard', 'koch', 'horizontal-key', 'vertical-key'],
		priority: 30,
		key: 'wpm',
		label: 'WPM (速度: 5-40)',
		inputType: 'number',
		min: 5,
		max: 40,
		step: 1
	},
	//! Listening専用の設定。
	{
		screens: ['listening'],
		priority: 5,
		key: 'characterSpeed',
		label: '文字速度 (WPM)',
		inputType: 'number',
		min: 5,
		max: 40,
		step: 1
	},
	{
		screens: ['listening'],
		priority: 6,
		key: 'effectiveSpeed',
		label: '実効速度 (WPM)',
		inputType: 'number',
		min: 5,
		max: 40,
		step: 1
	},
	{
		screens: ['listening'],
		priority: 20,
		key: 'frequency',
		label: '周波数 (Hz)',
		inputType: 'number',
		min: 400,
		max: 1000,
		step: 10
	},
	{
		screens: ['listening'],
		priority: 10,
		key: 'volume',
		label: '音量',
		inputType: 'range-with-number',
		min: 0,
		max: 100,
		step: 5,
		unit: '%'
	},
	//! テスト再生ボタン。
	{
		screens: ['flashcard', 'listening'],
		priority: 100,
		key: 'testPlay',
		label: 'テスト再生',
		inputType: 'button',
		buttonText: '再生',
		buttonClass: 'test-button'
	}
];

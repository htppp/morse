// 設定管理モジュール

window.Settings = {
    defaultSettings: {
        volume: 0.3,
        frequency: 600,
        wpm: 20,
        straightKey: 'Space',
        paddleLeft: 'j',
        paddleRight: 'k',
        iambicMode: 'B',
        paddleLayout: 'normal'
    },

    settings: {},
    playHistory: [],
    tempSettings: null, // 一時的な設定保存用

    // 設定値の取得
    get(key) {
        return this.settings[key];
    },

    // 設定値の設定
    set(key, value) {
        this.settings[key] = value;
        this.updateUI();
    },

    // 設定値の一時設定（保存しない）
    setTemp(key, value) {
        this.settings[key] = value;
        this.updateUI();
    },

    // 設定の読み込み
    load() {
        const saved = localStorage.getItem('morseSettings');
        if (saved) {
            this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
        } else {
            this.settings = { ...this.defaultSettings };
        }

        const savedHistory = localStorage.getItem('morsePlayHistory');
        if (savedHistory) {
            this.playHistory = JSON.parse(savedHistory);
        }
    },

    // 設定の保存
    save() {
        localStorage.setItem('morseSettings', JSON.stringify(this.settings));
    },

    // 一時設定の保存
    saveTempSettings() {
        this.tempSettings = JSON.parse(JSON.stringify(this.settings));
    },

    // 一時設定の復元
    restoreTempSettings() {
        if (this.tempSettings) {
            this.settings = JSON.parse(JSON.stringify(this.tempSettings));
            this.tempSettings = null;
            this.updateUI();
            this.updatePaddleLayout();
        }
    },

    // 設定の確定（保存）
    applySettings() {
        this.save();
        this.tempSettings = null;
    },

    // 履歴の追加
    addToHistory(text) {
        this.playHistory.push(text);
        localStorage.setItem('morsePlayHistory', JSON.stringify(this.playHistory));
        this.updateHistoryDisplay();
    },

    // 履歴のクリア
    clearHistory() {
        this.playHistory = [];
        localStorage.setItem('morsePlayHistory', JSON.stringify(this.playHistory));
        this.updateHistoryDisplay();
    },

    // UIの更新
    updateUI() {
        // 音量
        const volumeRange = document.getElementById('volumeRange');
        const volumeInput = document.getElementById('volumeInput');
        if (volumeRange && volumeInput) {
            volumeRange.value = this.settings.volume * 100;
            volumeInput.value = Math.round(this.settings.volume * 100);
        }

        // 周波数
        const frequencyInput = document.getElementById('globalFrequency');
        if (frequencyInput) {
            frequencyInput.value = this.settings.frequency;
        }

        // WPM
        const wpmInput = document.getElementById('globalWPM');
        if (wpmInput) {
            wpmInput.value = this.settings.wpm;
        }

        // キー設定
        const straightKeyInput = document.getElementById('straightKey');
        if (straightKeyInput) {
            straightKeyInput.value = this.settings.straightKey;
        }

        const paddleLeftInput = document.getElementById('paddleLeftKey');
        if (paddleLeftInput) {
            paddleLeftInput.value = this.settings.paddleLeft;
        }

        const paddleRightInput = document.getElementById('paddleRightKey');
        if (paddleRightInput) {
            paddleRightInput.value = this.settings.paddleRight;
        }

        // Iambicモード
        const iambicCheckbox = document.getElementById('iambicMode');
        if (iambicCheckbox) {
            iambicCheckbox.checked = this.settings.iambicMode === 'B';
        }

        // パドルレイアウト
        const paddleLayoutCheckbox = document.getElementById('paddleLayout');
        if (paddleLayoutCheckbox) {
            paddleLayoutCheckbox.checked = this.settings.paddleLayout === 'reversed';
        }

        this.updateKeyHints();
        this.updateHistoryDisplay();
        this.updateJapaneseModeStatus();
        this.updateIambicModeStatus();
        this.updatePaddleLayoutStatus();
    },

    // キーヒントの更新
    updateKeyHints() {
        const straightKeyHint = document.getElementById('straightKeyHint');
        if (straightKeyHint) {
            straightKeyHint.textContent = this.settings.straightKey;
        }

        const paddleKeysHint = document.getElementById('paddleKeysHint');
        if (paddleKeysHint) {
            paddleKeysHint.textContent = 
                this.settings.paddleLeft.toUpperCase() + ' / ' + this.settings.paddleRight.toUpperCase();
        }
    },

    // 履歴表示の更新
    updateHistoryDisplay() {
        const historyDiv = document.getElementById('playHistory');
        if (!historyDiv) return;

        if (this.playHistory.length === 0) {
            historyDiv.textContent = '再生履歴はありません';
        } else {
            historyDiv.innerHTML = this.playHistory.map((item, i) =>
                `<div>${i + 1}. ${item}</div>`
            ).join('');
        }
    },

    // 和文モードステータスの更新
    updateJapaneseModeStatus() {
        const statusSpan = document.getElementById('japaneseModeStatus');
        const checkbox = document.getElementById('japaneseMode');
        if (statusSpan && checkbox) {
            statusSpan.textContent = checkbox.checked ? '(現在: 和文)' : '(現在: 欧文)';
        }
    },

    // Iambicモードステータスの更新
    updateIambicModeStatus() {
        const statusSpan = document.getElementById('iambicModeStatus');
        const checkbox = document.getElementById('iambicMode');
        if (statusSpan && checkbox) {
            statusSpan.textContent = checkbox.checked ? '(現在: Iambic B)' : '(現在: Iambic A)';
        }
    },

    // パドルレイアウトステータスの更新
    updatePaddleLayoutStatus() {
        const statusSpan = document.getElementById('paddleLayoutStatus');
        const checkbox = document.getElementById('paddleLayout');
        if (statusSpan && checkbox) {
            statusSpan.textContent = checkbox.checked ? '(現在: 左:長点 / 右:短点)' : '(現在: 左:短点 / 右:長点)';
        }
    },

    // パドルレイアウトの更新
    updatePaddleLayout() {
        const leftBtn = document.getElementById('paddleLeft');
        const rightBtn = document.getElementById('paddleRight');

        if (!leftBtn || !rightBtn) {
            // DOM要素が見つからない場合は何もしない（横振りタブが表示されていない場合など）
            return;
        }

        if (this.settings.paddleLayout === 'reversed') {
            // 左ボタンを長点に
            leftBtn.innerHTML = '長点<br>ー';
            leftBtn.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
            // 右ボタンを短点に
            rightBtn.innerHTML = '短点<br>・';
            rightBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        } else {
            // 左ボタンを短点に
            leftBtn.innerHTML = '短点<br>・';
            leftBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            // 右ボタンを長点に
            rightBtn.innerHTML = '長点<br>ー';
            rightBtn.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        }
    },

    // イベントリスナーの設定
    setupEventListeners() {
        // 音量
        const volumeRange = document.getElementById('volumeRange');
        const volumeInput = document.getElementById('volumeInput');

        if (volumeRange) {
            volumeRange.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.setTemp('volume', value / 100);
                if (volumeInput) volumeInput.value = value;
            });
        }

        if (volumeInput) {
            volumeInput.addEventListener('input', (e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                this.setTemp('volume', value / 100);
                if (volumeRange) volumeRange.value = value;
                e.target.value = value;
            });
        }

        // 周波数
        const frequencyInput = document.getElementById('globalFrequency');
        if (frequencyInput) {
            frequencyInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 100) val = 100;
                if (val > 2000) val = 2000;
                e.target.value = val;
                this.setTemp('frequency', val);
            });
        }

        // WPM
        const wpmInput = document.getElementById('globalWPM');
        if (wpmInput) {
            wpmInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 999) val = 999;
                e.target.value = val;
                this.setTemp('wpm', val);
            });
        }

        // キー設定
        const straightKeyInput = document.getElementById('straightKey');
        if (straightKeyInput) {
            straightKeyInput.addEventListener('change', (e) => {
                this.setTemp('straightKey', e.target.value.trim() || 'Space');
            });
        }

        const paddleLeftInput = document.getElementById('paddleLeftKey');
        if (paddleLeftInput) {
            paddleLeftInput.addEventListener('change', (e) => {
                this.setTemp('paddleLeft', e.target.value.trim() || 'j');
            });
        }

        const paddleRightInput = document.getElementById('paddleRightKey');
        if (paddleRightInput) {
            paddleRightInput.addEventListener('change', (e) => {
                this.setTemp('paddleRight', e.target.value.trim() || 'k');
            });
        }

        // Iambicモード
        const iambicCheckbox = document.getElementById('iambicMode');
        if (iambicCheckbox) {
            iambicCheckbox.addEventListener('change', (e) => {
                this.setTemp('iambicMode', e.target.checked ? 'B' : 'A');
                this.updateIambicModeStatus();
            });
        }

        // パドルレイアウト
        const paddleLayoutCheckbox = document.getElementById('paddleLayout');
        if (paddleLayoutCheckbox) {
            paddleLayoutCheckbox.addEventListener('change', (e) => {
                this.setTemp('paddleLayout', e.target.checked ? 'reversed' : 'normal');
                this.updatePaddleLayoutStatus();
                this.updatePaddleLayout();
            });
        }

        // 和文モード
        const japaneseModeCheckbox = document.getElementById('japaneseMode');
        if (japaneseModeCheckbox) {
            japaneseModeCheckbox.addEventListener('change', () => {
                this.updateJapaneseModeStatus();
            });
        }

        // 履歴クリア
        const clearHistoryBtn = document.getElementById('clearHistory');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    },

    // 初期化
    init() {
        this.load();
        this.updateUI();
        this.setupEventListeners();
        
        // DOMが読み込まれた後にパドルレイアウトを更新
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePaddleLayout();
            });
        } else {
            this.updatePaddleLayout();
        }
    }
};
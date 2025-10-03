// 縦振り電鍵機能モジュール

window.StraightKey = {
    keyDown: false,
    keyDownTime: 0,
    buffer: '',
    sequence: '',
    lastInputTime: 0,
    charTimer: null,
    wordTimer: null,

    // タイミング設定の取得
    getTimings() {
        const wpm = window.Settings ? window.Settings.get('wpm') : 20;
        const unit = 1200 / wpm;
        return {
            dot: unit,
            dash: unit * 3,
            charGap: unit * 4,
            wordGap: unit * 7
        };
    },

    // タイマーのクリア
    clearTimers() {
        if (this.charTimer) {
            clearTimeout(this.charTimer);
            this.charTimer = null;
        }
        if (this.wordTimer) {
            clearTimeout(this.wordTimer);
            this.wordTimer = null;
        }
    },

    // タイマーの設定
    setTimers() {
        this.clearTimers();
        const timings = this.getTimings();
        
        this.charTimer = setTimeout(() => {
            if (this.sequence) {
                this.buffer += this.sequence + ' ';
                this.sequence = '';
                this.updateDisplay();
            }
        }, timings.charGap);
        
        this.wordTimer = setTimeout(() => {
            if (this.sequence) {
                this.buffer += this.sequence + ' ';
                this.sequence = '';
            }
            if (!this.buffer.endsWith('/ ')) {
                this.buffer += '/ ';
            }
            this.updateDisplay();
        }, timings.wordGap);
    },

    // キーダウン処理
    onKeyDown() {
        if (this.keyDown) return;
        
        this.keyDown = true;
        this.keyDownTime = Date.now();
        this.clearTimers();
        
        if (window.AudioSystem) {
            window.AudioSystem.startContinuousTone();
        }
    },

    // キーアップ処理
    onKeyUp() {
        if (!this.keyDown) return;
        
        this.keyDown = false;
        const duration = Date.now() - this.keyDownTime;
        
        if (window.AudioSystem) {
            window.AudioSystem.stopContinuousTone();
        }
        
        const timings = this.getTimings();
        const signal = duration < timings.dash ? '.' : '-';
        this.sequence += signal;
        this.lastInputTime = Date.now();
        this.updateDisplay();
        this.setTimers();
    },

    // 表示の更新
    updateDisplay() {
        let display = '';
        if (this.buffer) {
            display = this.buffer.trim();
        }
        if (this.sequence) {
            if (display) display += ' ';
            display += `[${this.sequence}]`;
        }
        
        const morseDisplay = document.getElementById('straightMorseDisplay');
        if (morseDisplay) {
            morseDisplay.textContent = display || '入力されたモールス信号';
        }
        
        this.updateDecoded();
    },

    // デコード表示の更新
    updateDecoded() {
        const sequences = this.buffer.trim().split(/\s+/);
        let decoded = '';
        
        if (window.MorseCode) {
            decoded = window.MorseCode.morseSequencesToText(sequences);
        }
        
        const decodedOutput = document.getElementById('straightDecoded');
        if (decodedOutput) {
            decodedOutput.textContent = decoded || '解読された文字';
        }
    },

    // クリア処理
    clear() {
        this.buffer = '';
        this.sequence = '';
        this.clearTimers();
        this.updateDisplay();
    },

    // イベントリスナーの設定
    setupEventListeners() {
        // マウスイベント
        const morseKey = document.getElementById('morseKey');
        if (morseKey) {
            morseKey.addEventListener('mousedown', () => this.onKeyDown());
            morseKey.addEventListener('mouseup', () => this.onKeyUp());
            morseKey.addEventListener('mouseleave', () => {
                if (this.keyDown) {
                    this.onKeyUp();
                }
            });
        }

        // クリアボタン
        const clearBtn = document.getElementById('straightClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.repeat) return;
            
            const activeTab = document.querySelector('.tab.active');
            if (!activeTab || activeTab.dataset.tab !== 'straight') return;
            
            const straightKey = window.Settings ? window.Settings.get('straightKey') : 'Space';
            if (e.key === straightKey || (straightKey === 'Space' && e.code === 'Space')) {
                e.preventDefault();
                this.onKeyDown();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const activeTab = document.querySelector('.tab.active');
            if (!activeTab || activeTab.dataset.tab !== 'straight') return;
            
            const straightKey = window.Settings ? window.Settings.get('straightKey') : 'Space';
            if (e.key === straightKey || (straightKey === 'Space' && e.code === 'Space')) {
                e.preventDefault();
                this.onKeyUp();
            }
        });
    },

    // 初期化
    init() {
        this.setupEventListeners();
    }
};
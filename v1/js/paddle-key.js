// 横振り電鍵機能モジュール

window.PaddleKey = {
    leftDown: false,
    rightDown: false,
    buffer: '',
    sequence: '',
    sending: false,
    lastSent: null,
    lastInputTime: 0,
    charTimer: null,
    wordTimer: null,
    dotReqCount: 0,
    dashReqCount: 0,
    forceNextElement: null,
    isSqueezing: false,
    squeezeOccurred: false,

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

    // パドル要素の送信
    sendPaddleElement(element) {
        if (this.sending) return;

        this.sending = true;
        this.clearTimers();

        // 新しい要素の送信開始時にsqueezeDetectedをリセット（前回のスクイーズが処理された）
        // ただし、すでに両方のパドルが押されている場合は維持
        if (!(this.leftDown && this.rightDown)) {
            this.squeezeDetected = false;
        }

        const unit = 1200 / (window.Settings ? window.Settings.get('wpm') : 20);
        const duration = element === '.' ? unit : unit * 3;

        if (window.AudioSystem) {
            window.AudioSystem.scheduleTone(window.AudioSystem.audioContext?.currentTime || 0, duration);
        }

        this.sequence += element;
        this.lastInputTime = Date.now();
        this.updateDisplay();
        this.lastSent = element;

        // Iambic logic
        setTimeout(() => {
            const iambicMode = window.Settings ? window.Settings.get('iambicMode') : 'B';
            const both = this.leftDown && this.rightDown;

            // Iambic B: スクイーズが検出されていた場合、現在パドルが離されていても次の要素を設定
            if (iambicMode === 'B' && this.squeezeDetected && !this.forceNextElement) {
                if (element === '.') {
                    this.forceNextElement = '-';
                } else if (element === '-') {
                    this.forceNextElement = '.';
                }
            }

            // 現在も両方のパドルが押されている場合のみ交互送信（Iambic A/B共通）
            if (both && !this.forceNextElement) {
                if (element === '.') {
                    this.forceNextElement = '-';
                } else if (element === '-') {
                    this.forceNextElement = '.';
                }
            }
        }, duration - 5);
        
        setTimeout(() => {
            this.sending = false;

            // Update button states
            if (!this.leftDown) {
                const leftBtn = document.getElementById('paddleLeft');
                if (leftBtn) leftBtn.classList.remove('active');
            }
            if (!this.rightDown) {
                const rightBtn = document.getElementById('paddleRight');
                if (rightBtn) rightBtn.classList.remove('active');
            }

            this.updateSqueezeIndicator();

            // Iambic Bモード: forceNextElementが設定されている場合は必ず送信
            if (this.forceNextElement) {
                this.scheduleNext();
            } else if (this.leftDown || this.rightDown) {
                this.scheduleNext();
            } else {
                this.setTimers();
            }
        }, duration + unit);
    },

    // 次の要素のスケジュール
    scheduleNext() {
        const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
        const isReversed = paddleLayout === 'reversed';

        if (this.forceNextElement) {
            const next = this.forceNextElement;
            this.forceNextElement = null;
            // squeezeDetectedはリセットしない（連続スクイーズのため）
            this.sendPaddleElement(next);
        } else if (this.leftDown && this.rightDown) {
            // Both paddles - alternate
            const nextElement = this.lastSent === '.' ? '-' : '.';
            this.sendPaddleElement(nextElement);
        } else if (this.leftDown) {
            const element = isReversed ? '-' : '.';
            this.sendPaddleElement(element);
        } else if (this.rightDown) {
            const element = isReversed ? '.' : '-';
            this.sendPaddleElement(element);
        }
    },

    // Squeeze状態の更新
    updateSqueezeIndicator() {
        const squeezing = this.leftDown && this.rightDown;
        this.isSqueezing = squeezing;
        
        const indicator = document.getElementById('squeezeIndicator');
        if (indicator) {
            if (squeezing) {
                indicator.classList.add('active');
                this.squeezeOccurred = true;
            } else {
                indicator.classList.remove('active');
            }
        }
    },

    // 左パドルダウン
    onLeftDown() {
        const iambicMode = window.Settings ? window.Settings.get('iambicMode') : 'B';

        this.leftDown = true;
        const leftBtn = document.getElementById('paddleLeft');
        if (leftBtn) leftBtn.classList.add('active');
        this.updateSqueezeIndicator();

        // Iambic Bモードで送信中かつ右も押されている場合、次の要素を予約
        if (iambicMode === 'B' && this.sending && this.rightDown) {
            const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
            // 左パドルを押したので、次は左の要素（normalならディット、reversedならダー）
            this.forceNextElement = paddleLayout === 'reversed' ? '-' : '.';
            this.squeezeDetected = true; // スクイーズ検出（離した後も送信）
        }

        if (!this.sending) {
            const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
            const element = paddleLayout === 'reversed' ? '-' : '.';
            this.sendPaddleElement(element);
        }
    },

    // 右パドルダウン
    onRightDown() {
        const iambicMode = window.Settings ? window.Settings.get('iambicMode') : 'B';

        this.rightDown = true;
        const rightBtn = document.getElementById('paddleRight');
        if (rightBtn) rightBtn.classList.add('active');
        this.updateSqueezeIndicator();

        // Iambic Bモードで送信中かつ左も押されている場合、次の要素を予約
        if (iambicMode === 'B' && this.sending && this.leftDown) {
            const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
            // 右パドルを押したので、次は右の要素（normalならダー、reversedならディット）
            this.forceNextElement = paddleLayout === 'reversed' ? '.' : '-';
            this.squeezeDetected = true; // スクイーズ検出（離した後も送信）
        }

        if (!this.sending) {
            const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
            const element = paddleLayout === 'reversed' ? '.' : '-';
            this.sendPaddleElement(element);
        }
    },

    // 左パドルアップ
    onLeftUp() {
        this.leftDown = false;
        this.dashReqCount = 0;
        const leftBtn = document.getElementById('paddleLeft');
        if (leftBtn) leftBtn.classList.remove('active');
        this.updateSqueezeIndicator();
        
        const iambicMode = window.Settings ? window.Settings.get('iambicMode') : 'B';
        if (iambicMode === 'B' && this.isSqueezing && this.rightDown && !this.sending) {
            setTimeout(() => {
                if (this.rightDown && !this.sending) {
                    const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
                    const element = paddleLayout === 'reversed' ? '.' : '-';
                    this.sendPaddleElement(element);
                }
            }, 10);
        }
    },

    // 右パドルアップ
    onRightUp() {
        this.rightDown = false;
        this.dotReqCount = 0;
        const rightBtn = document.getElementById('paddleRight');
        if (rightBtn) rightBtn.classList.remove('active');
        this.updateSqueezeIndicator();
        
        const iambicMode = window.Settings ? window.Settings.get('iambicMode') : 'B';
        if (iambicMode === 'B' && this.isSqueezing && this.leftDown && !this.sending) {
            setTimeout(() => {
                if (this.leftDown && !this.sending) {
                    const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
                    const element = paddleLayout === 'reversed' ? '-' : '.';
                    this.sendPaddleElement(element);
                }
            }, 10);
        }
        
        // Iambic B専用処理
        if (!this.leftDown && !this.rightDown && this.squeezeOccurred) {
            if (iambicMode === 'B' && this.lastSent === '-') {
                if (!this.sending) {
                    const paddleLayout = window.Settings ? window.Settings.get('paddleLayout') : 'normal';
                    const element = paddleLayout === 'reversed' ? '-' : '.';
                    this.sendPaddleElement(element);
                } else {
                    this.dotReqCount++;
                }
            }
            this.squeezeOccurred = false;
        }
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
        
        const morseDisplay = document.getElementById('paddleMorseDisplay');
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
        
        const decodedOutput = document.getElementById('paddleDecoded');
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
        // マウスの状態を追跡
        let leftMouseDown = false;
        let rightMouseDown = false;

        // 左パドル
        const leftPaddle = document.getElementById('paddleLeft');
        if (leftPaddle) {
            leftPaddle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!leftMouseDown) {
                    leftMouseDown = true;
                    this.onLeftDown();
                }
            });
            leftPaddle.addEventListener('mouseup', (e) => {
                e.preventDefault();
                if (leftMouseDown) {
                    leftMouseDown = false;
                    this.onLeftUp();
                }
            });
        }

        // 右パドル
        const rightPaddle = document.getElementById('paddleRight');
        if (rightPaddle) {
            rightPaddle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!rightMouseDown) {
                    rightMouseDown = true;
                    this.onRightDown();
                }
            });
            rightPaddle.addEventListener('mouseup', (e) => {
                e.preventDefault();
                if (rightMouseDown) {
                    rightMouseDown = false;
                    this.onRightUp();
                }
            });
        }

        // グローバルmouseupイベント（ボタン外でマウスを離した場合に対応）
        document.addEventListener('mouseup', () => {
            if (leftMouseDown) {
                leftMouseDown = false;
                this.onLeftUp();
            }
            if (rightMouseDown) {
                rightMouseDown = false;
                this.onRightUp();
            }
        });

        // クリアボタン
        const clearBtn = document.getElementById('paddleClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.repeat) return;
            
            const activeTab = document.querySelector('.tab.active');
            if (!activeTab || activeTab.dataset.tab !== 'paddle') return;
            
            const paddleLeft = window.Settings ? window.Settings.get('paddleLeft') : 'j';
            const paddleRight = window.Settings ? window.Settings.get('paddleRight') : 'k';
            
            if (e.key.toLowerCase() === paddleLeft.toLowerCase()) {
                e.preventDefault();
                this.onLeftDown();
            } else if (e.key.toLowerCase() === paddleRight.toLowerCase()) {
                e.preventDefault();
                this.onRightDown();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const activeTab = document.querySelector('.tab.active');
            if (!activeTab || activeTab.dataset.tab !== 'paddle') return;
            
            const paddleLeft = window.Settings ? window.Settings.get('paddleLeft') : 'j';
            const paddleRight = window.Settings ? window.Settings.get('paddleRight') : 'k';
            
            if (e.key.toLowerCase() === paddleLeft.toLowerCase()) {
                e.preventDefault();
                this.onLeftUp();
            } else if (e.key.toLowerCase() === paddleRight.toLowerCase()) {
                e.preventDefault();
                this.onRightUp();
            }
        });
    },

    // 初期化
    init() {
        this.setupEventListeners();
    }
};
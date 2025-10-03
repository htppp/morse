// UIコントロールとタブ管理モジュール

window.UIControls = {
    modalMouseDownInside: false,
    textLogArr: [],

    // タブ切り替え機能
    initTabs() {
        // 保存されたタブを復元
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            this.switchToTab(savedTab);
        }

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                window.UIControls.switchToTab(targetTab);
            });
        });
    },

    // タブ切り替え処理
    switchToTab(targetTab) {
        // タブのアクティブ状態を更新
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const targetTabElement = document.querySelector(`.tab[data-tab="${targetTab}"]`);
        if (targetTabElement) {
            targetTabElement.classList.add('active');
        }

        // コンテンツの表示を切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(targetTab + '-content');
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // 横振りタブに切り替えたときにパドルレイアウトを更新
        if (targetTab === 'paddle' && window.Settings) {
            window.Settings.updatePaddleLayout();
        }

        // タブの状態を保存
        localStorage.setItem('activeTab', targetTab);
    },

    // 設定モーダルの初期化
    initSettingsModal() {
        const settingsIcon = document.getElementById('settingsIcon');
        const settingsModal = document.getElementById('settingsModal');
        const settingsCancel = document.getElementById('settingsCancel');
        const settingsOK = document.getElementById('settingsOK');

        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                if (settingsModal) {
                    // 設定画面を開くときに現在の設定を一時保存
                    if (window.Settings) {
                        window.Settings.saveTempSettings();
                    }
                    settingsModal.classList.add('active');
                }
            });
        }

        if (settingsCancel) {
            settingsCancel.addEventListener('click', () => {
                if (settingsModal) {
                    // キャンセル: 設定を復元
                    if (window.Settings) {
                        window.Settings.restoreTempSettings();
                    }
                    settingsModal.classList.remove('active');
                }
            });
        }

        if (settingsOK) {
            settingsOK.addEventListener('click', () => {
                if (settingsModal) {
                    // OK: 設定を確定して保存
                    if (window.Settings) {
                        window.Settings.applySettings();
                    }
                    settingsModal.classList.remove('active');
                }
            });
        }

        if (settingsModal) {
            settingsModal.addEventListener('mousedown', (e) => {
                this.modalMouseDownInside = e.target.closest('.settings-content') !== null;
            });

            settingsModal.addEventListener('click', (e) => {
                if (e.target.id === 'settingsModal' && !this.modalMouseDownInside) {
                    // キャンセル: 設定を復元
                    if (window.Settings) {
                        window.Settings.restoreTempSettings();
                    }
                    settingsModal.classList.remove('active');
                }
                this.modalMouseDownInside = false;
            });
        }
    },

    // テキスト変換機能の初期化
    initTextConversion() {
        const textInput = document.getElementById('textInput');
        const playButton = document.getElementById('playButton');
        const stopButton = document.getElementById('stopButton');
        const clearTextButton = document.getElementById('clearTextButton');
        const morseOutput = document.getElementById('morseOutput');

        if (textInput) {
            // テキスト入力時のモールス変換
            textInput.addEventListener('input', (e) => {
                const text = e.target.value.toUpperCase();
                let morse = '';
                
                if (window.MorseCode) {
                    morse = window.MorseCode.textToMorse(text);
                }
                
                if (morseOutput) {
                    morseOutput.textContent = morse || 'モールス信号が表示されます';
                }
            });

            // Enterキーで再生
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const text = textInput.value.trim();
                    if (text) {
                        if (window.Settings) {
                            window.Settings.addToHistory(text);
                        }
                        this.playMorseText();
                    }
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', () => {
                this.playMorseText();
            });
        }

        if (stopButton) {
            stopButton.addEventListener('click', () => {
                if (window.AudioSystem) {
                    window.AudioSystem.stopPlaying();
                    playButton.disabled = false;
                    stopButton.disabled = true;
                }
            });
        }

        if (clearTextButton) {
            clearTextButton.addEventListener('click', () => {
                this.clearTextInput();
            });
        }
    },

    // モールス文字列の再生
    async playMorseText() {
        const textInput = document.getElementById('textInput');
        const playButton = document.getElementById('playButton');
        const stopButton = document.getElementById('stopButton');
        const morseOutput = document.getElementById('morseOutput');

        if (!textInput || !playButton || !stopButton || !morseOutput) return;
        if (!window.AudioSystem) return;

        const morse = morseOutput.textContent;
        if (!morse || morse === 'モールス信号が表示されます') return;

        // 再生開始時のボタン状態設定
        playButton.disabled = true;
        stopButton.disabled = false;

        try {
            // 再生実行
            await window.AudioSystem.playMorseString(morse);
        } catch (error) {
            console.error('再生エラー:', error);
        } finally {
            // 再生終了後は必ずボタン状態をリセット
            playButton.disabled = false;
            stopButton.disabled = true;
        }
    },

    // テキストログ機能の初期化
    initTextLog() {
        const textInput = document.getElementById('textInput');
        const playButton = document.getElementById('playButton');
        const textLog = document.getElementById('textLog');
        const clearTextLogBtn = document.getElementById('clearTextLog');

        // ログ初期化 - 新しいフォーマットに対応
        const saved = localStorage.getItem('morseTextLog');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 旧フォーマット（文字列配列）から新フォーマット（オブジェクト配列）に変換
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    this.textLogArr = parsed.map((text, index) => ({ 
                        text, 
                        favorite: false, 
                        id: Date.now() + index 
                    }));
                    this.saveTextLog(); // 新フォーマットで保存
                } else if (Array.isArray(parsed)) {
                    this.textLogArr = parsed;
                } else {
                    this.textLogArr = [];
                }
                this.renderTextLog();
            } catch (error) {
                console.error('ログ読み込みエラー:', error);
                this.textLogArr = [];
            }
        }

        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.acceptTextInput();
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', () => {
                this.acceptTextInput();
            });
        }

        if (clearTextLogBtn) {
            clearTextLogBtn.addEventListener('click', () => {
                this.clearTextLog();
            });
        }
    },

    // テキスト入力の受理
    acceptTextInput() {
        const textInput = document.getElementById('textInput');
        if (!textInput) return;

        const val = textInput.value.trim();
        if (val) {
            this.addTextLog(val);
            this.playTextInput(val);
            textInput.value = '';
        }
    },

    // テキストログに追加
    addTextLog(str) {
        const logItem = {
            id: Date.now() + Math.random(),
            text: str,
            favorite: false
        };
        this.textLogArr.push(logItem);
        this.renderTextLog();
        this.saveTextLog();
    },

    // テキストログの保存
    saveTextLog() {
        localStorage.setItem('morseTextLog', JSON.stringify(this.textLogArr));
    },

    // テキストログの描画
    renderTextLog() {
        const textLog = document.getElementById('textLog');
        if (textLog) {
            textLog.innerHTML = this.textLogArr.slice().reverse().map(item => {
                const starIcon = item.favorite ? '★' : '☆';
                const starClass = item.favorite ? 'favorite-star active' : 'favorite-star';
                return `
                    <li data-id="${item.id}">
                        <span class="log-text">${item.text}</span>
                        <button class="${starClass}" data-id="${item.id}">${starIcon}</button>
                    </li>
                `;
            }).join('');
            
            // ログアイテムのテキスト部分にクリックイベントを追加
            textLog.querySelectorAll('.log-text').forEach(textSpan => {
                textSpan.style.cursor = 'pointer';
                textSpan.addEventListener('click', () => {
                    this.selectLogItem(textSpan.textContent);
                });
                
                // ホバー効果
                textSpan.addEventListener('mouseenter', () => {
                    textSpan.parentElement.style.backgroundColor = '#d6e3ff';
                });
                textSpan.addEventListener('mouseleave', () => {
                    textSpan.parentElement.style.backgroundColor = '';
                });
            });

            // 星ボタンにクリックイベントを追加
            textLog.querySelectorAll('.favorite-star').forEach(starBtn => {
                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // テキストクリックイベントを防ぐ
                    this.toggleFavorite(starBtn.dataset.id);
                });
            });
        }
    },

    // お気に入りの切り替え
    toggleFavorite(itemId) {
        const item = this.textLogArr.find(item => item.id == itemId);
        if (item) {
            item.favorite = !item.favorite;
            this.renderTextLog();
            this.saveTextLog();
        }
    },

    // テキストログのクリア（お気に入りは保持）
    clearTextLog() {
        this.textLogArr = this.textLogArr.filter(item => item.favorite);
        this.renderTextLog();
        this.saveTextLog();
    },

    // テキスト再生
    playTextInput(str) {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.value = str;
            
            // モールス信号に変換
            if (window.MorseCode) {
                const morse = window.MorseCode.textToMorse(str);
                const morseOutput = document.getElementById('morseOutput');
                if (morseOutput) {
                    morseOutput.textContent = morse || 'モールス信号が表示されます';
                }
            }
        }
    },

    // ログアイテム選択時の処理
    selectLogItem(text) {
        const textInput = document.getElementById('textInput');
        const morseOutput = document.getElementById('morseOutput');
        
        if (textInput) {
            // 入力欄にテキストを設定
            textInput.value = text;
            
            // モールス信号に変換して表示
            if (window.MorseCode && morseOutput) {
                const morse = window.MorseCode.textToMorse(text);
                morseOutput.textContent = morse || 'モールス信号が表示されます';
            }
            
            // 自動的に再生を開始
            this.playMorseText();
        }
    },

    // テキスト入力欄のクリア
    clearTextInput() {
        const textInput = document.getElementById('textInput');
        const morseOutput = document.getElementById('morseOutput');
        
        if (textInput) {
            textInput.value = '';
        }
        
        if (morseOutput) {
            morseOutput.textContent = 'モールス信号が表示されます';
        }
        
        // 再生中の場合は停止
        if (window.AudioSystem) {
            window.AudioSystem.stopPlaying();
            const playButton = document.getElementById('playButton');
            const stopButton = document.getElementById('stopButton');
            if (playButton && stopButton) {
                playButton.disabled = false;
                stopButton.disabled = true;
            }
        }
    },

    // 初期化
    init() {
        this.initTabs();
        this.initSettingsModal();
        this.initTextConversion();
        this.initTextLog();
    }
};
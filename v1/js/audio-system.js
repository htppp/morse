// 音声システムモジュール

window.AudioSystem = {
    audioContext: null,
    sidOsc: null,
    sidGain: null,
    sidFilter: null,
    isPlaying: false,

    // AudioContextの初期化
    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    // サイドトーンの初期化
    ensureSidetone() {
        this.ensureAudioContext();
        if (!this.sidOsc) {
            this.sidOsc = this.audioContext.createOscillator();
            this.sidGain = this.audioContext.createGain();
            this.sidFilter = this.audioContext.createBiquadFilter();
            const sidComp = this.audioContext.createDynamicsCompressor();
            
            this.sidOsc.type = 'sine';
            this.sidOsc.frequency.value = window.Settings ? window.Settings.get('frequency') : 600;
            this.sidGain.gain.value = 0;
            
            this.sidFilter.type = 'bandpass';
            this.sidFilter.frequency.value = window.Settings ? window.Settings.get('frequency') : 600;
            this.sidFilter.Q.value = 10;
            
            sidComp.threshold.value = -18;
            sidComp.ratio.value = 2.0;
            sidComp.attack.value = 0.001;
            sidComp.release.value = 0.08;
            
            this.sidOsc.connect(this.sidGain);
            this.sidGain.connect(this.sidFilter);
            this.sidFilter.connect(sidComp);
            sidComp.connect(this.audioContext.destination);
            this.sidOsc.start();
        }
    },

    // 指定された時間に音を再生
    scheduleTone(startTime, durationMs) {
        this.ensureAudioContext();
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const frequency = window.Settings ? window.Settings.get('frequency') : 600;
            const volume = window.Settings ? window.Settings.get('volume') : 0.3;
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const now = this.audioContext.currentTime;
            const t0 = Math.max(now, startTime);
            gainNode.gain.setValueAtTime(0, t0);
            gainNode.gain.linearRampToValueAtTime(volume, t0 + 0.001);
            gainNode.gain.setValueAtTime(volume, t0 + (durationMs - 1) / 1000);
            gainNode.gain.linearRampToValueAtTime(0, t0 + durationMs / 1000);
            
            oscillator.start(t0);
            oscillator.stop(t0 + durationMs / 1000);
        } catch (error) {
            console.error('音声エラー:', error);
        }
    },

    // 連続音の開始
    startContinuousTone() {
        this.ensureAudioContext();
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            // 既存の音を停止
            if (window.currentStraightOsc) {
                try {
                    window.currentStraightOsc.stop();
                } catch (e) {}
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const frequency = window.Settings ? window.Settings.get('frequency') : 600;
            const volume = window.Settings ? window.Settings.get('volume') : 0.3;
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.001);
            
            oscillator.start(now);
            
            window.currentStraightOsc = oscillator;
            window.currentStraightGain = gainNode;
        } catch (error) {
            console.error('連続音開始エラー:', error);
        }
    },

    // 連続音の停止
    stopContinuousTone() {
        try {
            if (window.currentStraightOsc && window.currentStraightGain) {
                const now = this.audioContext.currentTime;
                window.currentStraightGain.gain.cancelScheduledValues(now);
                window.currentStraightGain.gain.setValueAtTime(window.currentStraightGain.gain.value, now);
                window.currentStraightGain.gain.linearRampToValueAtTime(0, now + 0.001);
                window.currentStraightOsc.stop(now + 0.002);
                window.currentStraightOsc = null;
                window.currentStraightGain = null;
            }
        } catch (error) {
            console.error('連続音停止エラー:', error);
        }
    },

    // モールス符号文字列の再生
    async playMorseString(morse) {
        if (this.isPlaying) return false;
        
        if (!morse || morse === 'モールス信号が表示されます') return false;
        
        this.ensureAudioContext();
        this.ensureSidetone();
        
        this.isPlaying = true;
        
        // 周波数を更新
        const frequency = window.Settings ? window.Settings.get('frequency') : 600;
        this.sidOsc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        this.sidFilter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        const wpm = window.Settings ? window.Settings.get('wpm') : 20;
        const unit = 1200 / wpm;
        const dot = unit;
        const dash = 3 * unit;
        const egap = unit;
        const lgap = 3 * unit;
        const wgap = 7 * unit;
        
        let t = this.audioContext.currentTime + 0.02;
        
        for (let i = 0; i < morse.length && this.isPlaying; i++) {
            const ch = morse[i];
            if (ch === '.') {
                this.scheduleTone(t, dot);
                t += (dot + egap) / 1000;
            } else if (ch === '-') {
                this.scheduleTone(t, dash);
                t += (dash + egap) / 1000;
            } else if (ch === ' ') {
                t += (lgap - egap) / 1000;
            } else if (ch === '/') {
                t += (wgap - egap) / 1000;
            }
        }
        
        const totalMs = (t - this.audioContext.currentTime) * 1000;
        await new Promise(res => setTimeout(res, totalMs));
        
        // 再生完了時の状態を正しく返す
        const wasPlaying = this.isPlaying;
        this.isPlaying = false;
        
        return wasPlaying; // trueなら正常完了、falseなら途中停止
    },

    // 再生の停止
    stopPlaying() {
        this.isPlaying = false;
        if (this.sidGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.sidGain.gain.cancelScheduledValues(now);
            this.sidGain.gain.setValueAtTime(0, now);
        }
    },

    // 初期化
    init() {
        // AudioContextを事前初期化して遅延を最小化
        document.addEventListener('click', () => {
            this.ensureAudioContext();
        }, { once: true });
        
        document.addEventListener('keydown', () => {
            this.ensureAudioContext();
        }, { once: true });
    }
};
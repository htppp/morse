import{A as d,M as m}from"./audio-system-IwvVicxu.js";import{S as n}from"./settings-BNECchb4.js";class o{static calculate(e,t={}){if(e<=0)throw new Error(`Invalid WPM value: ${e}. WPM must be greater than 0.`);const i=1200/e,s=t.shortenGaps?.9:1;return{dot:i,dash:i*3,elementGap:i,charGap:i*3*s,wordGap:i*7*s}}static getCharGapDelay(e){1200/e.dot;const t=e.charGap/(e.dot*3);return e.dot*4*t}static getWordGapDelay(e){return e.wordGap}static classifyElement(e,t){const i=t*1.5;return e<i?".":"-"}}class h{constructor(){this.buffer="",this.sequence=""}getSequence(){return this.sequence}getBuffer(){return this.buffer}addElement(e){this.sequence+=e}commitSequence(e=!0){this.sequence&&(this.buffer+=this.sequence,e&&(this.buffer+=" "),this.sequence="")}addWordSeparator(){this.commitSequence(!0),this.buffer.endsWith("/ ")||(this.buffer+="/ ")}clear(){this.buffer="",this.sequence=""}endsWith(e){return this.buffer.endsWith(e)}getBufferLength(){return this.buffer.length}getSequenceLength(){return this.sequence.length}isEmpty(){return this.buffer.length===0&&this.sequence.length===0}}class g{constructor(){this.timers=new Map}set(e,t,i){this.clear(e);const s=window.setTimeout(t,i);this.timers.set(e,s)}clear(e){const t=this.timers.get(e);t!==void 0&&(clearTimeout(t),this.timers.delete(e))}clearAll(){for(const e of this.timers.values())clearTimeout(e);this.timers.clear()}has(e){return this.timers.has(e)}count(){return this.timers.size}}class p{constructor(){n.load();const e=n.getAll();this.audioSystem=new d({frequency:e.frequency,volume:e.volume,wpm:e.wpm}),this.bufferManager=new h,this.timerManager=new g}getTimings(e=!1){const t=n.get("wpm");return o.calculate(t,{shortenGaps:e})}setCharTimer(e){const t=this.getTimings(!0),i=o.getCharGapDelay(t);this.timerManager.set("charGap",e,i)}setWordTimer(e){const t=this.getTimings(!0),i=o.getWordGapDelay(t);this.timerManager.set("wordGap",e,i)}clearAllTimers(){this.timerManager.clearAll()}clearBuffer(){this.bufferManager.clear()}getElement(e,t=!1){const i=document.getElementById(e);if(!i&&t)throw new Error(`Required element not found: #${e}`);return i}getRequiredElement(e){const t=this.getElement(e,!0);if(!t)throw new Error(`Required element not found: #${e}`);return t}getInputValue(e,t=""){return this.getElement(e)?.value??t}getInputNumber(e,t=0){const i=this.getInputValue(e),s=parseFloat(i);return isNaN(s)?t:s}}class y extends p{constructor(){super(),this.keyDown=!1,this.keyDownTime=0,this.render(),this.setupEventListeners(),this.setupSettingsModal()}onKeyDown(){if(this.keyDown)return;this.keyDown=!0,this.keyDownTime=Date.now(),this.clearAllTimers(),this.audioSystem.startContinuousTone();const e=this.getElement("morseKey");e&&e.classList.add("pressed")}onKeyUp(){if(!this.keyDown)return;this.keyDown=!1;const e=Date.now()-this.keyDownTime;this.audioSystem.stopContinuousTone();const t=this.getTimings(!0),i=o.classifyElement(e,t.dot);this.bufferManager.addElement(i),this.updateDisplay(),this.setupCharWordTimers();const s=this.getElement("morseKey");s&&s.classList.remove("pressed")}setupCharWordTimers(){this.clearAllTimers(),this.setCharTimer(()=>{this.bufferManager.getSequence()&&(this.bufferManager.commitSequence(),this.updateDisplay())}),this.setWordTimer(()=>{this.bufferManager.getSequence()&&this.bufferManager.commitSequence(),this.bufferManager.addWordSeparator(),this.updateDisplay()})}updateDisplay(){let e="";const t=this.bufferManager.getBuffer(),i=this.bufferManager.getSequence();t&&(e=t.trim()),i&&(e&&(e+=" "),e+=`[${i}]`);const s=this.getElement("morseDisplay");s&&(s.textContent=e||"入力されたモールス信号"),this.updateDecoded()}updateDecoded(){const t=this.bufferManager.getBuffer().trim().split(/\s+/),i=m.morseSequencesToText(t),s=this.getElement("decodedOutput");s&&(s.textContent=i||"解読された文字")}clear(){this.clearBuffer(),this.clearAllTimers(),this.updateDisplay()}setupEventListeners(){const e=this.getElement("morseKey");e&&(e.addEventListener("mousedown",()=>this.onKeyDown()),e.addEventListener("mouseup",()=>this.onKeyUp()),e.addEventListener("mouseleave",()=>{this.keyDown&&this.onKeyUp()}),e.addEventListener("touchstart",s=>{s.preventDefault(),this.onKeyDown()}),e.addEventListener("touchend",s=>{s.preventDefault(),this.onKeyUp()}));const t=this.getElement("clearBtn");t&&t.addEventListener("click",()=>this.clear());const i=this.getElement("backBtn");i&&i.addEventListener("click",()=>{window.location.hash="#menu"}),document.addEventListener("keydown",s=>{s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA"||s.repeat||s.code==="Space"&&(s.preventDefault(),this.onKeyDown())}),document.addEventListener("keyup",s=>{s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA"||s.code==="Space"&&(s.preventDefault(),this.onKeyUp())})}setupSettingsModal(){const e=this.getElement("settingsIcon"),t=this.getElement("settingsModal"),i=this.getElement("settingsCancel"),s=this.getElement("settingsOK");e&&t&&e.addEventListener("click",()=>{this.openSettingsModal()}),i&&t&&i.addEventListener("click",()=>{t.classList.remove("active")}),s&&t&&s.addEventListener("click",()=>{this.applySettings(),t.classList.remove("active")}),t&&t.addEventListener("click",a=>{a.target===t&&t.classList.remove("active")})}openSettingsModal(){const e=n.getAll(),t=this.getElement("volumeRange"),i=this.getElement("volumeInput"),s=this.getElement("frequencyInput"),a=this.getElement("wpmInput");t&&(t.value=String(e.volume*100)),i&&(i.value=String(Math.round(e.volume*100))),s&&(s.value=String(e.frequency)),a&&(a.value=String(e.wpm));const c=this.getElement("settingsModal");c&&c.classList.add("active"),t&&i&&(t.oninput=l=>{const u=l.target.value;i.value=u},i.oninput=l=>{const u=l.target.value;t.value=u})}applySettings(){const e=this.getInputNumber("volumeInput",70)/100,t=this.getInputNumber("frequencyInput",750),i=this.getInputNumber("wpmInput",20);n.set("volume",e),n.set("frequency",t),n.set("wpm",i);const s=n.getAll();this.audioSystem.updateSettings({volume:s.volume,frequency:s.frequency,wpm:s.wpm})}render(){const e=this.getElement("app");if(!e)return;const t=n.getAll();e.innerHTML=`
      <div class="settings-icon" id="settingsIcon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>

      <div class="settings-modal" id="settingsModal">
        <div class="settings-content">
          <div class="settings-header">
            <h2>設定</h2>
          </div>
          <div class="settings-grid">
            <div class="setting-item">
              <label>音量</label>
              <div class="setting-row">
                <input type="range" id="volumeRange" min="0" max="100" value="${t.volume*100}">
                <input type="number" id="volumeInput" min="0" max="100" value="${Math.round(t.volume*100)}">
                <span>%</span>
              </div>
            </div>
            <div class="setting-item">
              <label>周波数 (Hz)</label>
              <div class="setting-row">
                <input type="number" id="frequencyInput" min="100" max="2000" value="${t.frequency}" step="50">
              </div>
            </div>
            <div class="setting-item">
              <label>WPM (速度)</label>
              <div class="setting-row">
                <input type="number" id="wpmInput" min="1" max="999" value="${t.wpm}">
              </div>
            </div>
          </div>
          <div class="settings-buttons">
            <button id="settingsCancel" class="btn btn-secondary">キャンセル</button>
            <button id="settingsOK" class="btn">OK</button>
          </div>
        </div>
      </div>

      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>縦振り電鍵練習</h1>
        </header>

        <div class="key-container">
          <div id="morseKey" class="morse-key">
            <div class="key-label">押す</div>
          </div>
        </div>

        <div class="output-container">
          <div class="output-section">
            <h2>モールス信号</h2>
            <div id="morseDisplay" class="output-display">入力されたモールス信号</div>
          </div>

          <div class="output-section">
            <h2>解読された文字</h2>
            <div id="decodedOutput" class="output-display">解読された文字</div>
          </div>
        </div>

        <div class="controls">
          <button id="clearBtn" class="btn">クリア</button>
        </div>

        <div class="instructions">
          <h3>使い方</h3>
          <ul>
            <li>電鍵ボタンをクリック/タッチ、またはスペースキーを押して信号を送信</li>
            <li>短く押すと「・」（短点）、長く押すと「−」（長点）</li>
            <li>文字間は自動的に判定されます</li>
            <li>画面右上の設定アイコンから音量・周波数・速度を調整できます</li>
          </ul>
        </div>
      </div>
    `}destroy(){this.clearAllTimers(),this.audioSystem.stopContinuousTone()}}export{y as VerticalKeyTrainer};

import{A as c,M as u}from"./morse-code-CFHo7w6l.js";import{S as n}from"./settings-DqXuqGhb.js";class v{constructor(){this.keyDown=!1,this.keyDownTime=0,this.buffer="",this.sequence="",this.charTimer=null,this.wordTimer=null,n.load();const e=n.getAll();this.audioSystem=new c({frequency:e.frequency,volume:e.volume,wpm:e.wpm}),this.render(),this.setupEventListeners(),this.setupSettingsModal()}getTimings(){const e=1200/n.get("wpm");return{dot:e,dash:e*3,charGap:e*4*.9,wordGap:e*7*.9}}clearTimers(){this.charTimer!==null&&(clearTimeout(this.charTimer),this.charTimer=null),this.wordTimer!==null&&(clearTimeout(this.wordTimer),this.wordTimer=null)}setTimers(){this.clearTimers();const e=this.getTimings();this.charTimer=window.setTimeout(()=>{this.sequence&&(this.buffer+=this.sequence+" ",this.sequence="",this.updateDisplay())},e.charGap),this.wordTimer=window.setTimeout(()=>{this.sequence&&(this.buffer+=this.sequence+" ",this.sequence=""),this.buffer.endsWith("/ ")||(this.buffer+="/ "),this.updateDisplay()},e.wordGap)}onKeyDown(){if(this.keyDown)return;this.keyDown=!0,this.keyDownTime=Date.now(),this.clearTimers(),this.audioSystem.startContinuousTone();const e=document.getElementById("morseKey");e&&e.classList.add("pressed")}onKeyUp(){if(!this.keyDown)return;this.keyDown=!1;const e=Date.now()-this.keyDownTime;this.audioSystem.stopContinuousTone();const t=this.getTimings(),i=e<t.dash?".":"-";this.sequence+=i,this.updateDisplay(),this.setTimers();const s=document.getElementById("morseKey");s&&s.classList.remove("pressed")}updateDisplay(){let e="";this.buffer&&(e=this.buffer.trim()),this.sequence&&(e&&(e+=" "),e+=`[${this.sequence}]`);const t=document.getElementById("morseDisplay");t&&(t.textContent=e||"入力されたモールス信号"),this.updateDecoded()}updateDecoded(){const e=this.buffer.trim().split(/\s+/),t=u.morseSequencesToText(e),i=document.getElementById("decodedOutput");i&&(i.textContent=t||"解読された文字")}clear(){this.buffer="",this.sequence="",this.clearTimers(),this.updateDisplay()}setupEventListeners(){const e=document.getElementById("morseKey");e&&(e.addEventListener("mousedown",()=>this.onKeyDown()),e.addEventListener("mouseup",()=>this.onKeyUp()),e.addEventListener("mouseleave",()=>{this.keyDown&&this.onKeyUp()}),e.addEventListener("touchstart",s=>{s.preventDefault(),this.onKeyDown()}),e.addEventListener("touchend",s=>{s.preventDefault(),this.onKeyUp()}));const t=document.getElementById("clearBtn");t&&t.addEventListener("click",()=>this.clear());const i=document.getElementById("backBtn");i&&i.addEventListener("click",()=>{window.location.hash="#menu"}),document.addEventListener("keydown",s=>{s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA"||s.repeat||s.code==="Space"&&(s.preventDefault(),this.onKeyDown())}),document.addEventListener("keyup",s=>{s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA"||s.code==="Space"&&(s.preventDefault(),this.onKeyUp())})}setupSettingsModal(){const e=document.getElementById("settingsIcon"),t=document.getElementById("settingsModal"),i=document.getElementById("settingsCancel"),s=document.getElementById("settingsOK");e&&t&&e.addEventListener("click",()=>{this.openSettingsModal()}),i&&t&&i.addEventListener("click",()=>{t.classList.remove("active")}),s&&t&&s.addEventListener("click",()=>{this.applySettings(),t.classList.remove("active")}),t&&t.addEventListener("click",o=>{o.target===t&&t.classList.remove("active")})}openSettingsModal(){const e=n.getAll(),t=document.getElementById("volumeRange"),i=document.getElementById("volumeInput"),s=document.getElementById("frequencyInput"),o=document.getElementById("wpmInput");t&&(t.value=String(e.volume*100)),i&&(i.value=String(Math.round(e.volume*100))),s&&(s.value=String(e.frequency)),o&&(o.value=String(e.wpm));const l=document.getElementById("settingsModal");l&&l.classList.add("active"),t&&i&&(t.oninput=a=>{const d=a.target.value;i.value=d},i.oninput=a=>{const d=a.target.value;t.value=d})}applySettings(){const e=document.getElementById("volumeInput"),t=document.getElementById("frequencyInput"),i=document.getElementById("wpmInput");e&&n.set("volume",parseInt(e.value)/100),t&&n.set("frequency",parseInt(t.value)),i&&n.set("wpm",parseInt(i.value));const s=n.getAll();this.audioSystem.updateSettings({volume:s.volume,frequency:s.frequency,wpm:s.wpm})}render(){const e=document.getElementById("app");if(!e)return;const t=n.getAll();e.innerHTML=`
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
    `}destroy(){this.clearTimers(),this.audioSystem.stopContinuousTone()}}export{v as VerticalKeyTrainer};

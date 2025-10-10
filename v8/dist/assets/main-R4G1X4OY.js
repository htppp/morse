import{A as r,M as h}from"./morse-code-CFHo7w6l.js";import{S as d}from"./settings-DqXuqGhb.js";class f{constructor(){this.leftDown=!1,this.rightDown=!1,this.buffer="",this.sequence="",this.charTimer=null,this.wordTimer=null,this.sending=!1,this.lastSent=null,this.lastInputTime=0,this.dotReqCount=0,this.dashReqCount=0,this.forceNextElement=null,this.isSqueezing=!1,this.squeezeOccurred=!1,this.squeezeDetected=!1,this.savedSettings=null,d.load();const e=d.getAll();this.audioSystem=new r({frequency:e.frequency,volume:e.volume,wpm:e.wpm}),this.render(),this.setupEventListeners(),this.setupSettingsModal(),this.updatePaddleLayout()}getTimings(){const e=1200/d.get("wpm");return{dot:e,dash:e*3,charGap:e*4,wordGap:e*7}}clearTimers(){this.charTimer!==null&&(clearTimeout(this.charTimer),this.charTimer=null),this.wordTimer!==null&&(clearTimeout(this.wordTimer),this.wordTimer=null)}setTimers(){this.clearTimers();const e=this.getTimings();this.charTimer=window.setTimeout(()=>{this.sequence&&(this.buffer+=this.sequence+" ",this.sequence="",this.updateDisplay())},e.charGap),this.wordTimer=window.setTimeout(()=>{this.sequence&&(this.buffer+=this.sequence+" ",this.sequence=""),this.buffer.endsWith("/ ")||(this.buffer+="/ "),this.updateDisplay()},e.wordGap)}sendPaddleElement(e){if(this.sending)return;this.sending=!0,this.clearTimers(),this.leftDown&&this.rightDown||(this.squeezeDetected=!1);const t=1200/d.get("wpm"),s=e==="."?t:t*3;this.audioSystem.scheduleTone(0,s),this.sequence+=e,this.lastInputTime=Date.now(),this.updateDisplay(),this.lastSent=e,setTimeout(()=>{const n=d.get("iambicMode"),a=this.leftDown&&this.rightDown;n==="B"&&this.squeezeDetected&&!this.forceNextElement&&(e==="."?this.forceNextElement="-":e==="-"&&(this.forceNextElement=".")),a&&!this.forceNextElement&&(e==="."?this.forceNextElement="-":e==="-"&&(this.forceNextElement="."))},s-5),setTimeout(()=>{if(this.sending=!1,!this.leftDown){const n=document.getElementById("paddleLeft");n&&n.classList.remove("active")}if(!this.rightDown){const n=document.getElementById("paddleRight");n&&n.classList.remove("active")}this.updateSqueezeIndicator(),this.forceNextElement?this.scheduleNext():this.leftDown||this.rightDown?this.scheduleNext():this.setTimers()},s+t)}scheduleNext(){const t=d.get("paddleLayout")==="reversed";if(this.forceNextElement){const s=this.forceNextElement;this.forceNextElement=null,this.sendPaddleElement(s)}else if(this.leftDown&&this.rightDown){const s=this.lastSent==="."?"-":".";this.sendPaddleElement(s)}else if(this.leftDown){const s=t?"-":".";this.sendPaddleElement(s)}else if(this.rightDown){const s=t?".":"-";this.sendPaddleElement(s)}}updateSqueezeIndicator(){const e=this.leftDown&&this.rightDown;this.isSqueezing=e;const t=document.getElementById("squeezeIndicator");t&&(e?(t.classList.add("active"),this.squeezeOccurred=!0):t.classList.remove("active"))}onLeftDown(){const e=d.get("iambicMode");this.leftDown=!0;const t=document.getElementById("paddleLeft");if(t&&t.classList.add("active"),this.updateSqueezeIndicator(),e==="B"&&this.sending&&this.rightDown){const s=d.get("paddleLayout");this.forceNextElement=s==="reversed"?"-":".",this.squeezeDetected=!0}if(!this.sending){const n=d.get("paddleLayout")==="reversed"?"-":".";this.sendPaddleElement(n)}}onRightDown(){const e=d.get("iambicMode");this.rightDown=!0;const t=document.getElementById("paddleRight");if(t&&t.classList.add("active"),this.updateSqueezeIndicator(),e==="B"&&this.sending&&this.leftDown){const s=d.get("paddleLayout");this.forceNextElement=s==="reversed"?".":"-",this.squeezeDetected=!0}if(!this.sending){const n=d.get("paddleLayout")==="reversed"?".":"-";this.sendPaddleElement(n)}}onLeftUp(){this.leftDown=!1,this.dashReqCount=0;const e=document.getElementById("paddleLeft");e&&e.classList.remove("active"),this.updateSqueezeIndicator(),d.get("iambicMode")==="B"&&this.isSqueezing&&this.rightDown&&!this.sending&&setTimeout(()=>{if(this.rightDown&&!this.sending){const n=d.get("paddleLayout")==="reversed"?".":"-";this.sendPaddleElement(n)}},10)}onRightUp(){this.rightDown=!1,this.dotReqCount=0;const e=document.getElementById("paddleRight");e&&e.classList.remove("active"),this.updateSqueezeIndicator();const t=d.get("iambicMode");if(t==="B"&&this.isSqueezing&&this.leftDown&&!this.sending&&setTimeout(()=>{if(this.leftDown&&!this.sending){const n=d.get("paddleLayout")==="reversed"?"-":".";this.sendPaddleElement(n)}},10),!this.leftDown&&!this.rightDown&&this.squeezeOccurred){if(t==="B"&&this.lastSent==="-")if(this.sending)this.dotReqCount++;else{const n=d.get("paddleLayout")==="reversed"?"-":".";this.sendPaddleElement(n)}this.squeezeOccurred=!1}}updateDisplay(){let e="";this.buffer&&(e=this.buffer.trim()),this.sequence&&(e&&(e+=" "),e+=`[${this.sequence}]`);const t=document.getElementById("paddleMorseDisplay");t&&(t.textContent=e||"入力されたモールス信号"),this.updateDecoded()}updateDecoded(){const e=this.buffer.trim().split(/\s+/),t=h.morseSequencesToText(e),s=document.getElementById("paddleDecoded");s&&(s.textContent=t||"解読された文字")}clear(){this.buffer="",this.sequence="",this.clearTimers(),this.updateDisplay()}updatePaddleLayout(){const e=d.get("paddleLayout"),t=document.getElementById("paddleLeft"),s=document.getElementById("paddleRight");!t||!s||(e==="reversed"?(t.innerHTML='<div class="paddle-label">左<br>（長点）</div>',s.innerHTML='<div class="paddle-label">右<br>（短点）</div>'):(t.innerHTML='<div class="paddle-label">左<br>（短点）</div>',s.innerHTML='<div class="paddle-label">右<br>（長点）</div>'))}setupEventListeners(){let e=!1,t=!1,s=!1,n=!1;const a=document.getElementById("paddleLeft");a&&(a.addEventListener("mousedown",i=>{i.preventDefault(),e||(e=!0,this.onLeftDown())}),a.addEventListener("mouseup",i=>{i.preventDefault(),e&&(e=!1,this.onLeftUp())}),a.addEventListener("touchstart",i=>{i.preventDefault(),s||(s=!0,this.onLeftDown())},{passive:!1}),a.addEventListener("touchend",i=>{i.preventDefault(),s&&(s=!1,this.onLeftUp())},{passive:!1}));const l=document.getElementById("paddleRight");l&&(l.addEventListener("mousedown",i=>{i.preventDefault(),t||(t=!0,this.onRightDown())}),l.addEventListener("mouseup",i=>{i.preventDefault(),t&&(t=!1,this.onRightUp())}),l.addEventListener("touchstart",i=>{i.preventDefault(),n||(n=!0,this.onRightDown())},{passive:!1}),l.addEventListener("touchend",i=>{i.preventDefault(),n&&(n=!1,this.onRightUp())},{passive:!1})),document.addEventListener("mouseup",()=>{e&&(e=!1,this.onLeftUp()),t&&(t=!1,this.onRightUp())}),document.addEventListener("touchend",()=>{s&&(s=!1,this.onLeftUp()),n&&(n=!1,this.onRightUp())},{passive:!1});const o=document.getElementById("paddleClear");o&&o.addEventListener("click",()=>this.clear());const c=document.getElementById("backBtn");c&&c.addEventListener("click",()=>{window.location.hash="#menu"}),document.addEventListener("keydown",i=>{i.target.tagName==="INPUT"||i.target.tagName==="TEXTAREA"||i.repeat||(i.key==="j"||i.key==="J"?(i.preventDefault(),this.onLeftDown()):(i.key==="k"||i.key==="K")&&(i.preventDefault(),this.onRightDown()))}),document.addEventListener("keyup",i=>{i.target.tagName==="INPUT"||i.target.tagName==="TEXTAREA"||(i.key==="j"||i.key==="J"?(i.preventDefault(),this.onLeftUp()):(i.key==="k"||i.key==="K")&&(i.preventDefault(),this.onRightUp()))})}setupSettingsModal(){const e=document.getElementById("settingsIcon"),t=document.getElementById("settingsModal"),s=document.getElementById("settingsCancel"),n=document.getElementById("settingsOK"),a=document.getElementById("closeSettings");e&&t&&e.addEventListener("click",()=>{this.openSettingsModal()}),s&&t&&s.addEventListener("click",()=>{this.restoreSettings(),t.classList.remove("active")}),n&&t&&n.addEventListener("click",()=>{this.applySettings(),t.classList.remove("active")}),a&&t&&a.addEventListener("click",()=>{this.restoreSettings(),t.classList.remove("active")}),t&&t.addEventListener("click",l=>{l.target===t&&(this.restoreSettings(),t.classList.remove("active"))})}openSettingsModal(){this.savedSettings=d.getAll();const e=d.getAll(),t=document.getElementById("volumeRange"),s=document.getElementById("volumeInput"),n=document.getElementById("frequencyInput"),a=document.getElementById("wpmInput"),l=document.getElementById("iambicMode"),o=document.getElementById("paddleLayout");t&&(t.value=String(e.volume*100)),s&&(s.value=String(Math.round(e.volume*100))),n&&(n.value=String(e.frequency)),a&&(a.value=String(e.wpm)),l&&(l.checked=e.iambicMode==="B"),o&&(o.checked=e.paddleLayout==="reversed");const c=document.getElementById("settingsModal");c&&c.classList.add("active"),t&&s&&(t.oninput=i=>{const u=i.target.value;s.value=u},s.oninput=i=>{const u=i.target.value;t.value=u}),l&&(l.onchange=()=>{this.updateIambicModeStatus()}),o&&(o.onchange=()=>{this.updatePaddleLayoutStatus()}),this.updateIambicModeStatus(),this.updatePaddleLayoutStatus()}restoreSettings(){this.savedSettings&&(d.set("volume",this.savedSettings.volume),d.set("frequency",this.savedSettings.frequency),d.set("wpm",this.savedSettings.wpm),d.set("iambicMode",this.savedSettings.iambicMode),d.set("paddleLayout",this.savedSettings.paddleLayout),this.audioSystem.updateSettings({volume:this.savedSettings.volume,frequency:this.savedSettings.frequency,wpm:this.savedSettings.wpm}),this.updatePaddleLayout(),this.savedSettings=null)}applySettings(){const e=document.getElementById("volumeInput"),t=document.getElementById("frequencyInput"),s=document.getElementById("wpmInput"),n=document.getElementById("iambicMode"),a=document.getElementById("paddleLayout");e&&d.set("volume",parseInt(e.value)/100),t&&d.set("frequency",parseInt(t.value)),s&&d.set("wpm",parseInt(s.value)),n&&d.set("iambicMode",n.checked?"B":"A"),a&&d.set("paddleLayout",a.checked?"reversed":"normal");const l=d.getAll();this.audioSystem.updateSettings({volume:l.volume,frequency:l.frequency,wpm:l.wpm}),this.updatePaddleLayout(),this.savedSettings=null}updateIambicModeStatus(){const e=document.getElementById("iambicMode"),t=document.getElementById("iambicModeStatus");t&&e&&(t.textContent=e.checked?"(現在: Iambic B)":"(現在: Iambic A)")}updatePaddleLayoutStatus(){const e=document.getElementById("paddleLayout"),t=document.getElementById("paddleLayoutStatus");t&&e&&(t.textContent=e.checked?"(現在: 左:長点 / 右:短点)":"(現在: 左:短点 / 右:長点)")}render(){const e=document.getElementById("app");if(!e)return;const t=d.getAll();e.innerHTML=`
      <div class="settings-icon" id="settingsIcon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>

      <div class="settings-modal" id="settingsModal">
        <div class="settings-content">
          <div class="settings-header">
            <h2>設定</h2>
            <button class="close-btn" id="closeSettings">×</button>
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
            <div class="setting-item">
              <label>Iambic A/B モード <span id="iambicModeStatus">(現在: Iambic ${t.iambicMode})</span></label>
              <div class="setting-row">
                <div class="toggle-switch">
                  <input type="checkbox" id="iambicMode" class="toggle-input" ${t.iambicMode==="B"?"checked":""}>
                  <label for="iambicMode" class="toggle-label">
                    <span class="toggle-switch-handle"></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="setting-item">
              <label>横振りパドル配置 <span id="paddleLayoutStatus">(現在: ${t.paddleLayout==="reversed"?"左:長点 / 右:短点":"左:短点 / 右:長点"})</span></label>
              <div class="setting-row">
                <div class="toggle-switch">
                  <input type="checkbox" id="paddleLayout" class="toggle-input" ${t.paddleLayout==="reversed"?"checked":""}>
                  <label for="paddleLayout" class="toggle-label">
                    <span class="toggle-switch-handle"></span>
                  </label>
                </div>
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
          <h1>横振り電鍵練習</h1>
        </header>

        <div class="paddle-container">
          <button class="paddle-key paddle-left" id="paddleLeft">
            <div class="paddle-label">左<br>（短点）</div>
          </button>
          <button class="paddle-key paddle-right" id="paddleRight">
            <div class="paddle-label">右<br>（長点）</div>
          </button>
        </div>

        <div class="keyboard-hint">
          キーボード: J / K
        </div>

        <div class="squeeze-indicator" id="squeezeIndicator">
          ⚡squeeze⚡
        </div>

        <div class="morse-display" id="paddleMorseDisplay">入力されたモールス信号</div>
        <div class="decoded-output" id="paddleDecoded">解読された文字</div>

        <div style="text-align: center; margin-top: 20px;">
          <button id="paddleClear" class="btn">クリア</button>
        </div>
      </div>
    `}destroy(){this.clearTimers(),this.sending&&this.audioSystem.stopContinuousTone()}}export{f as HorizontalKeyTrainer};

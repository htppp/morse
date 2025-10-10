import{A as I,M as v}from"./morse-code-CFHo7w6l.js";const l="K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X".split(" ");function u(d){return l.slice(0,d+1)}function g(d,t=5,e=60){const s=[],o=Math.floor(e*20/(t*5));for(let n=0;n<o;n++){let r="";for(let a=0;a<t;a++){const c=d[Math.floor(Math.random()*d.length)];r+=c}s.push(r)}return s}const h=class h{static get(t){return this.settings[t]}static set(t,e){this.settings[t]=e,this.save()}static load(){try{const t=localStorage.getItem("v4.koch.settings");t&&(this.settings={...this.defaultSettings,...JSON.parse(t)})}catch(t){console.error("Failed to load Koch settings:",t)}}static save(){try{localStorage.setItem("v4.koch.settings",JSON.stringify(this.settings))}catch(t){console.error("Failed to save Koch settings:",t)}}static getAll(){return{...this.settings}}static reset(){this.settings={...this.defaultSettings},this.save()}};h.defaultSettings={characterSpeed:20,effectiveSpeed:20,frequency:750,volume:.7,groupSize:9,displayMode:"fixed",practiceDuration:60,showInput:!0},h.settings={...h.defaultSettings};let i=h;class B{constructor(){this.viewMode="learning",this.state={currentLesson:1,isPlaying:!1,userInput:"",correctAnswer:"",groups:[],currentGroupIndex:0},this.customState={selectedChars:new Set,isCustomRunning:!1,customUserInput:"",customCorrectAnswer:"",customGroups:[],customCurrentGroupIndex:0,customIsPlaying:!1},i.load();const t=i.getAll();this.audioSystem=new I({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed}),this.loadProgress(),this.loadViewMode(),this.loadSelectedChars(),this.render()}loadProgress(){try{const t=localStorage.getItem("v4.koch.currentLesson");t&&(this.state.currentLesson=parseInt(t))}catch(t){console.error("Failed to load progress:",t)}}saveProgress(){try{localStorage.setItem("v4.koch.currentLesson",this.state.currentLesson.toString())}catch(t){console.error("Failed to save progress:",t)}}loadViewMode(){try{const t=localStorage.getItem("v8.koch.viewMode");t&&["learning","custom"].includes(t)&&(this.viewMode=t)}catch(t){console.error("Failed to load view mode:",t)}}saveViewMode(){try{localStorage.setItem("v8.koch.viewMode",this.viewMode)}catch(t){console.error("Failed to save view mode:",t)}}loadSelectedChars(){try{const t=localStorage.getItem("v8.koch.selectedChars");if(t){const e=JSON.parse(t);this.customState.selectedChars=new Set(e)}}catch(t){console.error("Failed to load selected chars:",t)}}saveSelectedChars(){try{const t=Array.from(this.customState.selectedChars);localStorage.setItem("v8.koch.selectedChars",JSON.stringify(t))}catch(t){console.error("Failed to save selected chars:",t)}}async startLesson(){const t=i.getAll(),e=u(this.state.currentLesson);this.state.groups=g(e,5,t.practiceDuration),this.state.currentGroupIndex=0,this.state.userInput="",this.state.correctAnswer=this.state.groups.join(""),this.state.isPlaying=!1,this.audioSystem.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed}),this.renderPractice()}async playMorse(){if(!this.state.isPlaying){this.state.isPlaying=!0,this.state.currentGroupIndex=0,this.updateProgress(),this.updatePlaybackButtons();for(let t=0;t<this.state.groups.length&&this.state.isPlaying;t++){const e=this.state.groups[t],s=v.textToMorse(e);await this.audioSystem.playMorseString(s+" /"),this.state.currentGroupIndex=t+1,this.updateProgress()}this.state.isPlaying=!1,this.updatePlaybackButtons(),this.state.currentGroupIndex>=this.state.groups.length&&this.showResult()}}pauseMorse(){this.state.isPlaying=!1,this.audioSystem.stopPlaying(),this.updatePlaybackButtons()}stopLesson(){this.state.isPlaying=!1,this.audioSystem.stopPlaying(),this.render()}showResult(){const t=this.calculateAccuracy(),e=t>=90,s=document.getElementById("resultContainer");s&&(s.innerHTML=`
      <div class="result ${e?"passed":"failed"}">
        <h2>${e?"合格！":"不合格"}</h2>
        <div class="accuracy">正答率: ${t.toFixed(1)}%</div>
        <div class="comparison">
          <div>送信: ${this.state.correctAnswer}</div>
          <div>入力: ${this.state.userInput||"（未入力）"}</div>
        </div>
        <div class="actions">
          ${e?'<button class="btn primary" onclick="window.location.reload()">次のレッスンへ</button>':""}
          <button class="btn" onclick="window.location.reload()">もう一度</button>
        </div>
      </div>
    `,e&&this.state.currentLesson<40&&(this.state.currentLesson++,this.saveProgress()))}calculateAccuracy(){if(!this.state.userInput)return 0;const t=this.state.correctAnswer.replace(/\s/g,""),e=this.state.userInput.replace(/\s/g,""),s=Math.max(t.length,e.length);let o=0;for(let n=0;n<s;n++)t[n]===e[n]&&o++;return o/s*100}updateProgress(){const t=document.getElementById("lessonProgress"),e=document.getElementById("progressBar");if(t&&e){const s=this.state.currentGroupIndex/this.state.groups.length*100;t.textContent=`進行: ${this.state.currentGroupIndex}/${this.state.groups.length} (${s.toFixed(0)}%)`,e.style.width=`${s}%`}this.updatePlaybackButtons()}showSettings(){const t={...i.getAll()},e=i.getAll(),s=document.createElement("div");s.className="modal",s.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <h2>設定</h2>
          <button id="closeSettings" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>文字速度 (Character Speed) WPM:</label>
            <input type="number" id="characterSpeed" min="5" max="40" step="1" value="${e.characterSpeed}">
          </div>

          <div class="setting-item">
            <label>実効速度 (Effective Speed) WPM:</label>
            <input type="number" id="effectiveSpeed" min="5" max="40" step="1" value="${e.effectiveSpeed}">
          </div>

          <div class="setting-item">
            <label>周波数 (Hz):</label>
            <input type="number" id="frequency" min="400" max="1000" step="10" value="${e.frequency}">
          </div>

          <div class="setting-item">
            <label>音量 (%):</label>
            <div class="volume-control">
              <input type="range" id="volumeRange" min="0" max="100" step="5" value="${e.volume*100}">
              <input type="number" id="volumeInput" min="0" max="100" step="5" value="${Math.round(e.volume*100)}">
            </div>
          </div>

          <div class="setting-item">
            <label>練習時間 (秒):</label>
            <input type="number" id="practiceDuration" min="30" max="300" step="30" value="${e.practiceDuration}">
          </div>

          <div class="setting-item">
            <label>グループサイズ (文字):</label>
            <input type="number" id="groupSize" min="3" max="10" step="1" value="${e.groupSize}">
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="showInput" ${e.showInput?"checked":""}>
              入力を表示
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button id="cancelSettings" class="btn">キャンセル</button>
          <button id="saveSettings" class="btn primary">OK</button>
        </div>
      </div>
    `,document.body.appendChild(s);const o=document.getElementById("volumeRange"),n=document.getElementById("volumeInput");o&&n&&(o.oninput=a=>{const c=a.target.value;n.value=c},n.oninput=a=>{const c=a.target.value;o.value=c});const r=()=>{i.set("characterSpeed",t.characterSpeed),i.set("effectiveSpeed",t.effectiveSpeed),i.set("frequency",t.frequency),i.set("volume",t.volume),i.set("practiceDuration",t.practiceDuration),i.set("groupSize",t.groupSize),i.set("showInput",t.showInput),this.audioSystem.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed})};document.getElementById("saveSettings")?.addEventListener("click",()=>{const a=document.getElementById("characterSpeed"),c=document.getElementById("effectiveSpeed"),y=document.getElementById("frequency"),b=document.getElementById("practiceDuration"),f=document.getElementById("groupSize"),S=document.getElementById("showInput"),m=parseInt(a.value);let p=parseInt(c.value);p>m&&(p=m,c.value=m.toString()),i.set("characterSpeed",m),i.set("effectiveSpeed",p),i.set("frequency",parseInt(y.value)),i.set("volume",parseInt(n.value)/100),i.set("practiceDuration",parseInt(b.value)),i.set("groupSize",parseInt(f.value)),i.set("showInput",S.checked),this.audioSystem.updateSettings({frequency:i.get("frequency"),volume:i.get("volume"),wpm:i.get("characterSpeed"),effectiveWpm:i.get("effectiveSpeed")}),s.remove(),this.state.groups.length>0&&this.renderPractice()}),document.getElementById("cancelSettings")?.addEventListener("click",()=>{r(),s.remove()}),document.getElementById("closeSettings")?.addEventListener("click",()=>{r(),s.remove()}),s.addEventListener("click",a=>{a.target===s&&(r(),s.remove())})}render(){const t=document.getElementById("app");if(!t)return;u(this.state.currentLesson),l.slice(0,40).map((s,o)=>{const n=o+1,r=u(n),a=n===this.state.currentLesson,c=n<this.state.currentLesson;return`
        <div class="lesson-item ${a?"current":""} ${c?"passed":""}" data-lesson="${n}">
          <div class="lesson-num">L${n}</div>
          <div class="lesson-chars">${r.join("")}</div>
        </div>
      `}).join(""),t.innerHTML=`
      <div class="settings-icon" id="settingsIcon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>

      <div class="container">
        <header class="header">
          <button id="backBtn" class="back-btn">← 戻る</button>
          <h1>コッホ法トレーニング</h1>
        </header>

        <div class="tabs">
          <button class="tab-button ${this.viewMode==="learning"?"active":""}" data-tab="learning">基本学習</button>
          <button class="tab-button ${this.viewMode==="custom"?"active":""}" data-tab="custom">任意文字列練習</button>
        </div>

        ${this.renderModeContent()}
      </div>
    `,document.getElementById("backBtn")?.addEventListener("click",()=>{window.location.href="./index.html"}),document.getElementById("settingsIcon")?.addEventListener("click",()=>{this.showSettings()}),document.querySelectorAll(".tab-button").forEach(s=>{s.addEventListener("click",()=>{const o=s.getAttribute("data-tab");o&&(this.viewMode=o,this.saveViewMode(),this.render())})}),this.setupModeEventListeners()}renderModeContent(){switch(this.viewMode){case"learning":return this.renderLearningMode();case"custom":return this.renderCustomMode();default:return this.renderLearningMode()}}renderLearningMode(){const t=u(this.state.currentLesson),e=l.slice(0,40).map((s,o)=>{const n=o+1,r=u(n),a=n===this.state.currentLesson,c=n<this.state.currentLesson;return`
        <div class="lesson-item ${a?"current":""} ${c?"passed":""}" data-lesson="${n}">
          <div class="lesson-num">L${n}</div>
          <div class="lesson-chars">${r.join("")}</div>
        </div>
      `}).join("");return`
      <div class="lesson-info">
        <h2>レッスン ${this.state.currentLesson} / 40</h2>
        <div class="chars">学習文字: ${t.join("")}</div>
        <button id="startBtn" class="btn primary">練習開始</button>
      </div>

      <div id="practiceContainer"></div>
      <div id="resultContainer"></div>

      <div class="instructions">
        <h3>使い方</h3>
        <ul>
          <li>「練習開始」をクリックしてモールス信号を聞く</li>
          <li>聞こえた文字を入力</li>
          <li>90%以上の正答率で次のレッスンへ</li>
        </ul>
      </div>

      <div class="lesson-list-section">
        <h3>レッスン一覧</h3>
        <div class="lesson-list">
          ${e}
        </div>
      </div>
    `}renderCustomMode(){return this.customState.isCustomRunning?`
        <div id="customPracticeContainer"></div>
        <div id="customResultContainer"></div>
      `:`
        <div class="lesson-info">
          <h2>任意文字列練習モード</h2>
          <p>練習したい文字を選択してください（最低2文字）</p>
          <div class="char-selection">
            ${l.map(s=>`
        <button class="char-select-btn ${this.customState.selectedChars.has(s)?"selected":""}" data-char="${s}">
          ${s}
        </button>
      `).join("")}
          </div>
          <button id="startCustomBtn" class="btn primary" ${this.customState.selectedChars.size<2?"disabled":""}>練習開始</button>
        </div>

        <div class="instructions">
          <h3>使い方</h3>
          <ul>
            <li>練習したい文字をクリックして選択</li>
            <li>2文字以上選択すると練習開始可能</li>
            <li>選択した文字のみでランダムな練習問題が生成されます</li>
          </ul>
        </div>
      `}setupModeEventListeners(){this.viewMode==="learning"?(document.getElementById("startBtn")?.addEventListener("click",()=>{this.startLesson()}),document.querySelectorAll(".lesson-item").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.getAttribute("data-lesson")||"1");this.state.currentLesson=e,this.saveProgress(),this.render(),window.scrollTo({top:0,behavior:"smooth"})})})):this.viewMode==="custom"&&(this.customState.isCustomRunning||(document.getElementById("startCustomBtn")?.addEventListener("click",()=>{this.startCustom()}),document.querySelectorAll(".char-select-btn").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-char");e&&(this.customState.selectedChars.has(e)?this.customState.selectedChars.delete(e):this.customState.selectedChars.add(e),this.saveSelectedChars(),this.render())})})))}renderPractice(){const t=document.getElementById("practiceContainer");if(!t)return;const e=i.getAll(),s=u(this.state.currentLesson);t.innerHTML=`
      <div class="practice-area">
        <div class="progress-section">
          <div class="progress-bar-container">
            <div id="progressBar" class="progress-bar" style="width: 0%"></div>
          </div>
          <div id="lessonProgress" class="progress-text">準備完了 - 再生ボタンを押してください</div>
        </div>

        <div class="playback-controls">
          <button id="playBtn" class="control-btn" title="再生">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button id="pauseBtn" class="control-btn" title="一時停止" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
          <button id="stopBtn" class="control-btn" title="停止">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          </button>
        </div>

        <textarea id="userInput" class="input-area" placeholder="聞こえた文字を入力..." ${e.showInput?"":'style="opacity: 0.3; pointer-events: none;"'}></textarea>
        ${this.renderKeyboard(s)}
      </div>
    `;const o=document.getElementById("userInput");o&&o.addEventListener("input",n=>{this.state.userInput=n.target.value.toUpperCase()}),document.getElementById("playBtn")?.addEventListener("click",()=>{this.playMorse()}),document.getElementById("pauseBtn")?.addEventListener("click",()=>{this.pauseMorse()}),document.getElementById("stopBtn")?.addEventListener("click",()=>{this.stopLesson()}),this.setupKeyboardEvents(s),this.updatePlaybackButtons()}updatePlaybackButtons(){const t=document.getElementById("playBtn"),e=document.getElementById("pauseBtn");t&&e&&(this.state.isPlaying?(t.disabled=!0,e.disabled=!1):(t.disabled=!1,e.disabled=!0))}renderKeyboard(t){const e=i.get("groupSize"),s=[];for(let o=0;o<l.length;o+=e)s.push(l.slice(o,o+e));return`
      <div class="keyboard">
        <div class="keyboard-header">
          <small>グループベースキーボード（学習済み文字のみ有効）</small>
        </div>
        <div class="keyboard-controls">
          <button id="spaceBtn" class="key-btn special">スペース</button>
          <button id="backspaceBtn" class="key-btn special">1字削除</button>
        </div>
        <div class="keyboard-groups-wrapper">
          <div class="keyboard-groups">
            ${s.map((o,n)=>`
              <div class="keyboard-group">
                <div class="group-label">G${n+1}</div>
                <div class="group-keys">
                  ${o.map(r=>{const a=t.includes(r);return`
                      <button class="key-btn ${a?"":"disabled"}"
                              data-char="${r}"
                              ${a?"":"disabled"}>
                        ${r}
                      </button>
                    `}).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `}setupKeyboardEvents(t){const e=document.getElementById("userInput");e&&(document.querySelectorAll(".key-btn:not(.special)").forEach(s=>{s.addEventListener("click",o=>{o.preventDefault();const n=o.target.getAttribute("data-char");n&&t.includes(n)&&(e.value+=n,this.state.userInput=e.value.toUpperCase())})}),document.getElementById("spaceBtn")?.addEventListener("click",s=>{s.preventDefault(),e.value+=" ",this.state.userInput=e.value.toUpperCase()}),document.getElementById("backspaceBtn")?.addEventListener("click",s=>{s.preventDefault(),e.value=e.value.slice(0,-1),this.state.userInput=e.value.toUpperCase()}),e.addEventListener("keydown",s=>{s.key===""&&(s.preventDefault(),e.value+="",this.state.userInput=e.value.toUpperCase())}))}async startCustom(){const t=i.getAll(),e=Array.from(this.customState.selectedChars);this.customState.customGroups=g(e,5,t.practiceDuration),this.customState.customCurrentGroupIndex=0,this.customState.customUserInput="",this.customState.customCorrectAnswer=this.customState.customGroups.join(""),this.customState.customIsPlaying=!1,this.customState.isCustomRunning=!0,this.audioSystem.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed}),this.render(),this.renderCustomPractice()}renderCustomPractice(){const t=document.getElementById("customPracticeContainer");if(!t)return;const e=i.getAll();t.innerHTML=`
      <div class="practice-area">
        <div class="progress-section">
          <div class="progress-bar-container">
            <div id="customProgressBar" class="progress-bar" style="width: 0%"></div>
          </div>
          <div id="customProgress" class="progress-text">準備完了 - 再生ボタンを押してください</div>
        </div>

        <div class="playback-controls">
          <button id="customPlayBtn" class="control-btn" title="再生">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button id="customPauseBtn" class="control-btn" title="一時停止" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
          <button id="customStopBtn" class="control-btn" title="停止">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          </button>
        </div>

        ${e.showInput?`
          <textarea id="customInputArea" class="input-area" placeholder="聞こえた文字を入力してください..."></textarea>
        `:""}

        <button id="customEndBtn" class="btn primary">結果を見る</button>
      </div>
    `,this.setupCustomControls()}setupCustomControls(){const t=document.getElementById("customInputArea");t&&t.addEventListener("input",e=>{this.customState.customUserInput=e.target.value.toUpperCase()}),document.getElementById("customPlayBtn")?.addEventListener("click",()=>{this.playCustomMorse()}),document.getElementById("customPauseBtn")?.addEventListener("click",()=>{this.pauseCustomMorse()}),document.getElementById("customStopBtn")?.addEventListener("click",()=>{this.stopCustom()}),document.getElementById("customEndBtn")?.addEventListener("click",()=>{this.showCustomResult()}),this.updateCustomPlaybackButtons()}async playCustomMorse(){if(!this.customState.customIsPlaying){this.customState.customIsPlaying=!0,this.customState.customCurrentGroupIndex=0,this.updateCustomProgress(),this.updateCustomPlaybackButtons();for(let t=0;t<this.customState.customGroups.length&&this.customState.customIsPlaying;t++){const e=this.customState.customGroups[t],s=v.textToMorse(e);await this.audioSystem.playMorseString(s+" /"),this.customState.customCurrentGroupIndex=t+1,this.updateCustomProgress()}this.customState.customIsPlaying=!1,this.updateCustomPlaybackButtons()}}pauseCustomMorse(){this.customState.customIsPlaying=!1,this.audioSystem.stopPlaying(),this.updateCustomPlaybackButtons()}stopCustom(){this.customState.customIsPlaying=!1,this.audioSystem.stopPlaying(),this.customState.isCustomRunning=!1,this.render()}updateCustomProgress(){const t=document.getElementById("customProgress"),e=document.getElementById("customProgressBar");if(t&&e){const s=this.customState.customCurrentGroupIndex/this.customState.customGroups.length*100;t.textContent=`進行: ${this.customState.customCurrentGroupIndex}/${this.customState.customGroups.length} (${s.toFixed(0)}%)`,e.style.width=`${s}%`}this.updateCustomPlaybackButtons()}updateCustomPlaybackButtons(){const t=document.getElementById("customPlayBtn"),e=document.getElementById("customPauseBtn");t&&e&&(this.customState.customIsPlaying?(t.disabled=!0,e.disabled=!1):(t.disabled=!1,e.disabled=!0))}showCustomResult(){const t=document.getElementById("customResultContainer");if(!t)return;const e=this.customState.customUserInput.replace(/\s+/g,""),s=this.customState.customCorrectAnswer.replace(/\s+/g,"");let o=0;const n=Math.max(e.length,s.length);for(let a=0;a<n;a++)e[a]===s[a]&&o++;const r=n>0?Math.round(o/n*100):0;t.innerHTML=`
      <div class="result">
        <h2>練習結果</h2>
        <div class="accuracy">正答率: ${r}%</div>
        <div class="comparison">
          <div>送信: ${s}</div>
          <div>あなたの入力: ${e}</div>
        </div>
        <div class="actions">
          <button id="retryCustomBtn" class="btn">もう一度</button>
          <button id="backToCustomMenuBtn" class="btn primary">戻る</button>
        </div>
      </div>
    `,document.getElementById("retryCustomBtn")?.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render(),this.startCustom()}),document.getElementById("backToCustomMenuBtn")?.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render()})}destroy(){this.audioSystem.stopContinuousTone()}}export{B as KochTrainer};

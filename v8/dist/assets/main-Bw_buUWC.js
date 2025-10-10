import{A as X,M as w}from"./morse-code-CFHo7w6l.js";//! 定型文の型定義。
//! ランダムQSO生成用データ。
const Y=["TOKYO","OSAKA","KYOTO","NAGOYA","YOKOHAMA","KOBE","FUKUOKA","SAPPORO","SENDAI","HIROSHIMA","KAWASAKI","SAITAMA","CHIBA","KITAKYUSHU","SAKAI","NIIGATA","HAMAMATSU","KUMAMOTO","OKAYAMA","SAGAMIHARA","SHIZUOKA","KAGOSHIMA","MATSUYAMA","GIFU","UTSUNOMIYA","KANAZAWA","TOYAMA","NARA","NAGASAKI","OITA","KOCHI","MIYAZAKI","NAHA","WAKAYAMA","AOMORI","AKITA","FUKUSHIMA","MORIOKA","MAEBASHI","KOFU","MATSUMOTO","TOYOHASHI","FUKUI","OTSU","TSU","YOKKAICHI","MATSUE","TOTTORI","YAMAGUCHI","TOKUSHIMA","TAKAMATSU","MITO","KORIYAMA","IWAKI","TAKASAKI","HACHIOJI","MACHIDA","KURASHIKI","HIMEJI","NISHINOMIYA","AMAGASAKI","TAKATSUKI","TOYONAKA","SUITA","KAWAGUCHI","FUNABASHI","HAKODATE","ASAHIKAWA","OTARU","KUSHIRO","OBIHIRO","TOMAKOMAI","IWAMIZAWA","HACHINOHE","HIROSAKI","ISHINOMAKI","YAMAGATA","TSURUOKA","YONEZAWA","HITACHI","TSUKUBA","KASUKABE","KAWAGOE","TOKOROZAWA","AGEO","FUCHU","CHOFU","HINO","KOKUBUNJI","ATSUGI","ODAWARA","HIRATSUKA","FUJISAWA","KAMAKURA","ZUSHI","NUMAZU","FUJI","MISHIMA","KAKEGAWA","IWATA"],$=["JOHN","MIKE","TOM","DAVE","BOB","BILL","JIM","JACK","FRANK","PAUL","MARK","DAN","KEN","RON","RICK","STEVE","GEORGE","PETE","RAY","AL","FRED","JEFF","GARY","LARRY","DOUG","DENNIS","RANDY","SCOTT","BRIAN","BRUCE","ERIC","KEVIN","CRAIG","GLENN","GREG","WAYNE","CARL","TONY","KEITH","CHRIS","DONALD","EDWARD","JOSEPH","RICHARD","ROBERT","CHARLES","WILLIAM","THOMAS","JAMES","PATRICK","HENRY","HAROLD","HOWARD","WALTER","ARTHUR","ALBERT","EUGENE","RALPH","LAWRENCE","HERBERT","CLARENCE","ERNEST","WILLIE","ANDREW","SAMUEL","LOUIS","OSCAR","LEONARD","ROY","EARL","CHESTER","CLIFFORD","NORMAN","CLYDE","HOMER","STANLEY","LESTER","MORRIS","RAYMOND","LEWIS","LEON","EDDIE","CHARLIE","FLOYD","FRED","MARTIN","MELVIN","MARVIN","IRVING","HARVEY","SAM","MAX","MACK","JOE","ABE","HARRY","NED","GUS","BERT","EARL"],P=["FT-991A","FT-891","FT-857D","FT-450D","FT-101ES","IC-7300","IC-7610","IC-9700","IC-705","IC-718","TS-590SG","TS-590S","TS-480SAT","TS-850S","TS-2000"],W=["599","589","579","569","559","449","339"];//! ランダムなコールサインを生成する関数。
function G(){const a=["JA","JE","JF","JH","JI","JJ","JK","JL","JM","JN","JO","JP","JQ","JR"],t=a[Math.floor(Math.random()*a.length)],e=Math.floor(Math.random()*10),s=String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26));return`${t}${e}${s}`}//! ランダムな要素を配列から選択する関数。
function O(a){return a[Math.floor(Math.random()*a.length)]}//! ランダムなQSOを生成する関数。
function z(){const a=G(),t=G(),e=O(Y),s=O(Y),n=O($),i=O($),l=O(W),o=O(W),r=O(P),m=O(P),A=O(["GM","GA","GE","GN"]),u=`CQ CQ CQ DE ${a} ${a} PSE K BT ${a} DE ${t} ${t} K BT R ${t} DE ${a} ${A} OM TNX FER UR CALL BT UR RST IS ${o} ${o} BT MI QTH IS ${e} ${e} ES MI NAME IS ${n} ${n} HW ? AR ${a} DE ${a} KN BT R ${a} DE ${t} ${A} DR ${n} OM TKS FER FB RPT ${o} FM ${e} BT UR RST ALSO ${l} ${l} VY FB MI QTH IS ${s} ${s} BT NAME IS ${i} ${i} HW? ${a} DE ${t} KN BT R FB DE ${a} DR ${i} OM BT MI RIG IS ${r} PWR 100W BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR ${t} DE ${a} KN BT R ${a} DE ${t} OK ${n} OM BT UR RIG ${r} VY FB BT MI RIG IS ${m} BT QSL VIA JARL OK SURE BT TNX FB QSO ES 73 AR ${a} DE ${t} VA BT OK ${i} SOLID CPI BT TKS FB QSO ES BEST 73 AR ${t} DE ${a} VA TU E E`;return{id:`qso-random-${Date.now()}`,category:"qso",title:"ランダムQSO",content:u}}//! ラバースタンプQSOのサンプルデータ。
const x=[{id:"qso-1",category:"qso",title:"QSO例1: CQ呼び出しから終了まで",content:"CQ CQ CQ DE JF2SDR JF2SDR PSE K"},{id:"qso-2",category:"qso",title:"QSO例2: 応答",content:"JF2SDR DE JR2ZWA JR2ZWA K"},{id:"qso-3",category:"qso",title:"QSO例3: 挨拶と信号報告",content:"R JR2ZWA DE JF2SDR GM OM TNX FER UR CALL BT UR RST IS 599 599 BT MI QTH IS NAGOYA NAGOYA CITY ES MI NAME IS SHIN SHIN HW ? AR JF2SDR DE JF2SDR KN"},{id:"qso-4",category:"qso",title:"QSO例4: 返信と自己紹介",content:"R JF2SDR DE JR2ZWA GM DR SHIN OM TKS FER FB RPT 599 FM NAGOYA BT UR RST ALSO 599 599 VY FB MI QTH IS GIFU GIFU CITY BT NAME IS HIRO HIRO HW? JF2SDR DE JR2ZWA KN"},{id:"qso-5",category:"qso",title:"QSO例5: リグとアンテナ情報",content:"R FB DE JF2SDR DR HIRO OM BT MI RIG I TS-850S PWR 100W ES ANT IS 3ELE YAGI 12MH BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR JR2ZWA DE JF2SDR KN"},{id:"qso-6",category:"qso",title:"QSO例6: QSL確認と終了",content:"R JF2SDR DE JR2ZWA OK SHIN OM BT UR RIG ES ANT VY FB BT MI RIG IS FT-101ES VY OLD RIG ES ANT IS DP 8MH BT QSL VIA JARL OK SURE BT TNX FB 1ST QSO ES 73 AR JF2SDR DE JR2ZWA VA"},{id:"qso-7",category:"qso",title:"QSO例7: 最終挨拶",content:"OK HIRO SOLID CPI BT TKS FB QSO ES BEST 73 AR JR2ZWA DE JF2SDR VA TU E E"}];//! 英文100字程度のサンプルデータ。
const q=[{id:"text100-1",category:"text100",title:"英文例1: 自己紹介",content:"MY NAME IS JOHN. I LIVE IN TOKYO JAPAN. I AM A STUDENT AT THE UNIVERSITY. I ENJOY LEARNING MORSE CODE IN MY FREE TIME."},{id:"text100-2",category:"text100",title:"英文例2: 天気",content:"THE WEATHER TODAY IS VERY NICE. IT IS SUNNY AND WARM. I WENT FOR A WALK IN THE PARK. MANY PEOPLE WERE ENJOYING THE SUNSHINE."},{id:"text100-3",category:"text100",title:"英文例3: 趣味",content:"I HAVE MANY HOBBIES. I LIKE READING BOOKS AND LISTENING TO MUSIC. ON WEEKENDS I PLAY TENNIS WITH MY FRIENDS. WE HAVE A LOT OF FUN."}];//! 英文200字程度のサンプルデータ。
const V=[{id:"text200-1",category:"text200",title:"英文例1: アマチュア無線の歴史",content:"AMATEUR RADIO HAS A LONG AND RICH HISTORY. IT BEGAN IN THE EARLY TWENTIETH CENTURY WHEN ENTHUSIASTS STARTED EXPERIMENTING WITH RADIO WAVES. MORSE CODE WAS THE PRIMARY MODE OF COMMUNICATION. TODAY AMATEUR RADIO CONTINUES TO BE A POPULAR HOBBY AROUND THE WORLD. OPERATORS USE VARIOUS MODES INCLUDING CW SSB AND DIGITAL MODES. IT IS A GREAT WAY TO MAKE FRIENDS AND LEARN ABOUT TECHNOLOGY."},{id:"text200-2",category:"text200",title:"英文例2: 旅行の思い出",content:"LAST SUMMER I WENT ON A TRIP TO KYOTO. IT WAS MY FIRST TIME VISITING THE ANCIENT CAPITAL OF JAPAN. I VISITED MANY FAMOUS TEMPLES AND SHRINES. THE ARCHITECTURE WAS BEAUTIFUL AND THE GARDENS WERE PEACEFUL. I ALSO ENJOYED TRYING LOCAL FOODS LIKE TOFU AND GREEN TEA. THE PEOPLE WERE VERY FRIENDLY AND HELPFUL. I TOOK MANY PHOTOS TO REMEMBER THIS WONDERFUL EXPERIENCE. I HOPE TO RETURN SOMEDAY."}];//! 英文300字程度のサンプルデータ。
const Q=[{id:"text300-1",category:"text300",title:"英文例1: モールス符号の学習",content:"LEARNING MORSE CODE IS A REWARDING EXPERIENCE. AT FIRST IT MAY SEEM DIFFICULT BUT WITH REGULAR PRACTICE IT BECOMES EASIER. THE KOCH METHOD IS ONE OF THE MOST EFFECTIVE WAYS TO LEARN. IT STARTS WITH JUST TWO CHARACTERS AND GRADUALLY ADDS MORE. THIS APPROACH HELPS YOU LEARN AT A STEADY PACE. LISTENING PRACTICE IS ALSO VERY IMPORTANT. YOU SHOULD TRY TO COPY REAL MORSE CODE TRANSMISSIONS. MANY ONLINE RESOURCES ARE AVAILABLE TO HELP YOU PRACTICE. JOINING AN AMATEUR RADIO CLUB CAN ALSO BE BENEFICIAL. YOU CAN MEET OTHER ENTHUSIASTS AND SHARE EXPERIENCES. WITH DEDICATION AND PATIENCE YOU WILL MASTER MORSE CODE AND ENJOY USING IT IN YOUR RADIO COMMUNICATIONS."},{id:"text300-2",category:"text300",title:"英文例2: 無線交信の楽しみ",content:"AMATEUR RADIO OFFERS MANY EXCITING OPPORTUNITIES. ONE OF THE GREATEST JOYS IS MAKING CONTACT WITH STATIONS AROUND THE WORLD. YOU CAN TALK TO PEOPLE FROM DIFFERENT COUNTRIES AND CULTURES. EACH CONTACT IS UNIQUE AND SPECIAL. SOME OPERATORS ENJOY CONTESTS WHERE THEY TRY TO MAKE AS MANY CONTACTS AS POSSIBLE. OTHERS PREFER RELAXED CONVERSATIONS ABOUT HOBBIES AND DAILY LIFE. DX CONTACTS WITH DISTANT STATIONS ARE PARTICULARLY THRILLING. THE THRILL OF HEARING A WEAK SIGNAL FROM FAR AWAY IS UNFORGETTABLE. OPERATING PORTABLE FROM MOUNTAINTOPS OR PARKS IS ALSO FUN. YOU CAN COMBINE YOUR LOVE OF RADIO WITH OUTDOOR ACTIVITIES. AMATEUR RADIO IS MORE THAN A HOBBY IT IS A LIFELONG PASSION."}];//! すべてのビルトイン定型文を取得する関数。
function j(){return[...x,...q,...V,...Q]}//! カテゴリー別に定型文を取得する関数。
function _(a){switch(a){case"qso":return[{id:"qso-random-generate",category:"qso",title:"🎲 ランダムQSOを生成",content:""},...x];case"text100":return q;case"text200":return V;case"text300":return Q;case"custom":return B();default:return[]}}//! ユーザー定義定型文をローカルストレージから取得する関数。
function B(){try{const a=localStorage.getItem("v8.listening.customTemplates");if(a)return JSON.parse(a)}catch(a){console.error("Failed to load custom templates:",a)}return[]}//! ユーザー定義定型文をローカルストレージに保存する関数。
function F(a){try{localStorage.setItem("v8.listening.customTemplates",JSON.stringify(a))}catch(t){console.error("Failed to save custom templates:",t)}}//! 新しいユーザー定義定型文を追加する関数。
function tt(a,t){const e=B(),s={id:`custom-${Date.now()}`,category:"custom",title:a,content:t};e.push(s),F(e)}//! ユーザー定義定型文を更新する関数。
function et(a,t,e){const s=B(),n=s.findIndex(i=>i.id===a);n!==-1&&(s[n].title=t,s[n].content=e,F(s))}//! ユーザー定義定型文を削除する関数。
function st(a){const e=B().filter(s=>s.id!==a);F(e)}//! IDで定型文を取得する関数。
function J(a){return[...j(),...B()].find(e=>e.id===a)}const y=class y{static get(t){return this.settings[t]}static set(t,e){this.settings[t]=e,this.save()}static load(){try{const t=localStorage.getItem("v8.listening.settings");t&&(this.settings={...this.defaultSettings,...JSON.parse(t)})}catch(t){console.error("Failed to load Listening settings:",t)}}static save(){try{localStorage.setItem("v8.listening.settings",JSON.stringify(this.settings))}catch(t){console.error("Failed to save Listening settings:",t)}}static getAll(){return{...this.settings}}static reset(){this.settings={...this.defaultSettings},this.save()}};y.defaultSettings={characterSpeed:20,effectiveSpeed:20,frequency:600,volume:.5},y.settings={...y.defaultSettings};let d=y;class at{constructor(){this.state={currentCategory:"qso",selectedTemplate:null,isPlaying:!1,userInput:"",showResult:!1,showAnswer:!1,showDialogFormat:!1};//! 設定を読み込み。
d.load();const t=d.getAll();//! AudioSystemを初期化。
this.audioSystem=new X({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed}),this.render()}render(){const t=document.getElementById("app");t&&(t.innerHTML=`
			<div class="settings-icon" id="settingsIcon">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
				</svg>
			</div>

			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>モールス信号聞き取り練習</h1>
				</header>

				<div class="tabs">
					${this.renderCategoryTabs()}
				</div>

				<div class="content-area">
					${this.state.selectedTemplate?this.renderPracticeArea():this.renderTemplateList()}
				</div>
			</div>
		`,this.attachEventListeners())}renderCategoryTabs(){return[{id:"qso",label:"ラバースタンプQSO"},{id:"text100",label:"英文100字"},{id:"text200",label:"英文200字"},{id:"text300",label:"英文300字"},{id:"custom",label:"ユーザー定義"}].map(e=>`
			<button class="tab-button ${this.state.currentCategory===e.id?"active":""}" data-category="${e.id}">
				${e.label}
			</button>
		`).join("")}renderTemplateList(){const t=_(this.state.currentCategory);return t.length===0?`
				<div class="empty-state">
					<p>定型文がありません</p>
					${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn primary">新規作成</button>':""}
				</div>
			`:`
			<div class="template-list">
				${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn primary">新規作成</button>':""}
				${t.map(e=>{const s=e.id==="qso-random-generate"?"コールサイン、地名、名前、RSレポート、リグなどがランダムに生成された完全なQSOが作成されます。毎回異なる内容で練習できます。":`${e.content.substring(0,100)}${e.content.length>100?"...":""}`;return`
					<div class="template-card" data-template-id="${e.id}">
						<h3>${e.title}</h3>
						<p class="template-preview">${s}</p>
						<div class="template-actions">
							<button class="btn select-btn" data-template-id="${e.id}">選択</button>
							${this.state.currentCategory==="custom"?`
								<button class="btn edit-btn" data-template-id="${e.id}">編集</button>
								<button class="btn delete-btn" data-template-id="${e.id}">削除</button>
							`:""}
						</div>
					</div>
				`}).join("")}
			</div>
		`}renderPracticeArea(){return this.state.selectedTemplate?`
			<div class="practice-area">
				<div class="practice-header">
					<h2>${this.state.selectedTemplate.title}</h2>
					<button id="backToListBtn" class="btn">一覧に戻る</button>
				</div>

				<div class="playback-controls">
					<button id="playBtn" class="control-btn" title="再生" ${this.state.isPlaying?"disabled":""}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					</button>
					<button id="pauseBtn" class="control-btn" title="一時停止" ${this.state.isPlaying?"":"disabled"}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
						</svg>
					</button>
					<button id="stopBtn" class="control-btn" title="停止">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12"/>
						</svg>
					</button>
					<button id="downloadBtn" class="control-btn" title="WAVファイルとしてダウンロード">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
						</svg>
					</button>
				</div>

				<div class="input-section">
					<label for="userInput">聞き取った内容を入力してください:</label>
					<textarea id="userInput" class="input-area" placeholder="聞き取った文字を入力...">${this.state.userInput}</textarea>
				</div>

				<div class="action-buttons">
					<button id="checkBtn" class="btn primary">採点</button>
					<button id="showAnswerBtn" class="btn">${this.state.showAnswer?"正解を非表示":"正解を表示"}</button>
				</div>

				${this.state.showAnswer?this.renderAnswer():""}
				${this.state.showResult?this.renderResult():""}
			</div>
		`:""}renderAnswer(){if(!this.state.selectedTemplate)return"";const t=this.state.selectedTemplate.category==="qso",e=this.state.selectedTemplate.content;//! 対話形式ボタン（QSOの場合のみ表示）。
const s=t?`<button id="toggleDialogBtn" class="btn" style="margin-left: 10px;">${this.state.showDialogFormat?"通常表示":"対話形式で表示"}</button>`:"";//! 対話形式表示の生成。
let n="";if(t&&this.state.showDialogFormat){//! BTで区切って話者別に表示。
n=`
				<table class="dialog-table">
					<tbody>
						${e.split(/\s+BT\s+/).map((l,o)=>`
								<tr>
									<td class="speaker-cell">${o%2===0?"A":"B"}</td>
									<td class="content-cell">${l.trim()}</td>
								</tr>
							`).join("")}
					</tbody>
				</table>
			`}else n=`<div class="answer-text">${e}</div>`;return`
			<div class="answer-area">
				<h3 style="display: inline-block;">正解</h3>
				${s}
				${n}
			</div>
		`}renderResult(){if(!this.state.selectedTemplate)return"";const t=this.state.selectedTemplate.content.toUpperCase().replace(/\s+/g,""),e=this.state.userInput.toUpperCase().replace(/\s+/g,"");let s=0;const n=Math.max(t.length,e.length);for(let l=0;l<n;l++)t[l]===e[l]&&s++;return`
			<div class="result-area">
				<h3>結果</h3>
				<div class="accuracy">正答率: ${n>0?Math.round(s/n*100):0}%</div>
				<div class="comparison">
					<div class="comparison-row">
						<strong>正解:</strong>
						<div class="comparison-text">${this.state.selectedTemplate.content}</div>
					</div>
					<div class="comparison-row">
						<strong>入力:</strong>
						<div class="comparison-text">${this.state.userInput||"（未入力）"}</div>
					</div>
				</div>
			</div>
		`}attachEventListeners(){//! 戻るボタン。
document.getElementById("backBtn")?.addEventListener("click",()=>{if(this.state.selectedTemplate){//! 練習画面から一覧画面に戻る。
this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.audioSystem.stopPlaying(),this.render()}else{//! 一覧画面からメニュー画面に戻る。
window.location.href="./index.html"}});//! 設定アイコン。
document.getElementById("settingsIcon")?.addEventListener("click",()=>{this.showSettings()});//! カテゴリータブ。
document.querySelectorAll(".tab-button").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-category");s&&(this.state.currentCategory=s,this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render())})});//! 定型文選択ボタン。
document.querySelectorAll(".select-btn").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-template-id");if(s)if(s==="qso-random-generate")this.state.selectedTemplate=z(),this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render();else{const n=J(s);n&&(this.state.selectedTemplate=n,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render())}})});//! ユーザー定義定型文の新規作成ボタン。
document.getElementById("addCustomBtn")?.addEventListener("click",()=>{this.showCustomTemplateDialog()});//! ユーザー定義定型文の編集ボタン。
document.querySelectorAll(".edit-btn").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-template-id");if(s){const n=J(s);n&&this.showCustomTemplateDialog(n)}})});//! ユーザー定義定型文の削除ボタン。
document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-template-id");s&&confirm("この定型文を削除しますか?")&&(st(s),this.render())})});//! 一覧に戻るボタン。
document.getElementById("backToListBtn")?.addEventListener("click",()=>{this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.audioSystem.stopPlaying(),this.render()});//! 再生ボタン。
document.getElementById("playBtn")?.addEventListener("click",()=>{this.playMorse()});//! 一時停止ボタン。
document.getElementById("pauseBtn")?.addEventListener("click",()=>{this.pauseMorse()});//! 停止ボタン。
document.getElementById("stopBtn")?.addEventListener("click",()=>{this.stopMorse()});//! ダウンロードボタン。
document.getElementById("downloadBtn")?.addEventListener("click",()=>{this.downloadMorseAudio()});//! 入力欄。
const t=document.getElementById("userInput");t&&t.addEventListener("input",e=>{this.state.userInput=e.target.value});//! 採点ボタン。
document.getElementById("checkBtn")?.addEventListener("click",()=>{this.state.showResult=!0,this.render()});//! 正解表示ボタン。
document.getElementById("showAnswerBtn")?.addEventListener("click",()=>{this.state.showAnswer=!this.state.showAnswer,this.render()});//! 対話形式切り替えボタン。
document.getElementById("toggleDialogBtn")?.addEventListener("click",()=>{this.state.showDialogFormat=!this.state.showDialogFormat,this.render()})}async playMorse(){if(!this.state.selectedTemplate||this.state.isPlaying)return;this.state.isPlaying=!0,this.render();const t=w.textToMorse(this.state.selectedTemplate.content);await this.audioSystem.playMorseString(t),this.state.isPlaying=!1,this.render()}pauseMorse(){this.state.isPlaying=!1,this.audioSystem.stopPlaying(),this.render()}stopMorse(){this.state.isPlaying=!1,this.audioSystem.stopPlaying(),this.state.userInput="",this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.render()}showSettings(){//! 現在の設定を保存（キャンセル時の復元用）。
const t={...d.getAll()},e=d.getAll(),s=document.createElement("div");s.className="modal",s.innerHTML=`
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
				</div>
				<div class="modal-footer">
					<button id="cancelSettings" class="btn">キャンセル</button>
					<button id="saveSettings" class="btn primary">OK</button>
				</div>
			</div>
		`,document.body.appendChild(s);//! 音量のレンジと入力欄を連携。
const n=document.getElementById("volumeRange"),i=document.getElementById("volumeInput");n&&i&&(n.oninput=o=>{const r=o.target.value;i.value=r},i.oninput=o=>{const r=o.target.value;n.value=r});//! 設定を復元する関数。
const l=()=>{d.set("characterSpeed",t.characterSpeed),d.set("effectiveSpeed",t.effectiveSpeed),d.set("frequency",t.frequency),d.set("volume",t.volume);//! AudioSystemを元に戻す。
this.audioSystem.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed})};//! OK（保存）ボタン。
document.getElementById("saveSettings")?.addEventListener("click",()=>{const o=document.getElementById("characterSpeed"),r=document.getElementById("effectiveSpeed"),m=document.getElementById("frequency"),A=parseInt(o.value);let u=parseInt(r.value);//! 実効速度は文字速度を上限とする。
u>A&&(u=A,r.value=A.toString()),d.set("characterSpeed",A),d.set("effectiveSpeed",u),d.set("frequency",parseInt(m.value)),d.set("volume",parseInt(i.value)/100);//! AudioSystemを更新。
this.audioSystem.updateSettings({frequency:d.get("frequency"),volume:d.get("volume"),wpm:d.get("characterSpeed"),effectiveWpm:d.get("effectiveSpeed")}),s.remove()});//! キャンセルボタン。
document.getElementById("cancelSettings")?.addEventListener("click",()=>{l(),s.remove()});//! ×ボタンで閉じる（キャンセル扱い）。
document.getElementById("closeSettings")?.addEventListener("click",()=>{l(),s.remove()});//! モーダル外クリックで閉じる（キャンセル扱い）。
s.addEventListener("click",o=>{o.target===s&&(l(),s.remove())})}showCustomTemplateDialog(t){const e=!!t,s=document.createElement("div");s.className="modal",s.innerHTML=`
			<div class="modal-content">
				<div class="modal-header">
					<h2>${e?"定型文を編集":"新しい定型文を作成"}</h2>
					<button id="closeDialog" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="templateTitle">タイトル:</label>
						<input type="text" id="templateTitle" class="form-input" value="${t?.title||""}" placeholder="例: 私のQSO">
					</div>
					<div class="form-group">
						<label for="templateContent">内容:</label>
						<textarea id="templateContent" class="form-textarea" placeholder="モールス信号で送信する文章を入力してください">${t?.content||""}</textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button id="cancelDialog" class="btn">キャンセル</button>
					<button id="saveDialog" class="btn primary">${e?"更新":"作成"}</button>
				</div>
			</div>
		`,document.body.appendChild(s);//! 保存ボタン。
document.getElementById("saveDialog")?.addEventListener("click",()=>{const n=document.getElementById("templateTitle"),i=document.getElementById("templateContent");if(n&&i){const l=n.value.trim(),o=i.value.trim();if(!l||!o){alert("タイトルと内容を入力してください");return}e&&t?et(t.id,l,o):tt(l,o),s.remove(),this.render()}});//! キャンセルボタン。
document.getElementById("cancelDialog")?.addEventListener("click",()=>{s.remove()});//! 閉じるボタン。
document.getElementById("closeDialog")?.addEventListener("click",()=>{s.remove()});//! モーダル外クリックで閉じる。
s.addEventListener("click",n=>{n.target===s&&s.remove()})}async downloadMorseAudio(){if(this.state.selectedTemplate)try{//! 設定を取得。
const t=d.getAll(),e=t.characterSpeed,s=t.effectiveSpeed,n=t.frequency,i=t.volume;//! QSOの場合、テキストをBTで分割して話者ごとに周波数を変える。
const l=this.state.selectedTemplate.category==="qso";let o=[];if(l){//! BTで分割（BTも含める）。
const I=this.state.selectedTemplate.content.split(/(\s+BT\s+)/);let T="",C=0;for(const h of I)if(h.trim()==="BT"){if(T.trim()){//! 偶数番目はAさん（設定周波数）、奇数番目はBさん（+5Hz）。
const N=C%2===0?n:n+5;o.push({text:T.trim(),frequency:N}),C++,T=""}}else T+=h;//! 最後のセグメント。
if(T.trim()){const h=C%2===0?n:n+5;o.push({text:T.trim(),frequency:h})}}else{//! QSO以外は通常通り。
o=[{text:this.state.selectedTemplate.content,frequency:n}]}//! 全セグメントのモールス符号に変換。
const r=o.map(I=>({morse:w.textToMorse(I.text),frequency:I.frequency}));//! 全体のモールス符号（時間計算用）。
const m=r.map(I=>I.morse).join(" / ");//! タイミングを計算（ミリ秒）。
const A=1200/e,u=A*3,c=A,g=A*3,p=7*(1200/s);//! 総時間を計算。
let E=0;for(let I=0;I<m.length;I++){const T=m[I];T==="."?E+=A+c:T==="-"?E+=u+c:T===" "?E+=g-c:T==="/"&&(E+=p-c)}//! サンプルレート。
const R=44100,S=E/1e3;//! OfflineAudioContextを作成。
const H=new OfflineAudioContext(1,Math.ceil(R*S),R);//! モールス信号を生成（セグメントごとに周波数を変える）。
let f=0;for(let I=0;I<r.length;I++){const T=r[I],C=T.frequency;for(let h=0;h<T.morse.length;h++){const N=T.morse[h];let D=0;if(N==="."?D=A:N==="-"&&(D=u),D>0){//! オシレーターとゲインノードを作成。
const L=H.createOscillator(),v=H.createGain();L.connect(v),v.connect(H.destination),L.frequency.value=C,L.type="sine";//! エンベロープ（フェードイン・フェードアウト）。
const U=f/1e3,b=U+D/1e3;v.gain.setValueAtTime(0,U),v.gain.linearRampToValueAtTime(i,U+.001),v.gain.setValueAtTime(i,b-.001),v.gain.linearRampToValueAtTime(0,b),L.start(U),L.stop(b),f+=D+c}else N===" "?f+=g-c:N==="/"&&(f+=p-c)}//! セグメント間にワードギャップを追加。
I<r.length-1&&(f+=p)}//! レンダリング。
const k=await H.startRendering();//! WAVファイルに変換。
const Z=this.audioBufferToWav(k);//! ダウンロード。
const K=URL.createObjectURL(Z),M=document.createElement("a");M.href=K,M.download=`${this.state.selectedTemplate.title.replace(/[^a-zA-Z0-9]/g,"_")}.wav`,document.body.appendChild(M),M.click(),document.body.removeChild(M),URL.revokeObjectURL(K)}catch(t){console.error("音声ダウンロードエラー:",t),alert("音声ファイルの生成に失敗しました")}}audioBufferToWav(t){const e=t.numberOfChannels,s=t.sampleRate,n=1,i=16,l=i/8,o=e*l,r=new Float32Array(t.length*e);for(let E=0;E<e;E++){const R=t.getChannelData(E);for(let S=0;S<t.length;S++)r[S*e+E]=R[S]}const m=r.length*l,A=44+m,u=new ArrayBuffer(A),c=new DataView(u);//! WAVヘッダーを書き込む。
const g=(E,R)=>{for(let S=0;S<R.length;S++)c.setUint8(E+S,R.charCodeAt(S))};//! RIFFチャンク。
g(0,"RIFF"),c.setUint32(4,A-8,!0),g(8,"WAVE");//! fmtチャンク。
g(12,"fmt "),c.setUint32(16,16,!0),c.setUint16(20,n,!0),c.setUint16(22,e,!0),c.setUint32(24,s,!0),c.setUint32(28,s*o,!0),c.setUint16(32,o,!0),c.setUint16(34,i,!0);//! dataチャンク。
g(36,"data"),c.setUint32(40,m,!0);//! PCMデータを書き込む。
let p=44;for(let E=0;E<r.length;E++){const R=Math.max(-1,Math.min(1,r[E])),S=R<0?R*32768:R*32767;c.setInt16(p,S,!0),p+=2}return new Blob([u],{type:"audio/wav"})}destroy(){this.audioSystem.stopContinuousTone()}}export{at as ListeningTrainer};

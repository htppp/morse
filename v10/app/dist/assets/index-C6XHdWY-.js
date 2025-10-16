var V=Object.defineProperty;var Q=(m,t,e)=>t in m?V(m,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):m[t]=e;var d=(m,t,e)=>Q(m,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();class O{constructor(){d(this,"menuItems",[{id:"vertical",title:"縦振り電鍵練習",description:"上下に動かす電鍵（ストレートキー）の練習",route:"vertical"},{id:"horizontal",title:"横振り電鍵練習",description:"左右に動かす電鍵（パドル）の練習（Iambic A/B対応）",route:"horizontal"},{id:"flashcard",title:"CW略語・Q符号",description:"CW通信で使用される略語とQ符号を学習",route:"flashcard"},{id:"koch",title:"コッホ法トレーニング",description:"段階的に文字を増やして学習する方式",route:"koch"},{id:"listening",title:"モールス信号聞き取り練習",description:"ランダムQSOや英文を聞いて練習",route:"listening"}])}render(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
			<div class="container">
				<header class="menu-header">
					<h1>モールス練習アプリ</h1>
					<p class="version">v10 - Engine/GUI分離版</p>
				</header>

				<main class="menu-main">
					<div class="menu-grid">
						${this.menuItems.map(e=>this.renderMenuItem(e)).join("")}
					</div>
				</main>

				<footer class="menu-footer">
					<p>&copy; 2025 モールス練習アプリ</p>
				</footer>
			</div>
		`;//! イベントリスナーを設定。
this.attachEventListeners()}renderMenuItem(t){return`
			<div class="menu-item" data-route="${t.route}">
				<h2 class="menu-item-title">${t.title}</h2>
				<p class="menu-item-description">${t.description}</p>
			</div>
		`}attachEventListeners(){document.querySelectorAll(".menu-item").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-route");s&&(window.location.hash=`#${s}`)})})}destroy(){//! イベントリスナーは新しいHTMLで上書きされるため、特に処理不要。
}}const A={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."," ":"/",".":".-.-.-",",":"--..--",":":"---...","?":"..--..",_:"..--.-","+":".-.-.","-":"-....-","×":"-..-","^":"......","/":"-..-.","@":".--.-.","(":"-.--.",")":"-.--.-",'"':".-..-.","'":".----.","=":"-...-"},Y=Object.fromEntries(Object.entries(A).map(([m,t])=>[t,m]));class I{static textToMorse(t){const e=t.toUpperCase(),s=/\[([A-Z]+)\]/g,i=[];let n=0,a;for(;(a=s.exec(e))!==null;){if(a.index>n){const l=e.substring(n,a.index),o=Array.from(l).map(c=>A[c]||c);i.push(o.join(" "))}const r=Array.from(a[1]).map(l=>A[l]||l);i.push(r.join("")),n=s.lastIndex}if(n<e.length){const r=e.substring(n),l=Array.from(r).map(o=>A[o]||o);i.push(l.join(" "))}return i.filter(r=>r).join(" ")}static morseToText(t){let e="";for(const s of t)s==="/"?e+=" ":s&&s!==""&&(e+=Y[s]||"?");return e}static getMorseMap(){return{...A}}static charToMorse(t){return A[t.toUpperCase()]}}class k{static calculate(t,e={}){if(t<=0)throw new Error(`Invalid WPM value: ${t}. WPM must be greater than 0.`);const s=1200/t,i=e.shortenGaps?.9:1;return{dot:s,dash:s*3,elementGap:s,charGap:s*3*i,wordGap:s*7*i}}static getCharGapDelay(t){const e=t.charGap/(t.dot*3);return t.dot*4*e}static getWordGapDelay(t){return t.wordGap}static classifyElement(t,e){const s=e*1.5;return t<s?".":"-"}}class U{constructor(){this.buffer="",this.sequence=""}getSequence(){return this.sequence}getBuffer(){return this.buffer}addElement(t){this.sequence+=t}commitSequence(t=!0){this.sequence&&(this.buffer+=this.sequence,t&&(this.buffer+=" "),this.sequence="")}addWordSeparator(){this.commitSequence(!0),this.buffer.endsWith("/ ")||(this.buffer+="/ ")}clear(){this.buffer="",this.sequence=""}endsWith(t){return this.buffer.endsWith(t)}getBufferLength(){return this.buffer.length}getSequenceLength(){return this.sequence.length}isEmpty(){return this.buffer.length===0&&this.sequence.length===0}}class W{constructor(){this.timers=new Map}set(t,e,s){this.clear(t);const i=window.setTimeout(e,s);this.timers.set(t,i)}clear(t){const e=this.timers.get(t);e!==void 0&&(clearTimeout(e),this.timers.delete(t))}clearAll(){for(const t of this.timers.values())clearTimeout(t);this.timers.clear()}has(t){return this.timers.has(t)}count(){return this.timers.size}}class T{constructor(t={frequency:750,volume:.7,wpm:20}){this.audioContext=null,this.currentOscillator=null,this.currentGain=null,this.isPlaying=!1,this.settings=t}ensureAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&this.audioContext.resume()}updateSettings(t){this.settings={...this.settings,...t}}getSettings(){return{...this.settings}}scheduleTone(t,e){if(this.ensureAudioContext(),!!this.audioContext)try{const s=this.audioContext.createOscillator(),i=this.audioContext.createGain();s.connect(i),i.connect(this.audioContext.destination),s.frequency.value=this.settings.frequency,s.type="sine";const n=this.audioContext.currentTime,a=Math.max(n,t);i.gain.setValueAtTime(0,a),i.gain.linearRampToValueAtTime(this.settings.volume,a+.001),i.gain.setValueAtTime(this.settings.volume,a+(e-1)/1e3),i.gain.linearRampToValueAtTime(0,a+e/1e3),s.start(a),s.stop(a+e/1e3)}catch(s){console.error("音声エラー:",s)}}startContinuousTone(){if(this.ensureAudioContext(),!!this.audioContext)try{this.stopContinuousTone();const t=this.audioContext.createOscillator(),e=this.audioContext.createGain();t.connect(e),e.connect(this.audioContext.destination),t.frequency.value=this.settings.frequency,t.type="sine";const s=this.audioContext.currentTime;e.gain.setValueAtTime(0,s),e.gain.linearRampToValueAtTime(this.settings.volume,s+.001),t.start(s),this.currentOscillator=t,this.currentGain=e}catch(t){console.error("連続音開始エラー:",t)}}stopContinuousTone(){if(this.audioContext)try{if(this.currentOscillator&&this.currentGain){const t=this.audioContext.currentTime;this.currentGain.gain.cancelScheduledValues(t),this.currentGain.gain.setValueAtTime(this.currentGain.gain.value,t),this.currentGain.gain.linearRampToValueAtTime(0,t+.001),this.currentOscillator.stop(t+.002),this.currentOscillator=null,this.currentGain=null}}catch(t){console.error("連続音停止エラー:",t)}}async playMorseString(t){if(this.isPlaying||!t||(this.ensureAudioContext(),!this.audioContext))return!1;this.isPlaying=!0;const e=this.settings.wpm||20,s=Math.min(this.settings.effectiveWpm||e,e),i=1200/e,n=i,a=3*i,r=i,l=3*i,o=7*(1200/s);let c=this.audioContext.currentTime+.02;for(let u=0;u<t.length&&this.isPlaying;u++){const v=t[u];v==="."?(this.scheduleTone(c,n),c+=(n+r)/1e3):v==="-"?(this.scheduleTone(c,a),c+=(a+r)/1e3):v===" "?c+=(l-r)/1e3:v==="/"&&(c+=(o-r)/1e3)}const p=(c-this.audioContext.currentTime)*1e3;await new Promise(u=>setTimeout(u,p));const h=this.isPlaying;return this.isPlaying=!1,h}stopPlaying(){this.isPlaying=!1}isCurrentlyPlaying(){return this.isPlaying}getAudioContext(){return this.audioContext}getVolume(){return this.settings.volume}setVolume(t){this.settings.volume=Math.max(0,Math.min(1,t))}getFrequency(){return this.settings.frequency}setFrequency(t){this.settings.frequency=Math.max(400,Math.min(1200,t))}getWPM(){return this.settings.wpm||20}setWPM(t){this.settings.wpm=Math.max(5,Math.min(40,t))}async generateWav(t){if(!t)throw new Error("モールス符号が空です");const e=this.settings.wpm||20,s=Math.min(this.settings.effectiveWpm||e,e),i=1200/e,n=i,a=3*i,r=i,l=3*i,o=7*(1200/s);let c=0;for(let b=0;b<t.length;b++){const g=t[b];g==="."?c+=n+r:g==="-"?c+=a+r:g===" "?c+=l-r:g==="/"&&(c+=o-r)}const p=44100,h=(c+100)/1e3,u=new OfflineAudioContext(1,Math.ceil(h*p),p);let v=.02;for(let b=0;b<t.length;b++){const g=t[b];g==="."?(this.scheduleOfflineTone(u,v,n),v+=(n+r)/1e3):g==="-"?(this.scheduleOfflineTone(u,v,a),v+=(a+r)/1e3):g===" "?v+=(l-r)/1e3:g==="/"&&(v+=(o-r)/1e3)}const f=await u.startRendering();return this.audioBufferToWav(f)}scheduleOfflineTone(t,e,s){const i=t.createOscillator(),n=t.createGain();i.connect(n),n.connect(t.destination),i.frequency.value=this.settings.frequency,i.type="sine";const a=e;n.gain.setValueAtTime(0,a),n.gain.linearRampToValueAtTime(this.settings.volume,a+.001),n.gain.setValueAtTime(this.settings.volume,a+(s-1)/1e3),n.gain.linearRampToValueAtTime(0,a+s/1e3),i.start(a),i.stop(a+s/1e3)}audioBufferToWav(t){const e=t.numberOfChannels,s=t.sampleRate,i=1,n=16,a=n/8,r=e*a,l=new Float32Array(t.length*e);for(let f=0;f<t.numberOfChannels;f++){const b=t.getChannelData(f);for(let g=0;g<b.length;g++)l[g*e+f]=b[g]}const o=l.length*a,c=44+o,p=new ArrayBuffer(c),h=new DataView(p),u=(f,b)=>{for(let g=0;g<b.length;g++)h.setUint8(f+g,b.charCodeAt(g))};u(0,"RIFF"),h.setUint32(4,c-8,!0),u(8,"WAVE"),u(12,"fmt "),h.setUint32(16,16,!0),h.setUint16(20,i,!0),h.setUint16(22,e,!0),h.setUint32(24,s,!0),h.setUint32(28,s*r,!0),h.setUint16(32,r,!0),h.setUint16(34,n,!0),u(36,"data"),h.setUint32(40,o,!0);let v=44;for(let f=0;f<l.length;f++){const b=Math.max(-1,Math.min(1,l[f])),g=b<0?b*32768:b*32767;h.setInt16(v,g,!0),v+=2}return new Blob([p],{type:"audio/wav"})}}class ${constructor(t,e,s,i={}){this.buffer=t,this.timer=e,this.timings=s,this.callbacks=i,this.keyDown=!1,this.keyDownTime=0}keyPress(){var t,e;this.keyDown||(this.keyDown=!0,this.keyDownTime=Date.now(),this.timer.clearAll(),(e=(t=this.callbacks).onKeyPress)==null||e.call(t))}keyRelease(){var t,e,s,i;if(!this.keyDown)return;this.keyDown=!1;const n=Date.now()-this.keyDownTime<this.timings.dot*2?".":"-";this.buffer.addElement(n),(e=(t=this.callbacks).onKeyRelease)==null||e.call(t,n),(i=(s=this.callbacks).onSequenceUpdate)==null||i.call(s,this.buffer.getSequence()),this.notifyBufferUpdate(),this.setupCharWordTimers()}setupCharWordTimers(){this.timer.clearAll();const t=this.timings.charGap;this.timer.set("charGap",()=>{var s,i;const n=this.buffer.getSequence();if(n){const a=I.morseToText([n]);this.buffer.commitSequence(),(i=(s=this.callbacks).onCharacter)==null||i.call(s,n,a||"?"),this.notifyBufferUpdate()}},t);const e=this.timings.wordGap;this.timer.set("wordGap",()=>{var s,i,n,a;const r=this.buffer.getSequence();if(r){const l=I.morseToText([r]);this.buffer.commitSequence(),(i=(s=this.callbacks).onCharacter)==null||i.call(s,r,l||"?")}this.buffer.addWordSeparator(),(a=(n=this.callbacks).onWordSeparator)==null||a.call(n),this.notifyBufferUpdate()},e)}notifyBufferUpdate(){var t,e;const s=this.buffer.getBuffer(),i=s.trim().split(/\s+/),n=I.morseToText(i);(e=(t=this.callbacks).onBufferUpdate)==null||e.call(t,s,n)}clear(){this.buffer.clear(),this.timer.clearAll(),this.notifyBufferUpdate()}getBuffer(){return this.buffer.getBuffer()}getSequence(){return this.buffer.getSequence()}getDecoded(){const t=this.buffer.getBuffer().trim().split(/\s+/);return I.morseToText(t)}isKeyDown(){return this.keyDown}getTimerCount(){return this.timer.count()}}class J{constructor(t,e,s,i={},n={}){this.buffer=t,this.timer=e,this.timings=s,this.callbacks=i,this.leftDown=!1,this.rightDown=!1,this.sending=!1,this.lastSent=null,this.forceNextElement=null,this.squeezeDetected=!1,this.isSqueezing=!1,this.iambicMode=n.iambicMode||"A",this.paddleLayout=n.paddleLayout||"normal"}leftPaddlePress(){if(this.leftDown=!0,this.updateSqueezeState(),this.iambicMode==="B"&&this.sending&&this.rightDown){const t=this.paddleLayout==="reversed"?"-":".";this.forceNextElement=t,this.squeezeDetected=!0}if(!this.sending){const t=this.paddleLayout==="reversed"?"-":".";this.sendPaddleElement(t)}}rightPaddlePress(){if(this.rightDown=!0,this.updateSqueezeState(),this.iambicMode==="B"&&this.sending&&this.leftDown){const t=this.paddleLayout==="reversed"?".":"-";this.forceNextElement=t,this.squeezeDetected=!0}if(!this.sending){const t=this.paddleLayout==="reversed"?".":"-";this.sendPaddleElement(t)}}leftPaddleRelease(){this.leftDown=!1,this.updateSqueezeState()}rightPaddleRelease(){this.rightDown=!1,this.updateSqueezeState()}sendPaddleElement(t){var e,s,i,n;if(this.sending)return;this.sending=!0,this.timer.clearAll(),this.leftDown&&this.rightDown||(this.squeezeDetected=!1);const a=t==="."?this.timings.dot:this.timings.dash;(s=(e=this.callbacks).onElementStart)==null||s.call(e,t,a),this.buffer.addElement(t),this.lastSent=t,(n=(i=this.callbacks).onSequenceUpdate)==null||n.call(i,this.buffer.getSequence()),this.notifyBufferUpdate(),this.timer.set("iambicCheck",()=>{const r=this.leftDown&&this.rightDown;this.iambicMode==="B"&&this.squeezeDetected&&!this.forceNextElement&&(this.forceNextElement=t==="."?"-":"."),r&&!this.forceNextElement&&(this.forceNextElement=t==="."?"-":".")},Math.max(0,a-5)),this.timer.set("elementEnd",()=>{var r,l;this.sending=!1,(l=(r=this.callbacks).onElementEnd)==null||l.call(r,t),this.forceNextElement?this.scheduleNext():this.leftDown||this.rightDown?this.scheduleNext():this.setupCharWordTimers()},a+this.timings.dot)}scheduleNext(){if(this.forceNextElement){const t=this.forceNextElement;this.forceNextElement=null,this.sendPaddleElement(t)}else if(this.leftDown&&this.rightDown){const t=this.lastSent==="."?"-":".";this.sendPaddleElement(t)}else if(this.leftDown){const t=this.paddleLayout==="reversed"?"-":".";this.sendPaddleElement(t)}else if(this.rightDown){const t=this.paddleLayout==="reversed"?".":"-";this.sendPaddleElement(t)}}setupCharWordTimers(){this.timer.clearAll(),this.timer.set("charGap",()=>{var t,e;const s=this.buffer.getSequence();if(s){const i=I.morseToText([s]);this.buffer.commitSequence(),(e=(t=this.callbacks).onCharacter)==null||e.call(t,s,i||"?"),this.notifyBufferUpdate()}},this.timings.charGap),this.timer.set("wordGap",()=>{var t,e,s,i;const n=this.buffer.getSequence();if(n){const a=I.morseToText([n]);this.buffer.commitSequence(),(e=(t=this.callbacks).onCharacter)==null||e.call(t,n,a||"?")}this.buffer.addWordSeparator(),(i=(s=this.callbacks).onWordSeparator)==null||i.call(s),this.notifyBufferUpdate()},this.timings.wordGap)}updateSqueezeState(){var t,e;const s=this.leftDown&&this.rightDown;this.isSqueezing!==s&&(this.isSqueezing=s,(e=(t=this.callbacks).onSqueezeChange)==null||e.call(t,s))}notifyBufferUpdate(){var t,e;const s=this.buffer.getBuffer(),i=s.trim().split(/\s+/),n=I.morseToText(i);(e=(t=this.callbacks).onBufferUpdate)==null||e.call(t,s,n)}clear(){this.buffer.clear(),this.timer.clearAll(),this.sending=!1,this.forceNextElement=null,this.squeezeDetected=!1,this.lastSent=null,this.notifyBufferUpdate()}getBuffer(){return this.buffer.getBuffer()}getSequence(){return this.buffer.getSequence()}getDecoded(){const t=this.buffer.getBuffer().trim().split(/\s+/);return I.morseToText(t)}isLeftPaddleDown(){return this.leftDown}isRightPaddleDown(){return this.rightDown}isSending(){return this.sending}isSqueezingNow(){return this.isSqueezing}setIambicMode(t){this.iambicMode=t}setPaddleLayout(t){this.paddleLayout=t}getIambicMode(){return this.iambicMode}getPaddleLayout(){return this.paddleLayout}}const P=["K","M","U","R","E","S","N","A","P","T","L","W","I",".","J","Z","=","F","O","Y",",","V","G","5","/","Q","9","2","H","3","8","B","?","4","7","C","1","D","6","0","X"];class S{constructor(t=1){this.currentLesson=1,this.currentLesson=Math.max(1,Math.min(40,t))}static getCharsForLesson(t){const e=Math.max(1,Math.min(40,t));return P.slice(0,e+1)}static generateRandomGroups(t,e={}){const s=e.groupSize||5,i=e.duration||60,n=e.wpm||20,a=Math.floor(i*n/(s*5)),r=[];for(let l=0;l<a;l++){let o="";for(let c=0;c<s;c++){const p=t[Math.floor(Math.random()*t.length)];o+=p}r.push(o)}return r}static generateCustomGroups(t,e={}){const s=Array.from(t);if(s.length<2)throw new Error("文字セットには最低2文字必要です");return S.generateRandomGroups(s,e)}static calculateAccuracy(t,e){if(!e)return 0;const s=t.replace(/\s/g,""),i=e.replace(/\s/g,""),n=Math.max(s.length,i.length);if(n===0)return 0;let a=0;for(let r=0;r<n;r++)s[r]===i[r]&&a++;return a/n*100}static isPassed(t){return t>=90}getCurrentLesson(){return this.currentLesson}setCurrentLesson(t){this.currentLesson=Math.max(1,Math.min(40,t))}getCurrentChars(){return S.getCharsForLesson(this.currentLesson)}generatePractice(t={}){const e=this.getCurrentChars();return S.generateRandomGroups(e,t)}advanceLesson(){return this.currentLesson<40&&this.currentLesson++,this.currentLesson}previousLesson(){return this.currentLesson>1&&this.currentLesson--,this.currentLesson}isLastLesson(){return this.currentLesson===40}isFirstLesson(){return this.currentLesson===1}static getTotalLessons(){return 40}static getTotalChars(){return P.length}static getAllChars(){return[...P]}}//! 日本の都市名（ローマ字）。
const x=["TOKYO","OSAKA","KYOTO","NAGOYA","YOKOHAMA","KOBE","FUKUOKA","SAPPORO","SENDAI","HIROSHIMA","KAWASAKI","SAITAMA","CHIBA","KITAKYUSHU","SAKAI","NIIGATA","HAMAMATSU","KUMAMOTO","OKAYAMA","SAGAMIHARA","SHIZUOKA","KAGOSHIMA","MATSUYAMA","GIFU","UTSUNOMIYA","KANAZAWA","TOYAMA","NARA","NAGASAKI","OITA","KOCHI","MIYAZAKI","NAHA","WAKAYAMA","AOMORI","AKITA","FUKUSHIMA","MORIOKA","MAEBASHI","KOFU","MATSUMOTO","TOYOHASHI","FUKUI","OTSU","TSU","YOKKAICHI","MATSUE","TOTTORI","YAMAGUCHI","TOKUSHIMA","TAKAMATSU","MITO","KORIYAMA","IWAKI","TAKASAKI","HACHIOJI","MACHIDA","KURASHIKI","HIMEJI","NISHINOMIYA","AMAGASAKI","TAKATSUKI","TOYONAKA","SUITA","KAWAGUCHI","FUNABASHI","HAKODATE","ASAHIKAWA","OTARU","KUSHIRO","OBIHIRO","TOMAKOMAI","IWAMIZAWA","HACHINOHE","HIROSAKI","ISHINOMAKI","YAMAGATA","TSURUOKA","YONEZAWA","HITACHI","TSUKUBA","KASUKABE","KAWAGOE","TOKOROZAWA","AGEO","FUCHU","CHOFU","HINO","KOKUBUNJI","ATSUGI","ODAWARA","HIRATSUKA","FUJISAWA","KAMAKURA","ZUSHI","NUMAZU","FUJI","MISHIMA","KAKEGAWA","IWATA"];//! 名前（ファーストネーム）。
const q=["JOHN","MIKE","TOM","DAVE","BOB","BILL","JIM","JACK","FRANK","PAUL","MARK","DAN","KEN","RON","RICK","STEVE","GEORGE","PETE","RAY","AL","FRED","JEFF","GARY","LARRY","DOUG","DENNIS","RANDY","SCOTT","BRIAN","BRUCE","ERIC","KEVIN","CRAIG","GLENN","GREG","WAYNE","CARL","TONY","KEITH","CHRIS","DONALD","EDWARD","JOSEPH","RICHARD","ROBERT","CHARLES","WILLIAM","THOMAS","JAMES","PATRICK","HENRY","HAROLD","HOWARD","WALTER","ARTHUR","ALBERT","EUGENE","RALPH","LAWRENCE","HERBERT","CLARENCE","ERNEST","WILLIE","ANDREW","SAMUEL","LOUIS","OSCAR","LEONARD","ROY","EARL","CHESTER","CLIFFORD","NORMAN","CLYDE","HOMER","STANLEY","LESTER","MORRIS","RAYMOND","LEWIS","LEON","EDDIE","CHARLIE","FLOYD","FRED","MARTIN","MELVIN","MARVIN","IRVING","HARVEY","SAM","MAX","MACK","JOE","ABE","HARRY","NED","GUS","BERT","EARL"];//! CW用無線機のリスト。
const D=["FT-991A","FT-891","FT-857D","FT-450D","FT-101ES","IC-7300","IC-7610","IC-9700","IC-705","IC-718","TS-590SG","TS-590S","TS-480SAT","TS-850S","TS-2000"];//! RSTレポートのリスト。
const N=["599","589","579","569","559","449","339"];//! QSOのサンプルテンプレート。
const L=[{id:"qso-1",category:"qso",title:"QSO例1: CQ呼び出しから終了まで",content:"CQ CQ CQ DE JF2SDR JF2SDR PSE K"},{id:"qso-2",category:"qso",title:"QSO例2: 応答",content:"JF2SDR DE JR2ZWA JR2ZWA K"},{id:"qso-3",category:"qso",title:"QSO例3: 挨拶と信号報告",content:"R JR2ZWA DE JF2SDR GM OM TNX FER UR CALL BT UR RST IS 599 599 BT MI QTH IS NAGOYA NAGOYA CITY ES MI NAME IS SHIN SHIN HW ? AR JF2SDR DE JF2SDR KN"},{id:"qso-4",category:"qso",title:"QSO例4: 返信と自己紹介",content:"R JF2SDR DE JR2ZWA GM DR SHIN OM TKS FER FB RPT 599 FM NAGOYA BT UR RST ALSO 599 599 VY FB MI QTH IS GIFU GIFU CITY BT NAME IS HIRO HIRO HW? JF2SDR DE JR2ZWA KN"},{id:"qso-5",category:"qso",title:"QSO例5: リグとアンテナ情報",content:"R FB DE JF2SDR DR HIRO OM BT MI RIG IS TS-850S PWR 100W ES ANT IS 3ELE YAGI 12MH BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR JR2ZWA DE JF2SDR KN"},{id:"qso-6",category:"qso",title:"QSO例6: QSL確認と終了",content:"R JF2SDR DE JR2ZWA OK SHIN OM BT UR RIG ES ANT VY FB BT MI RIG IS FT-101ES VY OLD RIG ES ANT IS DP 8MH BT QSL VIA JARL OK SURE BT TNX FB 1ST QSO ES 73 AR JF2SDR DE JR2ZWA VA"},{id:"qso-7",category:"qso",title:"QSO例7: 最終挨拶",content:"OK HIRO SOLID CPI BT TKS FB QSO ES BEST 73 AR JR2ZWA DE JF2SDR VA TU E E"}];//! 英文100字程度のサンプルテンプレート。
const w=[{id:"text100-1",category:"text100",title:"英文例1: 自己紹介",content:"MY NAME IS JOHN. I LIVE IN TOKYO JAPAN. I AM A STUDENT AT THE UNIVERSITY. I ENJOY LEARNING MORSE CODE IN MY FREE TIME."},{id:"text100-2",category:"text100",title:"英文例2: 天気",content:"THE WEATHER TODAY IS VERY NICE. IT IS SUNNY AND WARM. I WENT FOR A WALK IN THE PARK. MANY PEOPLE WERE ENJOYING THE SUNSHINE."},{id:"text100-3",category:"text100",title:"英文例3: 趣味",content:"I HAVE MANY HOBBIES. I LIKE READING BOOKS AND LISTENING TO MUSIC. ON WEEKENDS I PLAY TENNIS WITH MY FRIENDS. WE HAVE A LOT OF FUN."}];//! 英文200字程度のサンプルテンプレート。
const C=[{id:"text200-1",category:"text200",title:"英文例1: アマチュア無線の歴史",content:"AMATEUR RADIO HAS A LONG AND RICH HISTORY. IT BEGAN IN THE EARLY TWENTIETH CENTURY WHEN ENTHUSIASTS STARTED EXPERIMENTING WITH RADIO WAVES. MORSE CODE WAS THE PRIMARY MODE OF COMMUNICATION. TODAY AMATEUR RADIO CONTINUES TO BE A POPULAR HOBBY AROUND THE WORLD. OPERATORS USE VARIOUS MODES INCLUDING CW SSB AND DIGITAL MODES. IT IS A GREAT WAY TO MAKE FRIENDS AND LEARN ABOUT TECHNOLOGY."},{id:"text200-2",category:"text200",title:"英文例2: 旅行の思い出",content:"LAST SUMMER I WENT ON A TRIP TO KYOTO. IT WAS MY FIRST TIME VISITING THE ANCIENT CAPITAL OF JAPAN. I VISITED MANY FAMOUS TEMPLES AND SHRINES. THE ARCHITECTURE WAS BEAUTIFUL AND THE GARDENS WERE PEACEFUL. I ALSO ENJOYED TRYING LOCAL FOODS LIKE TOFU AND GREEN TEA. THE PEOPLE WERE VERY FRIENDLY AND HELPFUL. I TOOK MANY PHOTOS TO REMEMBER THIS WONDERFUL EXPERIENCE. I HOPE TO RETURN SOMEDAY."}];//! 英文300字程度のサンプルテンプレート。
const B=[{id:"text300-1",category:"text300",title:"英文例1: モールス符号の学習",content:"LEARNING MORSE CODE IS A REWARDING EXPERIENCE. AT FIRST IT MAY SEEM DIFFICULT BUT WITH REGULAR PRACTICE IT BECOMES EASIER. THE KOCH METHOD IS ONE OF THE MOST EFFECTIVE WAYS TO LEARN. IT STARTS WITH JUST TWO CHARACTERS AND GRADUALLY ADDS MORE. THIS APPROACH HELPS YOU LEARN AT A STEADY PACE. LISTENING PRACTICE IS ALSO VERY IMPORTANT. YOU SHOULD TRY TO COPY REAL MORSE CODE TRANSMISSIONS. MANY ONLINE RESOURCES ARE AVAILABLE TO HELP YOU PRACTICE. JOINING AN AMATEUR RADIO CLUB CAN ALSO BE BENEFICIAL. YOU CAN MEET OTHER ENTHUSIASTS AND SHARE EXPERIENCES. WITH DEDICATION AND PATIENCE YOU WILL MASTER MORSE CODE AND ENJOY USING IT IN YOUR RADIO COMMUNICATIONS."},{id:"text300-2",category:"text300",title:"英文例2: 無線交信の楽しみ",content:"AMATEUR RADIO OFFERS MANY EXCITING OPPORTUNITIES. ONE OF THE GREATEST JOYS IS MAKING CONTACT WITH STATIONS AROUND THE WORLD. YOU CAN TALK TO PEOPLE FROM DIFFERENT COUNTRIES AND CULTURES. EACH CONTACT IS UNIQUE AND SPECIAL. SOME OPERATORS ENJOY CONTESTS WHERE THEY TRY TO MAKE AS MANY CONTACTS AS POSSIBLE. OTHERS PREFER RELAXED CONVERSATIONS ABOUT HOBBIES AND DAILY LIFE. DX CONTACTS WITH DISTANT STATIONS ARE PARTICULARLY THRILLING. THE THRILL OF HEARING A WEAK SIGNAL FROM FAR AWAY IS UNFORGETTABLE. OPERATING PORTABLE FROM MOUNTAINTOPS OR PARKS IS ALSO FUN. YOU CAN COMBINE YOUR LOVE OF RADIO WITH OUTDOOR ACTIVITIES. AMATEUR RADIO IS MORE THAN A HOBBY IT IS A LIFELONG PASSION."}];class M{static generateCallsign(){const t=["JA","JE","JF","JH","JI","JJ","JK","JL","JM","JN","JO","JP","JQ","JR"],e=t[Math.floor(Math.random()*t.length)],s=Math.floor(Math.random()*10),i=String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26));return`${e}${s}${i}`}static randomChoice(t){return t[Math.floor(Math.random()*t.length)]}static generateRandomQSO(){const t=this.generateCallsign(),e=this.generateCallsign(),s=this.randomChoice(x),i=this.randomChoice(x),n=this.randomChoice(q),a=this.randomChoice(q),r=this.randomChoice(N),l=this.randomChoice(N),o=this.randomChoice(D),c=this.randomChoice(D),p=this.randomChoice(["GM","GA","GE","GN"]),h=`CQ CQ CQ DE ${t} ${t} PSE K BT ${t} DE ${e} ${e} K BT R ${e} DE ${t} ${p} OM TNX FER UR CALL BT UR RST IS ${l} ${l} BT MI QTH IS ${s} ${s} ES MI NAME IS ${n} ${n} HW ? AR ${t} DE ${t} KN BT R ${t} DE ${e} ${p} DR ${n} OM TKS FER FB RPT ${l} FM ${s} BT UR RST ALSO ${r} ${r} VY FB MI QTH IS ${i} ${i} BT NAME IS ${a} ${a} HW? ${t} DE ${e} KN BT R FB DE ${t} DR ${a} OM BT MI RIG IS ${o} PWR 100W BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR ${e} DE ${t} KN BT R ${t} DE ${e} OK ${n} OM BT UR RIG ${o} VY FB BT MI RIG IS ${c} BT QSL VIA JARL OK SURE BT TNX FB QSO ES 73 AR ${t} DE ${e} VA BT OK ${a} SOLID CPI BT TKS FB QSO ES BEST 73 AR ${e} DE ${t} VA TU E E`;return{id:`qso-random-${Date.now()}`,category:"qso",title:"ランダムQSO",content:h}}static getBuiltinTemplates(t){if(!t)return[...L,...w,...C,...B];switch(t){case"qso":return[...L];case"text100":return[...w];case"text200":return[...C];case"text300":return[...B];default:return[]}}static getTemplateById(t){return this.getBuiltinTemplates().find(e=>e.id===t)}static calculateAccuracy(t,e){if(!e)return 0;//! 空白を除去して大文字化して比較。
const s=t.replace(/\s/g,"").toUpperCase(),i=e.replace(/\s/g,"").toUpperCase(),n=Math.max(s.length,i.length);if(n===0)return 0;let a=0;for(let r=0;r<n;r++)s[r]===i[r]&&a++;return Math.round(a/n*100)}static isPassed(t,e=90){return t>=e}static getTemplateCounts(){return{qso:L.length,text100:w.length,text200:C.length,text300:B.length}}static getTotalTemplateCount(){return L.length+w.length+C.length+B.length}}class E{static shuffleCards(t){const e=[...t];for(let s=e.length-1;s>0;s--){const i=Math.floor(Math.random()*(s+1));[e[s],e[i]]=[e[i],e[s]]}return e}static generateExamQuestions(t,e,s){if(t.length===0)return[];const i=Math.min(s,t.length);return this.shuffleCards(t).slice(0,i).map(n=>this.createQuestion(n,t,e))}static createQuestion(t,e,s){//! 正解以外のエントリーから3つ選ぶ。
const i=e.filter(r=>r.abbreviation!==t.abbreviation).sort(()=>Math.random()-.5).slice(0,3);let n,a;switch(s){case"abbr-to-meaning":case"morse-to-meaning":n=`${t.english} / ${t.japanese}`,a=[n,...i.map(r=>`${r.english} / ${r.japanese}`)];break;case"meaning-to-abbr":case"morse-to-abbr":n=t.abbreviation,a=[n,...i.map(r=>r.abbreviation)];break}//! 選択肢をシャッフル。
return a=a.sort(()=>Math.random()-.5),{type:s,entry:t,choices:a,correctAnswer:n}}static checkAnswer(t,e){return e===t.correctAnswer}static calculateScore(t){const e=t.length,s=t.filter(n=>n.isCorrect).length,i=e>0?Math.round(s/e*100):0;return{correct:s,total:e,percentage:i}}static isPassed(t,e=80){return t>=e}static getWrongAnswers(t){return t.filter(e=>!e.isCorrect).map(e=>e.question.entry)}static getCorrectAnswers(t){return t.filter(e=>e.isCorrect).map(e=>e.question.entry)}static filterByTags(t,e){return e.size===0?t:t.filter(s=>{const i=s.tags.split(",").map(n=>n.trim());return Array.from(e).some(n=>i.includes(n))})}static filterByFrequencies(t,e){return e.size===0?t:t.filter(s=>e.has(s.frequency))}static filterByQuery(t,e){if(!e.trim())return t;const s=e.toLowerCase();return t.filter(i=>i.abbreviation.toLowerCase().includes(s)||i.english.toLowerCase().includes(s)||i.japanese.includes(e)||i.tags.toLowerCase().includes(s))}static getAllTags(t){const e=new Set;return t.forEach(s=>{s.tags.split(",").forEach(i=>{const n=i.trim();n&&e.add(n)})}),Array.from(e).sort()}static sortByAbbreviation(t,e=!0){const s=[...t];return s.sort((i,n)=>{const a=i.abbreviation.localeCompare(n.abbreviation);return e?a:-a}),s}static sortByFrequency(t,e=!1){const s=[...t];return s.sort((i,n)=>{const a=i.frequency-n.frequency;return e?a:-a}),s}static sortByEnglish(t,e=!0){const s=[...t];return s.sort((i,n)=>{const a=i.english.localeCompare(n.english);return e?a:-a}),s}static sortByJapanese(t,e=!0){const s=[...t];return s.sort((i,n)=>{const a=i.japanese.localeCompare(n.japanese,"ja");return e?a:-a}),s}static sortByTags(t,e=!0){const s=[...t];return s.sort((i,n)=>{const a=i.tags.localeCompare(n.tags);return e?a:-a}),s}}const G=class{static saveProgress(t){try{const e={known:Array.from(t.known),unknown:Array.from(t.unknown)};localStorage.setItem(`${this.STORAGE_PREFIX}progress`,JSON.stringify(e))}catch(e){console.error("進捗保存エラー:",e)}}static loadProgress(){try{const t=localStorage.getItem(`${this.STORAGE_PREFIX}progress`);if(t){const e=JSON.parse(t);return{known:new Set(e.known||[]),unknown:new Set(e.unknown||[])}}}catch(t){console.error("進捗読み込みエラー:",t)}return{known:new Set,unknown:new Set}}static clearProgress(){try{localStorage.removeItem(`${this.STORAGE_PREFIX}progress`)}catch(t){console.error("進捗クリアエラー:",t)}}static saveFilters(t){try{const e={selectedTags:Array.from(t.selectedTags),selectedFrequencies:Array.from(t.selectedFrequencies),searchQuery:t.searchQuery};localStorage.setItem(`${this.STORAGE_PREFIX}filters`,JSON.stringify(e))}catch(e){console.error("フィルター保存エラー:",e)}}static loadFilters(){try{const t=localStorage.getItem(`${this.STORAGE_PREFIX}filters`);if(t){const e=JSON.parse(t);return{selectedTags:new Set(e.selectedTags||[]),selectedFrequencies:new Set(e.selectedFrequencies||[5]),searchQuery:e.searchQuery||""}}}catch(t){console.error("フィルター読み込みエラー:",t)}return{selectedTags:new Set,selectedFrequencies:new Set([5]),searchQuery:""}}static saveViewState(t){try{localStorage.setItem(`${this.STORAGE_PREFIX}viewState`,JSON.stringify(t))}catch(e){console.error("ビュー状態保存エラー:",e)}}static loadViewState(){try{const t=localStorage.getItem(`${this.STORAGE_PREFIX}viewState`);if(t)return JSON.parse(t)}catch(t){console.error("ビュー状態読み込みエラー:",t)}return{viewMode:"browse",displayMode:"card",sortColumn:"abbreviation",sortDirection:"asc",learnQuestionType:"abbr-to-meaning",examQuestionType:"abbr-to-meaning"}}static saveViewMode(t){const e=this.loadViewState();e.viewMode=t,this.saveViewState(e)}static saveDisplayMode(t){const e=this.loadViewState();e.displayMode=t,this.saveViewState(e)}static saveLearnQuestionType(t){const e=this.loadViewState();e.learnQuestionType=t,this.saveViewState(e)}static saveExamQuestionType(t){const e=this.loadViewState();e.examQuestionType=t,this.saveViewState(e)}static saveSortState(t,e){const s=this.loadViewState();s.sortColumn=t,s.sortDirection=e,this.saveViewState(s)}};G.STORAGE_PREFIX="v10.flashcard.";let y=G;class z{constructor(){d(this,"trainer");d(this,"buffer");d(this,"timer");d(this,"audio");d(this,"isKeyPressed",!1);d(this,"keyPressHandler",null);d(this,"keyReleaseHandler",null);d(this,"updateIntervalId",null);d(this,"currentWPM",20);d(this,"keyCode","Space");//! 設定を読み込む。
const t=localStorage.getItem("verticalKeyWPM");t&&(this.currentWPM=parseInt(t,10));const e=localStorage.getItem("verticalKeyCode");e&&(this.keyCode=e);//! コアコンポーネントを初期化。
this.buffer=new U,this.timer=new W,this.audio=new T({frequency:700,volume:.5,wpm:this.currentWPM});//! タイミング計算。
const s=k.calculate(this.currentWPM);//! トレーナーを初期化（コールバックで音声制御）。
this.trainer=new $(this.buffer,this.timer,s,{onKeyPress:()=>{//! キー押下時に音を鳴らす。
this.audio.startContinuousTone()},onKeyRelease:()=>{//! キー解放時に音を止める。
this.audio.stopContinuousTone()}})}formatKeyCode(t){return t.replace(/^Key/,"")}render(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
			<div class="settings-modal" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label for="volume-range">音量</label>
							<div class="setting-row">
								<input type="range" id="volume-range" min="0" max="100" value="${Math.round(this.audio.getVolume()*100)}">
								<input type="number" id="volume-input" min="0" max="100" value="${Math.round(this.audio.getVolume()*100)}">
								<span>%</span>
							</div>
						</div>
						<div class="setting-item">
							<label for="frequency-input">周波数 (Hz)</label>
							<input type="number" id="frequency-input" min="400" max="1200" value="${this.audio.getFrequency()}" step="50">
						</div>
						<div class="setting-item">
							<label for="wpm-input">WPM (速度: 5-40)</label>
							<input type="number" id="wpm-input" min="5" max="40" value="${this.currentWPM}">
						</div>
						<div class="setting-item">
							<label for="key-binding">キーバインド</label>
							<input type="text" id="key-binding" value="${this.formatKeyCode(this.keyCode)}" readonly placeholder="キーを押してください">
							<span class="key-hint">クリックしてキーを押す</span>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancel-btn" class="btn btn-secondary">キャンセル</button>
						<button id="ok-btn" class="btn btn-primary">OK</button>
					</div>
				</div>
			</div>

			<div class="container">
				<header class="header">
					<button class="back-btn">メニューに戻る</button>
					<h1>縦振り電鍵練習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="key-button-container">
					<button class="key-button" id="morse-key">
						KEY
						<span class="key-label">(クリック/タップで送信)</span>
					</button>
				</div>

				<div class="practice-container">
					<div class="display-area">
						<div class="display-section">
							<h3>モールス信号</h3>
							<div class="display-output morse-buffer" id="morse-buffer">（ここにモールス符号が表示されます）</div>
						</div>
						<div class="display-section">
							<h3>デコード結果</h3>
							<div class="display-output" id="decoded-text">（ここにデコードされた文字が表示されます）</div>
						</div>
					</div>

					<div class="action-area">
						<button class="btn btn-large btn-danger" id="clear-btn">クリア</button>
					</div>

					<div class="status-area">
						<div class="status-item">
							<span class="label">現在の速度</span>
							<span class="value" id="current-wpm">${this.currentWPM}</span>
						</div>
						<div class="status-item" id="key-status">
							<span class="label">キー状態</span>
							<span class="value">解放</span>
						</div>
						<div class="status-item">
							<span class="label">入力文字数</span>
							<span class="value" id="char-count">0</span>
						</div>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>スペースキーまたは画面のボタンを押している間、モールス信号が送信されます</li>
							<li>短く押すと「・」(dit)、長く押すと「ー」(dah)になります</li>
							<li>文字間は自動的に判定されます</li>
							<li>WPM（Words Per Minute）で速度を調整できます</li>
							<li>画面右上の⚙アイコンから音量・周波数・速度を調整できます</li>
							<li>音声が鳴らない場合は、一度ボタンをクリックしてください（ブラウザのオーディオポリシー）</li>
						</ul>
					</div>
				</div>
			</div>
		`;//! イベントリスナーを設定。
this.attachEventListeners();//! 定期更新を開始。
this.startUpdate()}attachEventListeners(){//! 戻るボタン。
const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const e=document.getElementById("settings-btn");e==null||e.addEventListener("click",()=>{this.openSettingsModal()});//! クリアボタン。
const s=document.getElementById("clear-btn");s==null||s.addEventListener("click",()=>{this.trainer.clear(),this.updateDisplay()});//! キーボードイベント（設定されたキー）。
this.keyPressHandler=l=>{l.code===this.keyCode&&!l.repeat&&(l.preventDefault(),this.isKeyPressed||this.handleKeyDown())},this.keyReleaseHandler=l=>{l.code===this.keyCode&&(l.preventDefault(),this.isKeyPressed&&this.handleKeyUp())},window.addEventListener("keydown",this.keyPressHandler),window.addEventListener("keyup",this.keyReleaseHandler);//! ボタンイベント（マウス/タッチ）。
const i=document.getElementById("morse-key");if(i){//! マウスイベント。
i.addEventListener("mousedown",l=>{l.preventDefault(),this.isKeyPressed||this.handleKeyDown()}),i.addEventListener("mouseup",l=>{l.preventDefault(),this.isKeyPressed&&this.handleKeyUp()}),i.addEventListener("mouseleave",()=>{this.isKeyPressed&&this.handleKeyUp()});//! タッチイベント。
i.addEventListener("touchstart",l=>{l.preventDefault(),this.isKeyPressed||this.handleKeyDown()}),i.addEventListener("touchend",l=>{l.preventDefault(),this.isKeyPressed&&this.handleKeyUp()}),i.addEventListener("touchcancel",()=>{this.isKeyPressed&&this.handleKeyUp()})}//! モーダルのキャンセルボタン。
const n=document.getElementById("cancel-btn");n==null||n.addEventListener("click",()=>{this.closeSettingsModal(!1)});//! モーダルのOKボタン。
const a=document.getElementById("ok-btn");a==null||a.addEventListener("click",()=>{this.closeSettingsModal(!0)});//! モーダル背景クリックで閉じる。
const r=document.getElementById("settings-modal");r==null||r.addEventListener("click",l=>{l.target===r&&this.closeSettingsModal(!1)})}handleKeyDown(){this.isKeyPressed=!0,this.trainer.keyPress(),this.updateKeyStatus(!0);//! ボタンの見た目を更新。
const t=document.getElementById("morse-key");t&&t.classList.add("pressed")}handleKeyUp(){this.isKeyPressed=!1,this.trainer.keyRelease(),this.updateKeyStatus(!1);//! ボタンの見た目を更新。
const t=document.getElementById("morse-key");t&&t.classList.remove("pressed")}startUpdate(){//! 100msごとに画面を更新。
this.updateIntervalId=window.setInterval(()=>{this.updateDisplay()},100)}updateDisplay(){const t=document.getElementById("morse-buffer"),e=document.getElementById("decoded-text"),s=document.getElementById("char-count");if(t){const i=this.trainer.getBuffer(),n=this.trainer.getSequence(),a=n?`${i} ${n}`:i;t.textContent=a||"（ここにモールス符号が表示されます）"}if(e){const i=this.trainer.getDecoded();e.textContent=i||"（ここにデコードされた文字が表示されます）"}if(s){const i=this.trainer.getDecoded();s.textContent=i.length.toString()}}updateKeyStatus(t){const e=document.getElementById("key-status");if(e){const s=e.querySelector(".value");s&&(s.textContent=t?"押下中":"解放"),t?e.classList.add("active"):e.classList.remove("active")}}openSettingsModal(){const t=document.getElementById("settings-modal");if(!t)return;//! モーダルを表示。
t.classList.add("active");//! 現在の設定値をinput要素に反映。
const e=document.getElementById("volume-range"),s=document.getElementById("volume-input"),i=document.getElementById("frequency-input"),n=document.getElementById("wpm-input"),a=Math.round(this.audio.getVolume()*100);e&&(e.value=a.toString()),s&&(s.value=a.toString()),i&&(i.value=this.audio.getFrequency().toString()),n&&(n.value=this.currentWPM.toString());//! 音量スライダーと数値入力の同期のみ（実際の音声設定は変更しない）。
const r=()=>{e&&s&&(s.value=e.value)},l=()=>{e&&s&&(e.value=s.value)};e==null||e.addEventListener("input",r),s==null||s.addEventListener("input",l);//! キーバインド設定。
const o=document.getElementById("key-binding");o&&(o.addEventListener("click",()=>{o.value="キーを押してください...",o.classList.add("waiting-key")}),o.addEventListener("keydown",c=>{c.preventDefault(),c.stopPropagation(),o.value=c.code,o.classList.remove("waiting-key")}))}closeSettingsModal(t){const e=document.getElementById("settings-modal");if(!e)return;//! モーダルを非表示。
if(e.classList.remove("active"),t){//! 設定を適用。
const s=document.getElementById("volume-input"),i=document.getElementById("frequency-input"),n=document.getElementById("wpm-input"),a=document.getElementById("key-binding");if(s){const r=parseInt(s.value,10)/100;this.audio.setVolume(r)}if(i){const r=parseInt(i.value,10);this.audio.setFrequency(r)}if(n){const r=parseInt(n.value,10);this.currentWPM=r,this.audio.setWPM(r);//! WPMをlocalStorageに保存。
localStorage.setItem("verticalKeyWPM",r.toString());//! タイミングを再計算してトレーナーを再初期化。
const l=k.calculate(r);this.trainer=new $(this.buffer,this.timer,l,{onKeyPress:()=>{this.audio.startContinuousTone()},onKeyRelease:()=>{this.audio.stopContinuousTone()}});//! 現在のWPM表示を更新。
const o=document.getElementById("current-wpm");o&&(o.textContent=r.toString())}if(a&&a.value){this.keyCode=a.value;//! キーバインドをlocalStorageに保存。
localStorage.setItem("verticalKeyCode",this.keyCode)}}//! キャンセル時は何もしない（設定を元に戻す必要もない）。
}destroy(){//! イベントリスナーを削除。
this.keyPressHandler&&(window.removeEventListener("keydown",this.keyPressHandler),this.keyPressHandler=null),this.keyReleaseHandler&&(window.removeEventListener("keyup",this.keyReleaseHandler),this.keyReleaseHandler=null);//! 定期更新を停止。
this.updateIntervalId!==null&&(clearInterval(this.updateIntervalId),this.updateIntervalId=null);//! 音声を停止。
this.audio.stopContinuousTone();//! トレーナーをクリア。
this.trainer.clear()}}class j{constructor(){d(this,"trainer");d(this,"buffer");d(this,"timer");d(this,"audio");d(this,"leftPressed",!1);d(this,"rightPressed",!1);d(this,"updateIntervalId",null);d(this,"currentWPM",20);d(this,"iambicMode","B");d(this,"paddleLayout","normal");d(this,"leftKeyCode","KeyJ");d(this,"rightKeyCode","KeyK");d(this,"keyPressHandler",null);d(this,"keyReleaseHandler",null);//! 設定を読み込む。
const t=localStorage.getItem("horizontalKeyWPM");t&&(this.currentWPM=parseInt(t,10));const e=localStorage.getItem("horizontalKeyIambicMode");(e==="A"||e==="B")&&(this.iambicMode=e);const s=localStorage.getItem("horizontalKeyPaddleLayout");(s==="normal"||s==="reversed")&&(this.paddleLayout=s);const i=localStorage.getItem("horizontalKeyLeftCode");i&&(this.leftKeyCode=i);const n=localStorage.getItem("horizontalKeyRightCode");n&&(this.rightKeyCode=n);//! コアコンポーネントを初期化。
this.buffer=new U,this.timer=new W,this.audio=new T({frequency:700,volume:.5,wpm:this.currentWPM});//! トレーナーを初期化。
this.initializeTrainer()}initializeTrainer(){const t=k.calculate(this.currentWPM);this.trainer=new J(this.buffer,this.timer,t,{onElementStart:(e,s)=>{//! 要素送信開始時に指定時間だけ音を鳴らす。
this.audio.scheduleTone(0,s)}},{iambicMode:this.iambicMode,paddleLayout:this.paddleLayout})}formatKeyCode(t){return t.replace(/^Key/,"")}render(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
			<div class="settings-modal" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label for="volume-range">音量</label>
							<div class="setting-row">
								<input type="range" id="volume-range" min="0" max="100" value="${Math.round(this.audio.getVolume()*100)}">
								<input type="number" id="volume-input" min="0" max="100" value="${Math.round(this.audio.getVolume()*100)}">
								<span>%</span>
							</div>
						</div>
						<div class="setting-item">
							<label for="frequency-input">周波数 (Hz)</label>
							<input type="number" id="frequency-input" min="400" max="1200" value="${this.audio.getFrequency()}" step="50">
						</div>
						<div class="setting-item">
							<label for="wpm-input">WPM (速度: 5-40)</label>
							<input type="number" id="wpm-input" min="5" max="40" value="${this.currentWPM}">
						</div>
						<div class="setting-item">
							<label for="iambic-mode-select">Iambicモード</label>
							<select id="iambic-mode-select">
								<option value="A" ${this.iambicMode==="A"?"selected":""}>Iambic A</option>
								<option value="B" ${this.iambicMode==="B"?"selected":""}>Iambic B</option>
							</select>
						</div>
						<div class="setting-item">
							<label for="paddle-layout-select">パドルレイアウト</label>
							<select id="paddle-layout-select">
								<option value="normal" ${this.paddleLayout==="normal"?"selected":""}>標準（左=dit / 右=dah）</option>
								<option value="reversed" ${this.paddleLayout==="reversed"?"selected":""}>反転（左=dah / 右=dit）</option>
							</select>
						</div>
						<div class="setting-item">
							<label for="left-key-binding">左パドルキー</label>
							<input type="text" id="left-key-binding" value="${this.formatKeyCode(this.leftKeyCode)}" readonly placeholder="キーを押してください">
							<span class="key-hint">クリックしてキーを押す</span>
						</div>
						<div class="setting-item">
							<label for="right-key-binding">右パドルキー</label>
							<input type="text" id="right-key-binding" value="${this.formatKeyCode(this.rightKeyCode)}" readonly placeholder="キーを押してください">
							<span class="key-hint">クリックしてキーを押す</span>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancel-btn" class="btn btn-secondary">キャンセル</button>
						<button id="ok-btn" class="btn btn-primary">OK</button>
					</div>
				</div>
			</div>

			<div class="container">
				<header class="header">
					<button class="back-btn">メニューに戻る</button>
					<h1>横振り電鍵練習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="paddle-container">
					<button class="paddle-button dit" id="left-paddle">
						DIT
						<span class="paddle-label">(短点)</span>
						<span class="paddle-key">J キー</span>
					</button>
					<button class="paddle-button dah" id="right-paddle">
						DAH
						<span class="paddle-label">(長点)</span>
						<span class="paddle-key">K キー</span>
					</button>
				</div>

				<div class="practice-container">
					<div class="display-area">
						<div class="display-section">
							<h3>モールス信号</h3>
							<div class="display-output morse-buffer" id="morse-buffer">（ここにモールス符号が表示されます）</div>
						</div>
						<div class="display-section">
							<h3>デコード結果</h3>
							<div class="display-output" id="decoded-text">（ここにデコードされた文字が表示されます）</div>
						</div>
					</div>

					<div class="action-area">
						<button class="btn btn-large btn-danger" id="clear-btn">クリア</button>
					</div>

					<div class="status-area">
						<div class="status-item">
							<span class="label">現在の速度</span>
							<span class="value" id="current-wpm">${this.currentWPM}</span>
						</div>
						<div class="status-item">
							<span class="label">Iambicモード</span>
							<span class="value" id="current-iambic-mode">${this.iambicMode}</span>
						</div>
						<div class="status-item">
							<span class="label">入力文字数</span>
							<span class="value" id="char-count">0</span>
						</div>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>左パドル（J）: 短点（・）/ 右パドル（K）: 長点（ー）</li>
							<li>両方同時押しで自動交互送信（Iambic）</li>
							<li>Iambic Bモード: スクイーズ後1要素追加送信</li>
							<li>画面右上の⚙アイコンから設定（WPM、Iambicモード、パドルレイアウト、音量・周波数）を変更できます</li>
						</ul>
					</div>
				</div>
			</div>
		`;//! イベントリスナーを設定。
this.attachEventListeners();//! 定期更新を開始。
this.startUpdate()}attachEventListeners(){//! 戻るボタン。
const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const e=document.getElementById("settings-btn");e==null||e.addEventListener("click",()=>{this.openSettingsModal()});//! クリアボタン。
const s=document.getElementById("clear-btn");s==null||s.addEventListener("click",()=>{this.trainer.clear(),this.updateDisplay()});//! キーボードイベント（設定されたキー）。
this.keyPressHandler=o=>{o.repeat||(o.code===this.leftKeyCode?(o.preventDefault(),this.handleLeftPaddlePress()):o.code===this.rightKeyCode&&(o.preventDefault(),this.handleRightPaddlePress()))},this.keyReleaseHandler=o=>{o.code===this.leftKeyCode?(o.preventDefault(),this.handleLeftPaddleRelease()):o.code===this.rightKeyCode&&(o.preventDefault(),this.handleRightPaddleRelease())},window.addEventListener("keydown",this.keyPressHandler),window.addEventListener("keyup",this.keyReleaseHandler);//! ボタンイベント（左パドル）。
const i=document.getElementById("left-paddle");i&&(i.addEventListener("mousedown",o=>{o.preventDefault(),this.handleLeftPaddlePress()}),i.addEventListener("mouseup",o=>{o.preventDefault(),this.handleLeftPaddleRelease()}),i.addEventListener("mouseleave",()=>{this.leftPressed&&this.handleLeftPaddleRelease()}),i.addEventListener("touchstart",o=>{o.preventDefault(),this.handleLeftPaddlePress()}),i.addEventListener("touchend",o=>{o.preventDefault(),this.handleLeftPaddleRelease()}),i.addEventListener("touchcancel",()=>{this.leftPressed&&this.handleLeftPaddleRelease()}));//! ボタンイベント（右パドル）。
const n=document.getElementById("right-paddle");n&&(n.addEventListener("mousedown",o=>{o.preventDefault(),this.handleRightPaddlePress()}),n.addEventListener("mouseup",o=>{o.preventDefault(),this.handleRightPaddleRelease()}),n.addEventListener("mouseleave",()=>{this.rightPressed&&this.handleRightPaddleRelease()}),n.addEventListener("touchstart",o=>{o.preventDefault(),this.handleRightPaddlePress()}),n.addEventListener("touchend",o=>{o.preventDefault(),this.handleRightPaddleRelease()}),n.addEventListener("touchcancel",()=>{this.rightPressed&&this.handleRightPaddleRelease()}));//! モーダルのキャンセルボタン。
const a=document.getElementById("cancel-btn");a==null||a.addEventListener("click",()=>{this.closeSettingsModal(!1)});//! モーダルのOKボタン。
const r=document.getElementById("ok-btn");r==null||r.addEventListener("click",()=>{this.closeSettingsModal(!0)});//! モーダル背景クリックで閉じる。
const l=document.getElementById("settings-modal");l==null||l.addEventListener("click",o=>{o.target===l&&this.closeSettingsModal(!1)})}handleLeftPaddlePress(){if(this.leftPressed)return;this.leftPressed=!0,this.trainer.leftPaddlePress();const t=document.getElementById("left-paddle");t&&t.classList.add("pressed")}handleLeftPaddleRelease(){if(!this.leftPressed)return;this.leftPressed=!1,this.trainer.leftPaddleRelease();const t=document.getElementById("left-paddle");t&&t.classList.remove("pressed")}handleRightPaddlePress(){if(this.rightPressed)return;this.rightPressed=!0,this.trainer.rightPaddlePress();const t=document.getElementById("right-paddle");t&&t.classList.add("pressed")}handleRightPaddleRelease(){if(!this.rightPressed)return;this.rightPressed=!1,this.trainer.rightPaddleRelease();const t=document.getElementById("right-paddle");t&&t.classList.remove("pressed")}updatePaddleLabels(){const t=document.getElementById("left-paddle"),e=document.getElementById("right-paddle");this.paddleLayout==="normal"?(t&&(t.className="paddle-button dit",t.innerHTML=`
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">J キー</span>
				`),e&&(e.className="paddle-button dah",e.innerHTML=`
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">K キー</span>
				`)):(t&&(t.className="paddle-button dah",t.innerHTML=`
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">J キー</span>
				`),e&&(e.className="paddle-button dit",e.innerHTML=`
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">K キー</span>
				`));//! イベントリスナーを再設定。
this.attachEventListeners()}startUpdate(){//! 100msごとに画面を更新。
this.updateIntervalId=window.setInterval(()=>{this.updateDisplay()},100)}updateDisplay(){const t=document.getElementById("morse-buffer"),e=document.getElementById("decoded-text"),s=document.getElementById("char-count");if(t){const i=this.trainer.getBuffer(),n=this.trainer.getSequence(),a=n?`${i} ${n}`:i;t.textContent=a||"（ここにモールス符号が表示されます）"}if(e){const i=this.trainer.getDecoded();e.textContent=i||"（ここにデコードされた文字が表示されます）"}if(s){const i=this.trainer.getDecoded();s.textContent=i.length.toString()}}openSettingsModal(){const t=document.getElementById("settings-modal");if(!t)return;//! モーダルを表示。
t.classList.add("active");//! 現在の設定値をinput要素に反映。
const e=document.getElementById("volume-range"),s=document.getElementById("volume-input"),i=document.getElementById("frequency-input"),n=document.getElementById("wpm-input"),a=document.getElementById("iambic-mode-select"),r=document.getElementById("paddle-layout-select"),l=Math.round(this.audio.getVolume()*100);e&&(e.value=l.toString()),s&&(s.value=l.toString()),i&&(i.value=this.audio.getFrequency().toString()),n&&(n.value=this.currentWPM.toString()),a&&(a.value=this.iambicMode),r&&(r.value=this.paddleLayout);//! 音量スライダーと数値入力の同期のみ（実際の音声設定は変更しない）。
const o=()=>{e&&s&&(s.value=e.value)},c=()=>{e&&s&&(e.value=s.value)};e==null||e.addEventListener("input",o),s==null||s.addEventListener("input",c);//! 左パドルキーバインド設定。
const p=document.getElementById("left-key-binding");p&&(p.addEventListener("click",()=>{p.value="キーを押してください...",p.classList.add("waiting-key")}),p.addEventListener("keydown",u=>{u.preventDefault(),u.stopPropagation(),p.value=u.code,p.classList.remove("waiting-key")}));//! 右パドルキーバインド設定。
const h=document.getElementById("right-key-binding");h&&(h.addEventListener("click",()=>{h.value="キーを押してください...",h.classList.add("waiting-key")}),h.addEventListener("keydown",u=>{u.preventDefault(),u.stopPropagation(),h.value=u.code,h.classList.remove("waiting-key")}))}closeSettingsModal(t){const e=document.getElementById("settings-modal");if(!e)return;//! モーダルを非表示。
if(e.classList.remove("active"),t){//! 設定を適用。
const s=document.getElementById("volume-input"),i=document.getElementById("frequency-input"),n=document.getElementById("wpm-input"),a=document.getElementById("iambic-mode-select"),r=document.getElementById("paddle-layout-select"),l=document.getElementById("left-key-binding"),o=document.getElementById("right-key-binding");if(s){const c=parseInt(s.value,10)/100;this.audio.setVolume(c)}if(i){const c=parseInt(i.value,10);this.audio.setFrequency(c)}if(n){const c=parseInt(n.value,10);this.currentWPM=c,this.audio.setWPM(c);//! WPMをlocalStorageに保存。
localStorage.setItem("horizontalKeyWPM",c.toString());//! 現在のWPM表示を更新。
const p=document.getElementById("current-wpm");p&&(p.textContent=c.toString())}if(a){this.iambicMode=a.value;//! IambicモードをlocalStorageに保存。
localStorage.setItem("horizontalKeyIambicMode",this.iambicMode);//! 現在のIambicモード表示を更新。
const c=document.getElementById("current-iambic-mode");c&&(c.textContent=this.iambicMode)}if(r){this.paddleLayout=r.value;//! パドルレイアウトをlocalStorageに保存。
localStorage.setItem("horizontalKeyPaddleLayout",this.paddleLayout),this.updatePaddleLabels()}if(l&&l.value){this.leftKeyCode=l.value;//! 左パドルキーバインドをlocalStorageに保存。
localStorage.setItem("horizontalKeyLeftCode",this.leftKeyCode)}if(o&&o.value){this.rightKeyCode=o.value;//! 右パドルキーバインドをlocalStorageに保存。
localStorage.setItem("horizontalKeyRightCode",this.rightKeyCode)}//! トレーナーを再初期化。
this.initializeTrainer()}//! キャンセル時は何もしない（設定を元に戻す必要もない）。
}destroy(){//! イベントリスナーを削除。
this.keyPressHandler&&(window.removeEventListener("keydown",this.keyPressHandler),this.keyPressHandler=null),this.keyReleaseHandler&&(window.removeEventListener("keyup",this.keyReleaseHandler),this.keyReleaseHandler=null);//! 定期更新を停止。
this.updateIntervalId!==null&&(clearInterval(this.updateIntervalId),this.updateIntervalId=null);//! トレーナーをクリア。
this.trainer.clear()}}async function X(m){//! TSVファイルを取得。
const t=await fetch(m);if(!t.ok)throw new Error(`Failed to load flashcard data: ${t.statusText}`);const e=await t.text();return Z(e)}function Z(m){//! 行に分割。
const t=m.split(`
`).filter(s=>s.trim());if(t.length===0)return[];//! 先頭行はヘッダーなのでスキップ。
return t.slice(1).map((s,i)=>{//! タブで分割。
var r,l;const n=s.split("	");//! 最低限6列（タグ、頻度、略語、英文、和訳、説明）必要。
return n.length<6?(console.warn(`Line ${i+2} has insufficient columns, skipping`),null):{tags:n[0].trim(),frequency:parseInt(n[1].trim(),10)||1,abbreviation:n[2].trim(),english:n[3].trim(),japanese:n[4].trim(),description:(r=n[5])==null?void 0:r.trim(),example:(l=n[6])==null?void 0:l.trim()}}).filter(s=>s!==null)}class _{constructor(){d(this,"allEntries",[]);d(this,"filteredEntries",[]);d(this,"currentState","loading");d(this,"selectedTags",new Set);d(this,"selectedFrequencies",new Set([5]));d(this,"searchQuery","");d(this,"displayMode","card");d(this,"sortColumn","abbreviation");d(this,"sortDirection","asc");d(this,"learnQuestionType","abbr-to-meaning");d(this,"learnCards",[]);d(this,"currentLearnIndex",0);d(this,"isFlipped",!1);d(this,"reviewMode",!1);d(this,"progress",{known:new Set,unknown:new Set});d(this,"questionType","abbr-to-meaning");d(this,"questionCount",10);d(this,"questions",[]);d(this,"currentQuestionIndex",0);d(this,"results",[]);d(this,"audio");d(this,"currentlyPlaying",null);this.audio=new T({frequency:700,volume:.5,wpm:20});//! ライブラリから状態を読み込む。
this.progress=y.loadProgress();const t=y.loadFilters();this.selectedTags=t.selectedTags,this.selectedFrequencies=t.selectedFrequencies,this.searchQuery=t.searchQuery;const e=y.loadViewState();this.displayMode=e.displayMode,this.sortColumn=e.sortColumn,this.sortDirection=e.sortDirection,this.learnQuestionType=e.learnQuestionType,this.questionType=e.examQuestionType}saveProgress(){y.saveProgress(this.progress)}clearProgress(){this.progress={known:new Set,unknown:new Set},y.clearProgress()}saveFilters(){y.saveFilters({selectedTags:this.selectedTags,selectedFrequencies:this.selectedFrequencies,searchQuery:this.searchQuery})}async render(){const t=document.getElementById("app");if(t)if(this.currentState==="loading"){//! ローディング画面を表示。
t.innerHTML=`
				<div class="container">
					<header class="header">
						<h1>CW略語・Q符号学習</h1>
						<button class="back-btn">メニューに戻る</button>
					</header>
					<div class="loading-container">
						<p>フラッシュカードデータを読み込み中...</p>
					</div>
				</div>
			`;const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! データをロード。
try{this.allEntries=await X("/flashcard.tsv"),this.updateFilteredEntries();//! データロード完了後、保存されていたviewModeを復元。
const s=y.loadViewState();this.currentState=s.viewMode,this.render()}catch(s){console.error("Failed to load flashcard data:",s),t.innerHTML=`
					<div class="container">
						<header class="header">
							<h1>CW略語・Q符号学習</h1>
							<button class="back-btn">メニューに戻る</button>
						</header>
						<div class="error-container">
							<p>データの読み込みに失敗しました。</p>
							<p>エラー: ${s}</p>
						</div>
					</div>
				`}}else this.currentState==="browse"?this.renderBrowseMode():this.currentState==="learn"?this.renderLearnMode():this.currentState==="exam"?this.renderExamMode():this.currentState==="exam-result"&&this.renderExamResultMode()}renderFilterSection(){return`
			<div class="filter-section">
				<h3>フィルター設定</h3>

				<div class="filter-group">
					<label>タグで絞り込み</label>
					<div class="tag-filter" id="tag-filter">
						${E.getAllTags(this.allEntries).map(e=>`
							<label class="tag-checkbox">
								<input type="checkbox" value="${e}" ${this.selectedTags.has(e)?"checked":""}>
								<span>${e}</span>
							</label>
						`).join("")}
					</div>
				</div>

				<div class="filter-group">
					<label>使用頻度で絞り込み（1=低頻度、5=高頻度）</label>
					<div class="frequency-filter" id="frequency-filter">
						${[5,4,3,2,1].map(e=>`
							<label class="frequency-checkbox">
								<input type="checkbox" value="${e}" ${this.selectedFrequencies.has(e)?"checked":""}>
								<span>★${e}</span>
							</label>
						`).join("")}
					</div>
				</div>

				<div class="filter-group">
					<label for="search-input">検索（略語・意味・タグ）</label>
					<input type="text" id="search-input" class="search-input" placeholder="例: QTH, location, Q符号" value="${this.searchQuery}">
				</div>

				<div class="filter-stats">
					<span>該当: <strong id="filtered-count">${this.filteredEntries.length}</strong> 件</span>
					<span>全体: <strong>${this.allEntries.length}</strong> 件</span>
				</div>
			</div>
		`}renderBrowseMode(){const t=document.getElementById("app");t&&(t.innerHTML=`
			<div class="container">
				<header class="header">
					<button class="back-btn">メニューに戻る</button>
					<h1>CW略語・Q符号学習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="tabs">
					<button class="tab-button active" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="flashcard-container">
					${this.renderFilterSection()}

					<div class="entries-section" id="entries-section">
						<!-- ここに一覧が表示される -->
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>タグ、使用頻度、検索で略語を絞り込めます</li>
							<li>略語カードをクリックするとモールス信号を再生できます</li>
							<li>カード表示とリスト表示を切り替えられます</li>
							<li>「学習モード」タブでフラッシュカード学習ができます</li>
							<li>「試験モード」タブで理解度テストができます</li>
							<li>画面右上の⚙アイコンから音量・周波数・速度を調整できます</li>
						</ul>
					</div>
				</div>
			</div>
		`,this.renderEntries(),this.attachBrowseModeListeners())}renderEntries(){const t=document.getElementById("entries-section");t&&(this.displayMode==="card"?this.renderCardView(t):this.renderListView(t))}renderCardView(t){t.innerHTML=`
			<div class="entries-header">
				<h3>略語一覧 (${this.filteredEntries.length}件)</h3>
				<button id="toggle-display-btn" class="toggle-display-btn">📋 リスト表示</button>
			</div>
			<div class="entries-grid">
				${this.filteredEntries.map(s=>`
					<div class="entry-card ${this.currentlyPlaying===s.abbreviation?"playing":""}" data-abbr="${s.abbreviation}">
						<div class="entry-header">
							<div class="entry-abbr">${this.formatAbbreviation(s.abbreviation)}</div>
							<div class="entry-frequency" title="使用頻度: ${s.frequency}/5">${"★".repeat(s.frequency)}${"☆".repeat(5-s.frequency)}</div>
						</div>
						<div class="entry-english">${s.english}</div>
						<div class="entry-japanese">${s.japanese}</div>
						${s.description?`<div class="entry-description">${s.description}</div>`:""}
						${s.example?`<div class="entry-example">例: ${s.example}</div>`:""}
						<div class="entry-tags">${s.tags}</div>
					</div>
				`).join("")}
			</div>
		`;//! カードクリックでモールス再生。
t.querySelectorAll(".entry-card").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-abbr");i&&this.playMorse(i)})});//! 表示モード切り替えボタン。
const e=document.getElementById("toggle-display-btn");e&&e.addEventListener("click",()=>{this.displayMode="list",y.saveDisplayMode(this.displayMode),this.renderEntries()})}renderListView(t){t.innerHTML=`
			<div class="entries-header">
				<h3>略語一覧 (${this.filteredEntries.length}件)</h3>
				<button id="toggle-display-btn" class="toggle-display-btn">🃏 カード表示</button>
			</div>
			<div class="list-table-container">
				<table class="list-table">
					<thead>
						<tr>
							<th class="sortable" data-column="abbreviation">略語${this.getSortIndicator("abbreviation")}</th>
							<th class="sortable" data-column="english">英文${this.getSortIndicator("english")}</th>
							<th class="sortable" data-column="japanese">和訳${this.getSortIndicator("japanese")}</th>
							<th class="sortable" data-column="frequency">頻度${this.getSortIndicator("frequency")}</th>
							<th class="sortable" data-column="tags">タグ${this.getSortIndicator("tags")}</th>
							<th>説明</th>
							<th>具体例</th>
						</tr>
					</thead>
					<tbody>
						${this.filteredEntries.map(n=>`
							<tr>
								<td class="list-abbr">
									<button class="abbr-play-btn ${this.currentlyPlaying===n.abbreviation?"playing":""}" data-abbr="${n.abbreviation}">
										${this.formatAbbreviation(n.abbreviation)}
									</button>
								</td>
								<td>${n.english}</td>
								<td>${n.japanese}</td>
								<td title="使用頻度: ${n.frequency}/5">${"★".repeat(n.frequency)}${"☆".repeat(5-n.frequency)}</td>
								<td>${n.tags}</td>
								<td>${n.description||""}</td>
								<td>${n.example||""}</td>
							</tr>
						`).join("")}
					</tbody>
				</table>
			</div>
		`;//! ソートヘッダーのイベントリスナー。
t.querySelectorAll("th.sortable").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-column");a&&this.toggleSort(a)})});//! 略語再生ボタンのイベントリスナー。
t.querySelectorAll(".abbr-play-btn").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-abbr");a&&this.playMorse(a)})});//! 表示モード切り替えボタン。
const i=document.getElementById("toggle-display-btn");i&&i.addEventListener("click",()=>{this.displayMode="card",y.saveDisplayMode(this.displayMode),this.renderEntries()})}renderLearnMode(){if(this.learnCards.length===0){//! セットアップ画面を表示。
this.renderLearnSetup()}else{//! 学習カードを表示。
this.renderLearnCard()}}renderLearnSetup(){const t=document.getElementById("app");if(!t)return;//! カード枚数を計算。
let e=this.filteredEntries.length;this.reviewMode&&(e=this.filteredEntries.filter(s=>this.progress.unknown.has(s.abbreviation)).length),t.innerHTML=`
			<div class="container">
				<header class="header">
					<button class="back-btn">メニューに戻る</button>
					<h1>CW略語・Q符号学習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button active" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="flashcard-container">
					${this.renderFilterSection()}

					<div class="learn-setup-section">
						<h3>学習設定</h3>

						<div class="filter-group">
							<label>モード</label>
							<div class="mode-buttons">
								<button class="mode-btn ${this.reviewMode?"active":""}" id="review-mode-btn">
									復習モード（わからないカードのみ: ${this.progress.unknown.size}件）
								</button>
							</div>
						</div>

						<div class="filter-group">
							<label>出題形式</label>
							<div class="question-type-buttons">
								<button class="question-type-btn ${this.learnQuestionType==="abbr-to-meaning"?"active":""}" data-type="abbr-to-meaning">略語→意味（基本）</button>
								<button class="question-type-btn ${this.learnQuestionType==="meaning-to-abbr"?"active":""}" data-type="meaning-to-abbr">意味→略語（応用）</button>
								<button class="question-type-btn ${this.learnQuestionType==="morse-to-abbr"?"active":""}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
								<button class="question-type-btn ${this.learnQuestionType==="morse-to-meaning"?"active":""}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
							</div>
						</div>

						<div class="filter-stats">
							<span>学習可能: <strong>${e}</strong> 枚</span>
						</div>

						<div class="action-area">
							<button class="btn btn-large btn-primary" id="start-learn-btn" ${e===0?"disabled":""}>学習開始</button>
							<button class="btn btn-large btn-secondary" id="clear-progress-btn">進捗をリセット</button>
						</div>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>フィルターで学習する略語を絞り込みます</li>
							<li>出題形式を選択します（略語→意味、意味→略語、モールス音からの解読）</li>
							<li>カードをクリックで裏返し、「わかる」「わからない」で進捗を記録</li>
							<li>復習モードで「わからない」カードのみを学習できます</li>
							<li>学習進捗はブラウザに自動保存されます</li>
						</ul>
					</div>
				</div>
			</div>
		`,this.attachCommonListeners(),this.attachLearnSetupListeners()}attachLearnSetupListeners(){//! タグフィルター。
const t=document.getElementById("tag-filter");t==null||t.addEventListener("change",l=>{const o=l.target;o.type==="checkbox"&&(o.checked?this.selectedTags.add(o.value):this.selectedTags.delete(o.value),this.updateFilteredEntries(),this.renderLearnSetup())});//! 使用頻度フィルター。
const e=document.getElementById("frequency-filter");e==null||e.addEventListener("change",l=>{const o=l.target;if(o.type==="checkbox"){const c=parseInt(o.value,10);o.checked?this.selectedFrequencies.add(c):this.selectedFrequencies.delete(c),this.updateFilteredEntries(),this.renderLearnSetup()}});//! 検索。
const s=document.getElementById("learn-search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.updateFilteredEntries(),this.renderLearnSetup()});//! 復習モードボタン。
const i=document.getElementById("review-mode-btn");i==null||i.addEventListener("click",()=>{this.reviewMode=!this.reviewMode,this.renderLearnSetup()});//! 出題形式ボタン。
document.querySelectorAll(".question-type-btn").forEach(l=>{l.addEventListener("click",()=>{const o=l.getAttribute("data-type");o&&(this.learnQuestionType=o,y.saveLearnQuestionType(this.learnQuestionType),this.renderLearnSetup())})});//! 学習開始ボタン。
const a=document.getElementById("start-learn-btn");a==null||a.addEventListener("click",()=>{this.startLearn()});//! 進捗リセットボタン。
const r=document.getElementById("clear-progress-btn");r==null||r.addEventListener("click",()=>{confirm("学習進捗をリセットしますか？")&&(this.clearProgress(),this.renderLearnSetup())})}startLearn(){//! フィルタリング済みのエントリーから学習カードを作成。
let t=[...this.filteredEntries];if(this.reviewMode){//! 復習モード: わからないカードのみ。
t=t.filter(e=>this.progress.unknown.has(e.abbreviation))}if(t.length===0){alert("学習可能なカードがありません。");return}//! シャッフル。
t=t.sort(()=>Math.random()-.5),this.learnCards=t,this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnCard()}renderLearnCard(){const t=document.getElementById("app");if(!t)return;const e=this.learnCards[this.currentLearnIndex],s=this.currentLearnIndex+1,i=this.learnCards.length;//! 問題と正解のコンテンツを生成。
let n="",a="";switch(this.learnQuestionType){case"abbr-to-meaning":n=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`;break;case"meaning-to-abbr":n=`
					<div class="card-label">意味</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
				`;break;case"morse-to-abbr":n=`
					<div class="card-label">モールス音を聞いて略語を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
				`;break;case"morse-to-meaning":n=`
					<div class="card-label">モールス音を聞いて意味を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`;break}//! 判定ボタンのHTML。
const r=this.progress.known.has(e.abbreviation),o=`
			<div class="judgment-controls">
				<button id="mark-unknown-btn" class="judgment-button unknown ${this.progress.unknown.has(e.abbreviation)?"active":""}">
					× わからない
				</button>
				<button id="mark-known-btn" class="judgment-button known ${r?"active":""}">
					○ わかる
				</button>
			</div>
		`;t.innerHTML=`
			<div class="container learning-view">
				<div class="learning-header">
					<button id="back-to-setup-btn" class="back-btn">← 設定に戻る</button>
					<div class="progress-indicator">${s} / ${i}</div>
				</div>

				<div class="card-container">
					<div class="flashcard ${this.isFlipped?"flipped":""}" id="flashcard">
						<div class="card-front">
							${n}
						</div>
						<div class="card-back">
							${a}
							${e.description?`<div class="card-description">${e.description}</div>`:""}
							${e.example?`<div class="card-example">例: ${e.example}</div>`:""}
							<div class="card-tags">${e.tags} / ${"★".repeat(e.frequency)}</div>
						</div>
					</div>
				</div>

				<div class="card-controls">
					<button id="flip-card-btn" class="control-button">
						${this.isFlipped?"問題に戻る":"正解を確認する"} (Space)
					</button>
				</div>

				${this.isFlipped?o:""}

				<div class="navigation-controls">
					<button id="prev-card-btn" class="nav-button" ${this.currentLearnIndex===0?"disabled":""}>
						← 前のカード
					</button>
					<button id="next-card-btn" class="nav-button" ${this.currentLearnIndex>=this.learnCards.length-1?"disabled":""}>
						次のカード →
					</button>
				</div>
			</div>
		`,this.attachLearnCardListeners()}attachLearnCardListeners(){//! 設定に戻るボタン。
const t=document.getElementById("back-to-setup-btn");t==null||t.addEventListener("click",()=>{this.learnCards=[],this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnSetup()});//! フリップボタン。
const e=document.getElementById("flip-card-btn");e==null||e.addEventListener("click",()=>{this.isFlipped=!this.isFlipped,this.renderLearnCard()});//! スペースキーでフリップ。
const s=o=>{o.code==="Space"&&o.target===document.body&&(o.preventDefault(),this.isFlipped=!this.isFlipped,this.renderLearnCard())};document.addEventListener("keydown",s);//! モールス再生ボタン。
const i=document.getElementById("play-morse-btn");i&&i.addEventListener("click",()=>{const o=this.learnCards[this.currentLearnIndex];this.playMorse(o.abbreviation)});//! 判定ボタン（わからない）。
const n=document.getElementById("mark-unknown-btn");n==null||n.addEventListener("click",()=>{const o=this.learnCards[this.currentLearnIndex];this.progress.unknown.add(o.abbreviation),this.progress.known.delete(o.abbreviation),this.saveProgress(),this.moveToNextCard()});//! 判定ボタン（わかる）。
const a=document.getElementById("mark-known-btn");a==null||a.addEventListener("click",()=>{const o=this.learnCards[this.currentLearnIndex];this.progress.known.add(o.abbreviation),this.progress.unknown.delete(o.abbreviation),this.saveProgress(),this.moveToNextCard()});//! 前のカードボタン。
const r=document.getElementById("prev-card-btn");r==null||r.addEventListener("click",()=>{this.currentLearnIndex>0&&(this.currentLearnIndex--,this.isFlipped=!1,this.renderLearnCard())});//! 次のカードボタン。
const l=document.getElementById("next-card-btn");l==null||l.addEventListener("click",()=>{this.currentLearnIndex<this.learnCards.length-1&&(this.currentLearnIndex++,this.isFlipped=!1,this.renderLearnCard())})}moveToNextCard(){if(this.currentLearnIndex<this.learnCards.length-1){//! 次のカードがあれば移動。
this.currentLearnIndex++,this.isFlipped=!1,this.renderLearnCard()}else{//! 最後のカードの場合は学習完了。
alert("学習完了しました！"),this.learnCards=[],this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnSetup()}}renderExamMode(){document.getElementById("app")&&(this.questions.length===0?this.renderExamSetup():this.renderExamQuestion())}renderExamSetup(){const t=document.getElementById("app");t&&(t.innerHTML=`
			<div class="container">
				<header class="header">
					<button class="back-btn">メニューに戻る</button>
					<h1>CW略語・Q符号学習</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button active" data-tab="exam">試験モード</button>
				</div>

				<div class="flashcard-container">
					${this.renderFilterSection()}

					<div class="exam-setup-section">
						<h3>出題形式</h3>
						<div class="question-type-buttons">
							<button class="question-type-btn ${this.questionType==="abbr-to-meaning"?"active":""}" data-type="abbr-to-meaning">略語→意味（基礎）</button>
							<button class="question-type-btn ${this.questionType==="meaning-to-abbr"?"active":""}" data-type="meaning-to-abbr">意味→略語（応用）</button>
							<button class="question-type-btn ${this.questionType==="morse-to-abbr"?"active":""}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
							<button class="question-type-btn ${this.questionType==="morse-to-meaning"?"active":""}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
						</div>

						<h3>問題数</h3>
						<div class="question-count-buttons">
							<button class="question-count-btn ${this.questionCount===5?"active":""}" data-count="5">5問</button>
							<button class="question-count-btn ${this.questionCount===10?"active":""}" data-count="10">10問</button>
							<button class="question-count-btn ${this.questionCount===20?"active":""}" data-count="20">20問</button>
							<button class="question-count-btn ${this.questionCount===50?"active":""}" data-count="50">50問</button>
							<button class="question-count-btn ${this.questionCount==="all"?"active":""}" data-count="all">全問</button>
						</div>

						<div class="action-area">
							<button class="btn btn-large btn-primary" id="start-exam-btn">試験開始</button>
						</div>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>フィルターで出題範囲を絞り込みます</li>
							<li>出題形式を選択します（略語→意味、意味→略語、モールス音から）</li>
							<li>問題数を選択します（5問〜全問）</li>
							<li>4つの選択肢から正解を選びます</li>
							<li>80%以上で合格です</li>
						</ul>
					</div>
				</div>
			</div>
		`,this.attachExamSetupListeners())}renderExamQuestion(){const t=document.getElementById("app");if(!t)return;const e=this.questions[this.currentQuestionIndex],s=this.currentQuestionIndex+1,i=this.questions.length;let n="";switch(e.type){case"abbr-to-meaning":n=`次の略語の意味は？<br><strong class="question-text">${e.entry.abbreviation}</strong>`;break;case"meaning-to-abbr":n=`次の意味を表す略語は？<br><strong class="question-text">${e.entry.english} / ${e.entry.japanese}</strong>`;break;case"morse-to-abbr":n='モールス音を聞いて、対応する略語は？<br><button id="replay-morse-btn" class="btn btn-secondary">🔊 もう一度再生</button>';break;case"morse-to-meaning":n='モールス音を聞いて、対応する意味は？<br><button id="replay-morse-btn" class="btn btn-secondary">🔊 もう一度再生</button>';break}t.innerHTML=`
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 試験中</h1>
					<button class="back-btn">中断</button>
				</header>

				<div class="exam-container">
					<div class="exam-progress">
						<span>問題 <strong>${s}</strong> / ${i}</span>
					</div>

					<div class="question-area">
						<p class="question">${n}</p>
					</div>

					<div class="choices-area">
						${e.choices.map((a,r)=>`
							<button class="choice-btn" data-choice="${a}">
								${r+1}. ${a}
							</button>
						`).join("")}
					</div>
				</div>
			</div>
		`,this.attachExamQuestionListeners();//! モールス音が必要な場合は自動再生。
(e.type==="morse-to-abbr"||e.type==="morse-to-meaning")&&setTimeout(()=>this.playMorse(e.entry.abbreviation),500)}renderExamResultMode(){const t=document.getElementById("app");if(!t)return;const e=E.calculateScore(this.results),s=E.isPassed(e.percentage),i=E.getWrongAnswers(this.results);t.innerHTML=`
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 結果</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="result-container">
					<div class="score-area ${s?"passed":"failed"}">
						<h2>${s?"合格！":"不合格"}</h2>
						<div class="score-display">
							<span class="score-percentage">${e.percentage}%</span>
							<span class="score-detail">${e.correct} / ${e.total} 問正解</span>
						</div>
					</div>

					${i.length>0?`
						<div class="wrong-answers-section">
							<h3>間違えた問題（${i.length}件）</h3>
							<div class="wrong-answers-list">
								${this.results.filter(n=>!n.isCorrect).map(n=>`
									<div class="wrong-answer-item">
										<div class="wrong-answer-question">
											<strong>${n.question.entry.abbreviation}</strong>
											<span>${n.question.entry.english} / ${n.question.entry.japanese}</span>
										</div>
										<div class="wrong-answer-detail">
											<span class="wrong-label">あなたの回答:</span>
											<span class="wrong-user-answer">${n.userAnswer}</span>
											<span class="correct-label">正解:</span>
											<span class="correct-answer">${n.question.correctAnswer}</span>
										</div>
										${n.question.entry.description?`
											<div class="wrong-answer-description">
												${n.question.entry.description}
											</div>
										`:""}
									</div>
								`).join("")}
							</div>
						</div>
					`:`
						<div class="perfect-score">
							<p>すべて正解しました！</p>
						</div>
					`}

					<div class="action-area">
						<button class="btn btn-primary btn-large" id="retry-btn">もう一度</button>
						<button class="btn btn-secondary btn-large" id="back-to-setup-btn">設定に戻る</button>
					</div>
				</div>
			</div>
		`,this.attachResultListeners()}attachBrowseModeListeners(){this.attachCommonListeners();//! タグフィルター。
const t=document.getElementById("tag-filter");t==null||t.addEventListener("change",i=>{const n=i.target;n.type==="checkbox"&&(n.checked?this.selectedTags.add(n.value):this.selectedTags.delete(n.value),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries())});//! 使用頻度フィルター。
const e=document.getElementById("frequency-filter");e==null||e.addEventListener("change",i=>{const n=i.target;if(n.type==="checkbox"){const a=parseInt(n.value,10);n.checked?this.selectedFrequencies.add(a):this.selectedFrequencies.delete(a),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries()}});//! 検索。
const s=document.getElementById("search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries()})}attachExamSetupListeners(){this.attachCommonListeners();//! タグフィルター。
const t=document.getElementById("tag-filter");t==null||t.addEventListener("change",r=>{const l=r.target;l.type==="checkbox"&&(l.checked?this.selectedTags.add(l.value):this.selectedTags.delete(l.value),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount())});//! 使用頻度フィルター。
const e=document.getElementById("frequency-filter");e==null||e.addEventListener("change",r=>{const l=r.target;if(l.type==="checkbox"){const o=parseInt(l.value,10);l.checked?this.selectedFrequencies.add(o):this.selectedFrequencies.delete(o),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount()}});//! 検索。
const s=document.getElementById("search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount()});//! 出題形式ボタン。
document.querySelectorAll(".question-type-btn").forEach(r=>{r.addEventListener("click",()=>{const l=r.getAttribute("data-type");l&&(this.questionType=l,y.saveExamQuestionType(this.questionType),this.renderExamSetup())})});//! 問題数ボタン。
document.querySelectorAll(".question-count-btn").forEach(r=>{r.addEventListener("click",()=>{const l=r.getAttribute("data-count");l&&(this.questionCount=l==="all"?"all":parseInt(l,10),this.renderExamSetup())})});//! 試験開始ボタン。
const a=document.getElementById("start-exam-btn");a==null||a.addEventListener("click",()=>{this.startExam()})}attachExamQuestionListeners(){//! 中断ボタン。
const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{confirm("試験を中断してメニューに戻りますか？")&&(window.location.hash="#menu")});//! モールス再生ボタン。
const e=document.getElementById("replay-morse-btn");if(e){const i=this.questions[this.currentQuestionIndex];e.addEventListener("click",()=>{this.playMorse(i.entry.abbreviation)})}//! 選択肢ボタン。
document.querySelectorAll(".choice-btn").forEach(i=>{i.addEventListener("click",n=>{const r=n.currentTarget.dataset.choice||"";this.handleAnswer(r)})})}attachResultListeners(){//! 戻るボタン。
const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! もう一度ボタン。
const e=document.getElementById("retry-btn");e==null||e.addEventListener("click",()=>{this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",this.render()});//! 設定に戻るボタン。
const s=document.getElementById("back-to-setup-btn");s==null||s.addEventListener("click",()=>{this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",this.render()})}attachCommonListeners(){//! 戻るボタン。
const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const e=document.getElementById("settings-btn");e==null||e.addEventListener("click",()=>{this.openSettingsModal()});//! タブ切り替え。
document.querySelectorAll(".tab-button").forEach(i=>{i.addEventListener("click",()=>{const n=i.getAttribute("data-tab");n==="browse"?(this.currentState="browse",y.saveViewMode("browse"),this.render()):n==="learn"?(this.currentState="learn",y.saveViewMode("learn"),this.render()):n==="exam"&&(this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",y.saveViewMode("exam"),this.render())})})}updateFilteredCount(){const t=document.getElementById("filtered-count");t&&(t.textContent=this.filteredEntries.length.toString());//! 問題数の最大値も更新（試験モードの場合）。
const e=document.getElementById("question-count");e&&(e.max=this.filteredEntries.length.toString(),parseInt(e.value,10)>this.filteredEntries.length&&(e.value=this.filteredEntries.length.toString(),this.questionCount=this.filteredEntries.length))}updateFilteredEntries(){let t=this.allEntries;//! タグでフィルタリング。
t=E.filterByTags(t,this.selectedTags);//! 使用頻度でフィルタリング。
t=E.filterByFrequencies(t,this.selectedFrequencies);//! 検索クエリでフィルタリング。
t=E.filterByQuery(t,this.searchQuery);//! ソート適用。
this.filteredEntries=this.sortEntries(t)}sortEntries(t){const e=this.sortDirection==="asc";switch(this.sortColumn){case"abbreviation":return E.sortByAbbreviation(t,e);case"english":return E.sortByEnglish(t,e);case"japanese":return E.sortByJapanese(t,e);case"frequency":return E.sortByFrequency(t,e);case"tags":return E.sortByTags(t,e);default:return t}}toggleSort(t){if(this.sortColumn===t){//! 同じ列なら方向を反転。
this.sortDirection=this.sortDirection==="asc"?"desc":"asc"}else{//! 異なる列なら昇順で開始。
this.sortColumn=t,this.sortDirection="asc"}//! ソート状態を保存。
y.saveSortState(this.sortColumn,this.sortDirection),this.updateFilteredEntries(),this.renderEntries()}getSortIndicator(t){return this.sortColumn!==t?"":this.sortDirection==="asc"?" ▲":" ▼"}formatAbbreviation(t){const e=t.match(/^\[([A-Z]+)\]$/);return e?`<span class="prosign">${e[1]}</span>`:t}async playMorse(t){try{//! 既に再生中の場合は停止。
if(this.currentlyPlaying===t){this.audio.stopContinuousTone(),this.currentlyPlaying=null,this.renderEntries();return}//! 別のものが再生中なら停止。
this.currentlyPlaying&&this.audio.stopContinuousTone(),this.currentlyPlaying=t,this.renderEntries();//! モールス符号に変換。
const e=I.textToMorse(t);if(e){//! シンプルな再生実装（scheduleToneを使用）。
for(const s of e)s==="."?(this.audio.scheduleTone(0,60),await new Promise(i=>setTimeout(i,120))):s==="-"?(this.audio.scheduleTone(0,180),await new Promise(i=>setTimeout(i,240))):s===" "&&await new Promise(i=>setTimeout(i,60))}this.currentlyPlaying=null,this.renderEntries()}catch(e){console.error("モールス再生エラー:",e),this.currentlyPlaying=null,this.renderEntries()}}startExam(){if(this.filteredEntries.length===0){alert("該当するエントリーがありません。フィルターを調整してください。");return}const t=this.questionCount==="all"?this.filteredEntries.length:this.questionCount,e=Math.min(t,this.filteredEntries.length);if(e===0){alert("問題数を1以上に設定してください。");return}//! 問題を生成。
this.questions=E.generateExamQuestions(this.filteredEntries,this.questionType,e),this.currentQuestionIndex=0,this.results=[],this.render()}handleAnswer(t){const e=this.questions[this.currentQuestionIndex],s=E.checkAnswer(e,t);//! 結果を記録。
this.results.push({question:e,userAnswer:t,isCorrect:s});//! 次の問題に進むか結果表示。
this.currentQuestionIndex++,this.currentQuestionIndex<this.questions.length?this.render():(this.currentState="exam-result",this.render())}openSettingsModal(){const t=Math.round(this.audio.getVolume()*100),e=this.audio.getFrequency(),s=this.audio.getWPM(),i=`
			<div class="settings-modal" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label for="volume-range">音量</label>
							<div class="setting-row">
								<input type="range" id="volume-range" min="0" max="100" value="${t}">
								<input type="number" id="volume-input" min="0" max="100" value="${t}">
								<span>%</span>
							</div>
						</div>
						<div class="setting-item">
							<label for="frequency-input">周波数 (Hz)</label>
							<input type="number" id="frequency-input" min="400" max="1200" value="${e}" step="50">
						</div>
						<div class="setting-item">
							<label for="wpm-input">WPM (速度: 5-40)</label>
							<input type="number" id="wpm-input" min="5" max="40" value="${s}">
						</div>
						<div class="setting-item">
							<span>テスト再生</span>
							<button id="test-morse-btn" class="btn btn-secondary">再生</button>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancel-btn" class="btn btn-secondary">キャンセル</button>
						<button id="ok-btn" class="btn btn-primary">OK</button>
					</div>
				</div>
			</div>
		`;document.body.insertAdjacentHTML("beforeend",i);//! イベントリスナー。
const n=document.getElementById("settings-modal");if(!n)return;//! 背景クリックで閉じる。
n.addEventListener("click",u=>{u.target===n&&this.closeSettingsModal(!1)});//! 音量スライダー。
const a=document.getElementById("volume-range"),r=document.getElementById("volume-input");a&&r&&(a.addEventListener("input",()=>{const u=parseInt(a.value)/100;this.audio.setVolume(u),r.value=a.value}),r.addEventListener("input",()=>{const u=parseInt(r.value)/100;this.audio.setVolume(u),a.value=r.value}));//! 周波数。
const l=document.getElementById("frequency-input");l&&l.addEventListener("input",()=>{const u=parseInt(l.value);this.audio.setFrequency(u)});//! WPM。
const o=document.getElementById("wpm-input");o&&o.addEventListener("input",()=>{const u=parseInt(o.value);this.audio.setWPM(u)});//! テスト再生。
const c=document.getElementById("test-morse-btn");c&&c.addEventListener("click",async()=>{await this.playMorse("CQ")});//! キャンセルボタン。
const p=document.getElementById("cancel-btn");p&&p.addEventListener("click",u=>{u.stopPropagation(),this.closeSettingsModal(!1)});//! OKボタン。
const h=document.getElementById("ok-btn");h&&h.addEventListener("click",u=>{u.stopPropagation(),this.closeSettingsModal(!0)})}closeSettingsModal(t){const e=document.getElementById("settings-modal");e&&e.remove()}destroy(){//! 音声を停止。
this.currentlyPlaying&&this.audio.stopContinuousTone()}}const F={characterSpeed:20,effectiveSpeed:15,frequency:700,volume:.7,practiceDuration:60,groupSize:5,showInput:!0};//! コッホシーケンス（41文字）。
const R=["K","M","U","R","E","S","N","A","P","T","L","W","I",".","J","Z","=","F","O","Y","V",",","G","5","/","Q","9","2","H","3","8","B","?","4","7","C","1","D","6","0","X"];class tt{constructor(){d(this,"audio");d(this,"viewMode","learning");d(this,"settings",{...F});d(this,"state",{currentLesson:1,isPlaying:!1,userInput:"",correctAnswer:"",groups:[],currentGroupIndex:0});d(this,"customState",{selectedChars:new Set,isCustomRunning:!1,customUserInput:"",customCorrectAnswer:"",customGroups:[],customCurrentGroupIndex:0,customIsPlaying:!1});//! 設定を読み込む。
this.loadSettings(),this.loadProgress(),this.loadViewMode(),this.loadSelectedChars();//! AudioGeneratorを初期化。
this.audio=new T({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed})}loadSettings(){try{const t=localStorage.getItem("v10.koch.settings");t&&(this.settings={...F,...JSON.parse(t)})}catch(t){console.error("Failed to load settings:",t)}}saveSettings(){try{localStorage.setItem("v10.koch.settings",JSON.stringify(this.settings))}catch(t){console.error("Failed to save settings:",t)}}loadProgress(){try{const t=localStorage.getItem("v10.koch.currentLesson");t&&(this.state.currentLesson=parseInt(t,10))}catch(t){console.error("Failed to load progress:",t)}}saveProgress(){try{localStorage.setItem("v10.koch.currentLesson",this.state.currentLesson.toString())}catch(t){console.error("Failed to save progress:",t)}}loadViewMode(){try{const t=localStorage.getItem("v10.koch.viewMode");t&&["learning","custom"].includes(t)&&(this.viewMode=t)}catch(t){console.error("Failed to load view mode:",t)}}saveViewMode(){try{localStorage.setItem("v10.koch.viewMode",this.viewMode)}catch(t){console.error("Failed to save view mode:",t)}}loadSelectedChars(){try{const t=localStorage.getItem("v10.koch.selectedChars");if(t){const e=JSON.parse(t);this.customState.selectedChars=new Set(e)}}catch(t){console.error("Failed to load selected chars:",t)}}saveSelectedChars(){try{const t=Array.from(this.customState.selectedChars);localStorage.setItem("v10.koch.selectedChars",JSON.stringify(t))}catch(t){console.error("Failed to save selected chars:",t)}}async startLesson(){const t=S.getCharsForLesson(this.state.currentLesson),e={groupSize:this.settings.groupSize,duration:this.settings.practiceDuration,wpm:this.settings.characterSpeed};this.state.groups=S.generateRandomGroups(t,e),this.state.currentGroupIndex=0,this.state.userInput="",this.state.correctAnswer=this.state.groups.join(""),this.state.isPlaying=!1;//! AudioGeneratorの設定を更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),this.renderPractice()}async playMorse(){if(this.state.isPlaying)return;this.state.isPlaying=!0,this.state.currentGroupIndex=0,this.updateProgress(),this.updatePlaybackButtons();//! モールス信号を再生。
for(let t=0;t<this.state.groups.length&&this.state.isPlaying;t++){const e=this.state.groups[t],s=I.textToMorse(e);await this.audio.playMorseString(s+" /"),this.state.currentGroupIndex=t+1,this.updateProgress()}this.state.isPlaying=!1,this.updatePlaybackButtons(),this.state.currentGroupIndex>=this.state.groups.length&&this.showResult()}pauseMorse(){this.state.isPlaying=!1,this.audio.stopPlaying(),this.updatePlaybackButtons()}stopLesson(){this.state.isPlaying=!1,this.audio.stopPlaying(),this.render()}showResult(){var i,n;const t=this.calculateAccuracy(),e=t>=90,s=document.getElementById("resultContainer");s&&(s.innerHTML=`
			<div class="result ${e?"passed":"failed"}">
				<h2>${e?"合格！":"不合格"}</h2>
				<div class="accuracy">正答率: ${t.toFixed(1)}%</div>
				<div class="comparison">
					<div>送信: ${this.state.correctAnswer}</div>
					<div>入力: ${this.state.userInput||"（未入力）"}</div>
				</div>
				<div class="actions">
					${e?'<button class="btn primary" id="nextLessonBtn">次のレッスンへ</button>':""}
					<button class="btn" id="retryBtn">もう一度</button>
				</div>
			</div>
		`,e&&this.state.currentLesson<40&&(this.state.currentLesson++,this.saveProgress(),(i=document.getElementById("nextLessonBtn"))==null||i.addEventListener("click",()=>{this.render()})),(n=document.getElementById("retryBtn"))==null||n.addEventListener("click",()=>{this.render()}))}calculateAccuracy(){if(!this.state.userInput)return 0;const t=this.state.correctAnswer.replace(/\s/g,""),e=this.state.userInput.replace(/\s/g,""),s=Math.max(t.length,e.length);let i=0;for(let n=0;n<s;n++)t[n]===e[n]&&i++;return i/s*100}updateProgress(){const t=document.getElementById("lessonProgress"),e=document.getElementById("progressBar");if(t&&e){const s=this.state.currentGroupIndex/this.state.groups.length*100;t.textContent=`進行: ${this.state.currentGroupIndex}/${this.state.groups.length} (${s.toFixed(0)}%)`,e.style.width=`${s}%`}this.updatePlaybackButtons()}updatePlaybackButtons(){const t=document.getElementById("playBtn"),e=document.getElementById("pauseBtn");t&&e&&(this.state.isPlaying?(t.disabled=!0,e.disabled=!1):(t.disabled=!1,e.disabled=!0))}async startCustom(){const t=Array.from(this.customState.selectedChars),e={groupSize:this.settings.groupSize,duration:this.settings.practiceDuration,wpm:this.settings.characterSpeed};this.customState.customGroups=S.generateRandomGroups(t,e),this.customState.customCurrentGroupIndex=0,this.customState.customUserInput="",this.customState.customCorrectAnswer=this.customState.customGroups.join(""),this.customState.customIsPlaying=!1,this.customState.isCustomRunning=!0;//! AudioGeneratorの設定を更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),this.render(),this.renderCustomPractice()}async playCustomMorse(){if(this.customState.customIsPlaying)return;this.customState.customIsPlaying=!0,this.customState.customCurrentGroupIndex=0,this.updateCustomProgress(),this.updateCustomPlaybackButtons();//! モールス信号を再生。
for(let t=0;t<this.customState.customGroups.length&&this.customState.customIsPlaying;t++){const e=this.customState.customGroups[t],s=I.textToMorse(e);await this.audio.playMorseString(s+" /"),this.customState.customCurrentGroupIndex=t+1,this.updateCustomProgress()}this.customState.customIsPlaying=!1,this.updateCustomPlaybackButtons()}pauseCustomMorse(){this.customState.customIsPlaying=!1,this.audio.stopPlaying(),this.updateCustomPlaybackButtons()}stopCustom(){this.customState.customIsPlaying=!1,this.audio.stopPlaying(),this.customState.isCustomRunning=!1,this.render()}updateCustomProgress(){const t=document.getElementById("customProgress"),e=document.getElementById("customProgressBar");if(t&&e){const s=this.customState.customCurrentGroupIndex/this.customState.customGroups.length*100;t.textContent=`進行: ${this.customState.customCurrentGroupIndex}/${this.customState.customGroups.length} (${s.toFixed(0)}%)`,e.style.width=`${s}%`}this.updateCustomPlaybackButtons()}updateCustomPlaybackButtons(){const t=document.getElementById("customPlayBtn"),e=document.getElementById("customPauseBtn");t&&e&&(this.customState.customIsPlaying?(t.disabled=!0,e.disabled=!1):(t.disabled=!1,e.disabled=!0))}showCustomResult(){var r,l;const t=document.getElementById("customResultContainer");if(!t)return;const e=this.customState.customUserInput.replace(/\s+/g,""),s=this.customState.customCorrectAnswer.replace(/\s+/g,"");let i=0;const n=Math.max(e.length,s.length);for(let o=0;o<n;o++)e[o]===s[o]&&i++;const a=n>0?Math.round(i/n*100):0;t.innerHTML=`
			<div class="result">
				<h2>練習結果</h2>
				<div class="accuracy">正答率: ${a}%</div>
				<div class="comparison">
					<div>送信: ${s}</div>
					<div>あなたの入力: ${e}</div>
				</div>
				<div class="actions">
					<button id="retryCustomBtn" class="btn">もう一度</button>
					<button id="backToCustomMenuBtn" class="btn primary">戻る</button>
				</div>
			</div>
		`,(r=document.getElementById("retryCustomBtn"))==null||r.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render(),this.startCustom()}),(l=document.getElementById("backToCustomMenuBtn"))==null||l.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render()})}showSettings(){//! 現在の設定を保存（キャンセル時の復元用）。
var a,r;const t={...this.settings},e=document.createElement("div");e.className="settings-modal active",e.innerHTML=`
			<div class="settings-content">
				<h2>設定</h2>
				<div class="settings-grid">
					<div class="setting-item">
						<label for="characterSpeed">文字速度 (WPM: 5-40)</label>
						<input type="number" id="characterSpeed" min="5" max="40" value="${this.settings.characterSpeed}">
					</div>
					<div class="setting-item">
						<label for="effectiveSpeed">実効速度 (WPM: 5-40)</label>
						<input type="number" id="effectiveSpeed" min="5" max="40" value="${this.settings.effectiveSpeed}">
					</div>
					<div class="setting-item">
						<label for="frequency-input">周波数 (Hz)</label>
						<input type="number" id="frequency-input" min="400" max="1200" value="${this.settings.frequency}" step="50">
					</div>
					<div class="setting-item">
						<label for="volume-range">音量</label>
						<div class="setting-row">
							<input type="range" id="volume-range" min="0" max="100" value="${Math.round(this.settings.volume*100)}">
							<input type="number" id="volume-input" min="0" max="100" value="${Math.round(this.settings.volume*100)}">
							<span>%</span>
						</div>
					</div>
					<div class="setting-item">
						<label for="practiceDuration">練習時間 (秒: 30-300)</label>
						<input type="number" id="practiceDuration" min="30" max="300" step="30" value="${this.settings.practiceDuration}">
					</div>
					<div class="setting-item">
						<label for="groupSize">グループサイズ (文字: 3-10)</label>
						<input type="number" id="groupSize" min="3" max="10" value="${this.settings.groupSize}">
					</div>
					<div class="setting-item">
						<label>
							<input type="checkbox" id="showInput" ${this.settings.showInput?"checked":""}>
							入力を表示
						</label>
					</div>
				</div>
				<div class="settings-buttons">
					<button id="cancel-btn" class="btn btn-secondary">キャンセル</button>
					<button id="ok-btn" class="btn btn-primary">OK</button>
				</div>
			</div>
		`,document.body.appendChild(e);//! 音量のレンジと入力欄を連携。
const s=document.getElementById("volume-range"),i=document.getElementById("volume-input");s&&i&&(s.oninput=()=>{i.value=s.value},i.oninput=()=>{s.value=i.value});//! 設定を復元する関数。
const n=()=>{this.settings={...t},this.audio.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed})};//! OK（保存）。
(a=document.getElementById("ok-btn"))==null||a.addEventListener("click",()=>{const l=document.getElementById("characterSpeed"),o=document.getElementById("effectiveSpeed"),c=document.getElementById("frequency-input"),p=document.getElementById("practiceDuration"),h=document.getElementById("groupSize"),u=document.getElementById("showInput"),v=parseInt(l.value,10);let f=parseInt(o.value,10);//! 実効速度は文字速度を上限とする。
f>v&&(f=v,o.value=v.toString()),this.settings.characterSpeed=v,this.settings.effectiveSpeed=f,this.settings.frequency=parseInt(c.value,10),this.settings.volume=parseInt(i.value,10)/100,this.settings.practiceDuration=parseInt(p.value,10),this.settings.groupSize=parseInt(h.value,10),this.settings.showInput=u.checked,this.saveSettings();//! AudioGeneratorを更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),e.remove();//! 練習中の場合、表示を更新。
this.state.groups.length>0&&this.renderPractice()});//! キャンセル。
(r=document.getElementById("cancel-btn"))==null||r.addEventListener("click",()=>{n(),e.remove()});//! モーダル外クリックで閉じる（キャンセル扱い）。
e.addEventListener("click",l=>{l.target===e&&(n(),e.remove())})}render(){const t=document.getElementById("app");t&&(t.innerHTML=`
			<div class="settings-modal" id="settings-modal"></div>

			<div class="container">
				<header class="header">
					<button class="back-btn" id="back-btn">メニューに戻る</button>
					<h1>コッホ法トレーニング</h1>
					<button class="settings-btn" id="settings-btn" title="設定">⚙</button>
				</header>

				<div class="tabs">
					<button class="tab-button ${this.viewMode==="learning"?"active":""}" data-tab="learning">基本学習</button>
					<button class="tab-button ${this.viewMode==="custom"?"active":""}" data-tab="custom">任意文字列練習</button>
				</div>

				${this.renderModeContent()}
			</div>
		`,this.attachEventListeners())}renderModeContent(){switch(this.viewMode){case"learning":return this.renderLearningMode();case"custom":return this.renderCustomMode();default:return this.renderLearningMode()}}renderLearningMode(){const t=S.getCharsForLesson(this.state.currentLesson),e=R.slice(0,40).map((s,i)=>{const n=i+1,a=S.getCharsForLesson(n),r=n===this.state.currentLesson,l=n<this.state.currentLesson;return`
				<div class="lesson-item ${r?"current":""} ${l?"passed":""}" data-lesson="${n}">
					<div class="lesson-num">L${n}</div>
					<div class="lesson-chars">${a.join("")}</div>
				</div>
			`}).join("");return`
			<div class="flashcard-container">
				<div class="lesson-info">
					<h2>レッスン ${this.state.currentLesson} / 40</h2>
					<div class="chars">学習文字: ${t.join("")}</div>
					<button id="startBtn" class="btn btn-primary">練習開始</button>
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
			</div>
		`}renderCustomMode(){if(this.customState.isCustomRunning){//! 練習実行画面。
return`
				<div class="flashcard-container">
					<div id="customPracticeContainer"></div>
					<div id="customResultContainer"></div>
				</div>
			`}else{//! 文字選択画面。
return`
				<div class="flashcard-container">
					<div class="lesson-info">
						<h2>任意文字列練習モード</h2>
						<p>練習したい文字を選択してください（最低2文字）</p>
						<div class="char-selection">
							${R.map(e=>`
				<button class="char-select-btn ${this.customState.selectedChars.has(e)?"selected":""}" data-char="${e}">
					${e}
				</button>
			`).join("")}
						</div>
						<button id="startCustomBtn" class="btn btn-primary" ${this.customState.selectedChars.size<2?"disabled":""}>練習開始</button>
					</div>

					<div class="instructions">
						<h3>使い方</h3>
						<ul>
							<li>練習したい文字をクリックして選択</li>
							<li>2文字以上選択すると練習開始可能</li>
							<li>選択した文字のみでランダムな練習問題が生成されます</li>
						</ul>
					</div>
				</div>
			`}}renderPractice(){var i,n,a;const t=document.getElementById("practiceContainer");if(!t)return;const e=S.getCharsForLesson(this.state.currentLesson);t.innerHTML=`
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

				<textarea id="userInput" class="input-area" placeholder="聞こえた文字を入力..." ${this.settings.showInput?"":'style="opacity: 0.3; pointer-events: none;"'}></textarea>
				${this.renderKeyboard(e)}
			</div>
		`;const s=document.getElementById("userInput");s&&s.addEventListener("input",r=>{this.state.userInput=r.target.value.toUpperCase()}),(i=document.getElementById("playBtn"))==null||i.addEventListener("click",()=>{this.playMorse()}),(n=document.getElementById("pauseBtn"))==null||n.addEventListener("click",()=>{this.pauseMorse()}),(a=document.getElementById("stopBtn"))==null||a.addEventListener("click",()=>{this.stopLesson()});//! キーボードボタンのイベント設定。
this.setupKeyboardEvents(e),this.updatePlaybackButtons()}renderCustomPractice(){const t=document.getElementById("customPracticeContainer");t&&(t.innerHTML=`
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

				${this.settings.showInput?`
					<textarea id="customInputArea" class="input-area" placeholder="聞こえた文字を入力してください..."></textarea>
				`:""}

				<button id="customEndBtn" class="btn btn-primary">結果を見る</button>
			</div>
		`,this.setupCustomControls())}renderKeyboard(t){const e=[];//! KOCH_SEQUENCEをgroupSizeごとに分割。
for(let s=0;s<R.length;s+=this.settings.groupSize)e.push(R.slice(s,s+this.settings.groupSize));return`
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
						${e.map((s,i)=>`
							<div class="keyboard-group">
								<div class="group-label">G${i+1}</div>
								<div class="group-keys">
									${s.map(n=>{const a=t.includes(n);return`
											<button class="key-btn ${a?"":"disabled"}"
											        data-char="${n}"
											        ${a?"":"disabled"}>
												${n}
											</button>
										`}).join("")}
								</div>
							</div>
						`).join("")}
					</div>
				</div>
			</div>
		`}setupKeyboardEvents(t){var s,i;const e=document.getElementById("userInput");if(!e)return;//! 文字キー。
document.querySelectorAll(".key-btn:not(.special)").forEach(n=>{n.addEventListener("click",a=>{a.preventDefault();const r=a.target.getAttribute("data-char");r&&t.includes(r)&&(e.value+=r,this.state.userInput=e.value.toUpperCase())})});//! スペースキー。
(s=document.getElementById("spaceBtn"))==null||s.addEventListener("click",n=>{n.preventDefault(),e.value+=" ",this.state.userInput=e.value.toUpperCase()});//! バックスペースキー。
(i=document.getElementById("backspaceBtn"))==null||i.addEventListener("click",n=>{n.preventDefault(),e.value=e.value.slice(0,-1),this.state.userInput=e.value.toUpperCase()})}setupCustomControls(){//! 入力欄のイベントリスナー。
var e,s,i,n;const t=document.getElementById("customInputArea");t&&t.addEventListener("input",a=>{this.customState.customUserInput=a.target.value.toUpperCase()}),(e=document.getElementById("customPlayBtn"))==null||e.addEventListener("click",()=>{this.playCustomMorse()}),(s=document.getElementById("customPauseBtn"))==null||s.addEventListener("click",()=>{this.pauseCustomMorse()}),(i=document.getElementById("customStopBtn"))==null||i.addEventListener("click",()=>{this.stopCustom()}),(n=document.getElementById("customEndBtn"))==null||n.addEventListener("click",()=>{this.showCustomResult()}),this.updateCustomPlaybackButtons()}attachEventListeners(){//! 戻るボタン。
var t,e;(t=document.getElementById("back-btn"))==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
(e=document.getElementById("settings-btn"))==null||e.addEventListener("click",()=>{this.showSettings()});//! タブボタン。
document.querySelectorAll(".tab-button").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-tab");i&&(this.viewMode=i,this.saveViewMode(),this.render())})});//! モード別のイベントリスナーを設定。
this.setupModeEventListeners()}setupModeEventListeners(){var t,e;if(this.viewMode==="learning"){(t=document.getElementById("startBtn"))==null||t.addEventListener("click",()=>{this.startLesson()});//! レッスンアイテムのクリックイベント。
document.querySelectorAll(".lesson-item").forEach(s=>{s.addEventListener("click",()=>{const i=parseInt(s.getAttribute("data-lesson")||"1",10);this.state.currentLesson=i,this.saveProgress(),this.render(),window.scrollTo({top:0,behavior:"smooth"})})})}else if(this.viewMode==="custom"&&!this.customState.isCustomRunning){(e=document.getElementById("startCustomBtn"))==null||e.addEventListener("click",()=>{this.startCustom()});//! 文字選択ボタン。
document.querySelectorAll(".char-select-btn").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-char");i&&(this.customState.selectedChars.has(i)?this.customState.selectedChars.delete(i):this.customState.selectedChars.add(i),this.saveSelectedChars(),this.render())})})}}destroy(){//! 音声を停止。
this.audio.stopPlaying()}}function et(m,t){const e=URL.createObjectURL(m),s=document.createElement("a");s.href=e,s.download=t,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(e)}function st(m){return m.replace(/[^a-zA-Z0-9_-]/g,"_")}const H={characterSpeed:20,effectiveSpeed:15,frequency:700,volume:.7};class nt{constructor(){d(this,"audio");d(this,"settings",{...H});d(this,"state",{currentCategory:"qso",selectedTemplate:null,isPlaying:!1,userInput:"",showResult:!1,showAnswer:!1,showDialogFormat:!1});d(this,"customTemplates",[]);//! 設定を読み込む。
this.loadSettings(),this.loadCategory(),this.loadCustomTemplates();//! AudioGeneratorを初期化。
this.audio=new T({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed})}loadSettings(){try{const t=localStorage.getItem("v10.listening.settings");t&&(this.settings={...H,...JSON.parse(t)})}catch(t){console.error("Failed to load settings:",t)}}saveSettings(){try{localStorage.setItem("v10.listening.settings",JSON.stringify(this.settings))}catch(t){console.error("Failed to save settings:",t)}}loadCategory(){try{const t=localStorage.getItem("v10.listening.category");t&&["qso","text100","text200","text300","custom"].includes(t)&&(this.state.currentCategory=t)}catch(t){console.error("Failed to load category:",t)}}saveCategory(){try{localStorage.setItem("v10.listening.category",this.state.currentCategory)}catch(t){console.error("Failed to save category:",t)}}loadCustomTemplates(){try{const t=localStorage.getItem("v10.listening.customTemplates");t&&(this.customTemplates=JSON.parse(t))}catch(t){console.error("Failed to load custom templates:",t)}}saveCustomTemplates(){try{localStorage.setItem("v10.listening.customTemplates",JSON.stringify(this.customTemplates))}catch(t){console.error("Failed to save custom templates:",t)}}getTemplates(){if(this.state.currentCategory==="custom"){//! ランダムQSO生成ボタンを追加。
return[{id:"qso-random-generate",category:"qso",title:"ランダムQSO生成",content:""},...this.customTemplates]}else{const t=M.getBuiltinTemplates(this.state.currentCategory);//! QSOカテゴリーにはランダムQSO生成ボタンを追加。
return this.state.currentCategory==="qso"?[{id:"qso-random-generate",category:"qso",title:"ランダムQSO生成",content:""},...t]:t}}async playMorse(){if(!this.state.selectedTemplate||this.state.isPlaying)return;this.state.isPlaying=!0,this.updatePlaybackButtons();//! モールス信号を再生。
const t=I.textToMorse(this.state.selectedTemplate.content);await this.audio.playMorseString(t),this.state.isPlaying=!1,this.updatePlaybackButtons()}pauseMorse(){this.audio.stopPlaying(),this.state.isPlaying=!1,this.updatePlaybackButtons()}stopMorse(){this.audio.stopPlaying(),this.state.isPlaying=!1,this.state.userInput="",this.state.showResult=!1,this.state.showAnswer=!1,this.renderPracticeArea()}updatePlaybackButtons(){const t=document.getElementById("playBtn"),e=document.getElementById("pauseBtn");t&&(t.disabled=this.state.isPlaying),e&&(e.disabled=!this.state.isPlaying)}checkAnswer(){this.state.selectedTemplate&&(this.state.showResult=!0,this.state.showAnswer=!0,this.renderPracticeArea())}toggleAnswer(){this.state.showAnswer=!this.state.showAnswer,this.renderPracticeArea()}toggleDialogFormat(){this.state.showDialogFormat=!this.state.showDialogFormat,this.renderAnswer()}showCustomTemplateDialog(t){var a,r;const e=!!t,s=e?t.title:"",i=e?t.content:"",n=document.createElement("div");n.className="modal-overlay",n.innerHTML=`
			<div class="modal">
				<h2>${e?"テンプレート編集":"テンプレート新規作成"}</h2>
				<div class="form-group">
					<label for="templateTitle">タイトル:</label>
					<input type="text" id="templateTitle" value="${s}" placeholder="タイトルを入力">
				</div>
				<div class="form-group">
					<label for="templateContent">内容:</label>
					<textarea id="templateContent" placeholder="モールス信号に変換するテキストを入力">${i}</textarea>
				</div>
				<div class="modal-actions">
					<button id="saveTemplateBtn" class="btn btn-primary">保存</button>
					<button id="cancelTemplateBtn" class="btn">キャンセル</button>
				</div>
			</div>
		`,document.body.appendChild(n);//! 保存ボタン。
(a=document.getElementById("saveTemplateBtn"))==null||a.addEventListener("click",()=>{const l=document.getElementById("templateTitle"),o=document.getElementById("templateContent");if(!l.value.trim()||!o.value.trim()){alert("タイトルと内容を入力してください");return}if(e&&t){//! 既存テンプレートを更新。
t.title=l.value.trim(),t.content=o.value.trim().toUpperCase()}else{//! 新規テンプレートを追加。
const c={id:`custom-${Date.now()}`,category:"qso",title:l.value.trim(),content:o.value.trim().toUpperCase()};this.customTemplates.push(c)}this.saveCustomTemplates(),n.remove(),this.render()});//! キャンセルボタン。
(r=document.getElementById("cancelTemplateBtn"))==null||r.addEventListener("click",()=>{n.remove()});//! モーダル外クリックで閉じる。
n.addEventListener("click",l=>{l.target===n&&n.remove()})}deleteCustomTemplate(t){confirm("この定型文を削除しますか?")&&(this.customTemplates=this.customTemplates.filter(e=>e.id!==t),this.saveCustomTemplates(),this.render())}showSettings(){var r,l,o;const t=document.createElement("div");t.className="modal-overlay",t.innerHTML=`
			<div class="modal settings-modal">
				<h2>設定</h2>
				<div class="settings-content">
					<div class="setting-group">
						<label>
							<span>文字速度 (WPM):</span>
							<div class="input-with-value">
								<input type="range" id="characterSpeed" min="5" max="50" step="1" value="${this.settings.characterSpeed}">
								<span id="characterSpeedValue">${this.settings.characterSpeed}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>実効速度 (WPM):</span>
							<div class="input-with-value">
								<input type="range" id="effectiveSpeed" min="5" max="50" step="1" value="${this.settings.effectiveSpeed}">
								<span id="effectiveSpeedValue">${this.settings.effectiveSpeed}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>周波数 (Hz):</span>
							<div class="input-with-value">
								<input type="range" id="frequency" min="400" max="1200" step="50" value="${this.settings.frequency}">
								<span id="frequencyValue">${this.settings.frequency}</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>音量:</span>
							<div class="input-with-value">
								<input type="range" id="volume" min="0" max="1" step="0.1" value="${this.settings.volume}">
								<span id="volumeValue">${Math.round(this.settings.volume*100)}%</span>
							</div>
						</label>
					</div>
					<div class="setting-group">
						<label>
							<span>テスト再生:</span>
							<button id="test-morse-btn" class="btn btn-secondary">CQ 再生</button>
						</label>
					</div>
				</div>
				<div class="modal-actions">
					<button id="save-btn" class="btn btn-primary">保存</button>
					<button id="cancel-btn" class="btn">キャンセル</button>
				</div>
			</div>
		`,document.body.appendChild(t);//! スライダーの値変更を監視。
const e=document.getElementById("characterSpeed"),s=document.getElementById("effectiveSpeed"),i=document.getElementById("frequency"),n=document.getElementById("volume");e==null||e.addEventListener("input",()=>{document.getElementById("characterSpeedValue").textContent=e.value}),s==null||s.addEventListener("input",()=>{document.getElementById("effectiveSpeedValue").textContent=s.value}),i==null||i.addEventListener("input",()=>{document.getElementById("frequencyValue").textContent=i.value}),n==null||n.addEventListener("input",()=>{document.getElementById("volumeValue").textContent=`${Math.round(parseFloat(n.value)*100)}%`});//! テスト再生ボタン。
(r=document.getElementById("test-morse-btn"))==null||r.addEventListener("click",async()=>{//! 現在の設定値で一時的にAudioGeneratorを更新。
this.audio.updateSettings({frequency:parseInt(i.value),volume:parseFloat(n.value),wpm:parseInt(e.value),effectiveWpm:parseInt(s.value)});//! CQを再生。
const c=I.textToMorse("CQ");await this.audio.playMorseString(c)});//! 設定の一時保存（キャンセル用）。
const a=()=>{this.loadSettings()};//! 保存ボタン。
(l=document.getElementById("save-btn"))==null||l.addEventListener("click",()=>{this.settings.characterSpeed=parseInt(e.value),this.settings.effectiveSpeed=parseInt(s.value),this.settings.frequency=parseInt(i.value),this.settings.volume=parseFloat(n.value),this.saveSettings();//! AudioGeneratorを更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),t.remove()});//! キャンセル。
(o=document.getElementById("cancel-btn"))==null||o.addEventListener("click",()=>{a(),t.remove()});//! モーダル外クリックで閉じる（キャンセル扱い）。
t.addEventListener("click",c=>{c.target===t&&(a(),t.remove())})}render(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
					${this.state.selectedTemplate?this.renderPracticeContent():this.renderTemplateList()}
				</div>
			</div>
		`,this.attachEventListeners())}renderCategoryTabs(){return[{id:"qso",label:"ラバースタンプQSO"},{id:"text100",label:"英文100字"},{id:"text200",label:"英文200字"},{id:"text300",label:"英文300字"},{id:"custom",label:"ユーザー定義"}].map(e=>`
			<button class="tab-button ${this.state.currentCategory===e.id?"active":""}" data-category="${e.id}">
				${e.label}
			</button>
		`).join("")}renderTemplateList(){const t=this.getTemplates();return t.length===0||t.length===1&&t[0].id==="qso-random-generate"?`
				<div class="empty-state">
					<p>定型文がありません</p>
					${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn btn-primary">新規作成</button>':""}
				</div>
			`:`
			<div class="template-list">
				${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn btn-primary">新規作成</button>':""}
				${t.map(e=>{const s=e.id==="qso-random-generate"?"コールサイン、地名、名前、RSレポート、リグなどがランダムに生成された完全なQSOが作成されます。毎回異なる内容で練習できます。":`${e.content.substring(0,100)}${e.content.length>100?"...":""}`;return`
					<div class="template-card" data-template-id="${e.id}">
						<h3>${e.title}</h3>
						<p class="template-preview">${s}</p>
						<div class="template-actions">
							<button class="btn select-btn" data-template-id="${e.id}">選択</button>
							${this.state.currentCategory==="custom"&&e.id!=="qso-random-generate"?`
								<button class="btn edit-btn" data-template-id="${e.id}">編集</button>
								<button class="btn delete-btn" data-template-id="${e.id}">削除</button>
							`:""}
						</div>
					</div>
				`}).join("")}
			</div>
		`}renderPracticeContent(){return this.state.selectedTemplate?`
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

				<div id="practiceInputArea"></div>
			</div>
		`:""}renderPracticeArea(){var s,i;const t=document.getElementById("practiceInputArea");if(!t)return;t.innerHTML=`
			<div class="input-section">
				<label for="userInput">聞き取った内容を入力してください:</label>
				<textarea id="userInput" class="input-area" placeholder="聞き取った文字を入力...">${this.state.userInput}</textarea>
			</div>

			<div class="action-buttons">
				<button id="checkBtn" class="btn btn-primary">採点</button>
				<button id="showAnswerBtn" class="btn">${this.state.showAnswer?"正解を非表示":"正解を表示"}</button>
			</div>

			${this.state.showAnswer?'<div id="answerArea"></div>':""}
			${this.state.showResult?'<div id="resultArea"></div>':""}
		`;//! ユーザー入力の監視。
const e=document.getElementById("userInput");e==null||e.addEventListener("input",()=>{this.state.userInput=e.value});//! 採点ボタン。
(s=document.getElementById("checkBtn"))==null||s.addEventListener("click",()=>{this.checkAnswer()});//! 正解表示ボタン。
(i=document.getElementById("showAnswerBtn"))==null||i.addEventListener("click",()=>{this.toggleAnswer()});//! 正解と結果を描画。
this.state.showAnswer&&this.renderAnswer(),this.state.showResult&&this.renderResult()}renderAnswer(){var a;const t=document.getElementById("answerArea");if(!t||!this.state.selectedTemplate)return;const e=this.state.selectedTemplate.category==="qso",s=this.state.selectedTemplate.content;//! 対話形式ボタン（QSOの場合のみ表示）。
const i=e?`<button id="toggleDialogBtn" class="btn" style="margin-left: 10px;">${this.state.showDialogFormat?"通常表示":"対話形式で表示"}</button>`:"";//! 対話形式表示の生成。
let n="";if(e&&this.state.showDialogFormat){//! BTで区切って話者別に表示。
n=`
				<table class="dialog-table">
					<tbody>
						${s.split(/\s+BT\s+/).map((l,o)=>`
								<tr>
									<td class="speaker-cell">${o%2===0?"A":"B"}</td>
									<td class="content-cell">${l.trim()}</td>
								</tr>
							`).join("")}
					</tbody>
				</table>
			`}else n=`<div class="answer-text">${s}</div>`;t.innerHTML=`
			<div class="answer-area">
				<h3 style="display: inline-block;">正解</h3>
				${i}
				${n}
			</div>
		`;//! 対話形式ボタン。
(a=document.getElementById("toggleDialogBtn"))==null||a.addEventListener("click",()=>{this.toggleDialogFormat()})}renderResult(){const t=document.getElementById("resultArea");if(!t||!this.state.selectedTemplate)return;const e=M.calculateAccuracy(this.state.selectedTemplate.content,this.state.userInput);t.innerHTML=`
			<div class="result-area">
				<h3>結果</h3>
				<div class="accuracy">正答率: ${e}%</div>
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
var t,e,s,i,n,a,r,l;(t=document.getElementById("backBtn"))==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定アイコン。
(e=document.getElementById("settingsIcon"))==null||e.addEventListener("click",()=>{this.showSettings()});//! カテゴリータブ。
document.querySelectorAll(".tab-button").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-category");c&&(this.state.currentCategory=c,this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.saveCategory(),this.render())})});//! 定型文選択ボタン。
document.querySelectorAll(".select-btn").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-template-id");if(c){//! ランダムQSO生成ボタンの場合。
if(c==="qso-random-generate")this.state.selectedTemplate=M.generateRandomQSO(),this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render(),this.renderPracticeArea();else{//! 通常のテンプレート選択。
const h=[...M.getBuiltinTemplates(),...this.customTemplates].find(u=>u.id===c);h&&(this.state.selectedTemplate=h,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render(),this.renderPracticeArea())}}})});//! 一覧に戻るボタン。
(s=document.getElementById("backToListBtn"))==null||s.addEventListener("click",()=>{this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.audio.stopPlaying(),this.render()});//! ユーザー定義定型文の新規作成ボタン。
(i=document.getElementById("addCustomBtn"))==null||i.addEventListener("click",()=>{this.showCustomTemplateDialog()});//! ユーザー定義定型文の編集ボタン。
document.querySelectorAll(".edit-btn").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-template-id");if(c){const p=this.customTemplates.find(h=>h.id===c);p&&this.showCustomTemplateDialog(p)}})});//! ユーザー定義定型文の削除ボタン。
document.querySelectorAll(".delete-btn").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-template-id");c&&this.deleteCustomTemplate(c)})});//! 再生コントロール（練習画面のみ）。
this.state.selectedTemplate&&((n=document.getElementById("playBtn"))==null||n.addEventListener("click",()=>{this.playMorse()}),(a=document.getElementById("pauseBtn"))==null||a.addEventListener("click",()=>{this.pauseMorse()}),(r=document.getElementById("stopBtn"))==null||r.addEventListener("click",()=>{this.stopMorse()}),(l=document.getElementById("downloadBtn"))==null||l.addEventListener("click",()=>{this.downloadWav()}),this.renderPracticeArea())}async downloadWav(){if(this.state.selectedTemplate)try{//! テキストをモールス符号に変換。
const t=I.textToMorse(this.state.selectedTemplate.content);//! WAVファイルを生成。
const e=await this.audio.generateWav(t);//! ダウンロード。
const s=`${st(this.state.selectedTemplate.title)}.wav`;et(e,s)}catch(t){console.error("WAVダウンロードエラー:",t),alert("WAVファイルの生成に失敗しました。")}}destroy(){//! AudioGeneratorを停止。
this.audio.stopPlaying()}}class it{constructor(){d(this,"currentView",null);d(this,"routes",[]);//! ルート定義。
this.routes=[{path:"",view:O},{path:"menu",view:O},{path:"vertical",view:z},{path:"horizontal",view:j},{path:"flashcard",view:_},{path:"koch",view:tt},{path:"listening",view:nt}]}init(){//! ハッシュ変更時のリスナーを登録。
window.addEventListener("hashchange",()=>this.handleRoute());//! 初回ルーティング。
this.handleRoute()}handleRoute(){//! 現在のビューを破棄。
this.currentView&&(this.currentView.destroy(),this.currentView=null);//! ハッシュからパスを取得（#を除去）。
const t=window.location.hash.slice(1),e=this.routes.find(s=>s.path===t);if(e){//! ビューを作成してレンダリング。
this.currentView=new e.view,this.currentView.render()}else{//! 該当するルートがない場合はメニューに遷移。
window.location.hash="#menu"}}navigate(t){window.location.hash=`#${t}`}}//! アプリケーション起動時の処理。
function K(){console.log("モールス練習アプリ v10 起動");//! ルーターを初期化。
new it().init()}//! DOMContentLoaded後に初期化。
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",K):K();
//# sourceMappingURL=index-C6XHdWY-.js.map

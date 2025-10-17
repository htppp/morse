var Y=Object.defineProperty;var J=(u,e,t)=>e in u?Y(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t;var c=(u,e,t)=>J(u,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();class x{constructor(){c(this,"menuItems",[{id:"vertical",title:"縦振り電鍵練習",description:"上下に動かす電鍵（ストレートキー）の練習",route:"vertical"},{id:"horizontal",title:"横振り電鍵練習",description:"左右に動かす電鍵（パドル）の練習（Iambic A/B対応）",route:"horizontal"},{id:"flashcard",title:"CW略語・Q符号",description:"CW通信で使用される略語とQ符号を学習",route:"flashcard"},{id:"koch",title:"コッホ法トレーニング",description:"段階的に文字を増やして学習する方式",route:"koch"},{id:"listening",title:"モールス信号聞き取り練習",description:"ランダムQSOや英文を聞いて練習",route:"listening"}])}render(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
			<div class="container">
				<header class="menu-header">
					<h1>モールス練習アプリ</h1>
					<p class="version">v10 - Engine/GUI分離版</p>
				</header>

				<main class="menu-main">
					<div class="menu-grid">
						${this.menuItems.map(t=>this.renderMenuItem(t)).join("")}
					</div>
				</main>

				<footer class="menu-footer">
					<p>&copy; 2025 モールス練習アプリ</p>
				</footer>
			</div>
		`;//! イベントリスナーを設定。
this.attachEventListeners()}renderMenuItem(e){return`
			<div class="menu-item" data-route="${e.route}">
				<h2 class="menu-item-title">${e.title}</h2>
				<p class="menu-item-description">${e.description}</p>
			</div>
		`}attachEventListeners(){document.querySelectorAll(".menu-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-route");s&&(window.location.hash=`#${s}`)})})}destroy(){//! イベントリスナーは新しいHTMLで上書きされるため、特に処理不要。
}}const A={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."," ":"/",".":".-.-.-",",":"--..--",":":"---...","?":"..--..",_:"..--.-","+":".-.-.","-":"-....-","×":"-..-","^":"......","/":"-..-.","@":".--.-.","(":"-.--.",")":"-.--.-",'"':".-..-.","'":".----.","=":"-...-"},z=Object.fromEntries(Object.entries(A).map(([u,e])=>[e,u]));class E{static textToMorse(e){const t=e.toUpperCase(),s=/\[([A-Z]+)\]/g,n=[];let i=0,a;for(;(a=s.exec(t))!==null;){if(a.index>i){const o=t.substring(i,a.index),l=Array.from(o).map(d=>A[d]||d);n.push(l.join(" "))}const r=Array.from(a[1]).map(o=>A[o]||o);n.push(r.join("")),i=s.lastIndex}if(i<t.length){const r=t.substring(i),o=Array.from(r).map(l=>A[l]||l);n.push(o.join(" "))}return n.filter(r=>r).join(" ")}static morseToText(e){let t="";for(const s of e)s==="/"?t+=" ":s&&s!==""&&(t+=z[s]||"?");return t}static getMorseMap(){return{...A}}static charToMorse(e){return A[e.toUpperCase()]}}class O{static calculate(e,t={}){if(e<=0)throw new Error(`Invalid WPM value: ${e}. WPM must be greater than 0.`);const s=1200/e,n=t.shortenGaps?.9:1;return{dot:s,dash:s*3,elementGap:s,charGap:s*3*n,wordGap:s*7*n}}static getCharGapDelay(e){const t=e.charGap/(e.dot*3);return e.dot*4*t}static getWordGapDelay(e){return e.wordGap}static classifyElement(e,t){const s=t*1.5;return e<s?".":"-"}}class G{constructor(){this.buffer="",this.sequence=""}getSequence(){return this.sequence}getBuffer(){return this.buffer}addElement(e){this.sequence+=e}commitSequence(e=!0){this.sequence&&(this.buffer+=this.sequence,e&&(this.buffer+=" "),this.sequence="")}addWordSeparator(){this.commitSequence(!0),this.buffer.endsWith("/ ")||(this.buffer+="/ ")}clear(){this.buffer="",this.sequence=""}endsWith(e){return this.buffer.endsWith(e)}getBufferLength(){return this.buffer.length}getSequenceLength(){return this.sequence.length}isEmpty(){return this.buffer.length===0&&this.sequence.length===0}}class V{constructor(){this.timers=new Map}set(e,t,s){this.clear(e);const n=window.setTimeout(t,s);this.timers.set(e,n)}clear(e){const t=this.timers.get(e);t!==void 0&&(clearTimeout(t),this.timers.delete(e))}clearAll(){for(const e of this.timers.values())clearTimeout(e);this.timers.clear()}has(e){return this.timers.has(e)}count(){return this.timers.size}}class T{constructor(e={frequency:750,volume:.7,wpm:20}){this.audioContext=null,this.currentOscillator=null,this.currentGain=null,this.isPlaying=!1,this.settings=e}ensureAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&this.audioContext.resume()}updateSettings(e){this.settings={...this.settings,...e}}getSettings(){return{...this.settings}}scheduleTone(e,t){if(this.ensureAudioContext(),!!this.audioContext)try{const s=this.audioContext.createOscillator(),n=this.audioContext.createGain();s.connect(n),n.connect(this.audioContext.destination),s.frequency.value=this.settings.frequency,s.type="sine";const i=this.audioContext.currentTime,a=Math.max(i,e);n.gain.setValueAtTime(0,a),n.gain.linearRampToValueAtTime(this.settings.volume,a+.001),n.gain.setValueAtTime(this.settings.volume,a+(t-1)/1e3),n.gain.linearRampToValueAtTime(0,a+t/1e3),s.start(a),s.stop(a+t/1e3)}catch(s){console.error("音声エラー:",s)}}startContinuousTone(){if(this.ensureAudioContext(),!!this.audioContext)try{this.stopContinuousTone();const e=this.audioContext.createOscillator(),t=this.audioContext.createGain();e.connect(t),t.connect(this.audioContext.destination),e.frequency.value=this.settings.frequency,e.type="sine";const s=this.audioContext.currentTime;t.gain.setValueAtTime(0,s),t.gain.linearRampToValueAtTime(this.settings.volume,s+.001),e.start(s),this.currentOscillator=e,this.currentGain=t}catch(e){console.error("連続音開始エラー:",e)}}stopContinuousTone(){if(this.audioContext)try{if(this.currentOscillator&&this.currentGain){const e=this.audioContext.currentTime;this.currentGain.gain.cancelScheduledValues(e),this.currentGain.gain.setValueAtTime(this.currentGain.gain.value,e),this.currentGain.gain.linearRampToValueAtTime(0,e+.001),this.currentOscillator.stop(e+.002),this.currentOscillator=null,this.currentGain=null}}catch(e){console.error("連続音停止エラー:",e)}}async playMorseString(e){if(this.isPlaying||!e||(this.ensureAudioContext(),!this.audioContext))return!1;this.isPlaying=!0;const t=this.settings.wpm||20,s=Math.min(this.settings.effectiveWpm||t,t),n=1200/t,i=n,a=3*n,r=n,o=3*n,l=7*(1200/s);let d=this.audioContext.currentTime+.02;for(let v=0;v<e.length&&this.isPlaying;v++){const b=e[v];b==="."?(this.scheduleTone(d,i),d+=(i+r)/1e3):b==="-"?(this.scheduleTone(d,a),d+=(a+r)/1e3):b===" "?d+=(o-r)/1e3:b==="/"&&(d+=(l-r)/1e3)}const g=(d-this.audioContext.currentTime)*1e3;await new Promise(v=>setTimeout(v,g));const h=this.isPlaying;return this.isPlaying=!1,h}stopPlaying(){this.isPlaying=!1}isCurrentlyPlaying(){return this.isPlaying}getAudioContext(){return this.audioContext}getVolume(){return this.settings.volume}setVolume(e){this.settings.volume=Math.max(0,Math.min(1,e))}getFrequency(){return this.settings.frequency}setFrequency(e){this.settings.frequency=Math.max(400,Math.min(1200,e))}getWPM(){return this.settings.wpm||20}setWPM(e){this.settings.wpm=Math.max(5,Math.min(40,e))}async generateWav(e){if(!e)throw new Error("モールス符号が空です");const t=this.settings.wpm||20,s=Math.min(this.settings.effectiveWpm||t,t),n=1200/t,i=n,a=3*n,r=n,o=3*n,l=7*(1200/s);let d=0;for(let m=0;m<e.length;m++){const p=e[m];p==="."?d+=i+r:p==="-"?d+=a+r:p===" "?d+=o-r:p==="/"&&(d+=l-r)}const g=44100,h=(d+100)/1e3,v=new OfflineAudioContext(1,Math.ceil(h*g),g);let b=.02;for(let m=0;m<e.length;m++){const p=e[m];p==="."?(this.scheduleOfflineTone(v,b,i),b+=(i+r)/1e3):p==="-"?(this.scheduleOfflineTone(v,b,a),b+=(a+r)/1e3):p===" "?b+=(o-r)/1e3:p==="/"&&(b+=(l-r)/1e3)}const I=await v.startRendering();return this.audioBufferToWav(I)}scheduleOfflineTone(e,t,s){const n=e.createOscillator(),i=e.createGain();n.connect(i),i.connect(e.destination),n.frequency.value=this.settings.frequency,n.type="sine";const a=t;i.gain.setValueAtTime(0,a),i.gain.linearRampToValueAtTime(this.settings.volume,a+.001),i.gain.setValueAtTime(this.settings.volume,a+(s-1)/1e3),i.gain.linearRampToValueAtTime(0,a+s/1e3),n.start(a),n.stop(a+s/1e3)}audioBufferToWav(e){const t=e.numberOfChannels,s=e.sampleRate,n=1,i=16,a=i/8,r=t*a,o=new Float32Array(e.length*t);for(let I=0;I<e.numberOfChannels;I++){const m=e.getChannelData(I);for(let p=0;p<m.length;p++)o[p*t+I]=m[p]}const l=o.length*a,d=44+l,g=new ArrayBuffer(d),h=new DataView(g),v=(I,m)=>{for(let p=0;p<m.length;p++)h.setUint8(I+p,m.charCodeAt(p))};v(0,"RIFF"),h.setUint32(4,d-8,!0),v(8,"WAVE"),v(12,"fmt "),h.setUint32(16,16,!0),h.setUint16(20,n,!0),h.setUint16(22,t,!0),h.setUint32(24,s,!0),h.setUint32(28,s*r,!0),h.setUint16(32,r,!0),h.setUint16(34,i,!0),v(36,"data"),h.setUint32(40,l,!0);let b=44;for(let I=0;I<o.length;I++){const m=Math.max(-1,Math.min(1,o[I])),p=m<0?m*32768:m*32767;h.setInt16(b,p,!0),b+=2}return new Blob([g],{type:"audio/wav"})}}class q{constructor(e,t,s,n={}){this.buffer=e,this.timer=t,this.timings=s,this.callbacks=n,this.keyDown=!1,this.keyDownTime=0}keyPress(){var e,t;this.keyDown||(this.keyDown=!0,this.keyDownTime=Date.now(),this.timer.clearAll(),(t=(e=this.callbacks).onKeyPress)==null||t.call(e))}keyRelease(){var e,t,s,n;if(!this.keyDown)return;this.keyDown=!1;const i=Date.now()-this.keyDownTime<this.timings.dot*2?".":"-";this.buffer.addElement(i),(t=(e=this.callbacks).onKeyRelease)==null||t.call(e,i),(n=(s=this.callbacks).onSequenceUpdate)==null||n.call(s,this.buffer.getSequence()),this.notifyBufferUpdate(),this.setupCharWordTimers()}setupCharWordTimers(){this.timer.clearAll();const e=this.timings.charGap;this.timer.set("charGap",()=>{var s,n;const i=this.buffer.getSequence();if(i){const a=E.morseToText([i]);this.buffer.commitSequence(),(n=(s=this.callbacks).onCharacter)==null||n.call(s,i,a||"?"),this.notifyBufferUpdate()}},e);const t=this.timings.wordGap;this.timer.set("wordGap",()=>{var s,n,i,a;const r=this.buffer.getSequence();if(r){const o=E.morseToText([r]);this.buffer.commitSequence(),(n=(s=this.callbacks).onCharacter)==null||n.call(s,r,o||"?")}this.buffer.addWordSeparator(),(a=(i=this.callbacks).onWordSeparator)==null||a.call(i),this.notifyBufferUpdate()},t)}notifyBufferUpdate(){var e,t;const s=this.buffer.getBuffer(),n=s.trim().split(/\s+/),i=E.morseToText(n);(t=(e=this.callbacks).onBufferUpdate)==null||t.call(e,s,i)}clear(){this.buffer.clear(),this.timer.clearAll(),this.notifyBufferUpdate()}getBuffer(){return this.buffer.getBuffer()}getSequence(){return this.buffer.getSequence()}getDecoded(){const e=this.buffer.getBuffer().trim().split(/\s+/);return E.morseToText(e)}isKeyDown(){return this.keyDown}getTimerCount(){return this.timer.count()}}class j{constructor(e,t,s,n={},i={}){this.buffer=e,this.timer=t,this.timings=s,this.callbacks=n,this.leftDown=!1,this.rightDown=!1,this.sending=!1,this.lastSent=null,this.forceNextElement=null,this.squeezeDetected=!1,this.isSqueezing=!1,this.iambicMode=i.iambicMode||"A",this.paddleLayout=i.paddleLayout||"normal"}leftPaddlePress(){if(this.leftDown=!0,this.updateSqueezeState(),this.iambicMode==="B"&&this.sending&&this.rightDown){const e=this.paddleLayout==="reversed"?"-":".";this.forceNextElement=e,this.squeezeDetected=!0}if(!this.sending){const e=this.paddleLayout==="reversed"?"-":".";this.sendPaddleElement(e)}}rightPaddlePress(){if(this.rightDown=!0,this.updateSqueezeState(),this.iambicMode==="B"&&this.sending&&this.leftDown){const e=this.paddleLayout==="reversed"?".":"-";this.forceNextElement=e,this.squeezeDetected=!0}if(!this.sending){const e=this.paddleLayout==="reversed"?".":"-";this.sendPaddleElement(e)}}leftPaddleRelease(){this.leftDown=!1,this.updateSqueezeState()}rightPaddleRelease(){this.rightDown=!1,this.updateSqueezeState()}sendPaddleElement(e){var t,s,n,i;if(this.sending)return;this.sending=!0,this.timer.clearAll(),this.leftDown&&this.rightDown||(this.squeezeDetected=!1);const a=e==="."?this.timings.dot:this.timings.dash;(s=(t=this.callbacks).onElementStart)==null||s.call(t,e,a),this.buffer.addElement(e),this.lastSent=e,(i=(n=this.callbacks).onSequenceUpdate)==null||i.call(n,this.buffer.getSequence()),this.notifyBufferUpdate(),this.timer.set("iambicCheck",()=>{const r=this.leftDown&&this.rightDown;this.iambicMode==="B"&&this.squeezeDetected&&!this.forceNextElement&&(this.forceNextElement=e==="."?"-":"."),r&&!this.forceNextElement&&(this.forceNextElement=e==="."?"-":".")},Math.max(0,a-5)),this.timer.set("elementEnd",()=>{var r,o;this.sending=!1,(o=(r=this.callbacks).onElementEnd)==null||o.call(r,e),this.forceNextElement?this.scheduleNext():this.leftDown||this.rightDown?this.scheduleNext():this.setupCharWordTimers()},a+this.timings.dot)}scheduleNext(){if(this.forceNextElement){const e=this.forceNextElement;this.forceNextElement=null,this.sendPaddleElement(e)}else if(this.leftDown&&this.rightDown){const e=this.lastSent==="."?"-":".";this.sendPaddleElement(e)}else if(this.leftDown){const e=this.paddleLayout==="reversed"?"-":".";this.sendPaddleElement(e)}else if(this.rightDown){const e=this.paddleLayout==="reversed"?".":"-";this.sendPaddleElement(e)}}setupCharWordTimers(){this.timer.clearAll(),this.timer.set("charGap",()=>{var e,t;const s=this.buffer.getSequence();if(s){const n=E.morseToText([s]);this.buffer.commitSequence(),(t=(e=this.callbacks).onCharacter)==null||t.call(e,s,n||"?"),this.notifyBufferUpdate()}},this.timings.charGap),this.timer.set("wordGap",()=>{var e,t,s,n;const i=this.buffer.getSequence();if(i){const a=E.morseToText([i]);this.buffer.commitSequence(),(t=(e=this.callbacks).onCharacter)==null||t.call(e,i,a||"?")}this.buffer.addWordSeparator(),(n=(s=this.callbacks).onWordSeparator)==null||n.call(s),this.notifyBufferUpdate()},this.timings.wordGap)}updateSqueezeState(){var e,t;const s=this.leftDown&&this.rightDown;this.isSqueezing!==s&&(this.isSqueezing=s,(t=(e=this.callbacks).onSqueezeChange)==null||t.call(e,s))}notifyBufferUpdate(){var e,t;const s=this.buffer.getBuffer(),n=s.trim().split(/\s+/),i=E.morseToText(n);(t=(e=this.callbacks).onBufferUpdate)==null||t.call(e,s,i)}clear(){this.buffer.clear(),this.timer.clearAll(),this.sending=!1,this.forceNextElement=null,this.squeezeDetected=!1,this.lastSent=null,this.notifyBufferUpdate()}getBuffer(){return this.buffer.getBuffer()}getSequence(){return this.buffer.getSequence()}getDecoded(){const e=this.buffer.getBuffer().trim().split(/\s+/);return E.morseToText(e)}isLeftPaddleDown(){return this.leftDown}isRightPaddleDown(){return this.rightDown}isSending(){return this.sending}isSqueezingNow(){return this.isSqueezing}setIambicMode(e){this.iambicMode=e}setPaddleLayout(e){this.paddleLayout=e}getIambicMode(){return this.iambicMode}getPaddleLayout(){return this.paddleLayout}}const $=["K","M","U","R","E","S","N","A","P","T","L","W","I",".","J","Z","=","F","O","Y",",","V","G","5","/","Q","9","2","H","3","8","B","?","4","7","C","1","D","6","0","X"];class S{constructor(e=1){this.currentLesson=1,this.currentLesson=Math.max(1,Math.min(40,e))}static getCharsForLesson(e){const t=Math.max(1,Math.min(40,e));return $.slice(0,t+1)}static generateRandomGroups(e,t={}){const s=t.groupSize||5,n=t.duration||60,i=t.wpm||20,a=Math.floor(n*i/(s*5)),r=[];for(let o=0;o<a;o++){let l="";for(let d=0;d<s;d++){const g=e[Math.floor(Math.random()*e.length)];l+=g}r.push(l)}return r}static generateCustomGroups(e,t={}){const s=Array.from(e);if(s.length<2)throw new Error("文字セットには最低2文字必要です");return S.generateRandomGroups(s,t)}static calculateAccuracy(e,t){if(!t)return 0;const s=e.replace(/\s/g,""),n=t.replace(/\s/g,""),i=Math.max(s.length,n.length);if(i===0)return 0;let a=0;for(let r=0;r<i;r++)s[r]===n[r]&&a++;return a/i*100}static isPassed(e){return e>=90}getCurrentLesson(){return this.currentLesson}setCurrentLesson(e){this.currentLesson=Math.max(1,Math.min(40,e))}getCurrentChars(){return S.getCharsForLesson(this.currentLesson)}generatePractice(e={}){const t=this.getCurrentChars();return S.generateRandomGroups(t,e)}advanceLesson(){return this.currentLesson<40&&this.currentLesson++,this.currentLesson}previousLesson(){return this.currentLesson>1&&this.currentLesson--,this.currentLesson}isLastLesson(){return this.currentLesson===40}isFirstLesson(){return this.currentLesson===1}static getTotalLessons(){return 40}static getTotalChars(){return $.length}static getAllChars(){return[...$]}}//! 日本の都市名（ローマ字）。
const D=["TOKYO","OSAKA","KYOTO","NAGOYA","YOKOHAMA","KOBE","FUKUOKA","SAPPORO","SENDAI","HIROSHIMA","KAWASAKI","SAITAMA","CHIBA","KITAKYUSHU","SAKAI","NIIGATA","HAMAMATSU","KUMAMOTO","OKAYAMA","SAGAMIHARA","SHIZUOKA","KAGOSHIMA","MATSUYAMA","GIFU","UTSUNOMIYA","KANAZAWA","TOYAMA","NARA","NAGASAKI","OITA","KOCHI","MIYAZAKI","NAHA","WAKAYAMA","AOMORI","AKITA","FUKUSHIMA","MORIOKA","MAEBASHI","KOFU","MATSUMOTO","TOYOHASHI","FUKUI","OTSU","TSU","YOKKAICHI","MATSUE","TOTTORI","YAMAGUCHI","TOKUSHIMA","TAKAMATSU","MITO","KORIYAMA","IWAKI","TAKASAKI","HACHIOJI","MACHIDA","KURASHIKI","HIMEJI","NISHINOMIYA","AMAGASAKI","TAKATSUKI","TOYONAKA","SUITA","KAWAGUCHI","FUNABASHI","HAKODATE","ASAHIKAWA","OTARU","KUSHIRO","OBIHIRO","TOMAKOMAI","IWAMIZAWA","HACHINOHE","HIROSAKI","ISHINOMAKI","YAMAGATA","TSURUOKA","YONEZAWA","HITACHI","TSUKUBA","KASUKABE","KAWAGOE","TOKOROZAWA","AGEO","FUCHU","CHOFU","HINO","KOKUBUNJI","ATSUGI","ODAWARA","HIRATSUKA","FUJISAWA","KAMAKURA","ZUSHI","NUMAZU","FUJI","MISHIMA","KAKEGAWA","IWATA"];//! 名前（ファーストネーム）。
const N=["JOHN","MIKE","TOM","DAVE","BOB","BILL","JIM","JACK","FRANK","PAUL","MARK","DAN","KEN","RON","RICK","STEVE","GEORGE","PETE","RAY","AL","FRED","JEFF","GARY","LARRY","DOUG","DENNIS","RANDY","SCOTT","BRIAN","BRUCE","ERIC","KEVIN","CRAIG","GLENN","GREG","WAYNE","CARL","TONY","KEITH","CHRIS","DONALD","EDWARD","JOSEPH","RICHARD","ROBERT","CHARLES","WILLIAM","THOMAS","JAMES","PATRICK","HENRY","HAROLD","HOWARD","WALTER","ARTHUR","ALBERT","EUGENE","RALPH","LAWRENCE","HERBERT","CLARENCE","ERNEST","WILLIE","ANDREW","SAMUEL","LOUIS","OSCAR","LEONARD","ROY","EARL","CHESTER","CLIFFORD","NORMAN","CLYDE","HOMER","STANLEY","LESTER","MORRIS","RAYMOND","LEWIS","LEON","EDDIE","CHARLIE","FLOYD","FRED","MARTIN","MELVIN","MARVIN","IRVING","HARVEY","SAM","MAX","MACK","JOE","ABE","HARRY","NED","GUS","BERT","EARL"];//! CW用無線機のリスト。
const F=["FT-991A","FT-891","FT-857D","FT-450D","FT-101ES","IC-7300","IC-7610","IC-9700","IC-705","IC-718","TS-590SG","TS-590S","TS-480SAT","TS-850S","TS-2000"];//! RSTレポートのリスト。
const H=["599","589","579","569","559","449","339"];//! QSOのサンプルテンプレート。
const L=[{id:"qso-1",category:"qso",title:"QSO例1: CQ呼び出しから終了まで",content:"CQ CQ CQ DE JF2SDR JF2SDR PSE K"},{id:"qso-2",category:"qso",title:"QSO例2: 応答",content:"JF2SDR DE JR2ZWA JR2ZWA K"},{id:"qso-3",category:"qso",title:"QSO例3: 挨拶と信号報告",content:"R JR2ZWA DE JF2SDR GM OM TNX FER UR CALL BT UR RST IS 599 599 BT MI QTH IS NAGOYA NAGOYA CITY ES MI NAME IS SHIN SHIN HW ? AR JF2SDR DE JF2SDR KN"},{id:"qso-4",category:"qso",title:"QSO例4: 返信と自己紹介",content:"R JF2SDR DE JR2ZWA GM DR SHIN OM TKS FER FB RPT 599 FM NAGOYA BT UR RST ALSO 599 599 VY FB MI QTH IS GIFU GIFU CITY BT NAME IS HIRO HIRO HW? JF2SDR DE JR2ZWA KN"},{id:"qso-5",category:"qso",title:"QSO例5: リグとアンテナ情報",content:"R FB DE JF2SDR DR HIRO OM BT MI RIG IS TS-850S PWR 100W ES ANT IS 3ELE YAGI 12MH BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR JR2ZWA DE JF2SDR KN"},{id:"qso-6",category:"qso",title:"QSO例6: QSL確認と終了",content:"R JF2SDR DE JR2ZWA OK SHIN OM BT UR RIG ES ANT VY FB BT MI RIG IS FT-101ES VY OLD RIG ES ANT IS DP 8MH BT QSL VIA JARL OK SURE BT TNX FB 1ST QSO ES 73 AR JF2SDR DE JR2ZWA VA"},{id:"qso-7",category:"qso",title:"QSO例7: 最終挨拶",content:"OK HIRO SOLID CPI BT TKS FB QSO ES BEST 73 AR JR2ZWA DE JF2SDR VA TU E E"}];//! 英文100字程度のサンプルテンプレート。
const M=[{id:"text100-1",category:"text100",title:"英文例1: 自己紹介",content:"MY NAME IS JOHN. I LIVE IN TOKYO JAPAN. I AM A STUDENT AT THE UNIVERSITY. I ENJOY LEARNING MORSE CODE IN MY FREE TIME."},{id:"text100-2",category:"text100",title:"英文例2: 天気",content:"THE WEATHER TODAY IS VERY NICE. IT IS SUNNY AND WARM. I WENT FOR A WALK IN THE PARK. MANY PEOPLE WERE ENJOYING THE SUNSHINE."},{id:"text100-3",category:"text100",title:"英文例3: 趣味",content:"I HAVE MANY HOBBIES. I LIKE READING BOOKS AND LISTENING TO MUSIC. ON WEEKENDS I PLAY TENNIS WITH MY FRIENDS. WE HAVE A LOT OF FUN."}];//! 英文200字程度のサンプルテンプレート。
const R=[{id:"text200-1",category:"text200",title:"英文例1: アマチュア無線の歴史",content:"AMATEUR RADIO HAS A LONG AND RICH HISTORY. IT BEGAN IN THE EARLY TWENTIETH CENTURY WHEN ENTHUSIASTS STARTED EXPERIMENTING WITH RADIO WAVES. MORSE CODE WAS THE PRIMARY MODE OF COMMUNICATION. TODAY AMATEUR RADIO CONTINUES TO BE A POPULAR HOBBY AROUND THE WORLD. OPERATORS USE VARIOUS MODES INCLUDING CW SSB AND DIGITAL MODES. IT IS A GREAT WAY TO MAKE FRIENDS AND LEARN ABOUT TECHNOLOGY."},{id:"text200-2",category:"text200",title:"英文例2: 旅行の思い出",content:"LAST SUMMER I WENT ON A TRIP TO KYOTO. IT WAS MY FIRST TIME VISITING THE ANCIENT CAPITAL OF JAPAN. I VISITED MANY FAMOUS TEMPLES AND SHRINES. THE ARCHITECTURE WAS BEAUTIFUL AND THE GARDENS WERE PEACEFUL. I ALSO ENJOYED TRYING LOCAL FOODS LIKE TOFU AND GREEN TEA. THE PEOPLE WERE VERY FRIENDLY AND HELPFUL. I TOOK MANY PHOTOS TO REMEMBER THIS WONDERFUL EXPERIENCE. I HOPE TO RETURN SOMEDAY."}];//! 英文300字程度のサンプルテンプレート。
const k=[{id:"text300-1",category:"text300",title:"英文例1: モールス符号の学習",content:"LEARNING MORSE CODE IS A REWARDING EXPERIENCE. AT FIRST IT MAY SEEM DIFFICULT BUT WITH REGULAR PRACTICE IT BECOMES EASIER. THE KOCH METHOD IS ONE OF THE MOST EFFECTIVE WAYS TO LEARN. IT STARTS WITH JUST TWO CHARACTERS AND GRADUALLY ADDS MORE. THIS APPROACH HELPS YOU LEARN AT A STEADY PACE. LISTENING PRACTICE IS ALSO VERY IMPORTANT. YOU SHOULD TRY TO COPY REAL MORSE CODE TRANSMISSIONS. MANY ONLINE RESOURCES ARE AVAILABLE TO HELP YOU PRACTICE. JOINING AN AMATEUR RADIO CLUB CAN ALSO BE BENEFICIAL. YOU CAN MEET OTHER ENTHUSIASTS AND SHARE EXPERIENCES. WITH DEDICATION AND PATIENCE YOU WILL MASTER MORSE CODE AND ENJOY USING IT IN YOUR RADIO COMMUNICATIONS."},{id:"text300-2",category:"text300",title:"英文例2: 無線交信の楽しみ",content:"AMATEUR RADIO OFFERS MANY EXCITING OPPORTUNITIES. ONE OF THE GREATEST JOYS IS MAKING CONTACT WITH STATIONS AROUND THE WORLD. YOU CAN TALK TO PEOPLE FROM DIFFERENT COUNTRIES AND CULTURES. EACH CONTACT IS UNIQUE AND SPECIAL. SOME OPERATORS ENJOY CONTESTS WHERE THEY TRY TO MAKE AS MANY CONTACTS AS POSSIBLE. OTHERS PREFER RELAXED CONVERSATIONS ABOUT HOBBIES AND DAILY LIFE. DX CONTACTS WITH DISTANT STATIONS ARE PARTICULARLY THRILLING. THE THRILL OF HEARING A WEAK SIGNAL FROM FAR AWAY IS UNFORGETTABLE. OPERATING PORTABLE FROM MOUNTAINTOPS OR PARKS IS ALSO FUN. YOU CAN COMBINE YOUR LOVE OF RADIO WITH OUTDOOR ACTIVITIES. AMATEUR RADIO IS MORE THAN A HOBBY IT IS A LIFELONG PASSION."}];class B{static generateCallsign(){const e=["JA","JE","JF","JH","JI","JJ","JK","JL","JM","JN","JO","JP","JQ","JR"],t=e[Math.floor(Math.random()*e.length)],s=Math.floor(Math.random()*10),n=String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26));return`${t}${s}${n}`}static randomChoice(e){return e[Math.floor(Math.random()*e.length)]}static generateRandomQSO(){const e=this.generateCallsign(),t=this.generateCallsign(),s=this.randomChoice(D),n=this.randomChoice(D),i=this.randomChoice(N),a=this.randomChoice(N),r=this.randomChoice(H),o=this.randomChoice(H),l=this.randomChoice(F),d=this.randomChoice(F),g=this.randomChoice(["GM","GA","GE","GN"]),h=`CQ CQ CQ DE ${e} ${e} PSE K BT ${e} DE ${t} ${t} K BT R ${t} DE ${e} ${g} OM TNX FER UR CALL BT UR RST IS ${o} ${o} BT MI QTH IS ${s} ${s} ES MI NAME IS ${i} ${i} HW ? AR ${e} DE ${e} KN BT R ${e} DE ${t} ${g} DR ${i} OM TKS FER FB RPT ${o} FM ${s} BT UR RST ALSO ${r} ${r} VY FB MI QTH IS ${n} ${n} BT NAME IS ${a} ${a} HW? ${e} DE ${t} KN BT R FB DE ${e} DR ${a} OM BT MI RIG IS ${l} PWR 100W BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR ${t} DE ${e} KN BT R ${e} DE ${t} OK ${i} OM BT UR RIG ${l} VY FB BT MI RIG IS ${d} BT QSL VIA JARL OK SURE BT TNX FB QSO ES 73 AR ${e} DE ${t} VA BT OK ${a} SOLID CPI BT TKS FB QSO ES BEST 73 AR ${t} DE ${e} VA TU E E`;return{id:`qso-random-${Date.now()}`,category:"qso",title:"ランダムQSO",content:h}}static getBuiltinTemplates(e){if(!e)return[...L,...M,...R,...k];switch(e){case"qso":return[...L];case"text100":return[...M];case"text200":return[...R];case"text300":return[...k];default:return[]}}static getTemplateById(e){return this.getBuiltinTemplates().find(t=>t.id===e)}static calculateAccuracy(e,t){if(!t)return 0;//! 空白を除去して大文字化して比較。
const s=e.replace(/\s/g,"").toUpperCase(),n=t.replace(/\s/g,"").toUpperCase(),i=Math.max(s.length,n.length);if(i===0)return 0;let a=0;for(let r=0;r<i;r++)s[r]===n[r]&&a++;return Math.round(a/i*100)}static isPassed(e,t=90){return e>=t}static getTemplateCounts(){return{qso:L.length,text100:M.length,text200:R.length,text300:k.length}}static getTotalTemplateCount(){return L.length+M.length+R.length+k.length}}class f{static shuffleCards(e){const t=[...e];for(let s=t.length-1;s>0;s--){const n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}static generateExamQuestions(e,t,s){if(e.length===0)return[];const n=Math.min(s,e.length);return this.shuffleCards(e).slice(0,n).map(i=>this.createQuestion(i,e,t))}static createQuestion(e,t,s){//! 正解以外のエントリーから3つ選ぶ。
const n=t.filter(r=>r.abbreviation!==e.abbreviation).sort(()=>Math.random()-.5).slice(0,3);let i,a;switch(s){case"abbr-to-meaning":case"morse-to-meaning":i=`${e.english} / ${e.japanese}`,a=[i,...n.map(r=>`${r.english} / ${r.japanese}`)];break;case"meaning-to-abbr":case"morse-to-abbr":i=e.abbreviation,a=[i,...n.map(r=>r.abbreviation)];break}//! 選択肢をシャッフル。
return a=a.sort(()=>Math.random()-.5),{type:s,entry:e,choices:a,correctAnswer:i}}static checkAnswer(e,t){return t===e.correctAnswer}static calculateScore(e){const t=e.length,s=e.filter(i=>i.isCorrect).length,n=t>0?Math.round(s/t*100):0;return{correct:s,total:t,percentage:n}}static isPassed(e,t=80){return e>=t}static getWrongAnswers(e){return e.filter(t=>!t.isCorrect).map(t=>t.question.entry)}static getCorrectAnswers(e){return e.filter(t=>t.isCorrect).map(t=>t.question.entry)}static filterByTags(e,t){return t.size===0?e:e.filter(s=>{const n=s.tags.split(",").map(i=>i.trim());return Array.from(t).some(i=>n.includes(i))})}static filterByFrequencies(e,t){return t.size===0?e:e.filter(s=>t.has(s.frequency))}static filterByQuery(e,t){if(!t.trim())return e;const s=t.toLowerCase();return e.filter(n=>n.abbreviation.toLowerCase().includes(s)||n.english.toLowerCase().includes(s)||n.japanese.includes(t)||n.tags.toLowerCase().includes(s))}static getAllTags(e){const t=new Set;return e.forEach(s=>{s.tags.split(",").forEach(n=>{const i=n.trim();i&&t.add(i)})}),Array.from(t).sort()}static sortByAbbreviation(e,t=!0){const s=[...e];return s.sort((n,i)=>{const a=n.abbreviation.localeCompare(i.abbreviation);return t?a:-a}),s}static sortByFrequency(e,t=!1){const s=[...e];return s.sort((n,i)=>{const a=n.frequency-i.frequency;return t?a:-a}),s}static sortByEnglish(e,t=!0){const s=[...e];return s.sort((n,i)=>{const a=n.english.localeCompare(i.english);return t?a:-a}),s}static sortByJapanese(e,t=!0){const s=[...e];return s.sort((n,i)=>{const a=n.japanese.localeCompare(i.japanese,"ja");return t?a:-a}),s}static sortByTags(e,t=!0){const s=[...e];return s.sort((n,i)=>{const a=n.tags.localeCompare(i.tags);return t?a:-a}),s}}const Q=class{static saveProgress(e){try{const t={known:Array.from(e.known),unknown:Array.from(e.unknown)};localStorage.setItem(`${this.STORAGE_PREFIX}progress`,JSON.stringify(t))}catch(t){console.error("進捗保存エラー:",t)}}static loadProgress(){try{const e=localStorage.getItem(`${this.STORAGE_PREFIX}progress`);if(e){const t=JSON.parse(e);return{known:new Set(t.known||[]),unknown:new Set(t.unknown||[])}}}catch(e){console.error("進捗読み込みエラー:",e)}return{known:new Set,unknown:new Set}}static clearProgress(){try{localStorage.removeItem(`${this.STORAGE_PREFIX}progress`)}catch(e){console.error("進捗クリアエラー:",e)}}static saveFilters(e){try{const t={selectedTags:Array.from(e.selectedTags),selectedFrequencies:Array.from(e.selectedFrequencies),searchQuery:e.searchQuery};localStorage.setItem(`${this.STORAGE_PREFIX}filters`,JSON.stringify(t))}catch(t){console.error("フィルター保存エラー:",t)}}static loadFilters(){try{const e=localStorage.getItem(`${this.STORAGE_PREFIX}filters`);if(e){const t=JSON.parse(e);return{selectedTags:new Set(t.selectedTags||[]),selectedFrequencies:new Set(t.selectedFrequencies||[5]),searchQuery:t.searchQuery||""}}}catch(e){console.error("フィルター読み込みエラー:",e)}return{selectedTags:new Set,selectedFrequencies:new Set([5]),searchQuery:""}}static saveViewState(e){try{localStorage.setItem(`${this.STORAGE_PREFIX}viewState`,JSON.stringify(e))}catch(t){console.error("ビュー状態保存エラー:",t)}}static loadViewState(){try{const e=localStorage.getItem(`${this.STORAGE_PREFIX}viewState`);if(e)return JSON.parse(e)}catch(e){console.error("ビュー状態読み込みエラー:",e)}return{viewMode:"browse",displayMode:"card",sortColumn:"abbreviation",sortDirection:"asc",learnQuestionType:"abbr-to-meaning",examQuestionType:"abbr-to-meaning"}}static saveViewMode(e){const t=this.loadViewState();t.viewMode=e,this.saveViewState(t)}static saveDisplayMode(e){const t=this.loadViewState();t.displayMode=e,this.saveViewState(t)}static saveLearnQuestionType(e){const t=this.loadViewState();t.learnQuestionType=e,this.saveViewState(t)}static saveExamQuestionType(e){const t=this.loadViewState();t.examQuestionType=e,this.saveViewState(t)}static saveSortState(e,t){const s=this.loadViewState();s.sortColumn=e,s.sortDirection=t,this.saveViewState(s)}};Q.STORAGE_PREFIX="v10.flashcard.";let y=Q;//! 画面の種類。
//! 入力タイプ。
//! 設定項目の定義。
//! 設定値の型。
//! モーダルのコールバック関数。
class C{constructor(e,t,s,n){c(this,"modalId");c(this,"items");c(this,"callbacks");c(this,"currentValues");c(this,"initialValues");this.modalId=e,this.items=t,this.currentValues={...s},this.initialValues={...s},this.callbacks=n}show(e){//! この画面用の設定項目をフィルタリングして優先度順にソート。
const t=this.items.filter(n=>n.screens.includes(e)).sort((n,i)=>n.priority-i.priority);//! モーダルのHTMLを生成。
const s=this.generateModalHTML(t);//! DOMに追加。
document.body.insertAdjacentHTML("beforeend",s);//! イベントリスナーを設定。
this.attachEventListeners(t)}generateModalHTML(e){//! FlashcardかListeningかで使い分ける。
if(this.modalId.includes("flashcard")){//! Flashcard用のモーダル（.settings-modal）。
return`
				<div class="settings-modal active" id="${this.modalId}">
					<div class="settings-content">
						<h2>設定</h2>
						<div class="settings-grid">
							${e.map(s=>this.generateSettingItemHTML(s)).join("")}
						</div>
						<div class="settings-buttons">
							<button id="${this.modalId}-cancel" class="secondary-button">キャンセル</button>
							<button id="${this.modalId}-save" class="primary-button">OK</button>
						</div>
					</div>
				</div>
			`}else{//! Listening用のモーダル（.modal）。
return`
				<div class="modal" id="${this.modalId}">
					<div class="modal-content">
						<div class="modal-header">
							<h2>設定</h2>
							<button id="${this.modalId}-close" class="close-btn">×</button>
						</div>
						<div class="modal-body">
							${e.map(s=>this.generateSettingItemHTML(s)).join("")}
						</div>
						<div class="modal-footer">
							<button id="${this.modalId}-cancel" class="btn">キャンセル</button>
							<button id="${this.modalId}-save" class="btn primary">OK</button>
						</div>
					</div>
				</div>
			`}}generateSettingItemHTML(e){const t=this.currentValues[e.key];switch(e.inputType){case"number":return`
					<div class="setting-item">
						<label for="${this.modalId}-${e.key}">${e.label}</label>
						<input type="number" id="${this.modalId}-${e.key}"
							min="${e.min}" max="${e.max}" step="${e.step||1}"
							value="${t}" data-key="${e.key}">
					</div>
				`;case"range-with-number":return`
					<div class="setting-item">
						<label for="${this.modalId}-${e.key}-range">${e.label}</label>
						<input type="range" id="${this.modalId}-${e.key}-range"
							min="${e.min}" max="${e.max}" step="${e.step||1}"
							value="${t}" data-key="${e.key}">
						<input type="number" id="${this.modalId}-${e.key}-number"
							min="${e.min}" max="${e.max}" step="${e.step||1}"
							value="${t}" data-key="${e.key}">
						${e.unit?`<span>${e.unit}</span>`:""}
					</div>
				`;case"button":return`
					<div class="setting-item">
						<span>${e.label}</span>
						<button id="${this.modalId}-${e.key}" class="${e.buttonClass||"test-button"}">${e.buttonText||"再生"}</button>
					</div>
				`;case"checkbox":return`
					<div class="setting-item">
						<label>
							<input type="checkbox" id="${this.modalId}-${e.key}"
								data-key="${e.key}" ${t?"checked":""}>
							${e.label}
						</label>
					</div>
				`;case"select":return`
					<div class="setting-item">
						<label for="${this.modalId}-${e.key}">${e.label}</label>
						<select id="${this.modalId}-${e.key}" data-key="${e.key}">
							${(e.options||[]).map(n=>`
								<option value="${n.value}" ${t===n.value?"selected":""}>${n.label}</option>
							`).join("")}
						</select>
					</div>
				`;case"keybinding":const s=typeof t=="string"?t.replace(/^Key/,""):t;return`
					<div class="setting-item">
						<label for="${this.modalId}-${e.key}">${e.label}</label>
						<input type="text" id="${this.modalId}-${e.key}" class="keybinding-input"
							value="${s}" readonly placeholder="キーを押してください" data-key="${e.key}">
						${e.hint?`<span class="key-hint">${e.hint}</span>`:""}
					</div>
				`;default:return""}}attachEventListeners(e){const t=document.getElementById(this.modalId);if(!t)return;//! 各設定項目のイベントリスナー。
e.forEach(a=>{if(a.inputType==="range-with-number"){//! レンジとナンバーの同期。
const r=document.getElementById(`${this.modalId}-${a.key}-range`),o=document.getElementById(`${this.modalId}-${a.key}-number`);r==null||r.addEventListener("input",()=>{o.value=r.value,this.currentValues[a.key]=parseFloat(r.value)}),o==null||o.addEventListener("input",()=>{r.value=o.value,this.currentValues[a.key]=parseFloat(o.value)})}else if(a.inputType==="number"){const r=document.getElementById(`${this.modalId}-${a.key}`);r==null||r.addEventListener("input",()=>{this.currentValues[a.key]=parseFloat(r.value)})}else if(a.inputType==="button"&&a.key==="testPlay"){//! テスト再生ボタン。
const r=document.getElementById(`${this.modalId}-${a.key}`);r==null||r.addEventListener("click",()=>{var o,l;(l=(o=this.callbacks).onTestPlay)==null||l.call(o)})}else if(a.inputType==="checkbox"){const r=document.getElementById(`${this.modalId}-${a.key}`);r==null||r.addEventListener("change",()=>{this.currentValues[a.key]=r.checked})}else if(a.inputType==="select"){const r=document.getElementById(`${this.modalId}-${a.key}`);r==null||r.addEventListener("change",()=>{this.currentValues[a.key]=r.value})}else if(a.inputType==="keybinding"){const r=document.getElementById(`${this.modalId}-${a.key}`);r==null||r.addEventListener("click",()=>{r.value="キーを押してください...",r.classList.add("waiting-key")}),r==null||r.addEventListener("keydown",o=>{o.preventDefault(),o.stopPropagation(),this.currentValues[a.key]=o.code,r.value=o.code.replace(/^Key/,""),r.classList.remove("waiting-key")})}});//! 保存ボタン。
const s=document.getElementById(`${this.modalId}-save`);s==null||s.addEventListener("click",()=>{this.callbacks.onSave(this.currentValues),this.close()});//! キャンセルボタン。
const n=document.getElementById(`${this.modalId}-cancel`);n==null||n.addEventListener("click",()=>{this.currentValues={...this.initialValues},this.callbacks.onCancel(),this.close()});//! 閉じるボタン（×）。
const i=document.getElementById(`${this.modalId}-close`);i==null||i.addEventListener("click",()=>{this.currentValues={...this.initialValues},this.callbacks.onCancel(),this.close()});//! モーダル外クリックで閉じる。
t.addEventListener("click",a=>{a.target===t&&(this.currentValues={...this.initialValues},this.callbacks.onCancel(),this.close())})}close(){const e=document.getElementById(this.modalId);e==null||e.remove()}}const w=[{screens:["flashcard","koch","horizontal-key","vertical-key"],priority:10,key:"volume",label:"音量",inputType:"range-with-number",min:0,max:100,step:1,unit:"%"},{screens:["flashcard","koch","horizontal-key","vertical-key"],priority:20,key:"frequency",label:"周波数 (Hz)",inputType:"number",min:400,max:1200,step:50},{screens:["flashcard","koch","horizontal-key","vertical-key"],priority:30,key:"wpm",label:"WPM (速度: 5-40)",inputType:"number",min:5,max:40,step:1},{screens:["listening"],priority:5,key:"characterSpeed",label:"文字速度 (WPM)",inputType:"number",min:5,max:40,step:1},{screens:["listening"],priority:6,key:"effectiveSpeed",label:"実効速度 (WPM)",inputType:"number",min:5,max:40,step:1},{screens:["listening"],priority:20,key:"frequency",label:"周波数 (Hz)",inputType:"number",min:400,max:1e3,step:10},{screens:["listening"],priority:10,key:"volume",label:"音量",inputType:"range-with-number",min:0,max:100,step:5,unit:"%"},{screens:["flashcard","listening"],priority:100,key:"testPlay",label:"テスト再生",inputType:"button",buttonText:"再生",buttonClass:"test-button"},{screens:["koch"],priority:5,key:"characterSpeed",label:"文字速度 (WPM: 5-40)",inputType:"number",min:5,max:40,step:1},{screens:["koch"],priority:6,key:"effectiveSpeed",label:"実効速度 (WPM: 5-40)",inputType:"number",min:5,max:40,step:1},{screens:["koch"],priority:40,key:"practiceDuration",label:"練習時間 (秒: 30-300)",inputType:"number",min:30,max:300,step:30},{screens:["koch"],priority:50,key:"groupSize",label:"グループサイズ (文字: 3-10)",inputType:"number",min:3,max:10,step:1},{screens:["koch"],priority:60,key:"showInput",label:"入力を表示",inputType:"checkbox"},{screens:["horizontal-key"],priority:40,key:"iambicMode",label:"Iambicモード",inputType:"select",options:[{value:"A",label:"Iambic A"},{value:"B",label:"Iambic B"}]},{screens:["horizontal-key"],priority:50,key:"paddleLayout",label:"パドルレイアウト",inputType:"select",options:[{value:"normal",label:"標準（左=dit / 右=dah）"},{value:"reversed",label:"反転（左=dah / 右=dit）"}]},{screens:["horizontal-key"],priority:60,key:"leftKeyCode",label:"左パドルキー",inputType:"keybinding",hint:"クリックしてキーを押す"},{screens:["horizontal-key"],priority:70,key:"rightKeyCode",label:"右パドルキー",inputType:"keybinding",hint:"クリックしてキーを押す"},{screens:["vertical-key"],priority:40,key:"keyCode",label:"キーバインド",inputType:"keybinding",hint:"クリックしてキーを押す"}];class X{constructor(){c(this,"trainer");c(this,"buffer");c(this,"timer");c(this,"audio");c(this,"isKeyPressed",!1);c(this,"keyPressHandler",null);c(this,"keyReleaseHandler",null);c(this,"updateIntervalId",null);c(this,"currentWPM",20);c(this,"keyCode","Space");//! 設定を読み込む。
const e=localStorage.getItem("verticalKeyWPM");e&&(this.currentWPM=parseInt(e,10));const t=localStorage.getItem("verticalKeyCode");t&&(this.keyCode=t);//! コアコンポーネントを初期化。
this.buffer=new G,this.timer=new V,this.audio=new T({frequency:700,volume:.5,wpm:this.currentWPM});//! タイミング計算。
const s=O.calculate(this.currentWPM);//! トレーナーを初期化（コールバックで音声制御）。
this.trainer=new q(this.buffer,this.timer,s,{onKeyPress:()=>{//! キー押下時に音を鳴らす。
this.audio.startContinuousTone()},onKeyRelease:()=>{//! キー解放時に音を止める。
this.audio.stopContinuousTone()}})}render(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
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
const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const t=document.getElementById("settings-btn");t==null||t.addEventListener("click",()=>{this.openSettingsModal()});//! クリアボタン。
const s=document.getElementById("clear-btn");s==null||s.addEventListener("click",()=>{this.trainer.clear(),this.updateDisplay()});//! キーボードイベント（設定されたキー）。
this.keyPressHandler=i=>{i.code===this.keyCode&&!i.repeat&&(i.preventDefault(),this.isKeyPressed||this.handleKeyDown())},this.keyReleaseHandler=i=>{i.code===this.keyCode&&(i.preventDefault(),this.isKeyPressed&&this.handleKeyUp())},window.addEventListener("keydown",this.keyPressHandler),window.addEventListener("keyup",this.keyReleaseHandler);//! ボタンイベント（マウス/タッチ）。
const n=document.getElementById("morse-key");if(n){//! マウスイベント。
n.addEventListener("mousedown",i=>{i.preventDefault(),this.isKeyPressed||this.handleKeyDown()}),n.addEventListener("mouseup",i=>{i.preventDefault(),this.isKeyPressed&&this.handleKeyUp()}),n.addEventListener("mouseleave",()=>{this.isKeyPressed&&this.handleKeyUp()});//! タッチイベント。
n.addEventListener("touchstart",i=>{i.preventDefault(),this.isKeyPressed||this.handleKeyDown()}),n.addEventListener("touchend",i=>{i.preventDefault(),this.isKeyPressed&&this.handleKeyUp()}),n.addEventListener("touchcancel",()=>{this.isKeyPressed&&this.handleKeyUp()})}}handleKeyDown(){this.isKeyPressed=!0,this.trainer.keyPress(),this.updateKeyStatus(!0);//! ボタンの見た目を更新。
const e=document.getElementById("morse-key");e&&e.classList.add("pressed")}handleKeyUp(){this.isKeyPressed=!1,this.trainer.keyRelease(),this.updateKeyStatus(!1);//! ボタンの見た目を更新。
const e=document.getElementById("morse-key");e&&e.classList.remove("pressed")}startUpdate(){//! 100msごとに画面を更新。
this.updateIntervalId=window.setInterval(()=>{this.updateDisplay()},100)}updateDisplay(){const e=document.getElementById("morse-buffer"),t=document.getElementById("decoded-text"),s=document.getElementById("char-count");if(e){const n=this.trainer.getBuffer(),i=this.trainer.getSequence(),a=i?`${n} ${i}`:n;e.textContent=a||"（ここにモールス符号が表示されます）"}if(t){const n=this.trainer.getDecoded();t.textContent=n||"（ここにデコードされた文字が表示されます）"}if(s){const n=this.trainer.getDecoded();s.textContent=n.length.toString()}}updateKeyStatus(e){const t=document.getElementById("key-status");if(t){const s=t.querySelector(".value");s&&(s.textContent=e?"押下中":"解放"),e?t.classList.add("active"):t.classList.remove("active")}}openSettingsModal(){//! 現在の設定値を取得。
const e={volume:Math.round(this.audio.getVolume()*100),frequency:this.audio.getFrequency(),wpm:this.currentWPM,keyCode:this.keyCode};//! 設定変更前の値を保存（キャンセル時の復元用）。
const t={volume:this.audio.getVolume(),frequency:this.audio.getFrequency(),wpm:this.currentWPM,keyCode:this.keyCode};//! SettingsModalを作成。
const s=new C("vertical-key-settings-modal",w,e,{onSave:n=>{//! 設定を保存。
this.audio.setVolume(n.volume/100),this.audio.setFrequency(n.frequency),this.audio.setWPM(n.wpm),this.currentWPM=n.wpm,this.keyCode=n.keyCode;//! localStorageに保存。
localStorage.setItem("verticalKeyWPM",this.currentWPM.toString()),localStorage.setItem("verticalKeyCode",this.keyCode);//! タイミングを再計算してトレーナーを再初期化。
const i=O.calculate(this.currentWPM);this.trainer=new q(this.buffer,this.timer,i,{onKeyPress:()=>{this.audio.startContinuousTone()},onKeyRelease:()=>{this.audio.stopContinuousTone()}});//! 現在のWPM表示を更新。
const a=document.getElementById("current-wpm");a&&(a.textContent=this.currentWPM.toString())},onCancel:()=>{//! 設定を元に戻す。
this.audio.setVolume(t.volume),this.audio.setFrequency(t.frequency),this.audio.setWPM(t.wpm),this.currentWPM=t.wpm,this.keyCode=t.keyCode}});//! モーダルを表示。
s.show("vertical-key")}destroy(){//! イベントリスナーを削除。
this.keyPressHandler&&(window.removeEventListener("keydown",this.keyPressHandler),this.keyPressHandler=null),this.keyReleaseHandler&&(window.removeEventListener("keyup",this.keyReleaseHandler),this.keyReleaseHandler=null);//! 定期更新を停止。
this.updateIntervalId!==null&&(clearInterval(this.updateIntervalId),this.updateIntervalId=null);//! 音声を停止。
this.audio.stopContinuousTone();//! トレーナーをクリア。
this.trainer.clear()}}class Z{constructor(){c(this,"trainer");c(this,"buffer");c(this,"timer");c(this,"audio");c(this,"leftPressed",!1);c(this,"rightPressed",!1);c(this,"updateIntervalId",null);c(this,"currentWPM",20);c(this,"iambicMode","B");c(this,"paddleLayout","normal");c(this,"leftKeyCode","KeyJ");c(this,"rightKeyCode","KeyK");c(this,"keyPressHandler",null);c(this,"keyReleaseHandler",null);//! 設定を読み込む。
const e=localStorage.getItem("horizontalKeyWPM");e&&(this.currentWPM=parseInt(e,10));const t=localStorage.getItem("horizontalKeyIambicMode");(t==="A"||t==="B")&&(this.iambicMode=t);const s=localStorage.getItem("horizontalKeyPaddleLayout");(s==="normal"||s==="reversed")&&(this.paddleLayout=s);const n=localStorage.getItem("horizontalKeyLeftCode");n&&(this.leftKeyCode=n);const i=localStorage.getItem("horizontalKeyRightCode");i&&(this.rightKeyCode=i);//! コアコンポーネントを初期化。
this.buffer=new G,this.timer=new V,this.audio=new T({frequency:700,volume:.5,wpm:this.currentWPM});//! トレーナーを初期化。
this.initializeTrainer()}initializeTrainer(){const e=O.calculate(this.currentWPM);this.trainer=new j(this.buffer,this.timer,e,{onElementStart:(t,s)=>{//! 要素送信開始時に指定時間だけ音を鳴らす。
this.audio.scheduleTone(0,s)}},{iambicMode:this.iambicMode,paddleLayout:this.paddleLayout})}render(){const e=document.getElementById("app");if(!e)return;e.innerHTML=`
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
const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const t=document.getElementById("settings-btn");t==null||t.addEventListener("click",()=>{this.openSettingsModal()});//! クリアボタン。
const s=document.getElementById("clear-btn");s==null||s.addEventListener("click",()=>{this.trainer.clear(),this.updateDisplay()});//! キーボードイベント（設定されたキー）。
this.keyPressHandler=a=>{a.repeat||(a.code===this.leftKeyCode?(a.preventDefault(),this.handleLeftPaddlePress()):a.code===this.rightKeyCode&&(a.preventDefault(),this.handleRightPaddlePress()))},this.keyReleaseHandler=a=>{a.code===this.leftKeyCode?(a.preventDefault(),this.handleLeftPaddleRelease()):a.code===this.rightKeyCode&&(a.preventDefault(),this.handleRightPaddleRelease())},window.addEventListener("keydown",this.keyPressHandler),window.addEventListener("keyup",this.keyReleaseHandler);//! ボタンイベント（左パドル）。
const n=document.getElementById("left-paddle");n&&(n.addEventListener("mousedown",a=>{a.preventDefault(),this.handleLeftPaddlePress()}),n.addEventListener("mouseup",a=>{a.preventDefault(),this.handleLeftPaddleRelease()}),n.addEventListener("mouseleave",()=>{this.leftPressed&&this.handleLeftPaddleRelease()}),n.addEventListener("touchstart",a=>{a.preventDefault(),this.handleLeftPaddlePress()}),n.addEventListener("touchend",a=>{a.preventDefault(),this.handleLeftPaddleRelease()}),n.addEventListener("touchcancel",()=>{this.leftPressed&&this.handleLeftPaddleRelease()}));//! ボタンイベント（右パドル）。
const i=document.getElementById("right-paddle");i&&(i.addEventListener("mousedown",a=>{a.preventDefault(),this.handleRightPaddlePress()}),i.addEventListener("mouseup",a=>{a.preventDefault(),this.handleRightPaddleRelease()}),i.addEventListener("mouseleave",()=>{this.rightPressed&&this.handleRightPaddleRelease()}),i.addEventListener("touchstart",a=>{a.preventDefault(),this.handleRightPaddlePress()}),i.addEventListener("touchend",a=>{a.preventDefault(),this.handleRightPaddleRelease()}),i.addEventListener("touchcancel",()=>{this.rightPressed&&this.handleRightPaddleRelease()}))}handleLeftPaddlePress(){if(this.leftPressed)return;this.leftPressed=!0,this.trainer.leftPaddlePress();const e=document.getElementById("left-paddle");e&&e.classList.add("pressed")}handleLeftPaddleRelease(){if(!this.leftPressed)return;this.leftPressed=!1,this.trainer.leftPaddleRelease();const e=document.getElementById("left-paddle");e&&e.classList.remove("pressed")}handleRightPaddlePress(){if(this.rightPressed)return;this.rightPressed=!0,this.trainer.rightPaddlePress();const e=document.getElementById("right-paddle");e&&e.classList.add("pressed")}handleRightPaddleRelease(){if(!this.rightPressed)return;this.rightPressed=!1,this.trainer.rightPaddleRelease();const e=document.getElementById("right-paddle");e&&e.classList.remove("pressed")}updatePaddleLabels(){const e=document.getElementById("left-paddle"),t=document.getElementById("right-paddle");this.paddleLayout==="normal"?(e&&(e.className="paddle-button dit",e.innerHTML=`
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">J キー</span>
				`),t&&(t.className="paddle-button dah",t.innerHTML=`
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">K キー</span>
				`)):(e&&(e.className="paddle-button dah",e.innerHTML=`
					DAH
					<span class="paddle-label">(長点)</span>
					<span class="paddle-key">J キー</span>
				`),t&&(t.className="paddle-button dit",t.innerHTML=`
					DIT
					<span class="paddle-label">(短点)</span>
					<span class="paddle-key">K キー</span>
				`));//! イベントリスナーを再設定。
this.attachEventListeners()}startUpdate(){//! 100msごとに画面を更新。
this.updateIntervalId=window.setInterval(()=>{this.updateDisplay()},100)}updateDisplay(){const e=document.getElementById("morse-buffer"),t=document.getElementById("decoded-text"),s=document.getElementById("char-count");if(e){const n=this.trainer.getBuffer(),i=this.trainer.getSequence(),a=i?`${n} ${i}`:n;e.textContent=a||"（ここにモールス符号が表示されます）"}if(t){const n=this.trainer.getDecoded();t.textContent=n||"（ここにデコードされた文字が表示されます）"}if(s){const n=this.trainer.getDecoded();s.textContent=n.length.toString()}}openSettingsModal(){//! 現在の設定値を取得。
const e={volume:Math.round(this.audio.getVolume()*100),frequency:this.audio.getFrequency(),wpm:this.currentWPM,iambicMode:this.iambicMode,paddleLayout:this.paddleLayout,leftKeyCode:this.leftKeyCode,rightKeyCode:this.rightKeyCode};//! 設定変更前の値を保存（キャンセル時の復元用）。
const t={volume:this.audio.getVolume(),frequency:this.audio.getFrequency(),wpm:this.currentWPM,iambicMode:this.iambicMode,paddleLayout:this.paddleLayout,leftKeyCode:this.leftKeyCode,rightKeyCode:this.rightKeyCode};//! SettingsModalを作成。
const s=new C("horizontal-key-settings-modal",w,e,{onSave:n=>{//! 設定を保存。
this.audio.setVolume(n.volume/100),this.audio.setFrequency(n.frequency),this.audio.setWPM(n.wpm),this.currentWPM=n.wpm,this.iambicMode=n.iambicMode,this.paddleLayout=n.paddleLayout,this.leftKeyCode=n.leftKeyCode,this.rightKeyCode=n.rightKeyCode;//! localStorageに保存。
localStorage.setItem("horizontalKeyWPM",this.currentWPM.toString()),localStorage.setItem("horizontalKeyIambicMode",this.iambicMode),localStorage.setItem("horizontalKeyPaddleLayout",this.paddleLayout),localStorage.setItem("horizontalKeyLeftCode",this.leftKeyCode),localStorage.setItem("horizontalKeyRightCode",this.rightKeyCode);//! 現在のWPM表示を更新。
const i=document.getElementById("current-wpm");i&&(i.textContent=this.currentWPM.toString());//! 現在のIambicモード表示を更新。
const a=document.getElementById("current-iambic-mode");a&&(a.textContent=this.iambicMode);//! パドルレイアウトに応じてラベルを更新。
this.updatePaddleLabels();//! トレーナーを再初期化。
this.initializeTrainer()},onCancel:()=>{//! 設定を元に戻す。
this.audio.setVolume(t.volume),this.audio.setFrequency(t.frequency),this.audio.setWPM(t.wpm),this.currentWPM=t.wpm,this.iambicMode=t.iambicMode,this.paddleLayout=t.paddleLayout,this.leftKeyCode=t.leftKeyCode,this.rightKeyCode=t.rightKeyCode}});//! モーダルを表示。
s.show("horizontal-key")}destroy(){//! イベントリスナーを削除。
this.keyPressHandler&&(window.removeEventListener("keydown",this.keyPressHandler),this.keyPressHandler=null),this.keyReleaseHandler&&(window.removeEventListener("keyup",this.keyReleaseHandler),this.keyReleaseHandler=null);//! 定期更新を停止。
this.updateIntervalId!==null&&(clearInterval(this.updateIntervalId),this.updateIntervalId=null);//! トレーナーをクリア。
this.trainer.clear()}}async function _(u){//! TSVファイルを取得。
const e=await fetch(u);if(!e.ok)throw new Error(`Failed to load flashcard data: ${e.statusText}`);const t=await e.text();return ee(t)}function ee(u){//! 行に分割。
const e=u.split(`
`).filter(s=>s.trim());if(e.length===0)return[];//! 先頭行はヘッダーなのでスキップ。
return e.slice(1).map((s,n)=>{//! タブで分割。
var r,o;const i=s.split("	");//! 最低限6列（タグ、頻度、略語、英文、和訳、説明）必要。
return i.length<6?(console.warn(`Line ${n+2} has insufficient columns, skipping`),null):{tags:i[0].trim(),frequency:parseInt(i[1].trim(),10)||1,abbreviation:i[2].trim(),english:i[3].trim(),japanese:i[4].trim(),description:(r=i[5])==null?void 0:r.trim(),example:(o=i[6])==null?void 0:o.trim()}}).filter(s=>s!==null)}class te{constructor(){c(this,"allEntries",[]);c(this,"filteredEntries",[]);c(this,"currentState","loading");c(this,"selectedTags",new Set);c(this,"selectedFrequencies",new Set([5]));c(this,"searchQuery","");c(this,"displayMode","card");c(this,"sortColumn","abbreviation");c(this,"sortDirection","asc");c(this,"learnQuestionType","abbr-to-meaning");c(this,"learnCards",[]);c(this,"currentLearnIndex",0);c(this,"isFlipped",!1);c(this,"reviewMode",!1);c(this,"progress",{known:new Set,unknown:new Set});c(this,"questionType","abbr-to-meaning");c(this,"questionCount",10);c(this,"questions",[]);c(this,"currentQuestionIndex",0);c(this,"results",[]);c(this,"audio");c(this,"currentlyPlaying",null);this.audio=new T({frequency:700,volume:.5,wpm:20});//! ライブラリから状態を読み込む。
this.progress=y.loadProgress();const e=y.loadFilters();this.selectedTags=e.selectedTags,this.selectedFrequencies=e.selectedFrequencies,this.searchQuery=e.searchQuery;const t=y.loadViewState();this.displayMode=t.displayMode,this.sortColumn=t.sortColumn,this.sortDirection=t.sortDirection,this.learnQuestionType=t.learnQuestionType,this.questionType=t.examQuestionType}saveProgress(){y.saveProgress(this.progress)}clearProgress(){this.progress={known:new Set,unknown:new Set},y.clearProgress()}saveFilters(){y.saveFilters({selectedTags:this.selectedTags,selectedFrequencies:this.selectedFrequencies,searchQuery:this.searchQuery})}async render(){const e=document.getElementById("app");if(e)if(this.currentState==="loading"){//! ローディング画面を表示。
e.innerHTML=`
				<div class="container">
					<header class="header">
						<h1>CW略語・Q符号学習</h1>
						<button class="back-btn">メニューに戻る</button>
					</header>
					<div class="loading-container">
						<p>フラッシュカードデータを読み込み中...</p>
					</div>
				</div>
			`;const t=document.querySelector(".back-btn");t==null||t.addEventListener("click",()=>{window.location.hash="#menu"});//! データをロード。
try{this.allEntries=await _("/flashcard.tsv"),this.updateFilteredEntries();//! データロード完了後、保存されていたviewModeを復元。
const s=y.loadViewState();this.currentState=s.viewMode,this.render()}catch(s){console.error("Failed to load flashcard data:",s),e.innerHTML=`
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
						${f.getAllTags(this.allEntries).map(t=>`
							<label class="tag-checkbox">
								<input type="checkbox" value="${t}" ${this.selectedTags.has(t)?"checked":""}>
								<span>${t}</span>
							</label>
						`).join("")}
					</div>
				</div>

				<div class="filter-group">
					<label>使用頻度で絞り込み（1=低頻度、5=高頻度）</label>
					<div class="frequency-filter" id="frequency-filter">
						${[5,4,3,2,1].map(t=>`
							<label class="frequency-checkbox">
								<input type="checkbox" value="${t}" ${this.selectedFrequencies.has(t)?"checked":""}>
								<span>★${t}</span>
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
		`}renderBrowseMode(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,this.renderEntries(),this.attachBrowseModeListeners())}renderEntries(){const e=document.getElementById("entries-section");e&&(this.displayMode==="card"?this.renderCardView(e):this.renderListView(e))}renderCardView(e){e.innerHTML=`
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
e.querySelectorAll(".entry-card").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-abbr");n&&this.playMorse(n)})});//! 表示モード切り替えボタン。
const t=document.getElementById("toggle-display-btn");t&&t.addEventListener("click",()=>{this.displayMode="list",y.saveDisplayMode(this.displayMode),this.renderEntries()})}renderListView(e){e.innerHTML=`
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
						${this.filteredEntries.map(i=>`
							<tr>
								<td class="list-abbr">
									<button class="abbr-play-btn ${this.currentlyPlaying===i.abbreviation?"playing":""}" data-abbr="${i.abbreviation}">
										${this.formatAbbreviation(i.abbreviation)}
									</button>
								</td>
								<td>${i.english}</td>
								<td>${i.japanese}</td>
								<td title="使用頻度: ${i.frequency}/5">${"★".repeat(i.frequency)}${"☆".repeat(5-i.frequency)}</td>
								<td>${i.tags}</td>
								<td>${i.description||""}</td>
								<td>${i.example||""}</td>
							</tr>
						`).join("")}
					</tbody>
				</table>
			</div>
		`;//! ソートヘッダーのイベントリスナー。
e.querySelectorAll("th.sortable").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-column");a&&this.toggleSort(a)})});//! 略語再生ボタンのイベントリスナー。
e.querySelectorAll(".abbr-play-btn").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-abbr");a&&this.playMorse(a)})});//! 表示モード切り替えボタン。
const n=document.getElementById("toggle-display-btn");n&&n.addEventListener("click",()=>{this.displayMode="card",y.saveDisplayMode(this.displayMode),this.renderEntries()})}renderLearnMode(){if(this.learnCards.length===0){//! セットアップ画面を表示。
this.renderLearnSetup()}else{//! 学習カードを表示。
this.renderLearnCard()}}renderLearnSetup(){const e=document.getElementById("app");if(!e)return;//! カード枚数を計算。
let t=this.filteredEntries.length;this.reviewMode&&(t=this.filteredEntries.filter(s=>this.progress.unknown.has(s.abbreviation)).length),e.innerHTML=`
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
							<span>学習可能: <strong>${t}</strong> 枚</span>
						</div>

						<div class="action-area">
							<button class="btn btn-large btn-primary" id="start-learn-btn" ${t===0?"disabled":""}>学習開始</button>
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
const e=document.getElementById("tag-filter");e==null||e.addEventListener("change",o=>{const l=o.target;l.type==="checkbox"&&(l.checked?this.selectedTags.add(l.value):this.selectedTags.delete(l.value),this.updateFilteredEntries(),this.renderLearnSetup())});//! 使用頻度フィルター。
const t=document.getElementById("frequency-filter");t==null||t.addEventListener("change",o=>{const l=o.target;if(l.type==="checkbox"){const d=parseInt(l.value,10);l.checked?this.selectedFrequencies.add(d):this.selectedFrequencies.delete(d),this.updateFilteredEntries(),this.renderLearnSetup()}});//! 検索。
const s=document.getElementById("learn-search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.updateFilteredEntries(),this.renderLearnSetup()});//! 復習モードボタン。
const n=document.getElementById("review-mode-btn");n==null||n.addEventListener("click",()=>{this.reviewMode=!this.reviewMode,this.renderLearnSetup()});//! 出題形式ボタン。
document.querySelectorAll(".question-type-btn").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-type");l&&(this.learnQuestionType=l,y.saveLearnQuestionType(this.learnQuestionType),this.renderLearnSetup())})});//! 学習開始ボタン。
const a=document.getElementById("start-learn-btn");a==null||a.addEventListener("click",()=>{this.startLearn()});//! 進捗リセットボタン。
const r=document.getElementById("clear-progress-btn");r==null||r.addEventListener("click",()=>{confirm("学習進捗をリセットしますか？")&&(this.clearProgress(),this.renderLearnSetup())})}startLearn(){//! フィルタリング済みのエントリーから学習カードを作成。
let e=[...this.filteredEntries];if(this.reviewMode){//! 復習モード: わからないカードのみ。
e=e.filter(t=>this.progress.unknown.has(t.abbreviation))}if(e.length===0){alert("学習可能なカードがありません。");return}//! シャッフル。
e=e.sort(()=>Math.random()-.5),this.learnCards=e,this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnCard()}renderLearnCard(){const e=document.getElementById("app");if(!e)return;const t=this.learnCards[this.currentLearnIndex],s=this.currentLearnIndex+1,n=this.learnCards.length;//! 問題と正解のコンテンツを生成。
let i="",a="";switch(this.learnQuestionType){case"abbr-to-meaning":i=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(t.abbreviation)}</div>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-text">${t.english}</div>
					<div class="card-content-text">${t.japanese}</div>
				`;break;case"meaning-to-abbr":i=`
					<div class="card-label">意味</div>
					<div class="card-content-text">${t.english}</div>
					<div class="card-content-text">${t.japanese}</div>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(t.abbreviation)}</div>
				`;break;case"morse-to-abbr":i=`
					<div class="card-label">モールス音を聞いて略語を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(t.abbreviation)}</div>
				`;break;case"morse-to-meaning":i=`
					<div class="card-label">モールス音を聞いて意味を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-abbr">${this.formatAbbreviation(t.abbreviation)}</div>
					<div class="card-content-text">${t.english}</div>
					<div class="card-content-text">${t.japanese}</div>
				`;break}//! 判定ボタンのHTML。
const r=this.progress.known.has(t.abbreviation),l=`
			<div class="judgment-controls">
				<button id="mark-unknown-btn" class="judgment-button unknown ${this.progress.unknown.has(t.abbreviation)?"active":""}">
					× わからない
				</button>
				<button id="mark-known-btn" class="judgment-button known ${r?"active":""}">
					○ わかる
				</button>
			</div>
		`;e.innerHTML=`
			<div class="container learning-view">
				<div class="learning-header">
					<button id="back-to-setup-btn" class="back-btn">← 設定に戻る</button>
					<div class="progress-indicator">${s} / ${n}</div>
				</div>

				<div class="card-container">
					<div class="flashcard ${this.isFlipped?"flipped":""}" id="flashcard">
						<div class="card-front">
							${i}
						</div>
						<div class="card-back">
							${a}
							${t.description?`<div class="card-description">${t.description}</div>`:""}
							${t.example?`<div class="card-example">例: ${t.example}</div>`:""}
							<div class="card-tags">${t.tags} / ${"★".repeat(t.frequency)}</div>
						</div>
					</div>
				</div>

				<div class="card-controls">
					<button id="flip-card-btn" class="control-button">
						${this.isFlipped?"問題に戻る":"正解を確認する"} (Space)
					</button>
				</div>

				${this.isFlipped?l:""}

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
const e=document.getElementById("back-to-setup-btn");e==null||e.addEventListener("click",()=>{this.learnCards=[],this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnSetup()});//! フリップボタン。
const t=document.getElementById("flip-card-btn");t==null||t.addEventListener("click",()=>{this.isFlipped=!this.isFlipped,this.renderLearnCard()});//! スペースキーでフリップ。
const s=l=>{l.code==="Space"&&l.target===document.body&&(l.preventDefault(),this.isFlipped=!this.isFlipped,this.renderLearnCard())};document.addEventListener("keydown",s);//! モールス再生ボタン。
const n=document.getElementById("play-morse-btn");n&&n.addEventListener("click",()=>{const l=this.learnCards[this.currentLearnIndex];this.playMorse(l.abbreviation)});//! 判定ボタン（わからない）。
const i=document.getElementById("mark-unknown-btn");i==null||i.addEventListener("click",()=>{const l=this.learnCards[this.currentLearnIndex];this.progress.unknown.add(l.abbreviation),this.progress.known.delete(l.abbreviation),this.saveProgress(),this.moveToNextCard()});//! 判定ボタン（わかる）。
const a=document.getElementById("mark-known-btn");a==null||a.addEventListener("click",()=>{const l=this.learnCards[this.currentLearnIndex];this.progress.known.add(l.abbreviation),this.progress.unknown.delete(l.abbreviation),this.saveProgress(),this.moveToNextCard()});//! 前のカードボタン。
const r=document.getElementById("prev-card-btn");r==null||r.addEventListener("click",()=>{this.currentLearnIndex>0&&(this.currentLearnIndex--,this.isFlipped=!1,this.renderLearnCard())});//! 次のカードボタン。
const o=document.getElementById("next-card-btn");o==null||o.addEventListener("click",()=>{this.currentLearnIndex<this.learnCards.length-1&&(this.currentLearnIndex++,this.isFlipped=!1,this.renderLearnCard())})}moveToNextCard(){if(this.currentLearnIndex<this.learnCards.length-1){//! 次のカードがあれば移動。
this.currentLearnIndex++,this.isFlipped=!1,this.renderLearnCard()}else{//! 最後のカードの場合は学習完了。
alert("学習完了しました！"),this.learnCards=[],this.currentLearnIndex=0,this.isFlipped=!1,this.renderLearnSetup()}}renderExamMode(){document.getElementById("app")&&(this.questions.length===0?this.renderExamSetup():this.renderExamQuestion())}renderExamSetup(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,this.attachExamSetupListeners())}renderExamQuestion(){const e=document.getElementById("app");if(!e)return;const t=this.questions[this.currentQuestionIndex],s=this.currentQuestionIndex+1,n=this.questions.length;let i="";switch(t.type){case"abbr-to-meaning":i=`次の略語の意味は？<br><strong class="question-text">${t.entry.abbreviation}</strong>`;break;case"meaning-to-abbr":i=`次の意味を表す略語は？<br><strong class="question-text">${t.entry.english} / ${t.entry.japanese}</strong>`;break;case"morse-to-abbr":i='モールス音を聞いて、対応する略語は？<br><button id="replay-morse-btn" class="btn btn-secondary">🔊 もう一度再生</button>';break;case"morse-to-meaning":i='モールス音を聞いて、対応する意味は？<br><button id="replay-morse-btn" class="btn btn-secondary">🔊 もう一度再生</button>';break}e.innerHTML=`
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 試験中</h1>
					<button class="back-btn">中断</button>
				</header>

				<div class="exam-container">
					<div class="exam-progress">
						<span>問題 <strong>${s}</strong> / ${n}</span>
					</div>

					<div class="question-area">
						<p class="question">${i}</p>
					</div>

					<div class="choices-area">
						${t.choices.map((a,r)=>`
							<button class="choice-btn" data-choice="${a}">
								${r+1}. ${a}
							</button>
						`).join("")}
					</div>
				</div>
			</div>
		`,this.attachExamQuestionListeners();//! モールス音が必要な場合は自動再生。
(t.type==="morse-to-abbr"||t.type==="morse-to-meaning")&&setTimeout(()=>this.playMorse(t.entry.abbreviation),500)}renderExamResultMode(){const e=document.getElementById("app");if(!e)return;const t=f.calculateScore(this.results),s=f.isPassed(t.percentage),n=f.getWrongAnswers(this.results);e.innerHTML=`
			<div class="container">
				<header class="header">
					<h1>CW略語・Q符号学習 - 結果</h1>
					<button class="back-btn">メニューに戻る</button>
				</header>

				<div class="result-container">
					<div class="score-area ${s?"passed":"failed"}">
						<h2>${s?"合格！":"不合格"}</h2>
						<div class="score-display">
							<span class="score-percentage">${t.percentage}%</span>
							<span class="score-detail">${t.correct} / ${t.total} 問正解</span>
						</div>
					</div>

					${n.length>0?`
						<div class="wrong-answers-section">
							<h3>間違えた問題（${n.length}件）</h3>
							<div class="wrong-answers-list">
								${this.results.filter(i=>!i.isCorrect).map(i=>`
									<div class="wrong-answer-item">
										<div class="wrong-answer-question">
											<strong>${i.question.entry.abbreviation}</strong>
											<span>${i.question.entry.english} / ${i.question.entry.japanese}</span>
										</div>
										<div class="wrong-answer-detail">
											<span class="wrong-label">あなたの回答:</span>
											<span class="wrong-user-answer">${i.userAnswer}</span>
											<span class="correct-label">正解:</span>
											<span class="correct-answer">${i.question.correctAnswer}</span>
										</div>
										${i.question.entry.description?`
											<div class="wrong-answer-description">
												${i.question.entry.description}
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
const e=document.getElementById("tag-filter");e==null||e.addEventListener("change",n=>{const i=n.target;i.type==="checkbox"&&(i.checked?this.selectedTags.add(i.value):this.selectedTags.delete(i.value),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries())});//! 使用頻度フィルター。
const t=document.getElementById("frequency-filter");t==null||t.addEventListener("change",n=>{const i=n.target;if(i.type==="checkbox"){const a=parseInt(i.value,10);i.checked?this.selectedFrequencies.add(a):this.selectedFrequencies.delete(a),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries()}});//! 検索。
const s=document.getElementById("search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount(),this.renderEntries()})}attachExamSetupListeners(){this.attachCommonListeners();//! タグフィルター。
const e=document.getElementById("tag-filter");e==null||e.addEventListener("change",r=>{const o=r.target;o.type==="checkbox"&&(o.checked?this.selectedTags.add(o.value):this.selectedTags.delete(o.value),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount())});//! 使用頻度フィルター。
const t=document.getElementById("frequency-filter");t==null||t.addEventListener("change",r=>{const o=r.target;if(o.type==="checkbox"){const l=parseInt(o.value,10);o.checked?this.selectedFrequencies.add(l):this.selectedFrequencies.delete(l),this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount()}});//! 検索。
const s=document.getElementById("search-input");s==null||s.addEventListener("input",()=>{this.searchQuery=s.value,this.saveFilters(),this.updateFilteredEntries(),this.updateFilteredCount()});//! 出題形式ボタン。
document.querySelectorAll(".question-type-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-type");o&&(this.questionType=o,y.saveExamQuestionType(this.questionType),this.renderExamSetup())})});//! 問題数ボタン。
document.querySelectorAll(".question-count-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-count");o&&(this.questionCount=o==="all"?"all":parseInt(o,10),this.renderExamSetup())})});//! 試験開始ボタン。
const a=document.getElementById("start-exam-btn");a==null||a.addEventListener("click",()=>{this.startExam()})}attachExamQuestionListeners(){//! 中断ボタン。
const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{confirm("試験を中断してメニューに戻りますか？")&&(window.location.hash="#menu")});//! モールス再生ボタン。
const t=document.getElementById("replay-morse-btn");if(t){const n=this.questions[this.currentQuestionIndex];t.addEventListener("click",()=>{this.playMorse(n.entry.abbreviation)})}//! 選択肢ボタン。
document.querySelectorAll(".choice-btn").forEach(n=>{n.addEventListener("click",i=>{const r=i.currentTarget.dataset.choice||"";this.handleAnswer(r)})})}attachResultListeners(){//! 戻るボタン。
const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! もう一度ボタン。
const t=document.getElementById("retry-btn");t==null||t.addEventListener("click",()=>{this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",this.render()});//! 設定に戻るボタン。
const s=document.getElementById("back-to-setup-btn");s==null||s.addEventListener("click",()=>{this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",this.render()})}attachCommonListeners(){//! 戻るボタン。
const e=document.querySelector(".back-btn");e==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
const t=document.getElementById("settings-btn");t==null||t.addEventListener("click",()=>{this.openSettingsModal()});//! タブ切り替え。
document.querySelectorAll(".tab-button").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-tab");i==="browse"?(this.currentState="browse",y.saveViewMode("browse"),this.render()):i==="learn"?(this.currentState="learn",y.saveViewMode("learn"),this.render()):i==="exam"&&(this.questions=[],this.results=[],this.currentQuestionIndex=0,this.currentState="exam",y.saveViewMode("exam"),this.render())})})}updateFilteredCount(){const e=document.getElementById("filtered-count");e&&(e.textContent=this.filteredEntries.length.toString());//! 問題数の最大値も更新（試験モードの場合）。
const t=document.getElementById("question-count");t&&(t.max=this.filteredEntries.length.toString(),parseInt(t.value,10)>this.filteredEntries.length&&(t.value=this.filteredEntries.length.toString(),this.questionCount=this.filteredEntries.length))}updateFilteredEntries(){let e=this.allEntries;//! タグでフィルタリング。
e=f.filterByTags(e,this.selectedTags);//! 使用頻度でフィルタリング。
e=f.filterByFrequencies(e,this.selectedFrequencies);//! 検索クエリでフィルタリング。
e=f.filterByQuery(e,this.searchQuery);//! ソート適用。
this.filteredEntries=this.sortEntries(e)}sortEntries(e){const t=this.sortDirection==="asc";switch(this.sortColumn){case"abbreviation":return f.sortByAbbreviation(e,t);case"english":return f.sortByEnglish(e,t);case"japanese":return f.sortByJapanese(e,t);case"frequency":return f.sortByFrequency(e,t);case"tags":return f.sortByTags(e,t);default:return e}}toggleSort(e){if(this.sortColumn===e){//! 同じ列なら方向を反転。
this.sortDirection=this.sortDirection==="asc"?"desc":"asc"}else{//! 異なる列なら昇順で開始。
this.sortColumn=e,this.sortDirection="asc"}//! ソート状態を保存。
y.saveSortState(this.sortColumn,this.sortDirection),this.updateFilteredEntries(),this.renderEntries()}getSortIndicator(e){return this.sortColumn!==e?"":this.sortDirection==="asc"?" ▲":" ▼"}formatAbbreviation(e){const t=e.match(/^\[([A-Z]+)\]$/);return t?`<span class="prosign">${t[1]}</span>`:e}async playMorse(e){try{//! 既に再生中の場合は停止。
if(this.currentlyPlaying===e){this.audio.stopContinuousTone(),this.currentlyPlaying=null,this.renderEntries();return}//! 別のものが再生中なら停止。
this.currentlyPlaying&&this.audio.stopContinuousTone(),this.currentlyPlaying=e,this.renderEntries();//! モールス符号に変換。
const t=E.textToMorse(e);if(t){//! シンプルな再生実装（scheduleToneを使用）。
for(const s of t)s==="."?(this.audio.scheduleTone(0,60),await new Promise(n=>setTimeout(n,120))):s==="-"?(this.audio.scheduleTone(0,180),await new Promise(n=>setTimeout(n,240))):s===" "&&await new Promise(n=>setTimeout(n,60))}this.currentlyPlaying=null,this.renderEntries()}catch(t){console.error("モールス再生エラー:",t),this.currentlyPlaying=null,this.renderEntries()}}startExam(){if(this.filteredEntries.length===0){alert("該当するエントリーがありません。フィルターを調整してください。");return}const e=this.questionCount==="all"?this.filteredEntries.length:this.questionCount,t=Math.min(e,this.filteredEntries.length);if(t===0){alert("問題数を1以上に設定してください。");return}//! 問題を生成。
this.questions=f.generateExamQuestions(this.filteredEntries,this.questionType,t),this.currentQuestionIndex=0,this.results=[],this.render()}handleAnswer(e){const t=this.questions[this.currentQuestionIndex],s=f.checkAnswer(t,e);//! 結果を記録。
this.results.push({question:t,userAnswer:e,isCorrect:s});//! 次の問題に進むか結果表示。
this.currentQuestionIndex++,this.currentQuestionIndex<this.questions.length?this.render():(this.currentState="exam-result",this.render())}openSettingsModal(){//! 現在の設定値を取得（0-100の範囲に変換）。
const e={volume:Math.round(this.audio.getVolume()*100),frequency:this.audio.getFrequency(),wpm:this.audio.getWPM()};//! 設定変更前の値を保存（キャンセル時の復元用）。
const t={volume:this.audio.getVolume(),frequency:this.audio.getFrequency(),wpm:this.audio.getWPM()};//! SettingsModalを作成。
const s=new C("flashcard-settings-modal",w,e,{onSave:n=>{//! 設定を保存。
this.audio.setVolume(n.volume/100),this.audio.setFrequency(n.frequency),this.audio.setWPM(n.wpm)},onCancel:()=>{//! 設定を元に戻す。
this.audio.setVolume(t.volume),this.audio.setFrequency(t.frequency),this.audio.setWPM(t.wpm)},onTestPlay:async()=>{//! テスト再生。
await this.playMorse("CQ")}});//! モーダルを表示。
s.show("flashcard")}destroy(){//! 音声を停止。
this.currentlyPlaying&&this.audio.stopContinuousTone()}}const K={characterSpeed:20,effectiveSpeed:15,frequency:700,volume:.7,practiceDuration:60,groupSize:5,showInput:!0};//! コッホシーケンス（41文字）。
const P=["K","M","U","R","E","S","N","A","P","T","L","W","I",".","J","Z","=","F","O","Y","V",",","G","5","/","Q","9","2","H","3","8","B","?","4","7","C","1","D","6","0","X"];class se{constructor(){c(this,"audio");c(this,"viewMode","learning");c(this,"settings",{...K});c(this,"state",{currentLesson:1,isPlaying:!1,userInput:"",correctAnswer:"",groups:[],currentGroupIndex:0});c(this,"customState",{selectedChars:new Set,isCustomRunning:!1,customUserInput:"",customCorrectAnswer:"",customGroups:[],customCurrentGroupIndex:0,customIsPlaying:!1});//! 設定を読み込む。
this.loadSettings(),this.loadProgress(),this.loadViewMode(),this.loadSelectedChars();//! AudioGeneratorを初期化。
this.audio=new T({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed})}loadSettings(){try{const e=localStorage.getItem("v10.koch.settings");e&&(this.settings={...K,...JSON.parse(e)})}catch(e){console.error("Failed to load settings:",e)}}saveSettings(){try{localStorage.setItem("v10.koch.settings",JSON.stringify(this.settings))}catch(e){console.error("Failed to save settings:",e)}}loadProgress(){try{const e=localStorage.getItem("v10.koch.currentLesson");e&&(this.state.currentLesson=parseInt(e,10))}catch(e){console.error("Failed to load progress:",e)}}saveProgress(){try{localStorage.setItem("v10.koch.currentLesson",this.state.currentLesson.toString())}catch(e){console.error("Failed to save progress:",e)}}loadViewMode(){try{const e=localStorage.getItem("v10.koch.viewMode");e&&["learning","custom"].includes(e)&&(this.viewMode=e)}catch(e){console.error("Failed to load view mode:",e)}}saveViewMode(){try{localStorage.setItem("v10.koch.viewMode",this.viewMode)}catch(e){console.error("Failed to save view mode:",e)}}loadSelectedChars(){try{const e=localStorage.getItem("v10.koch.selectedChars");if(e){const t=JSON.parse(e);this.customState.selectedChars=new Set(t)}}catch(e){console.error("Failed to load selected chars:",e)}}saveSelectedChars(){try{const e=Array.from(this.customState.selectedChars);localStorage.setItem("v10.koch.selectedChars",JSON.stringify(e))}catch(e){console.error("Failed to save selected chars:",e)}}async startLesson(){const e=S.getCharsForLesson(this.state.currentLesson),t={groupSize:this.settings.groupSize,duration:this.settings.practiceDuration,wpm:this.settings.characterSpeed};this.state.groups=S.generateRandomGroups(e,t),this.state.currentGroupIndex=0,this.state.userInput="",this.state.correctAnswer=this.state.groups.join(""),this.state.isPlaying=!1;//! AudioGeneratorの設定を更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),this.renderPractice()}async playMorse(){if(this.state.isPlaying)return;this.state.isPlaying=!0,this.state.currentGroupIndex=0,this.updateProgress(),this.updatePlaybackButtons();//! モールス信号を再生。
for(let e=0;e<this.state.groups.length&&this.state.isPlaying;e++){const t=this.state.groups[e],s=E.textToMorse(t);await this.audio.playMorseString(s+" /"),this.state.currentGroupIndex=e+1,this.updateProgress()}this.state.isPlaying=!1,this.updatePlaybackButtons(),this.state.currentGroupIndex>=this.state.groups.length&&this.showResult()}pauseMorse(){this.state.isPlaying=!1,this.audio.stopPlaying(),this.updatePlaybackButtons()}stopLesson(){this.state.isPlaying=!1,this.audio.stopPlaying(),this.render()}showResult(){var n,i;const e=this.calculateAccuracy(),t=e>=90,s=document.getElementById("resultContainer");s&&(s.innerHTML=`
			<div class="result ${t?"passed":"failed"}">
				<h2>${t?"合格！":"不合格"}</h2>
				<div class="accuracy">正答率: ${e.toFixed(1)}%</div>
				<div class="comparison">
					<div>送信: ${this.state.correctAnswer}</div>
					<div>入力: ${this.state.userInput||"（未入力）"}</div>
				</div>
				<div class="actions">
					${t?'<button class="btn primary" id="nextLessonBtn">次のレッスンへ</button>':""}
					<button class="btn" id="retryBtn">もう一度</button>
				</div>
			</div>
		`,t&&this.state.currentLesson<40&&(this.state.currentLesson++,this.saveProgress(),(n=document.getElementById("nextLessonBtn"))==null||n.addEventListener("click",()=>{this.render()})),(i=document.getElementById("retryBtn"))==null||i.addEventListener("click",()=>{this.render()}))}calculateAccuracy(){if(!this.state.userInput)return 0;const e=this.state.correctAnswer.replace(/\s/g,""),t=this.state.userInput.replace(/\s/g,""),s=Math.max(e.length,t.length);let n=0;for(let i=0;i<s;i++)e[i]===t[i]&&n++;return n/s*100}updateProgress(){const e=document.getElementById("lessonProgress"),t=document.getElementById("progressBar");if(e&&t){const s=this.state.currentGroupIndex/this.state.groups.length*100;e.textContent=`進行: ${this.state.currentGroupIndex}/${this.state.groups.length} (${s.toFixed(0)}%)`,t.style.width=`${s}%`}this.updatePlaybackButtons()}updatePlaybackButtons(){const e=document.getElementById("playBtn"),t=document.getElementById("pauseBtn");e&&t&&(this.state.isPlaying?(e.disabled=!0,t.disabled=!1):(e.disabled=!1,t.disabled=!0))}async startCustom(){const e=Array.from(this.customState.selectedChars),t={groupSize:this.settings.groupSize,duration:this.settings.practiceDuration,wpm:this.settings.characterSpeed};this.customState.customGroups=S.generateRandomGroups(e,t),this.customState.customCurrentGroupIndex=0,this.customState.customUserInput="",this.customState.customCorrectAnswer=this.customState.customGroups.join(""),this.customState.customIsPlaying=!1,this.customState.isCustomRunning=!0;//! AudioGeneratorの設定を更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed}),this.render(),this.renderCustomPractice()}async playCustomMorse(){if(this.customState.customIsPlaying)return;this.customState.customIsPlaying=!0,this.customState.customCurrentGroupIndex=0,this.updateCustomProgress(),this.updateCustomPlaybackButtons();//! モールス信号を再生。
for(let e=0;e<this.customState.customGroups.length&&this.customState.customIsPlaying;e++){const t=this.customState.customGroups[e],s=E.textToMorse(t);await this.audio.playMorseString(s+" /"),this.customState.customCurrentGroupIndex=e+1,this.updateCustomProgress()}this.customState.customIsPlaying=!1,this.updateCustomPlaybackButtons()}pauseCustomMorse(){this.customState.customIsPlaying=!1,this.audio.stopPlaying(),this.updateCustomPlaybackButtons()}stopCustom(){this.customState.customIsPlaying=!1,this.audio.stopPlaying(),this.customState.isCustomRunning=!1,this.render()}updateCustomProgress(){const e=document.getElementById("customProgress"),t=document.getElementById("customProgressBar");if(e&&t){const s=this.customState.customCurrentGroupIndex/this.customState.customGroups.length*100;e.textContent=`進行: ${this.customState.customCurrentGroupIndex}/${this.customState.customGroups.length} (${s.toFixed(0)}%)`,t.style.width=`${s}%`}this.updateCustomPlaybackButtons()}updateCustomPlaybackButtons(){const e=document.getElementById("customPlayBtn"),t=document.getElementById("customPauseBtn");e&&t&&(this.customState.customIsPlaying?(e.disabled=!0,t.disabled=!1):(e.disabled=!1,t.disabled=!0))}showCustomResult(){var r,o;const e=document.getElementById("customResultContainer");if(!e)return;const t=this.customState.customUserInput.replace(/\s+/g,""),s=this.customState.customCorrectAnswer.replace(/\s+/g,"");let n=0;const i=Math.max(t.length,s.length);for(let l=0;l<i;l++)t[l]===s[l]&&n++;const a=i>0?Math.round(n/i*100):0;e.innerHTML=`
			<div class="result">
				<h2>練習結果</h2>
				<div class="accuracy">正答率: ${a}%</div>
				<div class="comparison">
					<div>送信: ${s}</div>
					<div>あなたの入力: ${t}</div>
				</div>
				<div class="actions">
					<button id="retryCustomBtn" class="btn">もう一度</button>
					<button id="backToCustomMenuBtn" class="btn primary">戻る</button>
				</div>
			</div>
		`,(r=document.getElementById("retryCustomBtn"))==null||r.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render(),this.startCustom()}),(o=document.getElementById("backToCustomMenuBtn"))==null||o.addEventListener("click",()=>{this.customState.isCustomRunning=!1,this.render()})}showSettings(){//! 現在の設定値を取得（volumeを0-100の範囲に変換）。
const e={volume:Math.round(this.settings.volume*100),frequency:this.settings.frequency,wpm:this.settings.characterSpeed,characterSpeed:this.settings.characterSpeed,effectiveSpeed:this.settings.effectiveSpeed,practiceDuration:this.settings.practiceDuration,groupSize:this.settings.groupSize,showInput:this.settings.showInput};//! 設定変更前の値を保存（キャンセル時の復元用）。
const t={...this.settings};//! SettingsModalを作成。
const s=new C("koch-settings-modal",w,e,{onSave:n=>{//! 実効速度は文字速度を上限とする。
let i=n.effectiveSpeed;const a=n.characterSpeed;i>a&&(i=a);//! 設定を保存。
this.settings.characterSpeed=a,this.settings.effectiveSpeed=i,this.settings.frequency=n.frequency,this.settings.volume=n.volume/100,this.settings.practiceDuration=n.practiceDuration,this.settings.groupSize=n.groupSize,this.settings.showInput=n.showInput,this.saveSettings();//! AudioGeneratorを更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed});//! 練習中の場合、表示を更新。
this.state.groups.length>0&&this.renderPractice()},onCancel:()=>{//! 設定を元に戻す。
this.settings={...t},this.audio.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed})}});//! モーダルを表示。
s.show("koch")}render(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,this.attachEventListeners())}renderModeContent(){switch(this.viewMode){case"learning":return this.renderLearningMode();case"custom":return this.renderCustomMode();default:return this.renderLearningMode()}}renderLearningMode(){const e=S.getCharsForLesson(this.state.currentLesson),t=P.slice(0,40).map((s,n)=>{const i=n+1,a=S.getCharsForLesson(i),r=i===this.state.currentLesson,o=i<this.state.currentLesson;return`
				<div class="lesson-item ${r?"current":""} ${o?"passed":""}" data-lesson="${i}">
					<div class="lesson-num">L${i}</div>
					<div class="lesson-chars">${a.join("")}</div>
				</div>
			`}).join("");return`
			<div class="flashcard-container">
				<div class="lesson-info">
					<h2>レッスン ${this.state.currentLesson} / 40</h2>
					<div class="chars">学習文字: ${e.join("")}</div>
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
						${t}
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
							${P.map(t=>`
				<button class="char-select-btn ${this.customState.selectedChars.has(t)?"selected":""}" data-char="${t}">
					${t}
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
			`}}renderPractice(){var n,i,a;const e=document.getElementById("practiceContainer");if(!e)return;const t=S.getCharsForLesson(this.state.currentLesson);e.innerHTML=`
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
				${this.renderKeyboard(t)}
			</div>
		`;const s=document.getElementById("userInput");s&&s.addEventListener("input",r=>{this.state.userInput=r.target.value.toUpperCase()}),(n=document.getElementById("playBtn"))==null||n.addEventListener("click",()=>{this.playMorse()}),(i=document.getElementById("pauseBtn"))==null||i.addEventListener("click",()=>{this.pauseMorse()}),(a=document.getElementById("stopBtn"))==null||a.addEventListener("click",()=>{this.stopLesson()});//! キーボードボタンのイベント設定。
this.setupKeyboardEvents(t),this.updatePlaybackButtons()}renderCustomPractice(){const e=document.getElementById("customPracticeContainer");e&&(e.innerHTML=`
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
		`,this.setupCustomControls())}renderKeyboard(e){const t=[];//! KOCH_SEQUENCEをgroupSizeごとに分割。
for(let s=0;s<P.length;s+=this.settings.groupSize)t.push(P.slice(s,s+this.settings.groupSize));return`
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
						${t.map((s,n)=>`
							<div class="keyboard-group">
								<div class="group-label">G${n+1}</div>
								<div class="group-keys">
									${s.map(i=>{const a=e.includes(i);return`
											<button class="key-btn ${a?"":"disabled"}"
											        data-char="${i}"
											        ${a?"":"disabled"}>
												${i}
											</button>
										`}).join("")}
								</div>
							</div>
						`).join("")}
					</div>
				</div>
			</div>
		`}setupKeyboardEvents(e){var s,n;const t=document.getElementById("userInput");if(!t)return;//! 文字キー。
document.querySelectorAll(".key-btn:not(.special)").forEach(i=>{i.addEventListener("click",a=>{a.preventDefault();const r=a.target.getAttribute("data-char");r&&e.includes(r)&&(t.value+=r,this.state.userInput=t.value.toUpperCase())})});//! スペースキー。
(s=document.getElementById("spaceBtn"))==null||s.addEventListener("click",i=>{i.preventDefault(),t.value+=" ",this.state.userInput=t.value.toUpperCase()});//! バックスペースキー。
(n=document.getElementById("backspaceBtn"))==null||n.addEventListener("click",i=>{i.preventDefault(),t.value=t.value.slice(0,-1),this.state.userInput=t.value.toUpperCase()})}setupCustomControls(){//! 入力欄のイベントリスナー。
var t,s,n,i;const e=document.getElementById("customInputArea");e&&e.addEventListener("input",a=>{this.customState.customUserInput=a.target.value.toUpperCase()}),(t=document.getElementById("customPlayBtn"))==null||t.addEventListener("click",()=>{this.playCustomMorse()}),(s=document.getElementById("customPauseBtn"))==null||s.addEventListener("click",()=>{this.pauseCustomMorse()}),(n=document.getElementById("customStopBtn"))==null||n.addEventListener("click",()=>{this.stopCustom()}),(i=document.getElementById("customEndBtn"))==null||i.addEventListener("click",()=>{this.showCustomResult()}),this.updateCustomPlaybackButtons()}attachEventListeners(){//! 戻るボタン。
var e,t;(e=document.getElementById("back-btn"))==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定ボタン。
(t=document.getElementById("settings-btn"))==null||t.addEventListener("click",()=>{this.showSettings()});//! タブボタン。
document.querySelectorAll(".tab-button").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tab");n&&(this.viewMode=n,this.saveViewMode(),this.render())})});//! モード別のイベントリスナーを設定。
this.setupModeEventListeners()}setupModeEventListeners(){var e,t;if(this.viewMode==="learning"){(e=document.getElementById("startBtn"))==null||e.addEventListener("click",()=>{this.startLesson()});//! レッスンアイテムのクリックイベント。
document.querySelectorAll(".lesson-item").forEach(s=>{s.addEventListener("click",()=>{const n=parseInt(s.getAttribute("data-lesson")||"1",10);this.state.currentLesson=n,this.saveProgress(),this.render(),window.scrollTo({top:0,behavior:"smooth"})})})}else if(this.viewMode==="custom"&&!this.customState.isCustomRunning){(t=document.getElementById("startCustomBtn"))==null||t.addEventListener("click",()=>{this.startCustom()});//! 文字選択ボタン。
document.querySelectorAll(".char-select-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-char");n&&(this.customState.selectedChars.has(n)?this.customState.selectedChars.delete(n):this.customState.selectedChars.add(n),this.saveSelectedChars(),this.render())})})}}destroy(){//! 音声を停止。
this.audio.stopPlaying()}}function ne(u,e){const t=URL.createObjectURL(u),s=document.createElement("a");s.href=t,s.download=e,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(t)}function ie(u){return u.replace(/[^a-zA-Z0-9_-]/g,"_")}const U={characterSpeed:20,effectiveSpeed:15,frequency:700,volume:.7};class ae{constructor(){c(this,"audio");c(this,"settings",{...U});c(this,"state",{currentCategory:"qso",selectedTemplate:null,isPlaying:!1,userInput:"",showResult:!1,showAnswer:!1,showDialogFormat:!1});c(this,"customTemplates",[]);//! 設定を読み込む。
this.loadSettings(),this.loadCategory(),this.loadCustomTemplates();//! AudioGeneratorを初期化。
this.audio=new T({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed})}loadSettings(){try{const e=localStorage.getItem("v10.listening.settings");e&&(this.settings={...U,...JSON.parse(e)})}catch(e){console.error("Failed to load settings:",e)}}saveSettings(){try{localStorage.setItem("v10.listening.settings",JSON.stringify(this.settings))}catch(e){console.error("Failed to save settings:",e)}}loadCategory(){try{const e=localStorage.getItem("v10.listening.category");e&&["qso","text100","text200","text300","custom"].includes(e)&&(this.state.currentCategory=e)}catch(e){console.error("Failed to load category:",e)}}saveCategory(){try{localStorage.setItem("v10.listening.category",this.state.currentCategory)}catch(e){console.error("Failed to save category:",e)}}loadCustomTemplates(){try{const e=localStorage.getItem("v10.listening.customTemplates");e&&(this.customTemplates=JSON.parse(e))}catch(e){console.error("Failed to load custom templates:",e)}}saveCustomTemplates(){try{localStorage.setItem("v10.listening.customTemplates",JSON.stringify(this.customTemplates))}catch(e){console.error("Failed to save custom templates:",e)}}getTemplates(){if(this.state.currentCategory==="custom"){//! ランダムQSO生成ボタンを追加。
return[{id:"qso-random-generate",category:"qso",title:"ランダムQSO生成",content:""},...this.customTemplates]}else{const e=B.getBuiltinTemplates(this.state.currentCategory);//! QSOカテゴリーにはランダムQSO生成ボタンを追加。
return this.state.currentCategory==="qso"?[{id:"qso-random-generate",category:"qso",title:"ランダムQSO生成",content:""},...e]:e}}async playMorse(){if(!this.state.selectedTemplate||this.state.isPlaying)return;this.state.isPlaying=!0,this.updatePlaybackButtons();//! モールス信号を再生。
const e=E.textToMorse(this.state.selectedTemplate.content);await this.audio.playMorseString(e),this.state.isPlaying=!1,this.updatePlaybackButtons()}pauseMorse(){this.audio.stopPlaying(),this.state.isPlaying=!1,this.updatePlaybackButtons()}stopMorse(){this.audio.stopPlaying(),this.state.isPlaying=!1,this.state.userInput="",this.state.showResult=!1,this.state.showAnswer=!1,this.renderPracticeArea()}updatePlaybackButtons(){const e=document.getElementById("playBtn"),t=document.getElementById("pauseBtn");e&&(e.disabled=this.state.isPlaying),t&&(t.disabled=!this.state.isPlaying)}checkAnswer(){this.state.selectedTemplate&&(this.state.showResult=!0,this.state.showAnswer=!0,this.renderPracticeArea())}toggleAnswer(){this.state.showAnswer=!this.state.showAnswer,this.renderPracticeArea()}toggleDialogFormat(){this.state.showDialogFormat=!this.state.showDialogFormat,this.renderAnswer()}showCustomTemplateDialog(e){var a,r;const t=!!e,s=t?e.title:"",n=t?e.content:"",i=document.createElement("div");i.className="modal-overlay",i.innerHTML=`
			<div class="modal">
				<h2>${t?"テンプレート編集":"テンプレート新規作成"}</h2>
				<div class="form-group">
					<label for="templateTitle">タイトル:</label>
					<input type="text" id="templateTitle" value="${s}" placeholder="タイトルを入力">
				</div>
				<div class="form-group">
					<label for="templateContent">内容:</label>
					<textarea id="templateContent" placeholder="モールス信号に変換するテキストを入力">${n}</textarea>
				</div>
				<div class="modal-actions">
					<button id="saveTemplateBtn" class="btn btn-primary">保存</button>
					<button id="cancelTemplateBtn" class="btn">キャンセル</button>
				</div>
			</div>
		`,document.body.appendChild(i);//! 保存ボタン。
(a=document.getElementById("saveTemplateBtn"))==null||a.addEventListener("click",()=>{const o=document.getElementById("templateTitle"),l=document.getElementById("templateContent");if(!o.value.trim()||!l.value.trim()){alert("タイトルと内容を入力してください");return}if(t&&e){//! 既存テンプレートを更新。
e.title=o.value.trim(),e.content=l.value.trim().toUpperCase()}else{//! 新規テンプレートを追加。
const d={id:`custom-${Date.now()}`,category:"qso",title:o.value.trim(),content:l.value.trim().toUpperCase()};this.customTemplates.push(d)}this.saveCustomTemplates(),i.remove(),this.render()});//! キャンセルボタン。
(r=document.getElementById("cancelTemplateBtn"))==null||r.addEventListener("click",()=>{i.remove()});//! モーダル外クリックで閉じる。
i.addEventListener("click",o=>{o.target===i&&i.remove()})}deleteCustomTemplate(e){confirm("この定型文を削除しますか?")&&(this.customTemplates=this.customTemplates.filter(t=>t.id!==e),this.saveCustomTemplates(),this.render())}showSettings(){//! 現在の設定値を取得（volumeを0-100の範囲に変換）。
const e={characterSpeed:this.settings.characterSpeed,effectiveSpeed:this.settings.effectiveSpeed,frequency:this.settings.frequency,volume:Math.round(this.settings.volume*100)};//! 設定変更前の値を保存（キャンセル時の復元用）。
const t={...this.settings};//! SettingsModalを作成。
const s=new C("listening-settings-modal",w,e,{onSave:n=>{//! 実効速度は文字速度を上限とする。
let i=n.effectiveSpeed;const a=n.characterSpeed;i>a&&(i=a);//! 設定を保存。
this.settings.characterSpeed=a,this.settings.effectiveSpeed=i,this.settings.frequency=n.frequency,this.settings.volume=n.volume/100,this.saveSettings();//! AudioGeneratorを更新。
this.audio.updateSettings({frequency:this.settings.frequency,volume:this.settings.volume,wpm:this.settings.characterSpeed,effectiveWpm:this.settings.effectiveSpeed})},onCancel:()=>{//! 設定を元に戻す。
this.settings={...t},this.audio.updateSettings({frequency:t.frequency,volume:t.volume,wpm:t.characterSpeed,effectiveWpm:t.effectiveSpeed})},onTestPlay:async()=>{//! テスト再生。
const n=E.textToMorse("CQ");await this.audio.playMorseString(n)}});//! モーダルを表示。
s.show("listening")}render(){const e=document.getElementById("app");e&&(e.innerHTML=`
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
		`,this.attachEventListeners())}renderCategoryTabs(){return[{id:"qso",label:"ラバースタンプQSO"},{id:"text100",label:"英文100字"},{id:"text200",label:"英文200字"},{id:"text300",label:"英文300字"},{id:"custom",label:"ユーザー定義"}].map(t=>`
			<button class="tab-button ${this.state.currentCategory===t.id?"active":""}" data-category="${t.id}">
				${t.label}
			</button>
		`).join("")}renderTemplateList(){const e=this.getTemplates();return e.length===0||e.length===1&&e[0].id==="qso-random-generate"?`
				<div class="empty-state">
					<p>定型文がありません</p>
					${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn btn-primary">新規作成</button>':""}
				</div>
			`:`
			<div class="template-list">
				${this.state.currentCategory==="custom"?'<button id="addCustomBtn" class="btn btn-primary">新規作成</button>':""}
				${e.map(t=>{const s=t.id==="qso-random-generate"?"コールサイン、地名、名前、RSレポート、リグなどがランダムに生成された完全なQSOが作成されます。毎回異なる内容で練習できます。":`${t.content.substring(0,100)}${t.content.length>100?"...":""}`;return`
					<div class="template-card" data-template-id="${t.id}">
						<h3>${t.title}</h3>
						<p class="template-preview">${s}</p>
						<div class="template-actions">
							<button class="btn select-btn" data-template-id="${t.id}">選択</button>
							${this.state.currentCategory==="custom"&&t.id!=="qso-random-generate"?`
								<button class="btn edit-btn" data-template-id="${t.id}">編集</button>
								<button class="btn delete-btn" data-template-id="${t.id}">削除</button>
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
		`:""}renderPracticeArea(){var s,n;const e=document.getElementById("practiceInputArea");if(!e)return;e.innerHTML=`
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
const t=document.getElementById("userInput");t==null||t.addEventListener("input",()=>{this.state.userInput=t.value});//! 採点ボタン。
(s=document.getElementById("checkBtn"))==null||s.addEventListener("click",()=>{this.checkAnswer()});//! 正解表示ボタン。
(n=document.getElementById("showAnswerBtn"))==null||n.addEventListener("click",()=>{this.toggleAnswer()});//! 正解と結果を描画。
this.state.showAnswer&&this.renderAnswer(),this.state.showResult&&this.renderResult()}renderAnswer(){var a;const e=document.getElementById("answerArea");if(!e||!this.state.selectedTemplate)return;const t=this.state.selectedTemplate.category==="qso",s=this.state.selectedTemplate.content;//! 対話形式ボタン（QSOの場合のみ表示）。
const n=t?`<button id="toggleDialogBtn" class="btn" style="margin-left: 10px;">${this.state.showDialogFormat?"通常表示":"対話形式で表示"}</button>`:"";//! 対話形式表示の生成。
let i="";if(t&&this.state.showDialogFormat){//! BTで区切って話者別に表示。
i=`
				<table class="dialog-table">
					<tbody>
						${s.split(/\s+BT\s+/).map((o,l)=>`
								<tr>
									<td class="speaker-cell">${l%2===0?"A":"B"}</td>
									<td class="content-cell">${o.trim()}</td>
								</tr>
							`).join("")}
					</tbody>
				</table>
			`}else i=`<div class="answer-text">${s}</div>`;e.innerHTML=`
			<div class="answer-area">
				<h3 style="display: inline-block;">正解</h3>
				${n}
				${i}
			</div>
		`;//! 対話形式ボタン。
(a=document.getElementById("toggleDialogBtn"))==null||a.addEventListener("click",()=>{this.toggleDialogFormat()})}renderResult(){const e=document.getElementById("resultArea");if(!e||!this.state.selectedTemplate)return;const t=B.calculateAccuracy(this.state.selectedTemplate.content,this.state.userInput);e.innerHTML=`
			<div class="result-area">
				<h3>結果</h3>
				<div class="accuracy">正答率: ${t}%</div>
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
var e,t,s,n,i,a,r,o;(e=document.getElementById("backBtn"))==null||e.addEventListener("click",()=>{window.location.hash="#menu"});//! 設定アイコン。
(t=document.getElementById("settingsIcon"))==null||t.addEventListener("click",()=>{this.showSettings()});//! カテゴリータブ。
document.querySelectorAll(".tab-button").forEach(l=>{l.addEventListener("click",()=>{const d=l.getAttribute("data-category");d&&(this.state.currentCategory=d,this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.saveCategory(),this.render())})});//! 定型文選択ボタン。
document.querySelectorAll(".select-btn").forEach(l=>{l.addEventListener("click",()=>{const d=l.getAttribute("data-template-id");if(d){//! ランダムQSO生成ボタンの場合。
if(d==="qso-random-generate")this.state.selectedTemplate=B.generateRandomQSO(),this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render(),this.renderPracticeArea();else{//! 通常のテンプレート選択。
const h=[...B.getBuiltinTemplates(),...this.customTemplates].find(v=>v.id===d);h&&(this.state.selectedTemplate=h,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.render(),this.renderPracticeArea())}}})});//! 一覧に戻るボタン。
(s=document.getElementById("backToListBtn"))==null||s.addEventListener("click",()=>{this.state.selectedTemplate=null,this.state.showResult=!1,this.state.showAnswer=!1,this.state.showDialogFormat=!1,this.state.userInput="",this.audio.stopPlaying(),this.render()});//! ユーザー定義定型文の新規作成ボタン。
(n=document.getElementById("addCustomBtn"))==null||n.addEventListener("click",()=>{this.showCustomTemplateDialog()});//! ユーザー定義定型文の編集ボタン。
document.querySelectorAll(".edit-btn").forEach(l=>{l.addEventListener("click",()=>{const d=l.getAttribute("data-template-id");if(d){const g=this.customTemplates.find(h=>h.id===d);g&&this.showCustomTemplateDialog(g)}})});//! ユーザー定義定型文の削除ボタン。
document.querySelectorAll(".delete-btn").forEach(l=>{l.addEventListener("click",()=>{const d=l.getAttribute("data-template-id");d&&this.deleteCustomTemplate(d)})});//! 再生コントロール（練習画面のみ）。
this.state.selectedTemplate&&((i=document.getElementById("playBtn"))==null||i.addEventListener("click",()=>{this.playMorse()}),(a=document.getElementById("pauseBtn"))==null||a.addEventListener("click",()=>{this.pauseMorse()}),(r=document.getElementById("stopBtn"))==null||r.addEventListener("click",()=>{this.stopMorse()}),(o=document.getElementById("downloadBtn"))==null||o.addEventListener("click",()=>{this.downloadWav()}),this.renderPracticeArea())}async downloadWav(){if(this.state.selectedTemplate)try{//! テキストをモールス符号に変換。
const e=E.textToMorse(this.state.selectedTemplate.content);//! WAVファイルを生成。
const t=await this.audio.generateWav(e);//! ダウンロード。
const s=`${ie(this.state.selectedTemplate.title)}.wav`;ne(t,s)}catch(e){console.error("WAVダウンロードエラー:",e),alert("WAVファイルの生成に失敗しました。")}}destroy(){//! AudioGeneratorを停止。
this.audio.stopPlaying()}}class re{constructor(){c(this,"currentView",null);c(this,"routes",[]);//! ルート定義。
this.routes=[{path:"",view:x},{path:"menu",view:x},{path:"vertical",view:X},{path:"horizontal",view:Z},{path:"flashcard",view:te},{path:"koch",view:se},{path:"listening",view:ae}]}init(){//! ハッシュ変更時のリスナーを登録。
window.addEventListener("hashchange",()=>this.handleRoute());//! 初回ルーティング。
this.handleRoute()}handleRoute(){//! 現在のビューを破棄。
this.currentView&&(this.currentView.destroy(),this.currentView=null);//! ハッシュからパスを取得（#を除去）。
const e=window.location.hash.slice(1),t=this.routes.find(s=>s.path===e);if(t){//! ビューを作成してレンダリング。
this.currentView=new t.view,this.currentView.render()}else{//! 該当するルートがない場合はメニューに遷移。
window.location.hash="#menu"}}navigate(e){window.location.hash=`#${e}`}}//! アプリケーション起動時の処理。
function W(){console.log("モールス練習アプリ v10 起動");//! ルーターを初期化。
new re().init()}//! DOMContentLoaded後に初期化。
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",W):W();
//# sourceMappingURL=index-BON6mBMS.js.map

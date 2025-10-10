import{A as m,M as g}from"./morse-code-CFHo7w6l.js";import{e as u}from"./index-CQjJcwRr.js";class E{constructor(){this.entries=[],this.filteredEntries=[],this.selectedTags=new Set,this.selectedFrequencies=new Set([5]),this.displayMode="card",this.viewMode="browse",this.sortColumn="abbreviation",this.sortDirection="asc",this.searchQuery="",this.currentCards=[],this.currentIndex=0,this.isFlipped=!1,this.progress={known:new Set,unknown:new Set},this.reviewMode=!1,this.hideAbbreviation=!1,this.isLearning=!1,this.learnQuestionType="abbr-to-meaning",this.currentlyPlaying=null,this.examQuestions=[],this.currentQuestionIndex=0,this.examResults=[],this.questionCount=10,this.questionType="abbr-to-meaning",this.settingsModalOpen=!1,this.tempSettings=null,this.isTestPlaying=!1,this.audioSystem=new m,this.loadProgress(),this.loadFilters(),this.loadData()}async loadData(){try{const t=await fetch("./flashcard.tsv");if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const e=await t.text();this.entries=e.trim().split(`
`).slice(1).map(s=>{const[n,i,a,c,d,r,o]=s.split("	");return{tags:n,frequency:parseInt(i),abbreviation:a,english:c,japanese:d,description:r||"",example:o||""}}),this.applyFilters(),this.render()}catch(t){console.error("データ読み込みエラー:",t),this.renderError()}}getAllTags(){const t=new Set;return this.entries.forEach(e=>{e.tags.split(",").forEach(s=>t.add(s.trim()))}),Array.from(t).sort()}applyFilters(){let t=this.entries;if(this.selectedTags.size>0&&(t=t.filter(e=>{const s=e.tags.split(",").map(n=>n.trim());return Array.from(this.selectedTags).some(n=>s.includes(n))})),this.selectedFrequencies.size>0&&(t=t.filter(e=>this.selectedFrequencies.has(e.frequency))),this.searchQuery.trim()){const e=this.searchQuery.toLowerCase();t=t.filter(s=>s.abbreviation.toLowerCase().includes(e)||s.english.toLowerCase().includes(e)||s.japanese.includes(this.searchQuery)||s.tags.toLowerCase().includes(e))}this.filteredEntries=this.sortEntries(t)}sortEntries(t){const e=[...t];return e.sort((s,n)=>{let i=0;switch(this.sortColumn){case"abbreviation":i=s.abbreviation.localeCompare(n.abbreviation);break;case"english":i=s.english.localeCompare(n.english);break;case"japanese":i=s.japanese.localeCompare(n.japanese);break;case"frequency":i=s.frequency-n.frequency;break;case"tags":i=s.tags.localeCompare(n.tags);break}return this.sortDirection==="asc"?i:-i}),e}toggleSort(t){this.sortColumn===t?this.sortDirection=this.sortDirection==="asc"?"desc":"asc":(this.sortColumn=t,this.sortDirection="asc"),this.applyFilters(),this.render()}toggleTag(t){this.selectedTags.has(t)?this.selectedTags.delete(t):this.selectedTags.add(t),this.applyFilters(),this.saveFilters(),this.render()}toggleFrequency(t){this.selectedFrequencies.has(t)?this.selectedFrequencies.delete(t):this.selectedFrequencies.add(t),this.applyFilters(),this.saveFilters(),this.render()}toggleAllFrequencies(){const t=[1,2,3,4,5];t.every(e=>this.selectedFrequencies.has(e))?this.selectedFrequencies.clear():t.forEach(e=>this.selectedFrequencies.add(e)),this.applyFilters(),this.saveFilters(),this.render()}toggleDisplayMode(){this.displayMode=this.displayMode==="card"?"list":"card",this.render()}getFrequencyStars(t){return"★".repeat(t)+"☆".repeat(5-t)}formatAbbreviation(t){const e=t.match(/^\[([A-Z]+)\]$/);return e?`<span class="prosign">${e[1]}</span>`:t}getCardCountText(){const t=this.filteredEntries.length,e=this.filteredEntries.filter(n=>this.progress.unknown.has(n.abbreviation)).length,s=this.filteredEntries.filter(n=>this.progress.known.has(n.abbreviation)).length;return`全${t}件 / わかる:${s}件 / わからない:${e}件`}shuffleCards(t){const e=[...t];for(let s=e.length-1;s>0;s--){const n=Math.floor(Math.random()*(s+1));[e[s],e[n]]=[e[n],e[s]]}return e}startLearning(){this.reviewMode?this.currentCards=this.filteredEntries.filter(t=>this.progress.unknown.has(t.abbreviation)):this.currentCards=this.shuffleCards(this.filteredEntries),this.currentIndex=0,this.isFlipped=!1,this.isLearning=!0,this.render()}flipCard(){this.isFlipped=!this.isFlipped,this.render()}nextCard(){this.currentIndex<this.currentCards.length-1&&(this.currentIndex++,this.isFlipped=!1,this.render())}previousCard(){this.currentIndex>0&&(this.currentIndex--,this.isFlipped=!1,this.render())}markAsKnown(){const t=this.currentCards[this.currentIndex];this.progress.known.add(t.abbreviation),this.progress.unknown.delete(t.abbreviation),this.saveProgress(),this.currentIndex<this.currentCards.length-1&&(this.currentIndex++,this.isFlipped=!1),this.render()}markAsUnknown(){const t=this.currentCards[this.currentIndex];this.progress.unknown.add(t.abbreviation),this.progress.known.delete(t.abbreviation),this.saveProgress(),this.currentIndex<this.currentCards.length-1&&(this.currentIndex++,this.isFlipped=!1),this.render()}backToLearnSetup(){this.isLearning=!1,this.currentCards=[],this.currentIndex=0,this.isFlipped=!1,this.render()}async playMorse(t){try{if(this.currentlyPlaying===t){this.audioSystem.stopPlaying(),this.currentlyPlaying=null,this.viewMode!=="exam"&&this.render();return}this.currentlyPlaying&&this.audioSystem.stopPlaying(),this.currentlyPlaying=t,this.viewMode!=="exam"&&this.render();const e=g.textToMorse(t);e&&await this.audioSystem.playMorseString(e),this.currentlyPlaying=null,this.viewMode!=="exam"&&this.render()}catch(e){console.error("モールス再生エラー:",e),this.currentlyPlaying=null,this.viewMode!=="exam"&&this.render()}}render(){this.viewMode==="browse"?this.renderBrowseMode():this.viewMode==="learn"?this.renderLearnMode():this.viewMode==="exam"&&this.renderExamMode(),this.settingsModalOpen&&this.renderSettingsModal()}renderBrowseMode(){const t=document.getElementById("app");if(!t)return;const e=this.getAllTags();t.innerHTML=`
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button active" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<div class="filter-group">
						<h2>タグでフィルター</h2>
						<div class="tags-list">
							${e.map(a=>`
								<button class="tag-btn ${this.selectedTags.has(a)?"active":""}" data-tag="${a}">
									${a}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>使用頻度 <button id="toggle-freq-btn" class="toggle-freq-btn" title="チェックを反転">⇆</button></h2>
						<div class="frequency-list">
							${[5,4,3,2,1].map(a=>`
								<button class="freq-btn ${this.selectedFrequencies.has(a)?"active":""}" data-freq="${a}">
									${this.getFrequencyStars(a)}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>検索</h2>
						<input type="text" id="search-input" class="search-input" placeholder="略語、英文、和訳、タグで検索..." value="${this.searchQuery}">
					</div>

					<div class="result-count">
						全 ${this.filteredEntries.length} 件
					</div>
				</div>

				<div class="entries-container" id="entriesContainer"></div>
			</div>
		`;const s=document.getElementById("backBtn");s&&s.addEventListener("click",()=>{window.location.hash="#menu"});const n=document.getElementById("settingsBtn");n&&n.addEventListener("click",()=>{this.openSettingsModal()}),document.querySelectorAll(".tab-button").forEach(a=>{a.addEventListener("click",()=>{const c=a.getAttribute("data-tab");c==="learn"?(this.viewMode="learn",this.render()):c==="exam"&&(this.viewMode="exam",this.render())})}),this.renderEntries(),this.attachBrowseModeListeners()}renderEntries(){const t=document.getElementById("entriesContainer");if(!t)return;this.displayMode==="card"?this.renderCardView(t):this.renderListView(t);const e=document.getElementById("toggleModeBtn");e&&e.addEventListener("click",()=>this.toggleDisplayMode())}updateResultCount(){const t=document.querySelector(".result-count");t&&(t.textContent=`全 ${this.filteredEntries.length} 件`)}renderCardView(t){t.innerHTML=`
			<div class="entries-header">
				<h2>略語一覧 (${this.filteredEntries.length}件 / ${this.entries.length}件中)</h2>
				<button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
					📋 リスト表示
				</button>
			</div>
			<div class="entries-list">
				${this.filteredEntries.map(e=>{const s=u(e.abbreviation),n=u(e.english),i=u(e.japanese),a=e.description?u(e.description):"",c=e.example?u(e.example):"",d=u(e.tags);return`
					<div class="entry-card ${this.currentlyPlaying===e.abbreviation?"playing":""}" data-abbr="${s}">
						<div class="entry-header">
							<div class="entry-abbr">${this.formatAbbreviation(s)}</div>
							<div class="entry-frequency" title="使用頻度: ${e.frequency}/5">${this.getFrequencyStars(e.frequency)}</div>
						</div>
						<div class="entry-english">${n}</div>
						<div class="entry-japanese">${i}</div>
						${a?`<div class="entry-description">${a}</div>`:""}
						${c?`<div class="entry-example">例: ${c}</div>`:""}
						<div class="entry-tags">${d}</div>
					</div>
				`}).join("")}
			</div>
		`,t.querySelectorAll(".entry-card").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-abbr");s&&this.playMorse(s)})})}getSortIndicator(t){return this.sortColumn!==t?"":this.sortDirection==="asc"?" ▲":" ▼"}renderListView(t){t.innerHTML=`
			<div class="entries-header">
				<h2>略語一覧 (${this.filteredEntries.length}件 / ${this.entries.length}件中)</h2>
				<button id="toggleModeBtn" class="toggle-mode-btn" title="表示モード切り替え">
					🃏 カード表示
				</button>
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
						${this.filteredEntries.map(n=>{const i=u(n.abbreviation),a=u(n.english),c=u(n.japanese),d=u(n.description),r=u(n.example),o=u(n.tags);return`
							<tr>
								<td class="list-abbr">
									<button class="abbr-play-btn ${this.currentlyPlaying===n.abbreviation?"playing":""}" data-abbr="${i}">
										${this.formatAbbreviation(i)}
									</button>
								</td>
								<td class="list-english">${a}</td>
								<td class="list-japanese">${c}</td>
								<td class="list-frequency" title="使用頻度: ${n.frequency}/5">${this.getFrequencyStars(n.frequency)}</td>
								<td class="list-tags">${o}</td>
								<td class="list-description">${d}</td>
								<td class="list-example">${r}</td>
							</tr>
						`}).join("")}
					</tbody>
				</table>
			</div>
		`,t.querySelectorAll("th.sortable").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-column");i&&this.toggleSort(i)})}),t.querySelectorAll(".abbr-play-btn").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-abbr");i&&this.playMorse(i)})})}renderLearnMode(){const t=document.getElementById("app");if(!t)return;if(!this.isLearning){this.renderLearnSetupView(t);return}if(this.currentCards.length===0){t.innerHTML=`
				<div class="container">
					<div class="no-cards">
						${this.reviewMode?"復習するカードがありません":"学習するカードがありません"}
					</div>
					<button id="back-to-setup-btn" class="secondary-button">設定に戻る</button>
				</div>
			`;const c=document.getElementById("back-to-setup-btn");c&&c.addEventListener("click",()=>this.backToLearnSetup());return}const e=this.currentCards[this.currentIndex],s=this.currentIndex+1,n=this.currentCards.length;let i="",a="";switch(this.learnQuestionType){case"abbr-to-meaning":i=`
					<div class="card-label">略語</div>
					<div class="card-content">${this.formatAbbreviation(e.abbreviation)}</div>
					<button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`;break;case"meaning-to-abbr":i=`
					<div class="card-label">意味</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
					<button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">🔊 モールス再生</button>
				`;break;case"morse-to-abbr":i=`
					<div class="card-label">モールス音を聞いて略語を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">略語</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
				`;break;case"morse-to-meaning":i=`
					<div class="card-label">モールス音を聞いて意味を答えてください</div>
					<button class="play-morse-btn" id="play-morse-btn" title="モールス符号を再生">🔊 モールス再生</button>
				`,a=`
					<div class="card-label">意味</div>
					<div class="card-content-abbr">${this.formatAbbreviation(e.abbreviation)}</div>
					<div class="card-content-text">${e.english}</div>
					<div class="card-content-text">${e.japanese}</div>
				`;break}t.innerHTML=`
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
							${e.description?`<div class="card-description">${e.description}</div>`:""}
							${e.example?`<div class="card-example">例: ${e.example}</div>`:""}
							<div class="card-tags">${e.tags} / ${this.getFrequencyStars(e.frequency)}</div>
						</div>
					</div>
				</div>

				<div class="card-controls">
					<button id="flip-card-btn" class="control-button">
						${this.isFlipped?"問題に戻る":"正解を確認する"} (Space)
					</button>
				</div>

				${this.isFlipped?this.renderJudgmentButtons(e):""}

				<div class="navigation-controls">
					<button id="prev-card-btn" class="nav-button" ${this.currentIndex===0?"disabled":""}>
						← 前のカード
					</button>
					<button id="next-card-btn" class="nav-button" ${this.currentIndex>=this.currentCards.length-1?"disabled":""}>
						次のカード →
					</button>
				</div>
			</div>
		`,this.attachLearnModeListeners()}renderLearnSetupView(t){const e=this.getAllTags();t.innerHTML=`
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button active" data-tab="learn">学習モード</button>
					<button class="tab-button" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<div class="filter-group">
						<h2>タグでフィルター</h2>
						<div class="tags-list">
							${e.map(a=>`
								<button class="tag-btn ${this.selectedTags.has(a)?"active":""}" data-tag="${a}">
									${a}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>使用頻度 <button id="toggle-freq-btn" class="toggle-freq-btn" title="チェックを反転">⇆</button></h2>
						<div class="frequency-list">
							${[5,4,3,2,1].map(a=>`
								<button class="freq-btn ${this.selectedFrequencies.has(a)?"active":""}" data-freq="${a}">
									${this.getFrequencyStars(a)}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>モード</h2>
						<div class="mode-buttons">
							<button class="mode-btn ${this.reviewMode?"selected":""}" id="review-mode-btn">復習モード（わからないカードのみ）</button>
							<button class="mode-btn ${this.hideAbbreviation?"selected":""}" id="hide-abbreviation-btn">略語を非表示（モールス再生のみ）</button>
						</div>
					</div>

					<div class="filter-group">
						<h2>出題形式</h2>
						<div class="question-type-buttons">
							<button class="question-type-btn ${this.learnQuestionType==="abbr-to-meaning"?"selected":""}" data-type="abbr-to-meaning">略語→意味（基本）</button>
							<button class="question-type-btn ${this.learnQuestionType==="meaning-to-abbr"?"selected":""}" data-type="meaning-to-abbr">意味→略語（応用）</button>
							<button class="question-type-btn ${this.learnQuestionType==="morse-to-abbr"?"selected":""}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
							<button class="question-type-btn ${this.learnQuestionType==="morse-to-meaning"?"selected":""}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
						</div>
					</div>

					<div class="result-count">
						${this.getCardCountText()}
					</div>

					<div class="action-buttons">
						<button id="start-learning-btn" class="primary-button">学習開始</button>
						<button id="clear-progress-btn" class="secondary-button">進捗をリセット</button>
					</div>
				</div>
			</div>
		`;const s=document.getElementById("backBtn");s&&s.addEventListener("click",()=>{window.location.hash="#menu"});const n=document.getElementById("settingsBtn");n&&n.addEventListener("click",()=>{this.openSettingsModal()}),document.querySelectorAll(".tab-button").forEach(a=>{a.addEventListener("click",()=>{const c=a.getAttribute("data-tab");c==="browse"?(this.viewMode="browse",this.render()):c==="exam"&&(this.viewMode="exam",this.render())})}),this.attachLearnSetupListeners()}renderJudgmentButtons(t){const e=this.progress.known.has(t.abbreviation);return`
			<div class="judgment-controls">
				<button id="mark-unknown-btn" class="judgment-button unknown ${this.progress.unknown.has(t.abbreviation)?"active":""}">
					× わからない
				</button>
				<button id="mark-known-btn" class="judgment-button known ${e?"active":""}">
					○ わかる
				</button>
			</div>
		`}attachBrowseModeListeners(){document.querySelectorAll(".tag-btn").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-tag");a&&this.toggleTag(a)})}),document.querySelectorAll(".freq-btn").forEach(i=>{i.addEventListener("click",()=>{const a=parseInt(i.getAttribute("data-freq")||"0",10);this.toggleFrequency(a)})});const s=document.getElementById("toggle-freq-btn");s&&s.addEventListener("click",()=>this.toggleAllFrequencies());const n=document.getElementById("search-input");n&&n.addEventListener("input",()=>{this.searchQuery=n.value,this.applyFilters(),this.renderEntries(),this.updateResultCount()})}attachLearnSetupListeners(){document.querySelectorAll(".tag-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-tag");o&&this.toggleTag(o)})}),document.querySelectorAll(".freq-btn").forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.getAttribute("data-freq")||"0",10);this.toggleFrequency(o)})});const s=document.getElementById("toggle-freq-btn");s&&s.addEventListener("click",()=>this.toggleAllFrequencies());const n=document.getElementById("review-mode-btn");n&&n.addEventListener("click",()=>{this.reviewMode=!this.reviewMode,this.render()});const i=document.getElementById("hide-abbreviation-btn");i&&i.addEventListener("click",()=>{this.hideAbbreviation=!this.hideAbbreviation,this.render()}),document.querySelectorAll(".question-type-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-type");o&&(this.learnQuestionType=o,this.render())})});const c=document.getElementById("start-learning-btn");c&&c.addEventListener("click",()=>this.startLearning());const d=document.getElementById("clear-progress-btn");d&&d.addEventListener("click",()=>{confirm("学習進捗をすべてリセットしますか？")&&(this.progress={known:new Set,unknown:new Set},this.saveProgress(),this.render())})}attachLearnModeListeners(){const t=document.getElementById("back-to-setup-btn");t&&t.addEventListener("click",()=>this.backToLearnSetup());const e=document.getElementById("flip-card-btn");e&&e.addEventListener("click",()=>this.flipCard());const s=document.getElementById("play-morse-btn");s&&s.addEventListener("click",()=>{const a=this.currentCards[this.currentIndex];this.playMorse(a.abbreviation)});const n=document.getElementById("prev-card-btn"),i=document.getElementById("next-card-btn");if(n&&n.addEventListener("click",()=>this.previousCard()),i&&i.addEventListener("click",()=>this.nextCard()),this.isFlipped){const a=document.getElementById("mark-known-btn"),c=document.getElementById("mark-unknown-btn");a&&a.addEventListener("click",()=>this.markAsKnown()),c&&c.addEventListener("click",()=>this.markAsUnknown())}this.attachKeyboardListeners()}attachKeyboardListeners(){const t=e=>{this.viewMode==="learn"&&(e.key===" "||e.key==="Spacebar"?(e.preventDefault(),this.flipCard()):e.key==="ArrowRight"?(e.preventDefault(),this.nextCard()):e.key==="ArrowLeft"&&(e.preventDefault(),this.previousCard()))};document.removeEventListener("keydown",t),document.addEventListener("keydown",t)}saveFilters(){try{const t={tags:Array.from(this.selectedTags),frequencies:Array.from(this.selectedFrequencies)};localStorage.setItem("v4.flashcard.filters",JSON.stringify(t))}catch(t){console.error("フィルタ保存エラー:",t)}}loadFilters(){try{const t=localStorage.getItem("v4.flashcard.filters");if(t){const e=JSON.parse(t);this.selectedTags=new Set(Array.isArray(e.tags)?e.tags:[]),this.selectedFrequencies=new Set(Array.isArray(e.frequencies)?e.frequencies:[5])}}catch(t){console.error("フィルタ読み込みエラー:",t)}}saveProgress(){try{const t={known:Array.from(this.progress.known),unknown:Array.from(this.progress.unknown)};localStorage.setItem("v4.flashcard.progress",JSON.stringify(t))}catch(t){console.error("進捗保存エラー:",t)}}loadProgress(){try{const t=localStorage.getItem("v4.flashcard.progress");if(t){const e=JSON.parse(t);this.progress={known:new Set(e.known||[]),unknown:new Set(e.unknown||[])}}}catch(t){console.error("進捗読み込みエラー:",t)}}renderError(){const t=document.getElementById("app");t&&(t.innerHTML=`
			<div class="container">
				<header class="header">
					<button onclick="window.location.href='./index.html'" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
				</header>
				<div class="error">
					データの読み込みに失敗しました。flashcard.tsvを確認してください。
				</div>
			</div>
		`)}openSettingsModal(){this.settingsModalOpen=!0,this.tempSettings={volume:this.audioSystem.getVolume(),frequency:this.audioSystem.getFrequency(),wpm:this.audioSystem.getWPM()},this.renderSettingsModal()}closeSettingsModal(t){this.isTestPlaying&&(this.audioSystem.stopPlaying(),this.isTestPlaying=!1),!t&&this.tempSettings?(this.audioSystem.setVolume(this.tempSettings.volume),this.audioSystem.setFrequency(this.tempSettings.frequency),this.audioSystem.setWPM(this.tempSettings.wpm)):t&&this.audioSystem.saveSettings(),this.settingsModalOpen=!1,this.tempSettings=null;const e=document.getElementById("settings-modal");e&&e.remove()}renderSettingsModal(){const t=document.getElementById("settings-modal");t&&t.remove();const e=this.audioSystem.getVolume(),s=this.audioSystem.getFrequency(),n=this.audioSystem.getWPM(),i=`
			<div class="settings-modal active" id="settings-modal">
				<div class="settings-content">
					<h2>設定</h2>
					<div class="settings-grid">
						<div class="setting-item">
							<label for="volumeRange">音量</label>
							<input type="range" id="volumeRange" min="0" max="100" value="${e*100}" aria-label="音量スライダー">
							<input type="number" id="volumeInput" min="0" max="100" value="${Math.round(e*100)}" aria-label="音量数値入力">
							<span>%</span>
						</div>
						<div class="setting-item">
							<label for="frequencyInput">周波数 (Hz)</label>
							<input type="number" id="frequencyInput" min="400" max="1200" value="${s}" step="50">
						</div>
						<div class="setting-item">
							<label for="wpmInput">WPM (速度: 5-40)</label>
							<input type="number" id="wpmInput" min="5" max="40" value="${n}">
						</div>
						<div class="setting-item">
							<span>テスト再生</span>
							<button id="testMorseBtn" class="test-button">再生</button>
						</div>
					</div>
					<div class="settings-buttons">
						<button id="cancelBtn" class="secondary-button">キャンセル</button>
						<button id="okBtn" class="primary-button">OK</button>
					</div>
				</div>
			</div>
		`;document.body.insertAdjacentHTML("beforeend",i);const a=document.getElementById("settings-modal");if(!a)return;a.addEventListener("click",l=>{l.target===a&&this.closeSettingsModal(!1)});const c=document.getElementById("volumeRange"),d=document.getElementById("volumeInput");c&&d&&(c.addEventListener("input",()=>{const l=parseInt(c.value)/100;this.audioSystem.setVolume(l),d.value=c.value}),d.addEventListener("input",()=>{const l=parseInt(d.value)/100;this.audioSystem.setVolume(l),c.value=d.value}));const r=document.getElementById("frequencyInput");r&&r.addEventListener("input",()=>{const l=parseInt(r.value);this.audioSystem.setFrequency(l)});const o=document.getElementById("wpmInput");o&&o.addEventListener("input",()=>{const l=parseInt(o.value);this.audioSystem.setWPM(l)});const h=document.getElementById("testMorseBtn");h&&h.addEventListener("click",async()=>{if(this.isTestPlaying)this.audioSystem.stopPlaying(),this.isTestPlaying=!1,h.textContent="再生";else{this.isTestPlaying=!0,h.textContent="停止";const l=g.textToMorse("CQ");l&&await this.audioSystem.playMorseString(l),this.isTestPlaying=!1,h.textContent="再生"}});const b=document.getElementById("cancelBtn");b&&b.addEventListener("click",()=>{this.closeSettingsModal(!1)});const v=document.getElementById("okBtn");v&&v.addEventListener("click",()=>{this.closeSettingsModal(!0)})}renderExamMode(){const t=document.getElementById("app");t&&(this.examQuestions.length===0?this.renderExamSetup(t):this.currentQuestionIndex<this.examQuestions.length?this.renderExamQuestion(t):this.renderExamResult(t))}renderExamSetup(t){const e=this.getAllTags();t.innerHTML=`
			<div class="container">
				<header class="header">
					<button id="backBtn" class="back-btn">← 戻る</button>
					<h1>CW略語・Q符号</h1>
					<div class="settings-icon" id="settingsBtn">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
						</svg>
					</div>
				</header>

				<div class="tabs">
					<button class="tab-button" data-tab="browse">一覧</button>
					<button class="tab-button" data-tab="learn">学習モード</button>
					<button class="tab-button active" data-tab="exam">試験モード</button>
				</div>

				<div class="filter-section">
					<div class="filter-group">
						<h2>タグでフィルター</h2>
						<div class="tags-list">
							${e.map(s=>`
								<button class="tag-btn ${this.selectedTags.has(s)?"active":""}" data-tag="${s}">
									${s}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>使用頻度</h2>
						<div class="frequency-list">
							${[5,4,3,2,1].map(s=>`
								<button class="freq-btn ${this.selectedFrequencies.has(s)?"active":""}" data-freq="${s}">
									${this.getFrequencyStars(s)}
								</button>
							`).join("")}
						</div>
					</div>

					<div class="filter-group">
						<h2>出題形式</h2>
						<div class="question-type-buttons">
							<button class="question-type-btn ${this.questionType==="abbr-to-meaning"?"selected":""}" data-type="abbr-to-meaning">略語→意味（基礎）</button>
							<button class="question-type-btn ${this.questionType==="meaning-to-abbr"?"selected":""}" data-type="meaning-to-abbr">意味→略語（応用）</button>
							<button class="question-type-btn ${this.questionType==="morse-to-abbr"?"selected":""}" data-type="morse-to-abbr">モールス音→略語（実践）</button>
							<button class="question-type-btn ${this.questionType==="morse-to-meaning"?"selected":""}" data-type="morse-to-meaning">モールス音→意味（実践）</button>
						</div>
					</div>

					<div class="filter-group">
						<h2>問題数</h2>
						<div class="question-count-buttons">
							<button class="question-count-btn ${this.questionCount===5?"selected":""}" data-count="5">5問</button>
							<button class="question-count-btn ${this.questionCount===10?"selected":""}" data-count="10">10問</button>
							<button class="question-count-btn ${this.questionCount===20?"selected":""}" data-count="20">20問</button>
							<button class="question-count-btn ${this.questionCount===50?"selected":""}" data-count="50">50問</button>
							<button class="question-count-btn ${this.questionCount==="all"?"selected":""}" data-count="all">全問</button>
						</div>
					</div>

					<div class="result-count">
						出題可能: ${this.filteredEntries.length}件
					</div>

					<div class="action-buttons">
						<button id="start-exam-btn" class="primary-button">試験開始</button>
					</div>
				</div>
			</div>
		`,this.attachExamSetupListeners()}attachExamSetupListeners(){const t=document.getElementById("backBtn");t&&t.addEventListener("click",()=>{window.location.hash="#menu"});const e=document.getElementById("settingsBtn");e&&e.addEventListener("click",()=>{this.openSettingsModal()}),document.querySelectorAll(".tab-button").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-tab");o==="browse"?(this.viewMode="browse",this.render()):o==="learn"&&(this.viewMode="learn",this.currentCards=[],this.render())})}),document.querySelectorAll(".tag-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-tag");o&&(this.selectedTags.has(o)?this.selectedTags.delete(o):this.selectedTags.add(o),this.applyFilters(),this.saveFilters(),this.render())})}),document.querySelectorAll(".freq-btn").forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.getAttribute("data-freq")||"0",10);this.toggleFrequency(o)})}),document.querySelectorAll(".question-type-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-type");o&&(this.questionType=o,this.render())})}),document.querySelectorAll(".question-count-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-count")||"10";this.questionCount=o==="all"?"all":parseInt(o,10),this.render()})});const d=document.getElementById("start-exam-btn");d&&d.addEventListener("click",()=>{this.startExam()})}startExam(){this.examQuestions=this.generateExamQuestions(),this.currentQuestionIndex=0,this.examResults=[],this.render()}generateExamQuestions(){const t=this.questionCount==="all"?this.filteredEntries.length:Math.min(this.questionCount,this.filteredEntries.length);return[...this.filteredEntries].sort(()=>Math.random()-.5).slice(0,t).map(n=>this.createExamQuestion(n))}createExamQuestion(t){const e=this.filteredEntries.filter(i=>i.abbreviation!==t.abbreviation).sort(()=>Math.random()-.5).slice(0,3);let s,n;switch(this.questionType){case"abbr-to-meaning":s=`${t.english} / ${t.japanese}`,n=[s,...e.map(i=>`${i.english} / ${i.japanese}`)];break;case"meaning-to-abbr":s=t.abbreviation,n=[s,...e.map(i=>i.abbreviation)];break;case"morse-to-abbr":s=t.abbreviation,n=[s,...e.map(i=>i.abbreviation)];break;case"morse-to-meaning":s=`${t.english} / ${t.japanese}`,n=[s,...e.map(i=>`${i.english} / ${i.japanese}`)];break}return n=n.sort(()=>Math.random()-.5),{type:this.questionType,entry:t,choices:n,correctAnswer:s}}renderExamQuestion(t){const e=this.examQuestions[this.currentQuestionIndex],s=`問題 ${this.currentQuestionIndex+1} / ${this.examQuestions.length}`;t.innerHTML=`
			<div class="container exam-view">
				<div class="exam-header">
					<button id="quit-exam-btn" class="secondary-button">試験を中止</button>
					<div class="progress-indicator">${s}</div>
				</div>

				<div class="question-container">
					${this.renderQuestion(e)}
				</div>

				<div class="choices-container">
					${this.renderChoices(e)}
				</div>

				<div id="feedback-area" class="feedback-area"></div>
			</div>
		`,this.attachExamQuestionListeners(),(e.type==="morse-to-abbr"||e.type==="morse-to-meaning")&&setTimeout(()=>this.playMorse(e.entry.abbreviation),500)}renderQuestion(t){switch(t.type){case"abbr-to-meaning":return`
					<div class="question-text">
						<p>次の略語の意味を選んでください:</p>
						<p class="question-abbr">${this.formatAbbreviation(t.entry.abbreviation)}</p>
					</div>
				`;case"meaning-to-abbr":return`
					<div class="question-text">
						<p>次の意味に対応する略語を選んでください:</p>
						<p class="question-meaning">${t.entry.english}</p>
						<p class="question-meaning">${t.entry.japanese}</p>
					</div>
				`;case"morse-to-abbr":return`
					<div class="question-text">
						<p>モールス音を聞いて、対応する略語を選んでください:</p>
						<button id="replay-morse-btn" class="control-button">🔊 もう一度再生</button>
					</div>
				`;case"morse-to-meaning":return`
					<div class="question-text">
						<p>モールス音を聞いて、対応する意味を選んでください:</p>
						<button id="replay-morse-btn" class="control-button">🔊 もう一度再生</button>
					</div>
				`}}renderChoices(t){return t.choices.map((e,s)=>`
			<button class="choice-button" data-choice="${e}">
				${String.fromCharCode(65+s)}. ${e}
			</button>
		`).join("")}attachExamQuestionListeners(){const t=document.getElementById("quit-exam-btn");t&&t.addEventListener("click",()=>{confirm("試験を中止しますか？")&&(this.examQuestions=[],this.examResults=[],this.currentQuestionIndex=0,this.render())});const e=document.getElementById("replay-morse-btn");e&&e.addEventListener("click",()=>{const n=this.examQuestions[this.currentQuestionIndex];this.playMorse(n.entry.abbreviation)}),document.querySelectorAll(".choice-button").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-choice");i&&this.submitExamAnswer(i)})})}submitExamAnswer(t){const e=this.examQuestions[this.currentQuestionIndex],s=t===e.correctAnswer;this.examResults.push({question:e,userAnswer:t,isCorrect:s}),this.showExamFeedback(s,e.correctAnswer),setTimeout(()=>{this.currentQuestionIndex++,this.render()},1500)}showExamFeedback(t,e){const s=document.getElementById("feedback-area");if(!s)return;s.className=`feedback-area ${t?"correct":"incorrect"}`,s.innerHTML=t?'<div class="feedback-text">✓ 正解！</div>':`<div class="feedback-text">✗ 不正解<br>正解: ${e}</div>`,document.querySelectorAll(".choice-button").forEach(i=>{i.disabled=!0})}renderExamResult(t){const e=this.examResults.filter(a=>a.isCorrect).length,s=this.examResults.length,n=Math.round(e/s*100),i=this.examResults.filter(a=>!a.isCorrect);t.innerHTML=`
			<div class="container exam-result-view">
				<div class="result-header">
					<h2>試験結果</h2>
				</div>

				<div class="score-display">
					<div class="score-large">${e} / ${s}</div>
					<div class="score-percentage">${n}%</div>
				</div>

				<div class="result-details">
					${i.length>0?`
						<h3>間違えた問題 (${i.length}問)</h3>
						<div class="wrong-questions">
							${i.map(a=>this.renderWrongAnswer(a)).join("")}
						</div>
					`:`
						<p class="perfect-score">全問正解です！おめでとうございます！</p>
					`}
				</div>

				<div class="action-buttons">
					<button id="back-to-setup-btn" class="primary-button">設定に戻る</button>
					${i.length>0?`
						<button id="retry-wrong-btn" class="secondary-button">間違えた問題を復習</button>
					`:""}
				</div>
			</div>
		`,this.attachExamResultListeners()}renderWrongAnswer(t){const{question:e,userAnswer:s}=t;return`
			<div class="wrong-question-item">
				<div class="wrong-q-abbr">${this.formatAbbreviation(e.entry.abbreviation)}</div>
				<div class="wrong-q-correct">正解: ${e.correctAnswer}</div>
				<div class="wrong-q-user">あなたの回答: ${s}</div>
				<div class="wrong-q-meaning">${e.entry.english} / ${e.entry.japanese}</div>
			</div>
		`}attachExamResultListeners(){const t=document.getElementById("back-to-setup-btn");t&&t.addEventListener("click",()=>{this.examQuestions=[],this.examResults=[],this.currentQuestionIndex=0,this.render()});const e=document.getElementById("retry-wrong-btn");e&&e.addEventListener("click",()=>{const s=this.examResults.filter(n=>!n.isCorrect).map(n=>n.question.entry);this.filteredEntries=s,this.questionCount=s.length,this.startExam()})}destroy(){this.audioSystem.stopContinuousTone()}}export{E as FlashcardTrainer};

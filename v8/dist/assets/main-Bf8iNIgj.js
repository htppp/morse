const s=[{id:"vertical",title:"縦振り電鍵練習",description:"縦振り電鍵の操作を練習",icon:"⬇️",hash:"#vertical"},{id:"horizontal",title:"横振り電鍵練習",description:"横振り電鍵の操作を練習",icon:"↔️",hash:"#horizontal"},{id:"flashcard",title:"CW略語・Q符号学習",description:"フラッシュカード・試験モード",icon:"📚",hash:"#flashcard"},{id:"koch",title:"コッホ法トレーニング",description:"40文字を段階的に習得",icon:"🎓",hash:"#koch"},{id:"listening",title:"モールス信号聞き取り練習",description:"ラバースタンプQSO・英文の聞き取り",icon:"👂",hash:"#listening"}];class n{constructor(){this.render()}render(){const e=document.getElementById("app");e&&(e.innerHTML=`
			<div class="container">
				<header class="header">
					<h1>モールス練習アプリ</h1>
					<p class="subtitle">練習メニューを選択してください</p>
				</header>

				<div class="menu-grid">
					${s.map(i=>`
						<a href="${i.hash}" class="menu-card" data-id="${i.id}">
							<div class="menu-icon">${i.icon}</div>
							<h2 class="menu-title">${i.title}</h2>
							<p class="menu-description">${i.description}</p>
						</a>
					`).join("")}
				</div>

				<footer class="footer">
					<p>モールス練習アプリ - モールス信号聞き取り練習版</p>
				</footer>
			</div>
		`)}destroy(){}}export{n as MenuPage};

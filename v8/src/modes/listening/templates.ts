/**
 * モールス信号聞き取り練習の定型文データ管理
 */

//! 定型文の型定義。
export interface Template {
	id: string;
	category: 'qso' | 'text100' | 'text200' | 'text300' | 'custom';
	title: string;
	content: string;
}

//! ランダムQSO生成用データ。
const JAPANESE_CITIES = [
	'TOKYO', 'OSAKA', 'KYOTO', 'NAGOYA', 'YOKOHAMA', 'KOBE', 'FUKUOKA', 'SAPPORO', 'SENDAI', 'HIROSHIMA',
	'KAWASAKI', 'SAITAMA', 'CHIBA', 'KITAKYUSHU', 'SAKAI', 'NIIGATA', 'HAMAMATSU', 'KUMAMOTO', 'OKAYAMA', 'SAGAMIHARA',
	'SHIZUOKA', 'KAGOSHIMA', 'MATSUYAMA', 'GIFU', 'UTSUNOMIYA', 'KANAZAWA', 'TOYAMA', 'NARA', 'NAGASAKI', 'OITA',
	'KOCHI', 'MIYAZAKI', 'NAHA', 'WAKAYAMA', 'AOMORI', 'AKITA', 'FUKUSHIMA', 'MORIOKA', 'MAEBASHI', 'KOFU',
	'MATSUMOTO', 'TOYOHASHI', 'FUKUI', 'OTSU', 'TSU', 'YOKKAICHI', 'MATSUE', 'TOTTORI', 'YAMAGUCHI', 'TOKUSHIMA',
	'TAKAMATSU', 'MITO', 'KORIYAMA', 'IWAKI', 'TAKASAKI', 'HACHIOJI', 'MACHIDA', 'KURASHIKI', 'HIMEJI', 'NISHINOMIYA',
	'AMAGASAKI', 'TAKATSUKI', 'TOYONAKA', 'SUITA', 'KAWAGUCHI', 'FUNABASHI', 'HAKODATE', 'ASAHIKAWA', 'OTARU', 'KUSHIRO',
	'OBIHIRO', 'TOMAKOMAI', 'IWAMIZAWA', 'HACHINOHE', 'HIROSAKI', 'ISHINOMAKI', 'YAMAGATA', 'TSURUOKA', 'YONEZAWA', 'HITACHI',
	'TSUKUBA', 'KASUKABE', 'KAWAGOE', 'TOKOROZAWA', 'AGEO', 'FUCHU', 'CHOFU', 'HINO', 'KOKUBUNJI', 'ATSUGI',
	'ODAWARA', 'HIRATSUKA', 'FUJISAWA', 'KAMAKURA', 'ZUSHI', 'NUMAZU', 'FUJI', 'MISHIMA', 'KAKEGAWA', 'IWATA'
];

const FIRST_NAMES = [
	'JOHN', 'MIKE', 'TOM', 'DAVE', 'BOB', 'BILL', 'JIM', 'JACK', 'FRANK', 'PAUL',
	'MARK', 'DAN', 'KEN', 'RON', 'RICK', 'STEVE', 'GEORGE', 'PETE', 'RAY', 'AL',
	'FRED', 'JEFF', 'GARY', 'LARRY', 'DOUG', 'DENNIS', 'RANDY', 'SCOTT', 'BRIAN', 'BRUCE',
	'ERIC', 'KEVIN', 'CRAIG', 'GLENN', 'GREG', 'WAYNE', 'CARL', 'TONY', 'KEITH', 'CHRIS',
	'DONALD', 'EDWARD', 'JOSEPH', 'RICHARD', 'ROBERT', 'CHARLES', 'WILLIAM', 'THOMAS', 'JAMES', 'PATRICK',
	'HENRY', 'HAROLD', 'HOWARD', 'WALTER', 'ARTHUR', 'ALBERT', 'EUGENE', 'RALPH', 'LAWRENCE', 'HERBERT',
	'CLARENCE', 'ERNEST', 'WILLIE', 'ANDREW', 'SAMUEL', 'LOUIS', 'OSCAR', 'LEONARD', 'ROY', 'EARL',
	'CHESTER', 'CLIFFORD', 'NORMAN', 'CLYDE', 'HOMER', 'STANLEY', 'LESTER', 'MORRIS', 'RAYMOND', 'LEWIS',
	'LEON', 'EDDIE', 'CHARLIE', 'FLOYD', 'FRED', 'MARTIN', 'MELVIN', 'MARVIN', 'IRVING', 'HARVEY',
	'SAM', 'MAX', 'MACK', 'JOE', 'ABE', 'HARRY', 'NED', 'GUS', 'BERT', 'EARL'
];

const CW_RIGS = [
	'FT-991A', 'FT-891', 'FT-857D', 'FT-450D', 'FT-101ES',  // Yaesu
	'IC-7300', 'IC-7610', 'IC-9700', 'IC-705', 'IC-718',   // ICOM
	'TS-590SG', 'TS-590S', 'TS-480SAT', 'TS-850S', 'TS-2000' // Kenwood
];

const RST_REPORTS = [
	'599', '589', '579', '569', '559', '449', '339'
];

//! ランダムなコールサインを生成する関数。
function generateCallsign(): string {
	const prefixes = ['JA', 'JE', 'JF', 'JH', 'JI', 'JJ', 'JK', 'JL', 'JM', 'JN', 'JO', 'JP', 'JQ', 'JR'];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const area = Math.floor(Math.random() * 10);
	const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
		String.fromCharCode(65 + Math.floor(Math.random() * 26));
	return `${prefix}${area}${suffix}`;
}

//! ランダムな要素を配列から選択する関数。
function randomChoice<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

//! ランダムなQSOを生成する関数。
export function generateRandomQSO(): Template {
	const myCall = generateCallsign();
	const urCall = generateCallsign();
	const myCity = randomChoice(JAPANESE_CITIES);
	const urCity = randomChoice(JAPANESE_CITIES);
	const myName = randomChoice(FIRST_NAMES);
	const urName = randomChoice(FIRST_NAMES);
	const myRST = randomChoice(RST_REPORTS);
	const urRST = randomChoice(RST_REPORTS);
	const myRig = randomChoice(CW_RIGS);
	const urRig = randomChoice(CW_RIGS);
	const greeting = randomChoice(['GM', 'GA', 'GE', 'GN']);

	const qsoText = `CQ CQ CQ DE ${myCall} ${myCall} PSE K BT ${myCall} DE ${urCall} ${urCall} K BT R ${urCall} DE ${myCall} ${greeting} OM TNX FER UR CALL BT UR RST IS ${urRST} ${urRST} BT MI QTH IS ${myCity} ${myCity} ES MI NAME IS ${myName} ${myName} HW ? AR ${myCall} DE ${myCall} KN BT R ${myCall} DE ${urCall} ${greeting} DR ${myName} OM TKS FER FB RPT ${urRST} FM ${myCity} BT UR RST ALSO ${myRST} ${myRST} VY FB MI QTH IS ${urCity} ${urCity} BT NAME IS ${urName} ${urName} HW? ${myCall} DE ${urCall} KN BT R FB DE ${myCall} DR ${urName} OM BT MI RIG IS ${myRig} PWR 100W BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR ${urCall} DE ${myCall} KN BT R ${myCall} DE ${urCall} OK ${myName} OM BT UR RIG ${myRig} VY FB BT MI RIG IS ${urRig} BT QSL VIA JARL OK SURE BT TNX FB QSO ES 73 AR ${myCall} DE ${urCall} VA BT OK ${urName} SOLID CPI BT TKS FB QSO ES BEST 73 AR ${urCall} DE ${myCall} VA TU E E`;

	return {
		id: `qso-random-${Date.now()}`,
		category: 'qso',
		title: 'ランダムQSO',
		content: qsoText
	};
}

//! ラバースタンプQSOのサンプルデータ。
const QSO_TEMPLATES: Template[] = [
	{
		id: 'qso-1',
		category: 'qso',
		title: 'QSO例1: CQ呼び出しから終了まで',
		content: 'CQ CQ CQ DE JF2SDR JF2SDR PSE K'
	},
	{
		id: 'qso-2',
		category: 'qso',
		title: 'QSO例2: 応答',
		content: 'JF2SDR DE JR2ZWA JR2ZWA K'
	},
	{
		id: 'qso-3',
		category: 'qso',
		title: 'QSO例3: 挨拶と信号報告',
		content: 'R JR2ZWA DE JF2SDR GM OM TNX FER UR CALL BT UR RST IS 599 599 BT MI QTH IS NAGOYA NAGOYA CITY ES MI NAME IS SHIN SHIN HW ? AR JF2SDR DE JF2SDR KN'
	},
	{
		id: 'qso-4',
		category: 'qso',
		title: 'QSO例4: 返信と自己紹介',
		content: 'R JF2SDR DE JR2ZWA GM DR SHIN OM TKS FER FB RPT 599 FM NAGOYA BT UR RST ALSO 599 599 VY FB MI QTH IS GIFU GIFU CITY BT NAME IS HIRO HIRO HW? JF2SDR DE JR2ZWA KN'
	},
	{
		id: 'qso-5',
		category: 'qso',
		title: 'QSO例5: リグとアンテナ情報',
		content: 'R FB DE JF2SDR DR HIRO OM BT MI RIG I TS-850S PWR 100W ES ANT IS 3ELE YAGI 12MH BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR JR2ZWA DE JF2SDR KN'
	},
	{
		id: 'qso-6',
		category: 'qso',
		title: 'QSO例6: QSL確認と終了',
		content: 'R JF2SDR DE JR2ZWA OK SHIN OM BT UR RIG ES ANT VY FB BT MI RIG IS FT-101ES VY OLD RIG ES ANT IS DP 8MH BT QSL VIA JARL OK SURE BT TNX FB 1ST QSO ES 73 AR JF2SDR DE JR2ZWA VA'
	},
	{
		id: 'qso-7',
		category: 'qso',
		title: 'QSO例7: 最終挨拶',
		content: 'OK HIRO SOLID CPI BT TKS FB QSO ES BEST 73 AR JR2ZWA DE JF2SDR VA TU E E'
	}
];

//! 英文100字程度のサンプルデータ。
const TEXT100_TEMPLATES: Template[] = [
	{
		id: 'text100-1',
		category: 'text100',
		title: '英文例1: 自己紹介',
		content: 'MY NAME IS JOHN. I LIVE IN TOKYO JAPAN. I AM A STUDENT AT THE UNIVERSITY. I ENJOY LEARNING MORSE CODE IN MY FREE TIME.'
	},
	{
		id: 'text100-2',
		category: 'text100',
		title: '英文例2: 天気',
		content: 'THE WEATHER TODAY IS VERY NICE. IT IS SUNNY AND WARM. I WENT FOR A WALK IN THE PARK. MANY PEOPLE WERE ENJOYING THE SUNSHINE.'
	},
	{
		id: 'text100-3',
		category: 'text100',
		title: '英文例3: 趣味',
		content: 'I HAVE MANY HOBBIES. I LIKE READING BOOKS AND LISTENING TO MUSIC. ON WEEKENDS I PLAY TENNIS WITH MY FRIENDS. WE HAVE A LOT OF FUN.'
	}
];

//! 英文200字程度のサンプルデータ。
const TEXT200_TEMPLATES: Template[] = [
	{
		id: 'text200-1',
		category: 'text200',
		title: '英文例1: アマチュア無線の歴史',
		content: 'AMATEUR RADIO HAS A LONG AND RICH HISTORY. IT BEGAN IN THE EARLY TWENTIETH CENTURY WHEN ENTHUSIASTS STARTED EXPERIMENTING WITH RADIO WAVES. MORSE CODE WAS THE PRIMARY MODE OF COMMUNICATION. TODAY AMATEUR RADIO CONTINUES TO BE A POPULAR HOBBY AROUND THE WORLD. OPERATORS USE VARIOUS MODES INCLUDING CW SSB AND DIGITAL MODES. IT IS A GREAT WAY TO MAKE FRIENDS AND LEARN ABOUT TECHNOLOGY.'
	},
	{
		id: 'text200-2',
		category: 'text200',
		title: '英文例2: 旅行の思い出',
		content: 'LAST SUMMER I WENT ON A TRIP TO KYOTO. IT WAS MY FIRST TIME VISITING THE ANCIENT CAPITAL OF JAPAN. I VISITED MANY FAMOUS TEMPLES AND SHRINES. THE ARCHITECTURE WAS BEAUTIFUL AND THE GARDENS WERE PEACEFUL. I ALSO ENJOYED TRYING LOCAL FOODS LIKE TOFU AND GREEN TEA. THE PEOPLE WERE VERY FRIENDLY AND HELPFUL. I TOOK MANY PHOTOS TO REMEMBER THIS WONDERFUL EXPERIENCE. I HOPE TO RETURN SOMEDAY.'
	}
];

//! 英文300字程度のサンプルデータ。
const TEXT300_TEMPLATES: Template[] = [
	{
		id: 'text300-1',
		category: 'text300',
		title: '英文例1: モールス符号の学習',
		content: 'LEARNING MORSE CODE IS A REWARDING EXPERIENCE. AT FIRST IT MAY SEEM DIFFICULT BUT WITH REGULAR PRACTICE IT BECOMES EASIER. THE KOCH METHOD IS ONE OF THE MOST EFFECTIVE WAYS TO LEARN. IT STARTS WITH JUST TWO CHARACTERS AND GRADUALLY ADDS MORE. THIS APPROACH HELPS YOU LEARN AT A STEADY PACE. LISTENING PRACTICE IS ALSO VERY IMPORTANT. YOU SHOULD TRY TO COPY REAL MORSE CODE TRANSMISSIONS. MANY ONLINE RESOURCES ARE AVAILABLE TO HELP YOU PRACTICE. JOINING AN AMATEUR RADIO CLUB CAN ALSO BE BENEFICIAL. YOU CAN MEET OTHER ENTHUSIASTS AND SHARE EXPERIENCES. WITH DEDICATION AND PATIENCE YOU WILL MASTER MORSE CODE AND ENJOY USING IT IN YOUR RADIO COMMUNICATIONS.'
	},
	{
		id: 'text300-2',
		category: 'text300',
		title: '英文例2: 無線交信の楽しみ',
		content: 'AMATEUR RADIO OFFERS MANY EXCITING OPPORTUNITIES. ONE OF THE GREATEST JOYS IS MAKING CONTACT WITH STATIONS AROUND THE WORLD. YOU CAN TALK TO PEOPLE FROM DIFFERENT COUNTRIES AND CULTURES. EACH CONTACT IS UNIQUE AND SPECIAL. SOME OPERATORS ENJOY CONTESTS WHERE THEY TRY TO MAKE AS MANY CONTACTS AS POSSIBLE. OTHERS PREFER RELAXED CONVERSATIONS ABOUT HOBBIES AND DAILY LIFE. DX CONTACTS WITH DISTANT STATIONS ARE PARTICULARLY THRILLING. THE THRILL OF HEARING A WEAK SIGNAL FROM FAR AWAY IS UNFORGETTABLE. OPERATING PORTABLE FROM MOUNTAINTOPS OR PARKS IS ALSO FUN. YOU CAN COMBINE YOUR LOVE OF RADIO WITH OUTDOOR ACTIVITIES. AMATEUR RADIO IS MORE THAN A HOBBY IT IS A LIFELONG PASSION.'
	}
];

//! すべてのビルトイン定型文を取得する関数。
export function getAllBuiltinTemplates(): Template[] {
	return [...QSO_TEMPLATES, ...TEXT100_TEMPLATES, ...TEXT200_TEMPLATES, ...TEXT300_TEMPLATES];
}

//! カテゴリー別に定型文を取得する関数。
export function getTemplatesByCategory(category: Template['category']): Template[] {
	switch (category) {
		case 'qso':
			// ランダムQSO生成ボタンを先頭に追加
			const randomQSOButton: Template = {
				id: 'qso-random-generate',
				category: 'qso',
				title: '🎲 ランダムQSOを生成',
				content: ''
			};
			return [randomQSOButton, ...QSO_TEMPLATES];
		case 'text100':
			return TEXT100_TEMPLATES;
		case 'text200':
			return TEXT200_TEMPLATES;
		case 'text300':
			return TEXT300_TEMPLATES;
		case 'custom':
			return getCustomTemplates();
		default:
			return [];
	}
}

//! ユーザー定義定型文をローカルストレージから取得する関数。
export function getCustomTemplates(): Template[] {
	try {
		const saved = localStorage.getItem('v8.listening.customTemplates');
		if (saved) {
			return JSON.parse(saved);
		}
	} catch (error) {
		console.error('Failed to load custom templates:', error);
	}
	return [];
}

//! ユーザー定義定型文をローカルストレージに保存する関数。
export function saveCustomTemplates(templates: Template[]): void {
	try {
		localStorage.setItem('v8.listening.customTemplates', JSON.stringify(templates));
	} catch (error) {
		console.error('Failed to save custom templates:', error);
	}
}

//! 新しいユーザー定義定型文を追加する関数。
export function addCustomTemplate(title: string, content: string): void {
	const templates = getCustomTemplates();
	const newTemplate: Template = {
		id: `custom-${Date.now()}`,
		category: 'custom',
		title,
		content
	};
	templates.push(newTemplate);
	saveCustomTemplates(templates);
}

//! ユーザー定義定型文を更新する関数。
export function updateCustomTemplate(id: string, title: string, content: string): void {
	const templates = getCustomTemplates();
	const index = templates.findIndex(t => t.id === id);
	if (index !== -1) {
		templates[index].title = title;
		templates[index].content = content;
		saveCustomTemplates(templates);
	}
}

//! ユーザー定義定型文を削除する関数。
export function deleteCustomTemplate(id: string): void {
	const templates = getCustomTemplates();
	const filtered = templates.filter(t => t.id !== id);
	saveCustomTemplates(filtered);
}

//! IDで定型文を取得する関数。
export function getTemplateById(id: string): Template | undefined {
	const all = [...getAllBuiltinTemplates(), ...getCustomTemplates()];
	return all.find(t => t.id === id);
}

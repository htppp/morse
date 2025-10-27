/**
 * 聞き取り練習トレーナー
 * UI非依存のピュアロジック実装
 * テンプレート管理とランダムQSO生成機能を提供
 */

/**
 * 聞き取り練習用テンプレートのカテゴリー
 */
export type TemplateCategory = 'qso' | 'text100' | 'text200' | 'text300';

/**
 * QSO対話のセグメント
 */
export interface DialogSegment {
	/**
	 * 発言側（A: 送信局、B: 応答局）
	 */
	side: 'A' | 'B';

	/**
	 * 発言内容
	 */
	text: string;
}

/**
 * 聞き取り練習用テンプレート
 */
export interface ListeningTemplate {
	/**
	 * テンプレートID
	 */
	id: string;

	/**
	 * カテゴリー
	 */
	category: TemplateCategory;

	/**
	 * タイトル
	 */
	title: string;

	/**
	 * 対話セグメント（QSOカテゴリの場合）
	 */
	dialog?: DialogSegment[];

	/**
	 * 本文（テキストカテゴリの場合）
	 */
	content?: string;
}

//! 日本の都市名（ローマ字）。
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

//! 名前（ファーストネーム）。
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

//! CW用無線機のリスト。
const CW_RIGS = [
	'FT-991A', 'FT-891', 'FT-857D', 'FT-450D', 'FT-101ES',  // Yaesu
	'IC-7300', 'IC-7610', 'IC-9700', 'IC-705', 'IC-718',   // ICOM
	'TS-590SG', 'TS-590S', 'TS-480SAT', 'TS-850S', 'TS-2000' // Kenwood
];

//! RSTレポートのリスト。
const RST_REPORTS = [
	'599', '589', '579', '569', '559', '449', '339'
];

//! QSOのサンプルテンプレート。
const QSO_TEMPLATES: ListeningTemplate[] = [
	{
		id: 'qso-rubberstamp-1',
		category: 'qso',
		title: 'ラバースタンプQSO例: 完全な交信',
		dialog: [
			{ side: 'A', text: 'CQ CQ CQ DE JF2SDR JF2SDR PSE K' },
			{ side: 'B', text: 'JF2SDR DE JR2ZWA JR2ZWA K' },
			{ side: 'A', text: 'R JR2ZWA DE JF2SDR GM OM TNX FER UR CALL BT UR RST IS 599 599 BT MI QTH IS NAGOYA NAGOYA CITY ES MI NAME IS SHIN SHIN HW ? AR JF2SDR DE JF2SDR KN' },
			{ side: 'B', text: 'R JF2SDR DE JR2ZWA GM DR SHIN OM TKS FER FB RPT 599 FM NAGOYA BT UR RST ALSO 599 599 VY FB MI QTH IS GIFU GIFU CITY BT NAME IS HIRO HIRO HW? JF2SDR DE JR2ZWA KN' },
			{ side: 'A', text: 'R FB DE JF2SDR DR HIRO OM BT MI RIG IS TS-850S PWR 100W ES ANT IS 3ELE YAGI 12MH BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR JR2ZWA DE JF2SDR KN' },
			{ side: 'B', text: 'R JF2SDR DE JR2ZWA OK SHIN OM BT UR RIG ES ANT VY FB BT MI RIG IS FT-101ES VY OLD RIG ES ANT IS DP 8MH BT QSL VIA JARL OK SURE BT TNX FB 1ST QSO ES 73 AR JF2SDR DE JR2ZWA VA' },
			{ side: 'A', text: 'OK HIRO SOLID CPI BT TKS FB QSO ES BEST 73 AR JR2ZWA DE JF2SDR VA TU E E' }
		]
	},
	{
		id: 'qso-short-1',
		category: 'qso',
		title: 'QSO例: 短い交信（CQ呼び出しと応答）',
		dialog: [
			{ side: 'A', text: 'CQ CQ CQ DE JA1ABC JA1ABC PSE K' },
			{ side: 'B', text: 'JA1ABC DE JE1XYZ JE1XYZ K' },
			{ side: 'A', text: 'R JE1XYZ DE JA1ABC TKS UR RST 599 QTH TOKYO TKS QSO 73 AR JA1ABC DE JA1ABC VA' },
			{ side: 'B', text: 'R JA1ABC DE JE1XYZ TKS 599 QTH OSAKA 73 AR JE1XYZ VA' }
		]
	},
	{
		id: 'qso-short-2',
		category: 'qso',
		title: 'QSO例: 挨拶と信号報告のみ',
		dialog: [
			{ side: 'A', text: 'CQ DX CQ DX DE JH8ZZZ JH8ZZZ K' },
			{ side: 'B', text: 'JH8ZZZ DE VK2AAA VK2AAA K' },
			{ side: 'A', text: 'R VK2AAA DE JH8ZZZ GM UR RST 579 NAME TARO QTH SAPPORO HW? AR JH8ZZZ KN' },
			{ side: 'B', text: 'R JH8ZZZ DE VK2AAA TKS TARO UR RST 589 NAME JOHN QTH SYDNEY 73 AR VK2AAA VA' },
			{ side: 'A', text: 'R VK2AAA TNX QSO 73 AR JH8ZZZ VA TU' }
		]
	}
];

//! 英文100字程度のサンプルテンプレート。
const TEXT100_TEMPLATES: ListeningTemplate[] = [
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

//! 英文200字程度のサンプルテンプレート。
const TEXT200_TEMPLATES: ListeningTemplate[] = [
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

//! 英文300字程度のサンプルテンプレート。
const TEXT300_TEMPLATES: ListeningTemplate[] = [
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

/**
 * 聞き取り練習トレーナークラス
 */
export class ListeningTrainer {
	/**
	 * ランダムなコールサインを生成する
	 * @returns JA/JE/JF等のプレフィックス + 0-9のエリア番号 + 3文字のサフィックス
	 */
	static generateCallsign(): string {
		const prefixes = ['JA', 'JE', 'JF', 'JH', 'JI', 'JJ', 'JK', 'JL', 'JM', 'JN', 'JO', 'JP', 'JQ', 'JR'];
		const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
		const area = Math.floor(Math.random() * 10);
		const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
			String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
			String.fromCharCode(65 + Math.floor(Math.random() * 26));
		return `${prefix}${area}${suffix}`;
	}

	/**
	 * 配列からランダムな要素を選択する
	 * @param array - 選択元の配列
	 * @returns ランダムに選ばれた要素
	 */
	private static randomChoice<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	}

	/**
	 * ランダムなQSOを生成する
	 * @returns 完全なQSOテンプレート
	 */
	static generateRandomQSO(): ListeningTemplate {
		const myCall = this.generateCallsign();
		const urCall = this.generateCallsign();
		const myCity = this.randomChoice(JAPANESE_CITIES);
		const urCity = this.randomChoice(JAPANESE_CITIES);
		const myName = this.randomChoice(FIRST_NAMES);
		const urName = this.randomChoice(FIRST_NAMES);
		const myRST = this.randomChoice(RST_REPORTS);
		const urRST = this.randomChoice(RST_REPORTS);
		const myRig = this.randomChoice(CW_RIGS);
		const urRig = this.randomChoice(CW_RIGS);
		const greeting = this.randomChoice(['GM', 'GA', 'GE', 'GN']);

		return {
			id: `qso-random-${Date.now()}`,
			category: 'qso',
			title: 'ランダムQSO',
			dialog: [
				{ side: 'A', text: `CQ CQ CQ DE ${myCall} ${myCall} PSE K` },
				{ side: 'B', text: `${myCall} DE ${urCall} ${urCall} K` },
				{ side: 'A', text: `R ${urCall} DE ${myCall} ${greeting} OM TNX FER UR CALL BT UR RST IS ${urRST} ${urRST} BT MI QTH IS ${myCity} ${myCity} ES MI NAME IS ${myName} ${myName} HW ? AR ${myCall} DE ${myCall} KN` },
				{ side: 'B', text: `R ${myCall} DE ${urCall} ${greeting} DR ${myName} OM TKS FER FB RPT ${urRST} FM ${myCity} BT UR RST ALSO ${myRST} ${myRST} VY FB MI QTH IS ${urCity} ${urCity} BT NAME IS ${urName} ${urName} HW? ${myCall} DE ${urCall} KN` },
				{ side: 'A', text: `R FB DE ${myCall} DR ${urName} OM BT MI RIG IS ${myRig} PWR 100W BT PSE UR QSL CRD VIA JARL ? MI CRD SURE HW? AR ${urCall} DE ${myCall} KN` },
				{ side: 'B', text: `R ${myCall} DE ${urCall} OK ${myName} OM BT UR RIG ${myRig} VY FB BT MI RIG IS ${urRig} BT QSL VIA JARL OK SURE BT TNX FB QSO ES 73 AR ${myCall} DE ${urCall} VA` },
				{ side: 'A', text: `OK ${urName} SOLID CPI BT TKS FB QSO ES BEST 73 AR ${urCall} DE ${myCall} VA TU E E` }
			]
		};
	}

	/**
	 * カテゴリー別にビルトインテンプレートを取得する
	 * @param category - テンプレートカテゴリー（省略時は全カテゴリー）
	 * @returns テンプレートの配列
	 */
	static getBuiltinTemplates(category?: TemplateCategory): ListeningTemplate[] {
		if (!category) {
			return [...QSO_TEMPLATES, ...TEXT100_TEMPLATES, ...TEXT200_TEMPLATES, ...TEXT300_TEMPLATES];
		}

		switch (category) {
			case 'qso':
				return [...QSO_TEMPLATES];
			case 'text100':
				return [...TEXT100_TEMPLATES];
			case 'text200':
				return [...TEXT200_TEMPLATES];
			case 'text300':
				return [...TEXT300_TEMPLATES];
			default:
				return [];
		}
	}

	/**
	 * IDでテンプレートを検索する
	 * @param id - テンプレートID
	 * @returns 該当するテンプレート（見つからない場合はundefined）
	 */
	static getTemplateById(id: string): ListeningTemplate | undefined {
		const all = this.getBuiltinTemplates();
		return all.find(t => t.id === id);
	}

	/**
	 * レーベンシュタイン距離（編集距離）を計算する
	 * @param str1 - 比較する文字列1
	 * @param str2 - 比較する文字列2
	 * @returns 編集距離
	 */
	private static levenshteinDistance(str1: string, str2: string): number {
		const len1 = str1.length;
		const len2 = str2.length;

		//! 動的計画法用の2次元配列を作成。
		const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

		//! 初期化: str1の各文字を削除するコスト。
		for (let i = 0; i <= len1; i++) {
			dp[i][0] = i;
		}

		//! 初期化: str2の各文字を挿入するコスト。
		for (let j = 0; j <= len2; j++) {
			dp[0][j] = j;
		}

		//! 動的計画法で編集距離を計算。
		for (let i = 1; i <= len1; i++) {
			for (let j = 1; j <= len2; j++) {
				if (str1[i - 1] === str2[j - 1]) {
					//! 文字が一致する場合、コストは増えない。
					dp[i][j] = dp[i - 1][j - 1];
				} else {
					//! 文字が一致しない場合、挿入・削除・置換の最小コストを選択。
					dp[i][j] = Math.min(
						dp[i - 1][j] + 1,     // 削除
						dp[i][j - 1] + 1,     // 挿入
						dp[i - 1][j - 1] + 1  // 置換
					);
				}
			}
		}

		return dp[len1][len2];
	}

	/**
	 * 2つの文字列の差分を計算し、各文字の状態を返す
	 * @param str1 - 正解の文字列
	 * @param str2 - ユーザー入力の文字列
	 * @returns 差分情報の配列
	 */
	static getDifference(str1: string, str2: string): Array<{type: 'match' | 'replace' | 'delete' | 'insert', correctChar?: string, inputChar?: string, correctIndex: number, inputIndex: number}> {
		const len1 = str1.length;
		const len2 = str2.length;

		//! 動的計画法用の2次元配列を作成。
		const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

		//! 初期化。
		for (let i = 0; i <= len1; i++) {
			dp[i][0] = i;
		}
		for (let j = 0; j <= len2; j++) {
			dp[0][j] = j;
		}

		//! 動的計画法で編集距離を計算。
		for (let i = 1; i <= len1; i++) {
			for (let j = 1; j <= len2; j++) {
				if (str1[i - 1] === str2[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1];
				} else {
					dp[i][j] = Math.min(
						dp[i - 1][j] + 1,     // 削除
						dp[i][j - 1] + 1,     // 挿入
						dp[i - 1][j - 1] + 1  // 置換
					);
				}
			}
		}

		//! バックトラックで差分を取得。
		const diff: Array<{type: 'match' | 'replace' | 'delete' | 'insert', correctChar?: string, inputChar?: string, correctIndex: number, inputIndex: number}> = [];
		let i = len1;
		let j = len2;

		while (i > 0 || j > 0) {
			if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
				//! 一致。
				diff.unshift({type: 'match', correctChar: str1[i - 1], inputChar: str2[j - 1], correctIndex: i - 1, inputIndex: j - 1});
				i--;
				j--;
			} else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
				//! 置換。
				diff.unshift({type: 'replace', correctChar: str1[i - 1], inputChar: str2[j - 1], correctIndex: i - 1, inputIndex: j - 1});
				i--;
				j--;
			} else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
				//! 削除（正解にあるが入力にない）。
				diff.unshift({type: 'delete', correctChar: str1[i - 1], correctIndex: i - 1, inputIndex: j});
				i--;
			} else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
				//! 挿入（入力にあるが正解にない）。
				diff.unshift({type: 'insert', inputChar: str2[j - 1], correctIndex: i, inputIndex: j - 1});
				j--;
			}
		}

		return diff;
	}

	/**
	 * 正答率を計算する
	 * レーベンシュタイン距離を使用して、挿入・削除・置換を適切に扱う
	 * @param correctAnswer - 正解の文字列
	 * @param userInput - ユーザー入力の文字列
	 * @returns 正答率（0-100）
	 */
	static calculateAccuracy(correctAnswer: string, userInput: string): number {
		if (!userInput) return 0;

		//! 空白を除去して大文字化して比較。
		const correct = correctAnswer.replace(/\s/g, '').toUpperCase();
		const input = userInput.replace(/\s/g, '').toUpperCase();

		if (correct.length === 0) return 0;

		//! レーベンシュタイン距離を計算。
		const distance = this.levenshteinDistance(correct, input);

		//! 正答率 = (1 - (編集距離 / 正解の長さ)) * 100
		//! 正解の長さを基準にすることで、正解より長い入力でも適切に採点できる。
		const accuracy = Math.max(0, (1 - distance / correct.length) * 100);

		//! 小数点1桁に丸めて返す。
		return Math.round(accuracy * 10) / 10;
	}

	/**
	 * 合格判定
	 * @param accuracy - 正答率（0-100）
	 * @param threshold - 合格ライン（デフォルト: 90）
	 * @returns 合格の場合true
	 */
	static isPassed(accuracy: number, threshold: number = 90): boolean {
		return accuracy >= threshold;
	}

	/**
	 * 全カテゴリーのテンプレート数を取得する
	 * @returns カテゴリーごとのテンプレート数
	 */
	static getTemplateCounts(): Record<TemplateCategory, number> {
		return {
			qso: QSO_TEMPLATES.length,
			text100: TEXT100_TEMPLATES.length,
			text200: TEXT200_TEMPLATES.length,
			text300: TEXT300_TEMPLATES.length
		};
	}

	/**
	 * 全ビルトインテンプレートの総数を取得する
	 * @returns 全テンプレート数
	 */
	static getTotalTemplateCount(): number {
		return QSO_TEMPLATES.length + TEXT100_TEMPLATES.length +
			TEXT200_TEMPLATES.length + TEXT300_TEMPLATES.length;
	}

}

/**
 * メニュービュー
 */

import type { View } from '../../router';

/**
 * メニュー項目の定義
 */
interface MenuItem {
	id: string;
	title: string;
	description: string;
	route: string;
}

/**
 * メニュービュークラス
 */
export class MenuView implements View {
	private menuItems: MenuItem[] = [
		{
			id: 'vertical',
			title: '縦振り電鍵練習',
			description: '上下に動かす電鍵（ストレートキー）の練習',
			route: 'vertical'
		},
		{
			id: 'horizontal',
			title: '横振り電鍵練習',
			description: '左右に動かす電鍵（パドル）の練習（Iambic A/B対応）',
			route: 'horizontal'
		},
		{
			id: 'flashcard',
			title: 'CW略語・Q符号',
			description: 'CW通信で使用される略語とQ符号を学習',
			route: 'flashcard'
		},
		{
			id: 'koch',
			title: 'コッホ法トレーニング',
			description: '段階的に文字を増やして学習する方式',
			route: 'koch'
		},
		{
			id: 'listening',
			title: 'モールス信号聞き取り練習',
			description: 'ランダムQSOや英文を聞いて練習',
			route: 'listening'
		}
	];

	/**
	 * ビューをレンダリングする
	 */
	render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="menu-header">
					<h1>モールス練習アプリ</h1>
					<p class="version">v11 - タイミング評価版</p>
				</header>

				<main class="menu-main">
					<div class="menu-grid">
						${this.menuItems.map(item => this.renderMenuItem(item)).join('')}
					</div>
				</main>

				<footer class="menu-footer">
					<p>&copy; 2025 モールス練習アプリ</p>
				</footer>
			</div>
		`;

		//! イベントリスナーを設定。
		this.attachEventListeners();
	}

	/**
	 * メニュー項目を描画する
	 */
	private renderMenuItem(item: MenuItem): string {
		return `
			<div class="menu-item" data-route="${item.route}">
				<h2 class="menu-item-title">${item.title}</h2>
				<p class="menu-item-description">${item.description}</p>
			</div>
		`;
	}

	/**
	 * イベントリスナーを設定する
	 */
	private attachEventListeners(): void {
		const menuItems = document.querySelectorAll('.menu-item');
		menuItems.forEach(item => {
			item.addEventListener('click', () => {
				const route = item.getAttribute('data-route');
				if (route) {
					window.location.hash = `#${route}`;
				}
			});
		});
	}

	/**
	 * ビューを破棄する
	 */
	destroy(): void {
		//! イベントリスナーは新しいHTMLで上書きされるため、特に処理不要。
	}
}

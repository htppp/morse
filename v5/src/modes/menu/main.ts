/**
 * メニューページ - v5の4つの機能へのナビゲーション
 */

import { ModeController } from '../../core/router';
import './style.css';

interface MenuItem {
	id: string;
	title: string;
	description: string;
	icon: string;
	hash: string;
}

const menuItems: MenuItem[] = [
	{
		id: 'vertical',
		title: '縦振り電鍵練習',
		description: '縦振り電鍵の操作を練習',
		icon: '⬇️',
		hash: '#vertical',
	},
	{
		id: 'horizontal',
		title: '横振り電鍵練習',
		description: '横振り電鍵の操作を練習',
		icon: '↔️',
		hash: '#horizontal',
	},
	{
		id: 'flashcard',
		title: 'CW略語・Q符号学習',
		description: 'フラッシュカード・試験モード',
		icon: '📚',
		hash: '#flashcard',
	},
	{
		id: 'koch',
		title: 'コッホ法トレーニング',
		description: '40文字を段階的に習得',
		icon: '🎓',
		hash: '#koch',
	},
];

export class MenuPage implements ModeController {
	constructor() {
		this.render();
	}

	private render(): void {
		const app = document.getElementById('app');
		if (!app) return;

		app.innerHTML = `
			<div class="container">
				<header class="header">
					<h1>モールス練習アプリ v5</h1>
					<p class="subtitle">練習メニューを選択してください</p>
				</header>

				<div class="menu-grid">
					${menuItems
						.map(
							(item) => `
						<a href="${item.hash}" class="menu-card" data-id="${item.id}">
							<div class="menu-icon">${item.icon}</div>
							<h2 class="menu-title">${item.title}</h2>
							<p class="menu-description">${item.description}</p>
						</a>
					`
						)
						.join('')}
				</div>

				<footer class="footer">
					<p>モールス練習アプリ v5 - 完全SPA版</p>
				</footer>
			</div>
		`;
	}

	/**
	 * クリーンアップ処理
	 */
	destroy(): void {
		// メニューページにはクリーンアップすべきリソースはない
	}
}

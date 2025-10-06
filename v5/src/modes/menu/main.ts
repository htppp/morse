/**
 * メニューページ - v4の4つの機能へのナビゲーション
 */

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'vertical',
    title: '縦振り電鍵練習',
    description: '縦振り電鍵の操作を練習',
    icon: '⬇️',
    url: './vertical.html',
  },
  {
    id: 'horizontal',
    title: '横振り電鍵練習',
    description: '横振り電鍵の操作を練習',
    icon: '↔️',
    url: './horizontal.html',
  },
  {
    id: 'flashcard',
    title: 'CW略語・Q符号学習',
    description: 'フラッシュカード・試験モード',
    icon: '📚',
    url: './flashcard.html',
  },
  {
    id: 'koch',
    title: 'コッホ法トレーニング',
    description: '40文字を段階的に習得',
    icon: '🎓',
    url: './koch.html',
  },
];

function renderMenu() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>モールス練習アプリ v4</h1>
        <p class="subtitle">練習メニューを選択してください</p>
      </header>

      <div class="menu-grid">
        ${menuItems
          .map(
            (item) => `
          <a href="${item.url}" class="menu-card" data-id="${item.id}">
            <div class="menu-icon">${item.icon}</div>
            <h2 class="menu-title">${item.title}</h2>
            <p class="menu-description">${item.description}</p>
          </a>
        `
          )
          .join('')}
      </div>

      <footer class="footer">
        <p>モールス練習アプリ v4 - 統合版</p>
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

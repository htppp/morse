/// <reference types="vite/client" />

// ?rawサフィックスでインポートされるファイルの型定義
declare module '*.tsv?raw' {
	const content: string;
	export default content;
}

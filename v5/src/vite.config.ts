import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ command }) => {
  // 環境変数で入力ファイルを指定
  const input = process.env.VITE_INPUT || './menu/index.html';

  return {
    root: '.',
    publicDir: 'public',
    base: './',
    plugins: [viteSingleFile()],
    build: {
      outDir: 'dist',
      emptyOutDir: false, // 個別ビルド時にクリアしない
      rollupOptions: {
        input,
      },
    },
    server: {
      port: 3000,
    },
  };
});

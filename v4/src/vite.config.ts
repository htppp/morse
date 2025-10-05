import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        menu: resolve(__dirname, 'menu/index.html'),
        vertical: resolve(__dirname, 'vertical/index.html'),
        horizontal: resolve(__dirname, 'horizontal/index.html'),
        flashcard: resolve(__dirname, 'flashcard/index.html'),
        koch: resolve(__dirname, 'koch/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  server: {
    port: 3000,
  },
});

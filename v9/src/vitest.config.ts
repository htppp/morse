/**
 * Vitest設定ファイル
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./vitest.setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/mockData/*',
				'src/main.ts', // エントリーポイント
			],
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 70,
				statements: 70
			}
		}
	}
});

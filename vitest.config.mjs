import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			exclude: [
				'bin/**',
				'**/engine-interface**',
				'dist-site/**',
				'site/**',
				'test/**',
				'dist/**',
				'vitest.config.mjs'
			],
		},
	},
});

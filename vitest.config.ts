import {defineConfig} from 'vitest/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
				'vitest.config.ts',
			],
		},
	},
});

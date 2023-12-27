// Vitest.config.ts
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			exclude: ['**/engine-interface**'],
		},
	},
});

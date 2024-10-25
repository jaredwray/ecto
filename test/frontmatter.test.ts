import fs from 'node:fs';
import {describe, expect, test} from 'vitest';
import {Ecto} from '../src/ecto.js';

describe('Ecto FrontMatter', async () => {
	const frontMatterDocument = await fs.promises.readFile('./test/data/frontmatter/frontmatter.md', 'utf8');
	const noFrontMatterDocument = await fs.promises.readFile('./test/data/frontmatter/no-frontmatter.md', 'utf8');

	test('should return true with frontMatter', async () => {
		const ecto = new Ecto();
		expect(ecto.hasFrontMatter(frontMatterDocument)).toBe(true);
	});

	test('should return false with no frontMatter', async () => {
		const ecto = new Ecto();
		expect(ecto.hasFrontMatter(noFrontMatterDocument)).toBe(false);
	});
});

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

	test('should get the front matter', async () => {
		const ecto = new Ecto();
		const frontMatter = ecto.getFrontMatter(frontMatterDocument);
		expect(frontMatter?.date).toEqual('2023-10-01');
		expect(frontMatter?.title).toEqual('Project Title');
		expect(frontMatter?.tags).toEqual(['project', 'documentation', 'example']);
	});

	test('should remove the front matter', async () => {
		const ecto = new Ecto();
		const content = ecto.removeFrontMatter(frontMatterDocument);
		console.log(content);
		expect(ecto.hasFrontMatter(content)).toBe(false);
	});
});

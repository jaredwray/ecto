import fs from 'node:fs';
import {describe, expect, test} from 'vitest';
import {Ecto} from '../src/ecto.js';

describe('Ecto FrontMatter', async () => {
	const frontMatterDocument = await fs.promises.readFile('./test/data/markdown/frontmatter.md', 'utf8');
	const noFrontMatterDocument = await fs.promises.readFile('./test/data/markdown/no-frontmatter.md', 'utf8');

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
		expect(ecto.hasFrontMatter(content)).toBe(false);
	});

	test('should add front matter', async () => {
		const ecto = new Ecto();
		const frontMatter = {
			title: 'Project Title',
			date: '2023-10-01',
			tags: ['project', 'documentation', 'example'],
		};
		const content = ecto.setFrontMatter(noFrontMatterDocument, frontMatter);
		expect(ecto.hasFrontMatter(content)).toBe(true);
	});
});

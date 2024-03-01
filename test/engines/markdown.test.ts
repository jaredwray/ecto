import {expect, it} from 'vitest';
import {Markdown} from '../../src/engines/markdown.js';

const exampleSource1 = '# markdown rulezz!';
const exampleSource2 = '_markdown_ rulezz!';

it('Markdown - Default Name markdown', () => {
	const engine = new Markdown();
	expect(engine.names.toString()).toContain('markdown');
});

it('Markdown - Setting Opts on the Constructor', () => {
	const options = {
		variables: {
			name: 'Variable1',
			frontmatter: {
				title: 'Variable content',
			},
		},
	};
	const engine = new Markdown(options);
	expect(engine.opts).toBe(options);
});

it('Markdown - Rendering with default Opts', async () => {
	const engine = new Markdown();
	engine.opts = undefined;
	expect(await engine.render(exampleSource1)).toContain('<h1 id="markdown-rulezz">markdown rulezz!</h1>');
});

it('Markdown - Extension should be a count of 2', () => {
	const engine = new Markdown();
	expect(engine.getExtensions().length).toBe(2);
});

it('Markdown - Rendering a simple string', async () => {
	const engine = new Markdown();
	expect(await engine.render(exampleSource1)).toContain('</h1>');
});

it('Markdown - Rendering a simple string synchronous', () => {
	const engine = new Markdown();
	expect(engine.renderSync(exampleSource1)).toContain('</h1>');
});

it('Markdown - Rendering a simple string after inital render', async () => {
	const engine = new Markdown();
	expect(await engine.render(exampleSource1)).toContain('<h1');
	expect(await engine.render(exampleSource2)).toContain('<em>');
});

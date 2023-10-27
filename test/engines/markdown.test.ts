import {Markdown} from '../../src/engines/markdown.js';

const exampleSource1 = '# markdown rulezz!';
const exampleSource2 = '_markdown_ rulezz!';

test('Markdown - Default Name markdown', () => {
	const engine = new Markdown();
	expect(engine.names.toString()).toContain('markdown');
});

test('Markdown - Setting Opts on the Constructor', () => {
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

test('Markdown - Rendering with default Opts', async () => {
	const engine = new Markdown();
	engine.opts = undefined;
	expect(await engine.render(exampleSource1)).toContain('<h1>markdown rulezz!</h1>');
});

test('Markdown - Extension should be a count of 2', () => {
	const engine = new Markdown();
	expect(engine.getExtensions().length).toBe(2);
});

test('Markdown - Rendering a simple string', async () => {
	const engine = new Markdown();
	expect(await engine.render(exampleSource1)).toContain('</h1>');
});

test('Markdown - Rendering a simple string after inital render', async () => {
	const engine = new Markdown();
	expect(await engine.render(exampleSource1)).toContain('<h1');
	expect(await engine.render(exampleSource2)).toContain('<em>');
});

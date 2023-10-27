import * as fs from 'fs-extra';
import {Nunjucks} from '../../src/engines/nunjucks.js';

const exampleSource1 = 'Hello {{ username }}';
const exampleData1 = {username: 'john.doe'};
const exampleSource2 = '<h1>Posts</h1><ul>{% for item in items %}<li>{{ item.title }}</li>{% else %}<li>This would display if the \'item\' collection were empty</li>{% endfor %}</ul>';
const exampleData2 = {items: [{title: 'foo', id: 1}, {title: 'bar', id: 2}]};

const testTemplateDir = './test/data/nunjucks';

test('Nunjucks - Default Name Nunjucks', () => {
	const engine = new Nunjucks();
	expect(engine.names.toString()).toContain('nunjucks');
});

test('Nunjucks - Opts should be set by', () => {
	const engine = new Nunjucks();
	expect(engine.opts.autoescape).toBe(true);
});

test('Nunjucks - Opts should be undefined by default', () => {
	const engine = new Nunjucks({autoescape: false});
	expect(engine.opts.autoescape).toBe(false);
});

test('Nunjucks - Setting Opts on the Constructor', () => {
	const options = {cool: true};
	const engine = new Nunjucks(options);
	expect(engine.opts).toBe(options);
});

test('Nunjucks - Extension should be a count of 1', () => {
	const engine = new Nunjucks();
	expect(engine.getExtensions().length).toBe(1);
});

test('Nunjucks - Rendering a simple string', async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource1, exampleData1)).toContain('john.doe');
});

test('Nunjucks - Rendering a simple string with no data', async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource1, undefined)).toBe('Hello ');
});

test('Nunjucks - Rendering a list / ul html', async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource2, exampleData2)).toContain('<h1>Posts</h1><ul><li>foo</li><li>bar</li></ul>');
});

test('Nunjucks - Rendering no data', async () => {
	const engine = new Nunjucks();
	const data = {items: []};
	expect(await engine.render(exampleSource2, data)).toBe('<h1>Posts</h1><ul><li>This would display if the \'item\' collection were empty</li></ul>');
});

test('Nunjucks - Rendering with partial template', async () => {
	const engine = new Nunjucks();
	engine.rootTemplatePath = testTemplateDir;

	const source = await fs.readFile(testTemplateDir + '/example1.njk', 'utf8');
	const output = await engine.render(source, exampleData2);

	expect(output).toContain('<h1>Posts</h1><ul><li>foo</li><li>bar</li></ul>');
	expect(output).toContain('Item!');
});

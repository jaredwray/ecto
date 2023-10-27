import {expect, it} from 'vitest';
import * as fs from 'fs-extra';
import {EJS} from '../../src/engines/ejs.js';

const exampleSource1 = '<% if (user) { %><h2><%= user.name %></h2><% } %>';
const exampleSource2 = '<% if (test) { %><h2><%= test.foo %></h2><% } %>';

const exampleData1 = {fruits: ['Apple', 'Pear', 'Orange', 'Lemon'], user: {name: 'John Doe'}};

const testTemplateDir = './test/data/ejs';

it('EJS - Default Name ejs', () => {
	const engine = new EJS();
	expect(engine.names.toString()).toContain('ejs');
});

it('EJS - Opts should be undefined by default', () => {
	const engine = new EJS();
	expect(engine.opts).toBe(undefined);
});

it('EJS - Setting Opts on the Constructor', () => {
	const options = {cool: true};
	const engine = new EJS(options);
	expect(engine.opts).toBe(options);
});

it('EJS - Extension should be a count of 1', () => {
	const engine = new EJS();
	expect(engine.getExtensions().length).toBe(1);
});

it('EJS - Rendering a simple string', async () => {
	const engine = new EJS();
	const data = {user: {name: 'Joe'}};
	expect(await engine.render(exampleSource1, data)).toContain('Joe');
});

it('EJS - Rendering a simple string after inital render', async () => {
	const engine = new EJS();
	const data = {user: {name: 'Joe'}, test: {foo: 'bar'}};
	expect(await engine.render(exampleSource1, data)).toContain('Joe');
	expect(await engine.render(exampleSource2, data)).toContain('bar');
});

it('EJS - Rendering with partial', async () => {
	const engine = new EJS();

	const source = await fs.readFile(testTemplateDir + '/example2.ejs', 'utf8');

	engine.rootTemplatePath = testTemplateDir;

	expect(await engine.render(source, exampleData1)).toContain('John Doe');
});

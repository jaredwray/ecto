import {expect, it} from 'vitest';
import * as fs from 'fs-extra';
import {Liquid} from '../../src/engines/liquid.js';

const exampleSource1 = '{{name | capitalize}}';
const exampleData1 = {name: 'john'};
const exampleSource2 = '<ul> {% for todo in todos %} <li>{{forloop.index}} - {{todo}}</li> {% endfor %}</ul>';
const exampleData2 = {todos: ['unit tests', 'wash car', 'go running', 'bycicle'], name: 'John Doe'};

const testTemplateDir = './test/data/liquid';

it('Liquid - Default Name Liquid', () => {
	const engine = new Liquid();
	expect(engine.names.toString()).toContain('liquid');
});

it('Liquid - Opts should be undefined by default', () => {
	const engine = new Liquid();
	expect(engine.opts).toBe(undefined);
});

it('Liquid - Setting Opts on the Constructor', () => {
	const options = {cool: true};
	const engine = new Liquid(options);
	expect(engine.opts.cool).toBe(true);
});

it('Liquid - Extension should be a count of 1', () => {
	const engine = new Liquid();
	expect(engine.getExtensions().length).toBe(1);
});

it('Liquid - Rendering a simple string', async () => {
	const engine = new Liquid();
	expect(await engine.render(exampleSource1, exampleData1)).toBe('John');
});

it('Liquid - Rendering a list in html', async () => {
	const engine = new Liquid();
	expect(await engine.render(exampleSource2, exampleData2)).toBe('<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>');
});

it('Liquid - Rendering Partials', async () => {
	const engine = new Liquid();
	const source = await fs.readFile(testTemplateDir + '/example1.liquid', 'utf8');

	engine.rootTemplatePath = testTemplateDir;

	const output = await engine.render(source, exampleData2);

	expect(output).toContain('<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>');
	expect(output).toContain('John Doe');
});

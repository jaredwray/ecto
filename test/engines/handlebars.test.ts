import {expect, it} from 'vitest';
import * as fs from 'fs-extra';
import {Handlebars} from '../../src/engines/handlebars.js';

const exampleSource1 = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>';
const exampleSource2 = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. </p>';
const exampleData1 = {name: 'Alan O\'Connor', hometown: 'Somewhere, TX', kids: [{name: 'Jimmy', age: '12'}, {name: 'Sally', age: '4'}]};

const testTemplateDir = './test/data/handlebars';

it('Handlebars - Default Name ejs', () => {
	const engine = new Handlebars();
	expect(engine.names.toString()).toContain('handlebars');
});

it('Handlebars - Opts should be undefined by default', () => {
	const engine = new Handlebars();
	expect(engine.opts).toBe(undefined);
});

it('Handlebars - Setting Opts on the Constructor', () => {
	const options = {cool: true};
	const engine = new Handlebars(options);
	expect(engine.opts).toBe(options);
});

it('Handlebars - Extension should be a count of 1', () => {
	const engine = new Handlebars();
	expect(engine.getExtensions().length).toBe(4);
});

it('Handlebars - Rendering a simple string', async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain('Alan O\'Connor');
});

it('Handlebars - Rendering a simple string synchronous', () => {
	const engine = new Handlebars();
	expect(engine.renderSync(exampleSource1, exampleData1)).toContain('Alan O\'Connor');
});

it('Handlebars - Rendering a simple string after inital render', async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain('Alan O\'Connor');
	expect(await engine.render(exampleSource2, exampleData1)).toContain('Somewhere, TX');
});

it('Handlebars - Test Rendering Helper Date', async () => {
	const engine = new Handlebars();
	const source = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. {{year}} </p>';
	const year = new Date().getFullYear().toString();
	expect(await engine.render(source, exampleData1)).toContain(year);
});

it('Handlebars - Test Rendering Helper isEmpty Array', async () => {
	const engine = new Handlebars();
	const data = {name: 'Joe', hometown: 'Somewhere, TX', jobs: []};
	const source = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. {{year}} {{isEmpty jobs}} </p>';
	expect(await engine.render(source, data)).toContain('true');
});

it('Handlebars - Rendering with Partials', async () => {
	const engine = new Handlebars();
	const source = await fs.readFile(testTemplateDir + '/example1.hbs', 'utf8');
	engine.rootTemplatePath = testTemplateDir;

	expect(await engine.render(source, exampleData1)).toContain('Alan O\'Connor');
	expect(await engine.render(source, exampleData1)).toContain('Foo!');
});

it('Handlebars - Render Sync with Partials', () => {
	const engine = new Handlebars();
	const source = fs.readFileSync(testTemplateDir + '/example1.hbs', 'utf8');
	engine.rootTemplatePath = testTemplateDir;

	expect(engine.renderSync(source, exampleData1)).toContain('Alan O\'Connor');
	expect(engine.renderSync(source, exampleData1)).toContain('Foo!');
});

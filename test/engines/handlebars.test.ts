import * as fs from 'fs-extra';
import {Handlebars} from '../../src/engines/handlebars';

const exampleSource1 = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>';
const exampleSource2 = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. </p>';
const exampleData1 = {name: 'Alan O\'Connor', hometown: 'Somewhere, TX', kids: [{name: 'Jimmy', age: '12'}, {name: 'Sally', age: '4'}]};

const testTemplateDir = './test/data/handlebars';

test('Handlebars - Default Name ejs', () => {
	const engine = new Handlebars();
	expect(engine.names.toString()).toContain('handlebars');
});

test('Handlebars - Opts should be undefined by default', () => {
	const engine = new Handlebars();
	expect(engine.opts).toBe(undefined);
});

test('Handlebars - Setting Opts on the Constructor', () => {
	const options = {cool: true};
	const engine = new Handlebars(options);
	expect(engine.opts).toBe(options);
});

test('Handlebars - Extension should be a count of 1', () => {
	const engine = new Handlebars();
	expect(engine.getExtensions().length).toBe(4);
});

test('Handlebars - Rendering a simple string', async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain('Alan O\'Connor');
});

test('Handlebars - Rendering a simple string after inital render', async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain('Alan O\'Connor');
	expect(await engine.render(exampleSource2, exampleData1)).toContain('Somewhere, TX');
});

test('Handlebars - Test Rendering Helper Date', async () => {
	const engine = new Handlebars();
	const source = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. {{year}} </p>';
	const year = new Date().getFullYear().toString();
	expect(await engine.render(source, exampleData1)).toContain(year);
});

test('Handlebars - Test Rendering Helper isEmpty Array', async () => {
	const engine = new Handlebars();
	const data = {name: 'Joe', hometown: 'Somewhere, TX', jobs: []};
	const source = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. {{year}} {{isEmpty jobs}} </p>';
	expect(await engine.render(source, data)).toContain('true');
});

test('Handlebars - Rendering with Partials', async () => {
	const engine = new Handlebars();
	const source = await fs.readFile(testTemplateDir + '/example1.hbs', 'utf8');
	engine.rootTemplatePath = testTemplateDir;

	expect(await engine.render(source, exampleData1)).toContain('Alan O\'Connor');
	expect(await engine.render(source, exampleData1)).toContain('Foo!');
});

import fs from 'node:fs';
import {expect, it} from 'vitest';
import {Ecto} from '../src/ecto.js';

const engines: string[] = ['ejs', 'markdown', 'pug', 'nunjucks', 'mustache', 'handlebars', 'liquid'];

const ejsExampleSource = '<% if (test) { %><h2><%= test.foo %></h2><% } %>';
const ejsExampleData = {user: {name: 'Joe'}, test: {foo: 'bar'}};
const ejsExampleData2 = {fruits: ['Apple', 'Pear', 'Orange', 'Lemon'], user: {name: 'John Doe'}};

const handlebarsExampleSource = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>';
const handlebarsExampleData = {name: 'Alan O\'Connor', hometown: 'Somewhere, TX', kids: [{name: 'Jimmy', age: '12'}, {name: 'Sally', age: '4'}]};

const testOutputDirectory = './test/output';
const testRootDirectory = './test/data';

it('Init and Verify defaultEngine', () => {
	const ecto = new Ecto();
	expect(ecto.defaultEngine).toBe('ejs');
});

it('Options Should Set defaultEngine', () => {
	const ecto = new Ecto({defaultEngine: 'handlebars'});
	expect(ecto.defaultEngine).toBe('handlebars');
});

it('Options Should Stay EJS if invalid defaultEngine', () => {
	const ecto = new Ecto({defaultEngine: 'cool'});
	expect(ecto.defaultEngine).toBe('ejs');
});

it('Set defaultEngine as valid', () => {
	const ecto = new Ecto();
	ecto.defaultEngine = 'pug';
	expect(ecto.defaultEngine).toBe('pug');
});

it('Set defaultEngine as invalid', () => {
	const ecto = new Ecto();
	ecto.defaultEngine = 'cool';
	expect(ecto.defaultEngine).toBe('ejs');
});

it('EJS should be registered', () => {
	const ecto = new Ecto();
	expect(ecto.mappings.get('ejs')?.length).toBe(1);
});

it('Handlebars should be registered', () => {
	const ecto = new Ecto();
	expect(ecto.mappings.get('handlebars')?.length).toBe(4);
});

it('Mustache should be registered', () => {
	const ecto = new Ecto();
	expect(ecto.mappings.get('mustache')?.length).toBe(4);
});

it('EJS is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.ejs.names.toString()).toContain('ejs');
});

it('markdown is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.markdown.names.toString()).toContain('markdown');
});

it('pug is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.pug.names.toString()).toContain('pug');
});

it('nunjucks is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.nunjucks.names.toString()).toContain('nunjucks');
});

it('handlebars is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.handlebars.names.toString()).toContain('handlebars');
});

it('liquid is valid instance', () => {
	const ecto = new Ecto();
	expect(ecto.liquid.names.toString()).toContain('liquid');
});

it('isValidEngine should return true', () => {
	const ecto = new Ecto();
	expect(ecto.isValidEngine('pug')).toBe(true);
});

it('isValidEngine should return false because bad name', () => {
	const ecto = new Ecto();
	expect(ecto.isValidEngine('cool')).toBe(false);
});

it('registerEngineMappings should register mappings', () => {
	const ecto = new Ecto();

	ecto.mappings.deleteExtension('handlebars', 'hbs');
	expect(ecto.mappings.get('handlebars')?.includes('hbs')).toBe(false);

	ecto.registerEngineMappings();

	expect(ecto.mappings.get('handlebars')?.includes('hbs')).toBe(true);
});

it('getRenderEngine should return the default ejs', () => {
	const ecto = new Ecto();

	expect(ecto.getRenderEngine('cool').names.toString()).toBe('ejs');
});

it('getRenderEngine should return valid for each', () => {
	const ecto = new Ecto();

	for (const engine of engines) {
		expect(ecto.getRenderEngine(engine).names.toString()).toContain(engine);
	}
});

it('getEngineByTemplatePath should return default ejs', () => {
	const ecto = new Ecto();

	expect(ecto.getEngineByFilePath('foo.html')).toBe('ejs');
});

it('getEngineByTemplatePath should return nunjucks', () => {
	const ecto = new Ecto();

	expect(ecto.getEngineByFilePath('foo.njk')).toBe('nunjucks');
});

it('getEngineByTemplatePath should return pug for jade', () => {
	const ecto = new Ecto();

	expect(ecto.getEngineByFilePath('./this/is/a/long/pathfoo.jade')).toBe('pug');
});

it('render via ejs', async () => {
	const ecto = new Ecto();

	expect(await ecto.render(ejsExampleSource, ejsExampleData)).toBe('<h2>bar</h2>');
});

it('render via ejs synchronous', () => {
	const ecto = new Ecto();

	expect(ecto.renderSync(ejsExampleSource, ejsExampleData)).toBe('<h2>bar</h2>');
});

it('render via ejs synchronous with file', () => {
	const ecto = new Ecto();
	const filePath = testOutputDirectory + '/ejs/ecto-ejs-test.html';

	if (fs.existsSync(filePath)) {
		fs.rmSync(testOutputDirectory, {recursive: true, force: true});
	}

	const content = ecto.renderSync(ejsExampleSource, ejsExampleData, undefined, undefined, filePath);

	expect(content).toBe('<h2>bar</h2>');
	expect(fs.existsSync(filePath)).toBe(true);

	fs.rmSync(testOutputDirectory, {recursive: true, force: true});
});

it('render via ejs hello from docs', async () => {
	const ecto = new Ecto();
	const source = '<h1>Hello <%= firstName%> <%= lastName %>!</h1>';
	const data = {firstName: 'John', lastName: 'Doe'};
	expect(await ecto.render(source, data)).toBe('<h1>Hello John Doe!</h1>');
});

it('render via handlebars', async () => {
	const ecto = new Ecto();

	expect(await ecto.render(handlebarsExampleSource, handlebarsExampleData, 'handlebars')).toBe('<p>Hello, my name is Alan O\'Connor. I\'m from Somewhere, TX. I have 2 kids:</p> <ul><li>Jimmy is 12</li><li>Sally is 4</li></ul>');
});

it('render via handlebars and not define engineName', async () => {
	const ecto = new Ecto();

	expect(await ecto.render(handlebarsExampleSource, handlebarsExampleData)).toBe(handlebarsExampleSource);
});

it('write via ejs', async () => {
	const ecto = new Ecto();
	const filePath = testOutputDirectory + '/ejs/ecto-ejs-test.html';
	if (fs.existsSync(filePath)) {
		fs.rmSync(filePath);
	}

	await ecto.render(ejsExampleSource, ejsExampleData, 'ejs', undefined, filePath);
	const fileSource = await fs.promises.readFile(filePath, 'utf8');

	expect(fileSource).toBe('<h2>bar</h2>');

	await fs.promises.rm(testOutputDirectory, {recursive: true});
});

it('write via ejs with long path', async () => {
	const ecto = new Ecto();
	const filePath = testOutputDirectory + '/ejs/foo/wow/ecto-ejs-test.html';
	if (fs.existsSync(filePath)) {
		fs.rmSync(filePath);
	}

	await ecto.render(ejsExampleSource, ejsExampleData, 'ejs', undefined, filePath);
	const fileSource = await fs.promises.readFile(filePath, 'utf8');

	expect(fileSource).toBe('<h2>bar</h2>');

	await fs.promises.rm(testOutputDirectory, {recursive: true});
});

it('Render from Template - EJS', async () => {
	const ecto = new Ecto();
	const source = await ecto.renderFromFile(testRootDirectory + '/ejs/example1.ejs', ejsExampleData2, testRootDirectory + '/ejs');

	expect(source).toContain('Oranges');
});

it('Render from Template - EJS synchronous', () => {
	const ecto = new Ecto();
	const source = ecto.renderFromFileSync(testRootDirectory + '/ejs/example1.ejs', ejsExampleData2, testRootDirectory + '/ejs');

	expect(source).toContain('Oranges');
});

it('Render from Template - Default to EJS', async () => {
	const ecto = new Ecto();
	const source = await ecto.renderFromFile(testRootDirectory + '/ejs/example1.html', ejsExampleData2, testRootDirectory + '/ejs');

	expect(source).toContain('Oranges');
});

it('Render from Template - Handlebars', async () => {
	const ecto = new Ecto();
	const source = await ecto.renderFromFile(testRootDirectory + '/handlebars/example1.hbs', handlebarsExampleData, testRootDirectory + '/handlebars');

	expect(source).toContain('<title>Alan O\'Connor - Header Title </title>');
	expect(source).toContain('Foo!');
});

it('Find Template without Extension', async () => {
	const ecto = new Ecto();
	const templatePath = testRootDirectory + '/find-templates';
	const filePath = await ecto.findTemplateWithoutExtension(templatePath, 'bar');
	expect(filePath).toBe(templatePath + '/bar.njk');
});

it('Find Template without Extension Sync', () => {
	const ecto = new Ecto();
	const templatePath = testRootDirectory + '/find-templates';
	const filePath = ecto.findTemplateWithoutExtensionSync(templatePath, 'bar');
	expect(filePath).toBe(templatePath + '/bar.njk');
});

it('Find Template without Extension on duplicate Sync', async () => {
	const ecto = new Ecto();
	const templatePath = testRootDirectory + '/find-templates';
	const filePath = await ecto.findTemplateWithoutExtension(templatePath, 'foo');
	expect(filePath).toBe(templatePath + '/foo.ejs');
});

it('Render with Configuration via Nunjucks', async () => {
	const nunjucksOptions = {autoescape: false};

	const ecto = new Ecto({defaultEngine: 'nunjucks', engineOptions: {nunjucks: nunjucksOptions}});
	const userInput = '<script>alert(\'XSS\')</script>';
	const source = await ecto.renderFromFile(testRootDirectory + '/nunjucks/example2.njk', {name: userInput});

	expect(source).toContain('Hello <script>alert(\'XSS\')</script>');
});

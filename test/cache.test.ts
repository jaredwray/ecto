/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import fs from 'node:fs';
import {expect, it} from 'vitest';
import {Cacheable} from 'cacheable';
import {Ecto} from '../src/ecto.js';

const engines: string[] = ['ejs', 'markdown', 'pug', 'nunjucks', 'mustache', 'handlebars', 'liquid'];

const ejsExampleSource = '<% if (test) { %><h2><%= test.foo %></h2><% } %>';
const ejsExampleData = {user: {name: 'Joe'}, test: {foo: 'bar'}};
const ejsExampleData2 = {fruits: ['Apple', 'Pear', 'Orange', 'Lemon'], user: {name: 'John Doe'}};

const handlebarsExampleSource = '<p>Hello, my name is {{name}}. I\'m from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>';
const handlebarsExampleData = {name: 'Alan O\'Connor', hometown: 'Somewhere, TX', kids: [{name: 'Jimmy', age: '12'}, {name: 'Sally', age: '4'}]};

const testOutputDirectory = './test/output';
const testRootDirectory = './test/data';

it('cache should be disabled by default', () => {
	const ecto = new Ecto();
	expect(ecto.cache).toBe(undefined);
	ecto.cache = new Cacheable();
	expect(ecto.cache).toBeInstanceOf(Cacheable);
	ecto.cache = undefined;
	expect(ecto.cache).toBe(undefined);
});

it('render via ejs with caching enabled', async () => {
	const ecto = new Ecto({cache: true});

	expect(await ecto.render(ejsExampleSource, ejsExampleData)).toBe('<h2>bar</h2>');
	expect(await ecto.render(ejsExampleSource, ejsExampleData)).toBe('<h2>bar</h2>'); // Cached result
});

it('render via ejs synchronous with file with caching enabled', () => {
	const ecto = new Ecto({cache: new Cacheable()});
	const filePath = testOutputDirectory + '/ejs/ecto-ejs-test.html';

	if (fs.existsSync(filePath)) {
		fs.rmSync(testOutputDirectory, {recursive: true, force: true});
	}

	const content = ecto.renderSync(ejsExampleSource, ejsExampleData, undefined, undefined, filePath);

	expect(content).toBe('<h2>bar</h2>');
	expect(fs.existsSync(filePath)).toBe(true);

	fs.rmSync(testOutputDirectory, {recursive: true, force: true});
});

it('render via ejs hello from docs with caching disabled', async () => {
	const ecto = new Ecto({cache: false});
	const source = '<h1>Hello <%= firstName%> <%= lastName %>!</h1>';
	const data = {firstName: 'John', lastName: 'Doe'};
	expect(await ecto.render(source, data)).toBe('<h1>Hello John Doe!</h1>');
});

import fs from "node:fs";
import { Cacheable, CacheableMemory } from "cacheable";
import { expect, it } from "vitest";
import { Ecto } from "../src/ecto.js";

const _engines: string[] = [
	"ejs",
	"markdown",
	"pug",
	"nunjucks",
	"mustache",
	"handlebars",
	"liquid",
];

const ejsExampleSource = "<% if (test) { %><h2><%= test.foo %></h2><% } %>";
const ejsExampleData = { user: { name: "Joe" }, test: { foo: "bar" } };
const _ejsExampleData2 = {
	fruits: ["Apple", "Pear", "Orange", "Lemon"],
	user: { name: "John Doe" },
};

const _handlebarsExampleSource =
	"<p>Hello, my name is {{name}}. I'm from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
const _handlebarsExampleData = {
	name: "Alan O'Connor",
	hometown: "Somewhere, TX",
	kids: [
		{ name: "Jimmy", age: "12" },
		{ name: "Sally", age: "4" },
	],
};

const testOutputDirectory = "./test/output";
const _testRootDirectory = "./test/data";

it("cache should be disabled by default", () => {
	const ecto = new Ecto();
	expect(ecto.cache).toBe(undefined);
	ecto.cache = new Cacheable();
	expect(ecto.cache).toBeInstanceOf(Cacheable);
	ecto.cache = undefined;
	expect(ecto.cache).toBe(undefined);
});

it("cacheSync should be disabled by default", () => {
	const ecto = new Ecto();
	expect(ecto.cacheSync).toBe(undefined);
	ecto.cacheSync = new CacheableMemory();
	expect(ecto.cacheSync).toBeInstanceOf(CacheableMemory);
	ecto.cacheSync = undefined;
	expect(ecto.cacheSync).toBe(undefined);
});

it("render via ejs with caching enabled", async () => {
	const ecto = new Ecto({ cache: true });

	expect(await ecto.render(ejsExampleSource, ejsExampleData)).toBe(
		"<h2>bar</h2>",
	);
	expect(await ecto.render(ejsExampleSource, ejsExampleData)).toBe(
		"<h2>bar</h2>",
	); // Cached result
});

it("render via ejs with caching enabled with sync", async () => {
	const ecto = new Ecto({ cacheSync: true });

	expect(ecto.renderSync(ejsExampleSource, ejsExampleData)).toBe(
		"<h2>bar</h2>",
	);
	expect(ecto.renderSync(ejsExampleSource, ejsExampleData)).toBe(
		"<h2>bar</h2>",
	); // Cached result
});

it("render via ejs synchronous with file with caching enabled", async () => {
	const ecto = new Ecto({ cache: new Cacheable() });
	const filePath = `${testOutputDirectory}/ejs/ecto-ejs-test.html`;

	if (fs.existsSync(filePath)) {
		fs.rmSync(testOutputDirectory, { recursive: true, force: true });
	}

	const content = await ecto.render(
		ejsExampleSource,
		ejsExampleData,
		undefined,
		undefined,
		filePath,
	);

	expect(content).toBe("<h2>bar</h2>");
	expect(fs.existsSync(filePath)).toBe(true);

	fs.rmSync(testOutputDirectory, { recursive: true, force: true });
});

it("render via ejs synchronous with file with caching enabled sync", () => {
	const ecto = new Ecto({ cacheSync: new CacheableMemory() });
	const filePath = `${testOutputDirectory}/ejs/ecto-ejs-test.html`;

	if (fs.existsSync(filePath)) {
		fs.rmSync(testOutputDirectory, { recursive: true, force: true });
	}

	const content = ecto.renderSync(
		ejsExampleSource,
		ejsExampleData,
		undefined,
		undefined,
		filePath,
	);

	expect(content).toBe("<h2>bar</h2>");
	expect(fs.existsSync(filePath)).toBe(true);

	fs.rmSync(testOutputDirectory, { recursive: true, force: true });
});

it("render via ejs hello from docs with caching disabled", async () => {
	const ecto = new Ecto({ cache: false });
	const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
	const data = { firstName: "John", lastName: "Doe" };
	expect(await ecto.render(source, data)).toBe("<h1>Hello John Doe!</h1>");
});

it("render via ejs hello from docs with caching disabled", () => {
	const ecto = new Ecto({ cacheSync: false });
	const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
	const data = { firstName: "John", lastName: "Doe" };
	expect(ecto.renderSync(source, data)).toBe("<h1>Hello John Doe!</h1>");
});

it("cache should remain disabled when explicitly set to false", () => {
	const ecto = new Ecto({ cache: false });
	expect(ecto.cache).toBe(undefined);
});

it("cacheSync should remain disabled when explicitly set to false", () => {
	const ecto = new Ecto({ cacheSync: false });
	expect(ecto.cacheSync).toBe(undefined);
});

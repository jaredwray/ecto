import fs from "node:fs";
import { faker } from "@faker-js/faker";
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
	const uniqueId = faker.string.alphanumeric(10);
	const testOutputFullDirectory = `${testOutputDirectory}/cache-${uniqueId}`;
	const filePath = `${testOutputFullDirectory}/ecto-ejs-test.html`;

	if (fs.existsSync(testOutputFullDirectory)) {
		fs.rmSync(testOutputFullDirectory, { recursive: true, force: true });
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

	fs.rmSync(testOutputFullDirectory, { recursive: true, force: true });
});

it("render via ejs synchronous with file with caching enabled sync", () => {
	const ecto = new Ecto({ cacheSync: new CacheableMemory() });
	const uniqueId = faker.string.alphanumeric(10);
	const testOutputFullDirectory = `${testOutputDirectory}/cache-${uniqueId}`;
	const filePath = `${testOutputFullDirectory}/ecto-ejs-test.html`;

	if (fs.existsSync(testOutputFullDirectory)) {
		fs.rmSync(testOutputFullDirectory, { recursive: true, force: true });
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

	fs.rmSync(testOutputFullDirectory, { recursive: true, force: true });
});

it("render via ejs hello from docs with the async cache disabled", async () => {
	const ecto = new Ecto({ cache: false });
	const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
	const data = { firstName: "John", lastName: "Doe" };
	expect(await ecto.render(source, data)).toBe("<h1>Hello John Doe!</h1>");
});

it("render via ejs hello from docs with the sync cache disabled", () => {
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

it("cache true keeps a bounded store", () => {
	const ecto = new Ecto({ cache: true, cacheSync: true });
	expect(ecto.cache?.ttl).toBe("5m");
	expect(ecto.cacheSync?.lruSize).toBe(1000);
	expect(ecto.cacheSync?.ttl).toBe("5m");
	const primary = ecto.cache?.primary as {
		store?: { store?: { lruSize?: number; ttl?: string } };
	};
	expect(primary.store?.store?.lruSize).toBe(1000);
	expect(primary.store?.store?.ttl).toBe("5m");
});

it("cacheSync drops the oldest result after 1000 entries", () => {
	const ecto = new Ecto({ cacheSync: true });
	const misses: string[] = [];
	ecto.on("cacheMiss", (message: string) => {
		misses.push(message);
	});
	for (let index = 0; index < 1000; index++) {
		ecto.renderSync(`<%= ${index} %>`, { index });
	}
	ecto.renderSync("<%= extra %>", { extra: "new" });
	const before = misses.length;
	ecto.renderSync("<%= 0 %>", { index: 0 });
	expect(misses.length).toBe(before + 1);
});

it("cache keys include the template root and the instance", async () => {
	const dirA = fs.mkdtempSync(`${testOutputDirectory}/cache-root-a-`);
	const dirB = fs.mkdtempSync(`${testOutputDirectory}/cache-root-b-`);
	fs.writeFileSync(`${dirA}/partial.ejs`, "ROOT-A");
	fs.writeFileSync(`${dirB}/partial.ejs`, "ROOT-B");
	const source = "<%- include('/partial') %>";
	try {
		const ecto = new Ecto({ cache: true, cacheSync: true });
		expect(await ecto.render(source, {}, "ejs", dirA)).toContain("ROOT-A");
		expect(await ecto.render(source, {}, "ejs", dirB)).toContain("ROOT-B");
		expect(ecto.renderSync(source, {}, "ejs", dirA)).toContain("ROOT-A");
		expect(ecto.renderSync(source, {}, "ejs", dirB)).toContain("ROOT-B");

		const store = new Cacheable();
		const loose = new Ecto({
			cache: store,
			engineOptions: { ejs: { escape: (value: string) => value } },
		});
		const strict = new Ecto({ cache: store });
		expect(await loose.render("<%= v %>", { v: "<b>" })).toBe("<b>");
		expect(await strict.render("<%= v %>", { v: "<b>" })).toBe("&lt;b&gt;");
	} finally {
		fs.rmSync(dirA, { recursive: true, force: true });
		fs.rmSync(dirB, { recursive: true, force: true });
	}
});

it("cache does not reuse a result for data that JSON cannot store", async () => {
	const ecto = new Ecto({ cache: true, cacheSync: true });
	expect(await ecto.render("<%= fn() %>", { fn: () => "one" })).toBe("one");
	expect(await ecto.render("<%= fn() %>", { fn: () => "two" })).toBe("two");
	expect(ecto.renderSync("<%= String(n) %>", { n: Number.NaN })).toBe("NaN");
	expect(ecto.renderSync("<%= String(n) %>", { n: null })).toBe("null");

	const first = new Map([["k", "one"]]);
	const second = new Map([["k", "two"]]);
	expect(ecto.renderSync("<%= items.get('k') %>", { items: first })).toBe(
		"one",
	);
	expect(ecto.renderSync("<%= items.get('k') %>", { items: second })).toBe(
		"two",
	);

	let reads = 0;
	const boxed: { n?: number } = {};
	Object.defineProperty(boxed, "n", {
		enumerable: true,
		get() {
			reads += 1;
			return reads;
		},
	});
	expect(ecto.renderSync("<%= n %>", boxed)).toBe("1");
	expect(ecto.renderSync("<%= n %>", boxed)).toBe("2");

	const cycle: Record<string, unknown> = { name: "ada" };
	cycle.self = cycle;
	expect(ecto.renderSync("<%= name %>", cycle)).toBe("ada");
	cycle.name = "bea";
	expect(ecto.renderSync("<%= name %>", cycle)).toBe("bea");

	const holey = ["x"];
	holey.length = 2;
	expect(
		ecto.renderSync("<%= items.hasOwnProperty(1) %>", { items: holey }),
	).toBe("false");
	expect(
		ecto.renderSync("<%= items.hasOwnProperty(1) %>", {
			items: ["x", null],
		}),
	).toBe("true");

	class Tagged extends Array<string> {
		label(): string {
			return "one";
		}
	}
	class TaggedTwo extends Array<string> {
		label(): string {
			return "two";
		}
	}
	const firstItems = new Tagged();
	firstItems.push("x");
	const secondItems = new TaggedTwo();
	secondItems.push("x");
	expect(ecto.renderSync("<%= items.label() %>", { items: firstItems })).toBe(
		"one",
	);
	expect(ecto.renderSync("<%= items.label() %>", { items: secondItems })).toBe(
		"two",
	);

	const hiddenIndex = ["one"];
	Object.defineProperty(hiddenIndex, "0", {
		value: "one",
		enumerable: false,
		writable: true,
		configurable: true,
	});
	expect(
		ecto.renderSync("<%= Object.keys(items).length %>", {
			items: hiddenIndex,
		}),
	).toBe("0");
	expect(
		ecto.renderSync("<%= Object.keys(items).length %>", { items: ["one"] }),
	).toBe("1");

	expect(ecto.renderSync("<%= items[0]() %>", { items: [() => "one"] })).toBe(
		"one",
	);
	expect(ecto.renderSync("<%= items[0]() %>", { items: [() => "two"] })).toBe(
		"two",
	);

	const sparse = [] as string[];
	sparse.length = 1;
	Object.defineProperty(sparse, "extra", { value: "one", enumerable: true });
	const sparseTwo = [] as string[];
	sparseTwo.length = 1;
	Object.defineProperty(sparseTwo, "extra", {
		value: "two",
		enumerable: true,
	});
	expect(ecto.renderSync("<%= items.extra %>", { items: sparse })).toBe("one");
	expect(ecto.renderSync("<%= items.extra %>", { items: sparseTwo })).toBe(
		"two",
	);

	const symbolKey = Symbol("secret");
	const symbolOne = { name: "ada" };
	const symbolTwo = { name: "ada" };
	Object.defineProperty(symbolOne, symbolKey, {
		value: "one",
		enumerable: true,
	});
	Object.defineProperty(symbolTwo, symbolKey, {
		value: "two",
		enumerable: true,
	});
	const symbolTemplate = "<%= data[Object.getOwnPropertySymbols(data)[0]] %>";
	expect(ecto.renderSync(symbolTemplate, { data: symbolOne })).toBe("one");
	expect(ecto.renderSync(symbolTemplate, { data: symbolTwo })).toBe("two");

	const hiddenOne = {};
	const hiddenTwo = {};
	Object.defineProperty(hiddenOne, "name", {
		value: "one",
		enumerable: false,
	});
	Object.defineProperty(hiddenTwo, "name", {
		value: "two",
		enumerable: false,
	});
	expect(ecto.renderSync("{{name}}", hiddenOne, "handlebars")).toBe("one");
	expect(ecto.renderSync("{{name}}", hiddenTwo, "handlebars")).toBe("two");
});

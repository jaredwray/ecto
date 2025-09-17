import fs from "node:fs";
import { expect, it } from "vitest";
import { Pug } from "../../src/engines/pug.js";

const exampleSource1 = "p #{name}'s Pug source code!";
const exampleData1 = { name: "John Doe" };
const exampleSource2 = "ul\neach val in items\n\tli= val";
const exampleData2 = { items: [1, 2, 3, 4, 5] };

const testTemplateDirectory = "./test/data/pug";

it("Pug - Default Name Pug", () => {
	const engine = new Pug();
	expect(engine.names.toString()).toContain("pug");
});

it("Pug - Opts should be undefined by default", () => {
	const engine = new Pug();
	expect(engine.opts).toBe(undefined);
});

it("Pug - Setting Opts on the Constructor", () => {
	const options = { cool: true };
	const engine = new Pug(options);
	expect(engine.opts.cool).toBe(true);
});

it("Pug - Extension should be a count of 1", () => {
	const engine = new Pug();
	expect(engine.getExtensions().length).toBe(2);
});

it("Pug - Rendering a simple string", async () => {
	const engine = new Pug();
	expect(await engine.render(exampleSource1, exampleData1)).toBe(
		"<p>John Doe's Pug source code!</p>",
	);
});

it("Pug - Rendering a simple string synchronous", () => {
	const engine = new Pug();
	expect(engine.renderSync(exampleSource1, exampleData1)).toBe(
		"<p>John Doe's Pug source code!</p>",
	);
});

it("Pug - Render Sync with Root Template Path", () => {
	const engine = new Pug();
	engine.rootTemplatePath = testTemplateDirectory;
	expect(engine.renderSync(exampleSource1, exampleData1)).toBe(
		"<p>John Doe's Pug source code!</p>",
	);
	expect(engine.opts.basedir).toBe(testTemplateDirectory);
});

it("Pug - Rendering a list in html", async () => {
	const engine = new Pug();
	expect(await engine.render(exampleSource2, exampleData2)).toBe(
		"<ul></ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>",
	);
});

it("Pug - Rendering with Includes", async () => {
	const engine = new Pug();
	const source = await fs.promises.readFile(
		`${testTemplateDirectory}/example1.pug`,
		"utf8",
	);

	engine.rootTemplatePath = testTemplateDirectory;

	const output = await engine.render(source, exampleData1);

	expect(output).toContain("<h2>By John Doe</h2>");
	expect(output).toContain("Header!");
});

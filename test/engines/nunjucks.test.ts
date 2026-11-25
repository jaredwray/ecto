import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as nunjucks from "nunjucks";
import { expect, it } from "vitest";
import { Nunjucks } from "../../src/engines/nunjucks.js";

const exampleSource1 = "Hello {{ username }}";
const exampleData1 = { username: "john.doe" };
const exampleSource2 =
	"<h1>Posts</h1><ul>{% for item in items %}<li>{{ item.title }}</li>{% else %}<li>This would display if the 'item' collection were empty</li>{% endfor %}</ul>";
const exampleData2 = {
	items: [
		{ title: "foo", id: 1 },
		{ title: "bar", id: 2 },
	],
};

const testTemplateDirectory = "./test/data/nunjucks";

it("Nunjucks - Default Name Nunjucks", () => {
	const engine = new Nunjucks();
	expect(engine.names.toString()).toContain("nunjucks");
});

it("Nunjucks - Opts should be set by", () => {
	const engine = new Nunjucks();
	expect(engine.opts.autoescape).toBe(true);
});

it("Nunjucks - Opts should be undefined by default", () => {
	const engine = new Nunjucks({ autoescape: false });
	expect(engine.opts.autoescape).toBe(false);
});

it("Nunjucks - Setting Opts on the Constructor", () => {
	const options = { cool: true };
	const engine = new Nunjucks(options);
	expect(engine.opts).toBe(options);
});

it("Nunjucks - Extension should be a count of 1", () => {
	const engine = new Nunjucks();
	expect(engine.getExtensions().length).toBe(1);
});

it("Nunjucks - Rendering a simple string", async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource1, exampleData1)).toContain(
		"john.doe",
	);
});

it("Nunjucks - Rendering a simple string synchronous", () => {
	const engine = new Nunjucks();
	expect(engine.renderSync(exampleSource1, exampleData1)).toContain("john.doe");
});

it("Nunjucks - Render Sync with Root Template Path and No Data", () => {
	const engine = new Nunjucks();
	engine.rootTemplatePath = testTemplateDirectory;
	expect(engine.renderSync(exampleSource1, undefined)).toContain("Hello");
});

it("Nunjucks - Rendering a simple string with no data", async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource1, undefined)).toBe("Hello ");
});

it("Nunjucks - Rendering a list / ul html", async () => {
	const engine = new Nunjucks();
	expect(await engine.render(exampleSource2, exampleData2)).toContain(
		"<h1>Posts</h1><ul><li>foo</li><li>bar</li></ul>",
	);
});

it("Nunjucks - Rendering no data", async () => {
	const engine = new Nunjucks();
	const data = { items: [] };
	expect(await engine.render(exampleSource2, data)).toBe(
		"<h1>Posts</h1><ul><li>This would display if the 'item' collection were empty</li></ul>",
	);
});

it("Nunjucks - Rendering with partial template", async () => {
	const engine = new Nunjucks();
	engine.rootTemplatePath = testTemplateDirectory;

	const source = await fs.promises.readFile(
		`${testTemplateDirectory}/example1.njk`,
		"utf8",
	);
	const output = await engine.render(source, exampleData2);

	expect(output).toContain("<h1>Posts</h1><ul><li>foo</li><li>bar</li></ul>");
	expect(output).toContain("Item!");
});

it("Nunjucks - Rendering with configuration", async () => {
	const options = { autoescape: true };
	const engine = new Nunjucks(options);
	engine.rootTemplatePath = testTemplateDirectory;

	const userInput = "<script>alert('XSS')</script>";

	const source = "Hello {{ userInput }}";
	const output = await engine.render(source, { userInput });

	expect(output).toContain(
		"Hello &lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;",
	);
});

it("Nunjucks - render does not change the global environment", () => {
	nunjucks.configure({ autoescape: true });
	const engine = new Nunjucks({ autoescape: false });
	expect(engine.renderSync("{{ name }}", { name: "<b>" })).toBe("<b>");
	expect(nunjucks.renderString("{{ name }}", { name: "<b>" })).toBe(
		"&lt;b&gt;",
	);
});

it("Nunjucks - an include cannot leave the template root", () => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-njk-"));
	const root = path.join(parent, "njk-root");
	const outside = path.join(parent, "njk-root-secret.txt");
	fs.mkdirSync(root);
	fs.writeFileSync(outside, "NJK-SECRET");
	fs.writeFileSync(path.join(root, "ok.njk"), "INSIDE");
	fs.mkdirSync(path.join(root, "sub"));
	fs.writeFileSync(path.join(root, "sub", "a.njk"), "{% include './b.njk' %}");
	fs.writeFileSync(path.join(root, "sub", "b.njk"), "NEAR");
	fs.writeFileSync(path.join(root, "shared.njk"), "SHARED");
	fs.writeFileSync(
		path.join(root, "sub", "up.njk"),
		"{% include '../shared.njk' %}",
	);
	fs.mkdirSync(path.join(root, "subdir"));
	fs.symlinkSync(outside, path.join(root, "leak.txt"));
	const engine = new Nunjucks();
	engine.rootTemplatePath = root;
	try {
		expect(engine.renderSync("{% include 'ok.njk' %}")).toContain("INSIDE");
		expect(engine.renderSync("{% include './ok.njk' %}")).toContain("INSIDE");
		expect(engine.renderSync("{% include 'sub/a.njk' %}")).toContain("NEAR");
		expect(engine.renderSync("{% include 'sub/up.njk' %}")).toContain("SHARED");
		expect(() =>
			engine.renderSync("{% include '../njk-root-secret.txt' %}"),
		).toThrow();
		expect(() => engine.renderSync("{% include 'leak.txt' %}")).toThrow();
		expect(() => engine.renderSync("{% include 'missing.njk' %}")).toThrow();
		expect(() => engine.renderSync("{% include 'subdir' %}")).toThrow();
		expect(() => engine.renderSync("{% include 'bad\0name.njk' %}")).toThrow();

		const watched = new Nunjucks({ autoescape: true, watch: true });
		watched.rootTemplatePath = root;
		expect(watched.renderSync("{% include 'ok.njk' %}")).toContain("INSIDE");
		const uncached = new Nunjucks({ autoescape: true, noCache: true });
		uncached.rootTemplatePath = root;
		expect(uncached.renderSync("{% include 'ok.njk' %}")).toContain("INSIDE");

		const fileRoot = new Nunjucks();
		fileRoot.rootTemplatePath = path.join(root, "ok.njk");
		expect(fileRoot.renderSync("Hello")).toBe("Hello");
		expect(() => fileRoot.renderSync("{% include 'ok.njk' %}")).toThrow();
		fileRoot.rootTemplatePath = path.join(parent, "missing-root");
		expect(() => fileRoot.renderSync("{% include 'ok.njk' %}")).toThrow();
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

it("Nunjucks - an include fails when the root is not set", () => {
	const fileName = `ecto-njk-${Date.now()}.njk`;
	const filePath = path.join(process.cwd(), fileName);
	fs.writeFileSync(filePath, "NJK-CWD");
	try {
		const engine = new Nunjucks();
		expect(() => engine.renderSync(`{% include '${fileName}' %}`)).toThrow();
	} finally {
		fs.rmSync(filePath, { force: true });
	}
});

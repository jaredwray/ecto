import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { Liquid } from "../../src/engines/liquid.js";

const exampleSource1 = "{{name | capitalize}}";
const exampleData1 = { name: "john" };
const exampleSource2 =
	"<ul> {% for todo in todos %} <li>{{forloop.index}} - {{todo}}</li> {% endfor %}</ul>";
const exampleData2 = {
	todos: ["unit tests", "wash car", "go running", "bycicle"],
	name: "John Doe",
};

const testTemplateDirectory = "./test/data/liquid";

it("Liquid - Default Name Liquid", () => {
	const engine = new Liquid();
	expect(engine.names.toString()).toContain("liquid");
});

it("Liquid - Opts should be undefined by default", () => {
	const engine = new Liquid();
	expect(engine.opts).toBe(undefined);
});

it("Liquid - Setting Opts on the Constructor", () => {
	const options = { cool: true };
	const engine = new Liquid(options);
	expect(engine.opts.cool).toBe(true);
});

it("Liquid - Extension should be a count of 1", () => {
	const engine = new Liquid();
	expect(engine.getExtensions().length).toBe(1);
});

it("Liquid - Rendering a simple string", async () => {
	const engine = new Liquid();
	expect(await engine.render(exampleSource1, exampleData1)).toBe("John");
});

it("Liquid - Rendering a simple string synchronous", () => {
	const engine = new Liquid();
	expect(engine.renderSync(exampleSource1, exampleData1)).toBe("John");
});

it("Liquid - Render Sync with Root Template Path", () => {
	const engine = new Liquid();
	engine.rootTemplatePath = testTemplateDirectory;
	expect(engine.renderSync(exampleSource1, exampleData1)).toBe("John");
});

it("Liquid - Rendering a list in html", async () => {
	const engine = new Liquid();
	expect(await engine.render(exampleSource2, exampleData2)).toBe(
		"<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>",
	);
});

it("Liquid - Rendering Partials", async () => {
	const engine = new Liquid();
	const source = await fs.promises.readFile(
		`${testTemplateDirectory}/example1.liquid`,
		"utf8",
	);

	engine.rootTemplatePath = testTemplateDirectory;

	const output = await engine.render(source, exampleData2);

	expect(output).toContain(
		"<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>",
	);
	expect(output).toContain("John Doe");
});

it("Liquid - Rendering multiple times with same engine instance (async)", async () => {
	const engine = new Liquid();
	const firstRender = await engine.render(exampleSource1, exampleData1);
	expect(firstRender).toBe("John");

	// Second render should reuse the existing engine
	const secondRender = await engine.render(exampleSource1, exampleData1);
	expect(secondRender).toBe("John");
});

it("Liquid - Rendering multiple times with same engine instance (sync)", () => {
	const engine = new Liquid();
	const firstRender = engine.renderSync(exampleSource1, exampleData1);
	expect(firstRender).toBe("John");

	// Second render should reuse the existing engine
	const secondRender = engine.renderSync(exampleSource1, exampleData1);
	expect(secondRender).toBe("John");
});

it("Liquid - different roots stay isolated", async () => {
	const rootA = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-liquid-a-"));
	const rootB = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-liquid-b-"));
	const options = { cool: true };
	fs.mkdirSync(path.join(rootA, "partials"));
	fs.mkdirSync(path.join(rootB, "partials"));
	fs.writeFileSync(path.join(rootA, "partials", "mark.liquid"), "FROM-A");
	fs.writeFileSync(path.join(rootB, "partials", "mark.liquid"), "FROM-B");
	const engine = new Liquid(options);
	const source = "{% render 'partials/mark.liquid' %}";
	try {
		engine.rootTemplatePath = rootA;
		expect(await engine.render(source)).toContain("FROM-A");
		engine.rootTemplatePath = rootB;
		expect(engine.renderSync(source)).toContain("FROM-B");
		engine.rootTemplatePath = path.join(rootB, "..", path.basename(rootA));
		expect(await engine.render(source)).toContain("FROM-A");
		engine.rootTemplatePath = undefined;
		expect(() => engine.renderSync(source)).toThrow();
		expect(options).toEqual({ cool: true });
	} finally {
		fs.rmSync(rootA, { recursive: true, force: true });
		fs.rmSync(rootB, { recursive: true, force: true });
	}
});

it("Liquid - include fails when no root is set", () => {
	const fileName = `ecto-cwd-${Date.now()}.liquid`;
	const filePath = path.join(process.cwd(), fileName);
	fs.writeFileSync(filePath, "FROM-CWD");
	const source = `{% render '${fileName}' %}`;
	try {
		const engine = new Liquid();
		expect(() => engine.renderSync(source)).toThrow();
		engine.rootTemplatePath = "";
		expect(() => engine.renderSync(source)).toThrow();
		engine.rootTemplatePath = "   ";
		expect(() => engine.renderSync(source)).toThrow();
		const blankRoot = new Liquid({ root: "" });
		expect(() => blankRoot.renderSync(source)).toThrow();
		const emptyList = new Liquid({ root: ["", " "] });
		expect(() => emptyList.renderSync(source)).toThrow();
	} finally {
		fs.rmSync(filePath, { force: true });
	}
});

it("Liquid - a root keeps spaces in the directory name", () => {
	const plain = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-liquid-plain-"));
	const spaced = `${plain} `;
	const source = "{% render 'partials/mark.liquid' %}";
	fs.mkdirSync(path.join(plain, "partials"));
	fs.mkdirSync(path.join(spaced, "partials"), { recursive: true });
	fs.writeFileSync(path.join(plain, "partials", "mark.liquid"), "PLAIN");
	fs.writeFileSync(path.join(spaced, "partials", "mark.liquid"), "SPACED");
	try {
		const byPath = new Liquid();
		byPath.rootTemplatePath = spaced;
		expect(byPath.renderSync(source)).toContain("SPACED");

		const byOption = new Liquid({ root: spaced });
		expect(byOption.renderSync(source)).toContain("SPACED");

		const byList = new Liquid({ root: [spaced] });
		expect(byList.renderSync(source)).toContain("SPACED");
	} finally {
		fs.rmSync(spaced, { recursive: true, force: true });
		fs.rmSync(plain, { recursive: true, force: true });
	}
});

it("Liquid - explicit root option is used when the template root is absent", async () => {
	const source = fs.readFileSync(
		`${testTemplateDirectory}/example1.liquid`,
		"utf8",
	);
	const byString = new Liquid({ root: testTemplateDirectory });
	expect(await byString.render(source, exampleData2)).toContain("John Doe");

	const byList = new Liquid({
		root: [testTemplateDirectory, ""],
	});
	expect(byList.renderSync(source, exampleData2)).toContain("John Doe");
});

import { expect, it } from "vitest";
import {
	EJS,
	Handlebars,
	Liquid,
	Markdown,
	Nunjucks,
	Pug,
} from "../src/ecto.js";

it("Engine Exports - EJS should be importable and usable", async () => {
	const ejs = new EJS();
	const result = await ejs.render("<%= name %>", { name: "World" });
	expect(result).toBe("World");
});

it("Engine Exports - Handlebars should be importable and usable", async () => {
	const handlebars = new Handlebars();
	const result = await handlebars.render("Hello {{name}}", { name: "World" });
	expect(result).toContain("Hello World");
});

it("Engine Exports - Liquid should be importable and usable", async () => {
	const liquid = new Liquid();
	const result = await liquid.render("{{ name | capitalize }}", {
		name: "world",
	});
	expect(result).toBe("World");
});

it("Engine Exports - Markdown should be importable and usable", async () => {
	const markdown = new Markdown();
	const result = await markdown.render("# Hello World");
	expect(result).toContain("<h1");
	expect(result).toContain("Hello World");
});

it("Engine Exports - Nunjucks should be importable and usable", async () => {
	const nunjucks = new Nunjucks();
	const result = await nunjucks.render("Hello {{ name }}", { name: "World" });
	expect(result).toBe("Hello World");
});

it("Engine Exports - Pug should be importable and usable", async () => {
	const pug = new Pug();
	const result = await pug.render("h1 Hello World");
	expect(result).toContain("<h1>Hello World</h1>");
});

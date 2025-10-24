import { expect, it } from "vitest";
import { Ecto, Handlebars } from "../src/ecto.js";

it("Engine Customization - Access and customize Handlebars engine", async () => {
	const ecto = new Ecto();

	// Access the Handlebars engine and add custom helpers
	ecto.handlebars.engine.registerHelper("uppercase", (text: string) =>
		text.toUpperCase(),
	);
	ecto.handlebars.engine.registerHelper("double", (num: number) => num * 2);

	// Use it with render
	const result = await ecto.render(
		"Hello {{uppercase name}} - {{double count}}",
		{ name: "world", count: 5 },
		"handlebars",
	);

	expect(result).toContain("WORLD");
	expect(result).toContain("10");
});

it("Engine Customization - Customize multiple engines", async () => {
	const ecto = new Ecto();

	// Customize Handlebars with helpers
	ecto.handlebars.engine.registerHelper(
		"bold",
		(text: string) => `<strong>${text}</strong>`,
	);

	// Test Handlebars customization
	const hbsResult = await ecto.render(
		"{{bold name}}",
		{ name: "Test" },
		"handlebars",
	);
	expect(hbsResult).toBe("<strong>Test</strong>");
});

it("Engine Customization - Set Handlebars partials path", async () => {
	const ecto = new Ecto();

	// Configure partials path
	ecto.handlebars.partialsPath = ["partials", "includes", "templates"];

	// Use renderFromFile which uses rootTemplatePath
	const result = await ecto.renderFromFile(
		"./test/data/handlebars/example1.hbs",
		{ name: "Test" },
	);

	expect(result).toContain("Foo!");
});

it("Engine Customization - Use exported engine standalone", async () => {
	// Use engine standalone
	const handlebars = new Handlebars();
	handlebars.engine.registerHelper("repeat", (text: string, times: number) => {
		return text.repeat(times);
	});

	const standaloneResult = await handlebars.render("{{repeat text times}}", {
		text: "Ha",
		times: 3,
	});
	expect(standaloneResult).toBe("HaHaHa");
});

it("Engine Customization - Configure engine via constructor", async () => {
	const ecto = new Ecto({
		engineOptions: {
			markdown: {
				html: true,
				breaks: true,
			},
		},
	});

	// Test that HTML is allowed (html: true)
	const result = await ecto.render(
		"# Hello\n\n<div>HTML content</div>",
		{},
		"markdown",
	);
	expect(result).toContain("<div>HTML content</div>");
});

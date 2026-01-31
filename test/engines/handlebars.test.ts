// biome-ignore-all lint/suspicious/noExplicitAny: test file
import fs from "node:fs";
import { expect, it } from "vitest";
import { Handlebars } from "../../src/engines/handlebars.js";

const exampleSource1 =
	"<p>Hello, my name is {{name}}. I'm from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
const exampleSource2 =
	"<p>Hello, my name is {{name}}. I'm from {{hometown}}. </p>";
const exampleData1 = {
	name: "Alan O'Connor",
	hometown: "Somewhere, TX",
	kids: [
		{ name: "Jimmy", age: "12" },
		{ name: "Sally", age: "4" },
	],
};

const testTemplateDirectory = "./test/data/handlebars";

it("Handlebars - Default Name ejs", () => {
	const engine = new Handlebars();
	expect(engine.names.toString()).toContain("handlebars");
});

it("Handlebars - Opts should be undefined by default", () => {
	const engine = new Handlebars();
	expect(engine.opts).toBe(undefined);
});

it("Handlebars - Setting Opts on the Constructor", () => {
	const options = { cool: true };
	const engine = new Handlebars(options);
	expect(engine.opts).toBe(options);
});

it("Handlebars - Extension should be a count of 1", () => {
	const engine = new Handlebars();
	expect(engine.getExtensions().length).toBe(4);
});

it("Handlebars - Rendering a simple string", async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain(
		"Alan O'Connor",
	);
});

it("Handlebars - Rendering a simple string synchronous", () => {
	const engine = new Handlebars();
	expect(engine.renderSync(exampleSource1, exampleData1)).toContain(
		"Alan O'Connor",
	);
});

it("Handlebars - Rendering a simple string after inital render", async () => {
	const engine = new Handlebars();
	expect(await engine.render(exampleSource1, exampleData1)).toContain(
		"Alan O'Connor",
	);
	expect(await engine.render(exampleSource2, exampleData1)).toContain(
		"Somewhere, TX",
	);
});

it("Handlebars - Test Rendering Helper Date", async () => {
	const engine = new Handlebars();
	const source =
		"<p>Hello, my name is {{name}}. I'm from {{hometown}}. {{year}} </p>";
	const year = new Date().getFullYear().toString();
	expect(await engine.render(source, exampleData1)).toContain(year);
});

it("Handlebars - Test Rendering Helper isEmpty Array", async () => {
	const engine = new Handlebars();
	const data = { name: "Joe", hometown: "Somewhere, TX", jobs: [] };
	const source =
		"<p>Hello, my name is {{name}}. I'm from {{hometown}}. {{year}} {{isEmpty jobs}} </p>";
	expect(await engine.render(source, data)).toContain("true");
});

it("Handlebars - Rendering with Partials", async () => {
	const engine = new Handlebars();
	const source = await fs.promises.readFile(
		`${testTemplateDirectory}/example1.hbs`,
		"utf8",
	);
	engine.rootTemplatePath = testTemplateDirectory;
	const result = await engine.render(source, exampleData1);

	expect(result).toContain("Alan O'Connor");
	expect(result).toContain("Foo!");
	expect(result).toContain("ux layout");
});

it("Handlebars - Render Sync with Partials", () => {
	const engine = new Handlebars();
	const source = fs.readFileSync(
		`${testTemplateDirectory}/example1.hbs`,
		"utf8",
	);
	engine.rootTemplatePath = testTemplateDirectory;

	expect(engine.renderSync(source, exampleData1)).toContain("Alan O'Connor");
	expect(engine.renderSync(source, exampleData1)).toContain("Foo!");
});

it("Handlebars - Rendering with Partials - Docula", async () => {
	const engine = new Handlebars();
	const source = await fs.promises.readFile(
		"./test/data/docula/template/index.hbs",
		"utf8",
	);
	engine.rootTemplatePath = "./test/data/docula/template";
	const result = await engine.render(source, exampleData1);

	expect(result).toContain('<img src="/logo.svg" alt="logo" />');
});

it("Handlebars - Partials functionality validation", async () => {
	const engine = new Handlebars();

	const mainTemplate = `
		<div class="container">
			{{> userInfo}}
			{{> itemList}}
			{{#if showFooter}}
				{{> footer}}
			{{/if}}
		</div>
	`;

	const userInfoPartial = `
		<div class="user">
			<h2>{{name}}</h2>
			<p>Location: {{location}}</p>
		</div>
	`;

	const itemListPartial = `
		<ul class="items">
			{{#each items}}
				<li>{{this.title}} - \${{this.price}}</li>
			{{/each}}
		</ul>
	`;

	const footerPartial = `
		<footer>
			<p>Copyright {{year}} - {{company}}</p>
		</footer>
	`;

	engine.engine.registerPartial(
		"userInfo",
		engine.engine.compile(userInfoPartial),
	);
	engine.engine.registerPartial(
		"itemList",
		engine.engine.compile(itemListPartial),
	);
	engine.engine.registerPartial("footer", engine.engine.compile(footerPartial));

	const data = {
		name: "John Doe",
		location: "New York, NY",
		items: [
			{ title: "Widget", price: 9.99 },
			{ title: "Gadget", price: 19.99 },
			{ title: "Doohickey", price: 14.99 },
		],
		showFooter: true,
		year: 2025,
		company: "Test Corp",
	};

	const result = await engine.render(mainTemplate, data);

	expect(result).toContain("John Doe");
	expect(result).toContain("New York, NY");
	expect(result).toContain("Widget - $9.99");
	expect(result).toContain("Gadget - $19.99");
	expect(result).toContain("Doohickey - $14.99");
	expect(result).toContain(`Copyright ${new Date().getFullYear()} - Test Corp`);
	expect(result).toContain('<div class="container">');
	expect(result).toContain('<div class="user">');
	expect(result).toContain('<ul class="items">');
	expect(result).toContain("<footer>");

	const dataWithoutFooter = { ...data, showFooter: false };
	const resultNoFooter = await engine.render(mainTemplate, dataWithoutFooter);
	expect(resultNoFooter).not.toContain("<footer>");
	expect(resultNoFooter).not.toContain("Copyright");
});

it("Handlebars - Nested partials validation", async () => {
	const handlebars = new Handlebars();

	const mainTemplate = `{{> outer}}`;

	const outerPartial = `
		<div class="outer">
			<h1>{{title}}</h1>
			{{> inner}}
		</div>
	`;

	const innerPartial = `
		<div class="inner">
			<p>{{message}}</p>
			{{> deepNested}}
		</div>
	`;

	const deepNestedPartial = `
		<span class="deep">{{detail}}</span>
	`;

	handlebars.engine.registerPartial(
		"outer",
		handlebars.engine.compile(outerPartial),
	);
	handlebars.engine.registerPartial(
		"inner",
		handlebars.engine.compile(innerPartial),
	);
	handlebars.engine.registerPartial(
		"deepNested",
		handlebars.engine.compile(deepNestedPartial),
	);

	const data = {
		title: "Nested Partials Test",
		message: "This is a nested partial",
		detail: "Deep nested content",
	};

	const result = await handlebars.render(mainTemplate, data);

	expect(result).toContain("Nested Partials Test");
	expect(result).toContain("This is a nested partial");
	expect(result).toContain("Deep nested content");
	expect(result).toContain('<div class="outer">');
	expect(result).toContain('<div class="inner">');
	expect(result).toContain('<span class="deep">');
});

it("Handlebars - Partial with context switching", async () => {
	const engine = new Handlebars();

	const mainTemplate = `
		{{#each users}}
			{{> userCard}}
		{{/each}}
	`;

	const userCardPartial = `
		<div class="card">
			<h3>{{name}}</h3>
			<p>Email: {{email}}</p>
			{{#if premium}}
				<span class="badge">Premium Member</span>
			{{/if}}
		</div>
	`;

	engine.engine.registerPartial(
		"userCard",
		engine.engine.compile(userCardPartial),
	);

	const data = {
		users: [
			{ name: "Alice", email: "alice@example.com", premium: true },
			{ name: "Bob", email: "bob@example.com", premium: false },
			{ name: "Charlie", email: "charlie@example.com", premium: true },
		],
	};

	const result = await engine.render(mainTemplate, data);

	expect(result).toContain("Alice");
	expect(result).toContain("alice@example.com");
	expect(result).toContain("Bob");
	expect(result).toContain("bob@example.com");
	expect(result).toContain("Charlie");
	expect(result).toContain("charlie@example.com");

	const premiumBadges = (result.match(/Premium Member/g) || []).length;
	expect(premiumBadges).toBe(2);
});

it("Handlebars - forEach with navigation sidebar like docula example", async () => {
	const engine = new Handlebars();

	const mainTemplate = `
		<nav class="sidebar">
			<div class="nav-sections">
				{{#forEach sections}}
					<div class="nav-section">
						<h4 class="section-title">{{title}}</h4>
						<ul class="nav-links">
							{{#forEach items}}
								<li class="nav-item{{#if active}} active{{/if}}">
									<a href="{{url}}" title="{{description}}">
										{{#if icon}}<span class="icon">{{icon}}</span>{{/if}}
										<span class="label">{{label}}</span>
									</a>
									{{#if children}}
										<ul class="sub-nav">
											{{#forEach children}}
												<li class="sub-item">
													<a href="{{url}}">{{label}}</a>
												</li>
											{{/forEach}}
										</ul>
									{{/if}}
								</li>
							{{/forEach}}
						</ul>
					</div>
				{{/forEach}}
			</div>
		</nav>
	`;

	engine.engine.registerHelper("forEach", (context: any, options: any) => {
		let result = "";
		if (Array.isArray(context)) {
			for (let i = 0; i < context.length; i++) {
				result += options.fn(context[i], {
					data: {
						index: i,
						first: i === 0,
						last: i === context.length - 1,
					},
				});
			}
		} else if (context && typeof context === "object") {
			const keys = Object.keys(context);
			for (let i = 0; i < keys.length; i++) {
				result += options.fn(context[keys[i]], {
					data: {
						key: keys[i],
						index: i,
						first: i === 0,
						last: i === keys.length - 1,
					},
				});
			}
		}
		return result;
	});

	const data = {
		sections: [
			{
				title: "Getting Started",
				items: [
					{
						label: "Installation",
						url: "/docs/installation",
						description: "How to install the library",
						icon: "📦",
						active: false,
					},
					{
						label: "Quick Start",
						url: "/docs/quickstart",
						description: "Get up and running quickly",
						icon: "🚀",
						active: true,
						children: [
							{ label: "Basic Setup", url: "/docs/quickstart/basic" },
							{ label: "Configuration", url: "/docs/quickstart/config" },
						],
					},
				],
			},
			{
				title: "API Reference",
				items: [
					{
						label: "Core API",
						url: "/docs/api/core",
						description: "Core functionality reference",
						icon: "📖",
						active: false,
					},
					{
						label: "Advanced Features",
						url: "/docs/api/advanced",
						description: "Advanced API features",
						icon: "⚙️",
						active: false,
						children: [
							{ label: "Plugins", url: "/docs/api/plugins" },
							{ label: "Extensions", url: "/docs/api/extensions" },
							{ label: "Middleware", url: "/docs/api/middleware" },
						],
					},
				],
			},
		],
	};

	const result = await engine.render(mainTemplate, data);

	expect(result).toContain('<nav class="sidebar">');
	expect(result).toContain("Getting Started");
	expect(result).toContain("API Reference");
	expect(result).toContain("Installation");
	expect(result).toContain("Quick Start");
	expect(result).toContain("Core API");
	expect(result).toContain("Advanced Features");

	expect(result).toContain("📦");
	expect(result).toContain("🚀");
	expect(result).toContain("📖");
	expect(result).toContain("⚙️");

	expect(result).toContain('class="nav-item active"');
	expect(result).toContain("/docs/installation");
	expect(result).toContain("/docs/quickstart");
	expect(result).toContain("/docs/api/core");
	expect(result).toContain("/docs/api/advanced");

	expect(result).toContain("Basic Setup");
	expect(result).toContain("Configuration");
	expect(result).toContain("Plugins");
	expect(result).toContain("Extensions");
	expect(result).toContain("Middleware");

	expect(result).toContain("/docs/quickstart/basic");
	expect(result).toContain("/docs/quickstart/config");
	expect(result).toContain("/docs/api/plugins");
	expect(result).toContain("/docs/api/extensions");
	expect(result).toContain("/docs/api/middleware");

	expect(result).toContain('title="How to install the library"');
	expect(result).toContain('title="Get up and running quickly"');
});

import { beforeEach, describe, expect, it } from "vitest";
import { Ecto } from "../src/ecto.js";

describe("Ecto detectEngine", () => {
	let ecto: Ecto;

	beforeEach(() => {
		ecto = new Ecto();
	});

	describe("EJS Detection", () => {
		it("should detect EJS with <%= %> syntax", () => {
			expect(ecto.detectEngine("<%= name %>")).toBe("ejs");
			expect(ecto.detectEngine("Hello <%= user.name %>!")).toBe("ejs");
			expect(ecto.detectEngine("<div><%= title %></div>")).toBe("ejs");
		});

		it("should detect EJS with <%- %> syntax", () => {
			expect(ecto.detectEngine("<%- htmlContent %>")).toBe("ejs");
			expect(ecto.detectEngine("<div><%- unescapedHtml %></div>")).toBe("ejs");
		});

		it("should detect EJS with <% %> syntax", () => {
			expect(ecto.detectEngine("<% if (true) { %>")).toBe("ejs");
			expect(ecto.detectEngine("<% for(let i = 0; i < 10; i++) { %>")).toBe(
				"ejs",
			);
			expect(
				ecto.detectEngine("<% if (user) { %><h1><%= user.name %></h1><% } %>"),
			).toBe("ejs");
		});

		it("should detect complex EJS templates", () => {
			const template = `
				<% if (items.length) { %>
					<ul>
						<% items.forEach(function(item) { %>
							<li><%= item.name %> - $<%= item.price %></li>
						<% }); %>
					</ul>
				<% } else { %>
					<p>No items found</p>
				<% } %>
			`;
			expect(ecto.detectEngine(template)).toBe("ejs");
		});
	});

	describe("Handlebars Detection", () => {
		it("should detect Handlebars with basic variable syntax", () => {
			expect(ecto.detectEngine("{{name}}")).toBe("handlebars");
			expect(ecto.detectEngine("Hello {{user.name}}!")).toBe("handlebars");
			expect(ecto.detectEngine("{{firstName}} {{lastName}}")).toBe(
				"handlebars",
			);
		});

		it("should detect Handlebars with helpers", () => {
			expect(ecto.detectEngine("{{#if isActive}}Active{{/if}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectEngine("{{#each items}}{{this}}{{/each}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectEngine("{{#unless hidden}}Visible{{/unless}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectEngine("{{#with person}}{{name}}{{/with}}")).toBe(
				"handlebars",
			);
		});

		it("should detect Handlebars partials", () => {
			expect(ecto.detectEngine("{{> header}}")).toBe("handlebars");
			expect(ecto.detectEngine("{{> partials/navigation}}")).toBe("handlebars");
		});

		it("should detect Handlebars comments", () => {
			expect(ecto.detectEngine("{{!-- This is a comment --}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectEngine("{{! Simple comment }}")).toBe("handlebars");
		});

		it("should detect complex Handlebars templates", () => {
			const template = `
				{{#if user}}
					<h1>Welcome {{user.name}}</h1>
					{{#each user.posts}}
						<article>
							<h2>{{title}}</h2>
							<p>{{content}}</p>
						</article>
					{{/each}}
				{{else}}
					<p>Please log in</p>
				{{/if}}
			`;
			expect(ecto.detectEngine(template)).toBe("handlebars");
		});
	});

	describe("Pug Detection", () => {
		it("should detect simple Pug syntax", () => {
			expect(ecto.detectEngine("html")).toBe("pug");
			expect(ecto.detectEngine("div")).toBe("pug");
			expect(ecto.detectEngine("p Hello World")).toBe("pug");
		});

		it("should detect Pug with classes and IDs", () => {
			expect(ecto.detectEngine("div.container")).toBe("pug");
			expect(ecto.detectEngine("div#main-content")).toBe("pug");
			expect(ecto.detectEngine("p.text-center#intro")).toBe("pug");
		});

		it("should detect Pug with attributes", () => {
			expect(ecto.detectEngine('a(href="/about") About')).toBe("pug");
			expect(ecto.detectEngine('img(src="logo.png" alt="Logo")')).toBe("pug");
		});

		it("should detect complex Pug templates", () => {
			const template = `doctype html
html
  head
    title My Site
  body
    h1 Welcome
    div.container
      p Hello World`;
			expect(ecto.detectEngine(template)).toBe("pug");
		});

		it("should not detect as Pug if HTML tags are present", () => {
			expect(ecto.detectEngine("<div>Hello</div>")).not.toBe("pug");
			expect(ecto.detectEngine("div <span>text</span>")).not.toBe("pug");
		});
	});

	describe("Nunjucks Detection", () => {
		it("should detect Nunjucks block syntax", () => {
			expect(ecto.detectEngine("{% block content %}{% endblock %}")).toBe(
				"nunjucks",
			);
			expect(ecto.detectEngine("{% extends 'base.html' %}")).toBe("nunjucks");
			expect(ecto.detectEngine("{% include 'header.html' %}")).toBe("nunjucks");
		});

		it("should detect Nunjucks control structures", () => {
			expect(ecto.detectEngine("{% if user %}Hello{% endif %}")).toBe(
				"nunjucks",
			);
			expect(
				ecto.detectEngine("{% for item in items %}{{ item }}{% endfor %}"),
			).toBe("nunjucks");
			expect(ecto.detectEngine("{% set name = 'John' %}")).toBe("nunjucks");
		});

		it("should detect Nunjucks macros", () => {
			expect(ecto.detectEngine("{% macro input(name) %}{% endmacro %}")).toBe(
				"nunjucks",
			);
			expect(ecto.detectEngine("{% import 'forms.html' as forms %}")).toBe(
				"nunjucks",
			);
		});

		it("should detect complex Nunjucks templates", () => {
			const template = `
				{% extends "base.html" %}
				{% block title %}Home{% endblock %}
				{% block content %}
					{% for post in posts %}
						<h2>{{ post.title }}</h2>
						<p>{{ post.content }}</p>
					{% endfor %}
				{% endblock %}
			`;
			expect(ecto.detectEngine(template)).toBe("nunjucks");
		});
	});

	describe("Liquid Detection", () => {
		it("should detect Liquid-specific tags", () => {
			expect(ecto.detectEngine("{% assign name = 'John' %}")).toBe("liquid");
			expect(ecto.detectEngine("{% capture var %}Hello{% endcapture %}")).toBe(
				"liquid",
			);
			expect(
				ecto.detectEngine("{% case color %}{% when 'red' %}{% endcase %}"),
			).toBe("liquid");
		});

		it("should detect Liquid control flow", () => {
			expect(ecto.detectEngine("{% unless condition %}{% endunless %}")).toBe(
				"liquid",
			);
			expect(
				ecto.detectEngine(
					"{% tablerow product in products %}{% endtablerow %}",
				),
			).toBe("liquid");
		});

		it("should detect Liquid with filters", () => {
			expect(ecto.detectEngine("{{ 'hello' | upcase }}")).toBe("liquid");
			expect(ecto.detectEngine("{{ product.price | minus: 10 }}")).toBe(
				"liquid",
			);
			// This template is ambiguous - both Nunjucks and Liquid use {% for %},
			// but the filter syntax with pipe is more specific to Liquid
			// Let's use a more specific Liquid example
			expect(
				ecto.detectEngine(
					"{% assign greeting = 'hello' %} {{ greeting | upcase }}",
				),
			).toBe("liquid");
		});

		it("should detect Liquid increment/decrement", () => {
			expect(ecto.detectEngine("{% increment counter %}")).toBe("liquid");
			expect(ecto.detectEngine("{% decrement counter %}")).toBe("liquid");
		});

		it("should detect complex Liquid templates", () => {
			const template = `
				{% assign products = collections.all.products %}
				{% capture product_list %}
					{% for product in products %}
						<h2>{{ product.title | upcase }}</h2>
						<p>{{ product.price | money }}</p>
						{% unless product.available %}
							<span>Sold Out</span>
						{% endunless %}
					{% endfor %}
				{% endcapture %}
				{{ product_list }}
			`;
			expect(ecto.detectEngine(template)).toBe("liquid");
		});
	});

	describe("Markdown Detection", () => {
		it("should detect Markdown headers", () => {
			expect(ecto.detectEngine("# Heading 1")).toBe("markdown");
			expect(ecto.detectEngine("## Heading 2")).toBe("markdown");
			expect(ecto.detectEngine("### Heading 3")).toBe("markdown");
			expect(ecto.detectEngine("#### Heading 4")).toBe("markdown");
		});

		it("should detect Markdown lists", () => {
			expect(ecto.detectEngine("- Item 1\n- Item 2")).toBe("markdown");
			expect(ecto.detectEngine("* Item 1\n* Item 2")).toBe("markdown");
			expect(ecto.detectEngine("+ Item 1\n+ Item 2")).toBe("markdown");
			expect(ecto.detectEngine("1. First\n2. Second")).toBe("markdown");
		});

		it("should detect Markdown code blocks", () => {
			expect(ecto.detectEngine("```javascript\nconst x = 1;\n```")).toBe(
				"markdown",
			);
			expect(ecto.detectEngine("```\ncode here\n```")).toBe("markdown");
		});

		it("should detect Markdown links and images", () => {
			expect(ecto.detectEngine("[Link text](http://example.com)")).toBe(
				"markdown",
			);
			expect(ecto.detectEngine("![Alt text](image.png)")).toBe("markdown");
		});

		it("should detect Markdown blockquotes", () => {
			expect(ecto.detectEngine("> This is a quote")).toBe("markdown");
			expect(ecto.detectEngine("> Quote line 1\n> Quote line 2")).toBe(
				"markdown",
			);
		});

		it("should detect Markdown tables", () => {
			expect(ecto.detectEngine("| Col1 | Col2 |\n|------|------|")).toBe(
				"markdown",
			);
		});

		it("should not detect as Markdown if template syntax is present", () => {
			expect(ecto.detectEngine("# Heading <%= name %>")).not.toBe("markdown");
			expect(ecto.detectEngine("# Title {{ variable }}")).not.toBe("markdown");
			expect(ecto.detectEngine("# Title {% if true %}")).not.toBe("markdown");
		});

		it("should detect complex Markdown documents", () => {
			const template = `# My Document

This is a paragraph with **bold** and *italic* text.

## Section 1

- Item 1
- Item 2
  - Nested item

\`\`\`javascript
const x = 1;
\`\`\`

[Link to site](http://example.com)

> This is a quote

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`;
			expect(ecto.detectEngine(template)).toBe("markdown");
		});
	});

	describe("Edge Cases and Unknown Detection", () => {
		it("should return unknown for empty or invalid input", () => {
			expect(ecto.detectEngine("")).toBe("unknown");
			// Test with invalid types using type assertions to bypass TypeScript checking
			// These tests ensure runtime handling of invalid input
			expect(ecto.detectEngine(null as unknown as string)).toBe("unknown");
			expect(ecto.detectEngine(undefined as unknown as string)).toBe("unknown");
			expect(ecto.detectEngine(123 as unknown as string)).toBe("unknown");
			expect(ecto.detectEngine({} as unknown as string)).toBe("unknown");
		});

		it("should return unknown for plain text without template syntax", () => {
			expect(ecto.detectEngine("Hello World")).toBe("unknown");
			expect(ecto.detectEngine("This is just plain text.")).toBe("unknown");
			expect(ecto.detectEngine("No template syntax here!")).toBe("unknown");
		});

		it("should return unknown for plain HTML without template syntax", () => {
			expect(ecto.detectEngine("<div>Hello</div>")).toBe("unknown");
			expect(ecto.detectEngine("<p>Plain HTML</p>")).toBe("unknown");
			expect(ecto.detectEngine("<span class='test'>Text</span>")).toBe(
				"unknown",
			);
		});

		it("should handle mixed content appropriately", () => {
			// EJS takes precedence
			expect(ecto.detectEngine("<%= name %> {{other}}")).toBe("ejs");

			// Nunjucks takes precedence over basic handlebars syntax
			expect(
				ecto.detectEngine("{% block content %} {{variable}} {% endblock %}"),
			).toBe("nunjucks");

			// Liquid-specific syntax with filters
			expect(
				ecto.detectEngine("{{ name | upcase }} {% assign foo = 'bar' %}"),
			).toBe("liquid");

			// For ambiguous templates (both Nunjucks and Liquid use {% for %}),
			// Nunjucks takes precedence without Liquid-specific keywords
			expect(
				ecto.detectEngine("{% for item in items %}{{ item }}{% endfor %}"),
			).toBe("nunjucks");
		});

		it("should handle whitespace and newlines correctly", () => {
			expect(ecto.detectEngine("   <%= name %>   ")).toBe("ejs");
			expect(ecto.detectEngine("\n\n{{name}}\n\n")).toBe("handlebars");
			expect(ecto.detectEngine("\t\t# Heading\n")).toBe("markdown");
		});

		it("should handle templates with comments", () => {
			expect(ecto.detectEngine("<!-- HTML comment --> <%= name %>")).toBe(
				"ejs",
			);
			expect(ecto.detectEngine("{{!-- Handlebars comment --}} {{name}}")).toBe(
				"handlebars",
			);
		});
	});

	describe("Real-world Template Examples", () => {
		it("should detect a real EJS template", () => {
			const template = `<!DOCTYPE html>
<html>
<head>
	<title><%= title %></title>
</head>
<body>
	<% include partials/header %>
	<h1><%= heading %></h1>
	<% if (user) { %>
		<p>Welcome, <%= user.name %>!</p>
	<% } %>
</body>
</html>`;
			expect(ecto.detectEngine(template)).toBe("ejs");
		});

		it("should detect a real Handlebars template", () => {
			const template = `<!DOCTYPE html>
<html>
<head>
	<title>{{title}}</title>
</head>
<body>
	{{> header}}
	<h1>{{heading}}</h1>
	{{#if user}}
		<p>Welcome, {{user.name}}!</p>
	{{/if}}
</body>
</html>`;
			expect(ecto.detectEngine(template)).toBe("handlebars");
		});

		it("should detect a real Pug template", () => {
			const template = `doctype html
html(lang="en")
	head
		title= pageTitle
		script(src="/js/app.js")
	body
		h1.title Welcome to Pug
		div.container
			p.
				This is a paragraph with
				multiple lines of text.
			ul
				each item in items
					li= item`;
			expect(ecto.detectEngine(template)).toBe("pug");
		});
	});
});

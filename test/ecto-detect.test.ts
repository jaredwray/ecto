import { beforeEach, describe, expect, it } from "vitest";
import { Ecto } from "../src/ecto.js";

describe("Ecto detectLanguage", () => {
	let ecto: Ecto;

	beforeEach(() => {
		ecto = new Ecto();
	});

	describe("EJS Detection", () => {
		it("should detect EJS with <%= %> syntax", () => {
			expect(ecto.detectLanguage("<%= name %>")).toBe("ejs");
			expect(ecto.detectLanguage("Hello <%= user.name %>!")).toBe("ejs");
			expect(ecto.detectLanguage("<div><%= title %></div>")).toBe("ejs");
		});

		it("should detect EJS with <%- %> syntax", () => {
			expect(ecto.detectLanguage("<%- htmlContent %>")).toBe("ejs");
			expect(ecto.detectLanguage("<div><%- unescapedHtml %></div>")).toBe(
				"ejs",
			);
		});

		it("should detect EJS with <% %> syntax", () => {
			expect(ecto.detectLanguage("<% if (true) { %>")).toBe("ejs");
			expect(ecto.detectLanguage("<% for(let i = 0; i < 10; i++) { %>")).toBe(
				"ejs",
			);
			expect(
				ecto.detectLanguage(
					"<% if (user) { %><h1><%= user.name %></h1><% } %>",
				),
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
			expect(ecto.detectLanguage(template)).toBe("ejs");
		});
	});

	describe("Handlebars Detection", () => {
		it("should detect Handlebars with basic variable syntax", () => {
			expect(ecto.detectLanguage("{{name}}")).toBe("handlebars");
			expect(ecto.detectLanguage("Hello {{user.name}}!")).toBe("handlebars");
			expect(ecto.detectLanguage("{{firstName}} {{lastName}}")).toBe(
				"handlebars",
			);
		});

		it("should detect Handlebars with helpers", () => {
			expect(ecto.detectLanguage("{{#if isActive}}Active{{/if}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectLanguage("{{#each items}}{{this}}{{/each}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectLanguage("{{#unless hidden}}Visible{{/unless}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectLanguage("{{#with person}}{{name}}{{/with}}")).toBe(
				"handlebars",
			);
		});

		it("should detect Handlebars partials", () => {
			expect(ecto.detectLanguage("{{> header}}")).toBe("handlebars");
			expect(ecto.detectLanguage("{{> partials/navigation}}")).toBe(
				"handlebars",
			);
		});

		it("should detect Handlebars comments", () => {
			expect(ecto.detectLanguage("{{!-- This is a comment --}}")).toBe(
				"handlebars",
			);
			expect(ecto.detectLanguage("{{! Simple comment }}")).toBe("handlebars");
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
			expect(ecto.detectLanguage(template)).toBe("handlebars");
		});
	});

	describe("Pug Detection", () => {
		it("should detect simple Pug syntax", () => {
			expect(ecto.detectLanguage("html")).toBe("pug");
			expect(ecto.detectLanguage("div")).toBe("pug");
			expect(ecto.detectLanguage("p Hello World")).toBe("pug");
		});

		it("should detect Pug with classes and IDs", () => {
			expect(ecto.detectLanguage("div.container")).toBe("pug");
			expect(ecto.detectLanguage("div#main-content")).toBe("pug");
			expect(ecto.detectLanguage("p.text-center#intro")).toBe("pug");
		});

		it("should detect Pug with attributes", () => {
			expect(ecto.detectLanguage('a(href="/about") About')).toBe("pug");
			expect(ecto.detectLanguage('img(src="logo.png" alt="Logo")')).toBe("pug");
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
			expect(ecto.detectLanguage(template)).toBe("pug");
		});

		it("should not detect as Pug if HTML tags are present", () => {
			expect(ecto.detectLanguage("<div>Hello</div>")).not.toBe("pug");
			expect(ecto.detectLanguage("div <span>text</span>")).not.toBe("pug");
		});
	});

	describe("Nunjucks Detection", () => {
		it("should detect Nunjucks block syntax", () => {
			expect(ecto.detectLanguage("{% block content %}{% endblock %}")).toBe(
				"nunjucks",
			);
			expect(ecto.detectLanguage("{% extends 'base.html' %}")).toBe("nunjucks");
			expect(ecto.detectLanguage("{% include 'header.html' %}")).toBe(
				"nunjucks",
			);
		});

		it("should detect Nunjucks control structures", () => {
			expect(ecto.detectLanguage("{% if user %}Hello{% endif %}")).toBe(
				"nunjucks",
			);
			expect(
				ecto.detectLanguage("{% for item in items %}{{ item }}{% endfor %}"),
			).toBe("nunjucks");
			expect(ecto.detectLanguage("{% set name = 'John' %}")).toBe("nunjucks");
		});

		it("should detect Nunjucks macros", () => {
			expect(ecto.detectLanguage("{% macro input(name) %}{% endmacro %}")).toBe(
				"nunjucks",
			);
			expect(ecto.detectLanguage("{% import 'forms.html' as forms %}")).toBe(
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
			expect(ecto.detectLanguage(template)).toBe("nunjucks");
		});
	});

	describe("Liquid Detection", () => {
		it("should detect Liquid-specific tags", () => {
			expect(ecto.detectLanguage("{% assign name = 'John' %}")).toBe("liquid");
			expect(
				ecto.detectLanguage("{% capture var %}Hello{% endcapture %}"),
			).toBe("liquid");
			expect(
				ecto.detectLanguage("{% case color %}{% when 'red' %}{% endcase %}"),
			).toBe("liquid");
		});

		it("should detect Liquid control flow", () => {
			expect(ecto.detectLanguage("{% unless condition %}{% endunless %}")).toBe(
				"liquid",
			);
			expect(
				ecto.detectLanguage(
					"{% tablerow product in products %}{% endtablerow %}",
				),
			).toBe("liquid");
		});

		it("should detect Liquid with filters", () => {
			expect(ecto.detectLanguage("{{ 'hello' | upcase }}")).toBe("liquid");
			expect(ecto.detectLanguage("{{ product.price | minus: 10 }}")).toBe(
				"liquid",
			);
			// This template is ambiguous - both Nunjucks and Liquid use {% for %},
			// but the filter syntax with pipe is more specific to Liquid
			// Let's use a more specific Liquid example
			expect(
				ecto.detectLanguage(
					"{% assign greeting = 'hello' %} {{ greeting | upcase }}",
				),
			).toBe("liquid");
		});

		it("should detect Liquid increment/decrement", () => {
			expect(ecto.detectLanguage("{% increment counter %}")).toBe("liquid");
			expect(ecto.detectLanguage("{% decrement counter %}")).toBe("liquid");
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
			expect(ecto.detectLanguage(template)).toBe("liquid");
		});
	});

	describe("Markdown Detection", () => {
		it("should detect Markdown headers", () => {
			expect(ecto.detectLanguage("# Heading 1")).toBe("markdown");
			expect(ecto.detectLanguage("## Heading 2")).toBe("markdown");
			expect(ecto.detectLanguage("### Heading 3")).toBe("markdown");
			expect(ecto.detectLanguage("#### Heading 4")).toBe("markdown");
		});

		it("should detect Markdown lists", () => {
			expect(ecto.detectLanguage("- Item 1\n- Item 2")).toBe("markdown");
			expect(ecto.detectLanguage("* Item 1\n* Item 2")).toBe("markdown");
			expect(ecto.detectLanguage("+ Item 1\n+ Item 2")).toBe("markdown");
			expect(ecto.detectLanguage("1. First\n2. Second")).toBe("markdown");
		});

		it("should detect Markdown code blocks", () => {
			expect(ecto.detectLanguage("```javascript\nconst x = 1;\n```")).toBe(
				"markdown",
			);
			expect(ecto.detectLanguage("```\ncode here\n```")).toBe("markdown");
		});

		it("should detect Markdown links and images", () => {
			expect(ecto.detectLanguage("[Link text](http://example.com)")).toBe(
				"markdown",
			);
			expect(ecto.detectLanguage("![Alt text](image.png)")).toBe("markdown");
		});

		it("should detect Markdown blockquotes", () => {
			expect(ecto.detectLanguage("> This is a quote")).toBe("markdown");
			expect(ecto.detectLanguage("> Quote line 1\n> Quote line 2")).toBe(
				"markdown",
			);
		});

		it("should detect Markdown tables", () => {
			expect(ecto.detectLanguage("| Col1 | Col2 |\n|------|------|")).toBe(
				"markdown",
			);
		});

		it("should not detect as Markdown if template syntax is present", () => {
			expect(ecto.detectLanguage("# Heading <%= name %>")).not.toBe("markdown");
			expect(ecto.detectLanguage("# Title {{ variable }}")).not.toBe(
				"markdown",
			);
			expect(ecto.detectLanguage("# Title {% if true %}")).not.toBe("markdown");
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
			expect(ecto.detectLanguage(template)).toBe("markdown");
		});
	});

	describe("Edge Cases and Unknown Detection", () => {
		it("should return unknown for empty or invalid input", () => {
			expect(ecto.detectLanguage("")).toBe("unknown");
			// Test with invalid types using type assertions to bypass TypeScript checking
			// These tests ensure runtime handling of invalid input
			expect(ecto.detectLanguage(null as unknown as string)).toBe("unknown");
			expect(ecto.detectLanguage(undefined as unknown as string)).toBe(
				"unknown",
			);
			expect(ecto.detectLanguage(123 as unknown as string)).toBe("unknown");
			expect(ecto.detectLanguage({} as unknown as string)).toBe("unknown");
		});

		it("should return unknown for plain text without template syntax", () => {
			expect(ecto.detectLanguage("Hello World")).toBe("unknown");
			expect(ecto.detectLanguage("This is just plain text.")).toBe("unknown");
			expect(ecto.detectLanguage("No template syntax here!")).toBe("unknown");
		});

		it("should return unknown for plain HTML without template syntax", () => {
			expect(ecto.detectLanguage("<div>Hello</div>")).toBe("unknown");
			expect(ecto.detectLanguage("<p>Plain HTML</p>")).toBe("unknown");
			expect(ecto.detectLanguage("<span class='test'>Text</span>")).toBe(
				"unknown",
			);
		});

		it("should handle mixed content appropriately", () => {
			// EJS takes precedence
			expect(ecto.detectLanguage("<%= name %> {{other}}")).toBe("ejs");

			// Nunjucks takes precedence over basic handlebars syntax
			expect(
				ecto.detectLanguage("{% block content %} {{variable}} {% endblock %}"),
			).toBe("nunjucks");

			// Liquid-specific syntax with filters
			expect(
				ecto.detectLanguage("{{ name | upcase }} {% assign foo = 'bar' %}"),
			).toBe("liquid");

			// For ambiguous templates (both Nunjucks and Liquid use {% for %}),
			// Nunjucks takes precedence without Liquid-specific keywords
			expect(
				ecto.detectLanguage("{% for item in items %}{{ item }}{% endfor %}"),
			).toBe("nunjucks");
		});

		it("should handle whitespace and newlines correctly", () => {
			expect(ecto.detectLanguage("   <%= name %>   ")).toBe("ejs");
			expect(ecto.detectLanguage("\n\n{{name}}\n\n")).toBe("handlebars");
			expect(ecto.detectLanguage("\t\t# Heading\n")).toBe("markdown");
		});

		it("should handle templates with comments", () => {
			expect(ecto.detectLanguage("<!-- HTML comment --> <%= name %>")).toBe(
				"ejs",
			);
			expect(
				ecto.detectLanguage("{{!-- Handlebars comment --}} {{name}}"),
			).toBe("handlebars");
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
			expect(ecto.detectLanguage(template)).toBe("ejs");
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
			expect(ecto.detectLanguage(template)).toBe("handlebars");
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
			expect(ecto.detectLanguage(template)).toBe("pug");
		});
	});
});

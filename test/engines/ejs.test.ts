import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { EJS } from "../../src/engines/ejs.js";

const exampleSource1 = "<% if (user) { %><h2><%= user.name %></h2><% } %>";
const exampleSource2 = "<% if (test) { %><h2><%= test.foo %></h2><% } %>";

const exampleData1 = {
	fruits: ["Apple", "Pear", "Orange", "Lemon"],
	user: { name: "John Doe" },
};

const testTemplateDirectory = "./test/data/ejs";

it("EJS - Default Name ejs", () => {
	const engine = new EJS();
	expect(engine.names.toString()).toContain("ejs");
});

it("EJS - Opts should be undefined by default", () => {
	const engine = new EJS();
	expect(engine.opts).toBe(undefined);
});

it("EJS - Setting Opts on the Constructor", () => {
	const options = { cool: true };
	const engine = new EJS(options);
	expect(engine.opts).toBe(options);
});

it("EJS - Extension should be a count of 1", () => {
	const engine = new EJS();
	expect(engine.getExtensions().length).toBe(1);
});

it("EJS - Rendering a simple string", async () => {
	const engine = new EJS();
	const data = { user: { name: "Joe" } };
	expect(await engine.render(exampleSource1, data)).toContain("Joe");
});

it("EJS - Rendering a simple string synchronous", () => {
	const engine = new EJS();
	const data = { user: { name: "Joe" } };
	expect(engine.renderSync(exampleSource1, data)).toContain("Joe");
});

it("EJS - Rendering a simple string after inital render", async () => {
	const engine = new EJS();
	const data = { user: { name: "Joe" }, test: { foo: "bar" } };
	expect(await engine.render(exampleSource1, data)).toContain("Joe");
	expect(await engine.render(exampleSource2, data)).toContain("bar");
});

it("EJS - Rendering with partial", async () => {
	const engine = new EJS();

	const source = await fs.promises.readFile(
		`${testTemplateDirectory}/example2.ejs`,
		"utf8",
	);

	engine.rootTemplatePath = testTemplateDirectory;

	expect(await engine.render(source, exampleData1)).toContain("John Doe");
});

it("EJS - an include cannot leave the template root", () => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-ejs-"));
	const root = path.join(parent, "root");
	const outside = path.join(parent, "secret.ejs");
	fs.mkdirSync(root);
	fs.writeFileSync(outside, "EJS-SECRET");
	fs.writeFileSync(path.join(root, "page.ejs"), "INSIDE");
	fs.symlinkSync(outside, path.join(root, "leak.ejs"));
	const options = { cool: true };
	const engine = new EJS(options);
	engine.rootTemplatePath = root;
	try {
		expect(engine.renderSync("<%- include('/page') %>")).toContain("INSIDE");
		expect(() => engine.renderSync("<%- include('/../secret') %>")).toThrow(
			/leaves the template root/,
		);
		expect(() => engine.renderSync("<%- include('/leak') %>")).toThrow(
			/leaves the template root/,
		);
		expect(engine.opts).toBe(options);
		expect(options).toEqual({ cool: true });
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

it("EJS - a swapped directory does not expose another file", () => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-ejs-swap-"));
	const root = path.join(parent, "root");
	const outside = path.join(parent, "outside");
	fs.mkdirSync(path.join(root, "sub"), { recursive: true });
	fs.mkdirSync(outside, { recursive: true });
	fs.writeFileSync(path.join(root, "sub", "page.ejs"), "INSIDE");
	fs.writeFileSync(path.join(outside, "page.ejs"), "EJS-SECRET");
	const directory = path.join(root, "sub");
	const originalOpen = fs.openSync;
	const originalLstat = fs.lstatSync;
	let armed = true;
	const swapDirectory = () => {
		if (!armed) return;
		armed = false;
		fs.rmSync(directory, { recursive: true });
		fs.symlinkSync(outside, directory);
	};
	// The old reader checks `sub` with lstat, then checks the file.
	// Swap in that gap so both later calls follow the symlink.
	fs.lstatSync = ((target: fs.PathLike, options?: fs.StatOptions) => {
		const stat = originalLstat.call(fs, target, options);
		if (String(target) === directory) swapDirectory();
		return stat;
	}) as typeof fs.lstatSync;
	// The new reader opens the root first, then opens `sub` from that descriptor.
	fs.openSync = ((target: fs.PathLike, flags: fs.OpenMode) => {
		const fd = originalOpen.call(fs, target, flags);
		if (String(target) === root) swapDirectory();
		return fd;
	}) as typeof fs.openSync;
	try {
		const engine = new EJS();
		engine.rootTemplatePath = root;
		expect(() => engine.renderSync("<%- include('/sub/page') %>")).toThrow(
			/leaves the template root/,
		);
	} finally {
		fs.openSync = originalOpen;
		fs.lstatSync = originalLstat;
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

it("EJS - a file include fails when the root is not set", () => {
	const file = path.join(os.tmpdir(), `ecto-ejs-noroot-${Date.now()}.ejs`);
	fs.writeFileSync(file, "EJS-SECRET");
	try {
		const engine = new EJS();
		const source = `<%- include(${JSON.stringify(file)}) %>`;
		expect(() => engine.renderSync(source)).toThrow(/root is not set/);
		expect(engine.opts).toBeUndefined();
	} finally {
		fs.rmSync(file, { force: true });
	}
});

it("EJS - a caller include stays inside the template root", () => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "ecto-ejs-caller-"));
	const root = path.join(parent, "root");
	const outside = path.join(parent, "secret.ejs");
	fs.mkdirSync(root);
	fs.writeFileSync(outside, "EJS-SECRET");
	fs.writeFileSync(path.join(root, "page.ejs"), "INSIDE");
	try {
		const virtual = new EJS({
			includer: () => ({ template: "VIRTUAL" }),
		});
		virtual.rootTemplatePath = root;
		expect(virtual.renderSync("<%- include('/page') %>")).toBe("VIRTUAL");
		expect(virtual.renderSync("<%- include('virtual') %>")).toBe("VIRTUAL");
		const virtualWithoutRoot = new EJS({
			includer: () => ({ template: "VIRTUAL" }),
		});
		expect(virtualWithoutRoot.renderSync("<%- include('virtual') %>")).toBe(
			"VIRTUAL",
		);

		const named = new EJS({
			includer: () =>
				({
					template: "VIRTUAL",
					filename: path.join(root, "page.ejs"),
				}) as unknown as { template: string },
		});
		named.rootTemplatePath = root;
		expect(named.renderSync("<%- include('virtual') %>")).toBe("VIRTUAL");

		const missingName = new EJS({
			includer: () =>
				({
					template: "VIRTUAL",
					filename: path.join(root, "missing.ejs"),
				}) as unknown as { template: string },
		});
		missingName.rootTemplatePath = root;
		expect(missingName.renderSync("<%- include('virtual') %>")).toBe("VIRTUAL");

		const outsideName = new EJS({
			includer: () =>
				({
					template: "VIRTUAL",
					filename: outside,
				}) as unknown as { template: string },
		});
		outsideName.rootTemplatePath = root;
		expect(outsideName.renderSync("<%- include('virtual') %>")).toBe("VIRTUAL");

		fs.mkdirSync(path.join(root, "dir"));
		fs.writeFileSync(path.join(root, "dir", "page.ejs"), "INSIDE");
		const nested = new EJS({
			includer: (original: string) => {
				if (original === "virtual") {
					return {
						template: "<%- include('./page') %>",
						filename: path.join(root, "dir", "logical.ejs"),
					} as unknown as { filename: string };
				}
				return undefined as unknown as { filename: string };
			},
		});
		nested.rootTemplatePath = root;
		expect(nested.renderSync("<%- include('virtual') %>")).toContain("INSIDE");

		const relativeNested = new EJS({
			includer: (original: string) => {
				if (original === "virtual") {
					return {
						template: "<%- include('./page') %>",
						filename: "dir/logical.ejs",
					} as unknown as { filename: string };
				}
				return undefined as unknown as { filename: string };
			},
		});
		relativeNested.rootTemplatePath = root;
		expect(relativeNested.renderSync("<%- include('virtual') %>")).toContain(
			"INSIDE",
		);

		const relativeWithoutRoot = new EJS({
			includer: () =>
				({
					template: "VIRTUAL",
					filename: "logical.ejs",
				}) as unknown as { template: string },
		});
		expect(relativeWithoutRoot.renderSync("<%- include('virtual') %>")).toBe(
			"VIRTUAL",
		);

		fs.writeFileSync(path.join(parent, "page.ejs"), "EJS-SECRET");
		const nestedOutside = new EJS({
			includer: (original: string) => {
				if (original === "virtual") {
					return {
						template: "<%- include('./page') %>",
						filename: path.join(parent, "logical.ejs"),
					} as unknown as { filename: string };
				}
				return undefined as unknown as { filename: string };
			},
		});
		nestedOutside.rootTemplatePath = root;
		expect(() => nestedOutside.renderSync("<%- include('virtual') %>")).toThrow(
			/leaves the template root/,
		);

		const relativeEscape = new EJS({
			includer: (original: string) => {
				if (original === "virtual") {
					return {
						template: "<%- include('./page') %>",
						filename: "../logical.ejs",
					} as unknown as { filename: string };
				}
				return undefined as unknown as { filename: string };
			},
		});
		relativeEscape.rootTemplatePath = root;
		expect(() =>
			relativeEscape.renderSync("<%- include('virtual') %>"),
		).toThrow(/leaves the template root/);

		const fallback = new EJS({
			includer: () => undefined as unknown as { filename: string },
		});
		fallback.rootTemplatePath = root;
		expect(fallback.renderSync("<%- include('/page') %>")).toContain("INSIDE");

		const passthrough = new EJS({
			includer: (_original: string, parsed: string) => ({ filename: parsed }),
		});
		passthrough.rootTemplatePath = root;
		expect(passthrough.renderSync("<%- include('/page') %>")).toContain(
			"INSIDE",
		);

		const outsideInclude = new EJS({
			includer: () => ({ filename: outside }),
		});
		outsideInclude.rootTemplatePath = root;
		expect(() => outsideInclude.renderSync("<%- include('/page') %>")).toThrow(
			/leaves the template root/,
		);

		const relative = new EJS();
		relative.rootTemplatePath = root;
		expect(() => relative.renderSync("<%- include('missing') %>")).toThrow(
			/path is empty/,
		);
		expect(() => relative.renderSync("<%- include('/missing') %>")).toThrow();
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

import fs from "node:fs";
import nodePath from "node:path";
import { BaseEngine } from "../base-engine.js";
import type { EngineInterface } from "../engine-interface.js";
import { createSafeFumanchu } from "./fumanchu-safety.js";

export class Handlebars extends BaseEngine implements EngineInterface {
	public partialsPath = ["partials", "includes", "templates"];

	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ["handlebars", "mustache"];
		this.opts = options;

		// `unsafeHelpers` selects helpers. It is not a Handlebars compile option.
		this.engine = createSafeFumanchu(options);

		this.setExtensions(["hbs", "hjs", "handlebars", "mustache"]);
	}

	async render(
		source: string,
		data?: Record<string, unknown>,
	): Promise<string> {
		return this.renderTemplate(source, data);
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		return this.renderTemplate(source, data);
	}

	/**
	 * Handlebars compile options. Omit `unsafeHelpers` so the flag
	 * does not reach the compiler.
	 */
	private templateOptions(): Record<string, unknown> | undefined {
		if (!this.opts || !Object.hasOwn(this.opts, "unsafeHelpers")) {
			return this.opts;
		}

		const { unsafeHelpers: _unsafeHelpers, ...rest } = this.opts;
		return rest;
	}

	/**
	 * Compile and render one template.
	 * File partials apply to this call only.
	 */
	private renderTemplate(
		source: string,
		data?: Record<string, unknown>,
	): string {
		const options = this.templateOptions();
		const template = this.engine.compile(source, options);
		const registered = (this.engine.partials ?? {}) as Record<string, unknown>;
		const configured = (options?.partials ?? {}) as Record<string, unknown>;
		const runtime = {
			...(options ?? {}),
			partials: {
				...registered,
				...configured,
				...this.filePartials(),
			},
		};

		// Standard Handlebars semantics: `{{var}}` HTML-escapes, `{{{var}}}`
		// inserts raw. No post-render entity decoding — a blanket decode
		// corrupts legitimately escaped content in the data (for example
		// `&#x3C;` inside pre-rendered code blocks) and re-activates
		// escaped markup.
		return template(data, runtime);
	}

	/**
	 * Load partials for this root. The result is not stored on the engine.
	 * A symlink or a file outside the root is skipped.
	 */
	private filePartials(): Record<string, string> {
		const root = this.rootTemplatePath?.trim();
		if (!root) return {};

		let realRoot: string;
		try {
			realRoot = fs.realpathSync(root);
			if (!fs.statSync(realRoot).isDirectory()) return {};
		} catch {
			return {};
		}

		const partials: Record<string, string> = {};
		for (const partialPath of this.partialsPath) {
			this.collectPartials(realRoot, partialPath, partials);
		}
		return partials;
	}

	private collectPartials(
		realRoot: string,
		partialPath: string,
		partials: Record<string, string>,
	): void {
		const directory = nodePath.resolve(realRoot, partialPath);
		let realDirectory: string;
		try {
			const stat = fs.lstatSync(directory);
			if (stat.isSymbolicLink() || !stat.isDirectory()) return;
			realDirectory = fs.realpathSync(directory);
		} catch {
			return;
		}

		const relativeDirectory = nodePath.relative(realRoot, realDirectory);
		if (
			relativeDirectory.startsWith("..") ||
			nodePath.isAbsolute(relativeDirectory)
		) {
			return;
		}

		this.walkPartials(realRoot, realDirectory, realDirectory, partials);
	}

	/**
	 * Read partial files under this directory.
	 * A symlink is skipped, so the walk does not leave the directory.
	 */
	private walkPartials(
		realRoot: string,
		base: string,
		current: string,
		partials: Record<string, string>,
	): void {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			return;
		}

		const allowed = new Set(this.getExtensions());
		for (const entry of entries) {
			if (entry.isSymbolicLink()) continue;
			const fullPath = nodePath.join(current, entry.name);
			if (entry.isDirectory()) {
				this.walkPartials(realRoot, base, fullPath, partials);
				continue;
			}
			if (!entry.isFile()) continue;

			const extension = nodePath.extname(entry.name).slice(1).toLowerCase();
			if (!allowed.has(extension)) continue;

			let realFile: string;
			try {
				realFile = fs.realpathSync(fullPath);
			} catch {
				continue;
			}

			const relativeFile = nodePath.relative(realRoot, realFile);
			if (relativeFile.startsWith("..") || nodePath.isAbsolute(relativeFile)) {
				continue;
			}

			const relativeParent = nodePath.relative(base, current);
			const stem = nodePath.basename(entry.name, nodePath.extname(entry.name));
			const name =
				relativeParent === ""
					? stem
					: `${relativeParent.split(nodePath.sep).join("/")}/${stem}`;
			partials[name] = fs.readFileSync(realFile, "utf8");
		}
	}
}

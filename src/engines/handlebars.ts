import fs from "node:fs";
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
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		const options = this.templateOptions();
		const template = this.engine.compile(source, options);

		// Standard Handlebars semantics: `{{var}}` HTML-escapes, `{{{var}}}`
		// inserts raw. No post-render entity decoding — a blanket decode
		// corrupts legitimately escaped content in the data (for example
		// `&#x3C;` inside pre-rendered code blocks) and re-activates
		// escaped markup.
		return template(data, options);
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		const options = this.templateOptions();
		const template = this.engine.compile(source, options);

		return template(data, options);
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

	initPartials(): void {
		for (const path of this.partialsPath) {
			const fullPath = `${this.rootTemplatePath}/${path}`;
			this.registerPartials(fullPath);
		}
	}

	registerPartials(partialsPath: string): boolean {
		let result = false;

		if (fs.existsSync(partialsPath)) {
			const partials = fs.readdirSync(partialsPath, {
				recursive: true,
				encoding: "utf8",
			});

			for (const p of partials) {
				if (fs.statSync(`${partialsPath}/${p}`).isDirectory()) {
					const directoryPartials = fs.readdirSync(`${partialsPath}/${p}`, {
						recursive: true,
						encoding: "utf8",
					});
					for (const dp of directoryPartials) {
						const source = fs
							.readFileSync(`${partialsPath}/${p}/${dp}`)
							.toString();
						const name = `${p}/${dp.split(".")[0]}`;
						this.engine.registerPartial(name, this.engine.compile(source));
					}
				} else {
					const source = fs.readFileSync(`${partialsPath}/${p}`, "utf8");
					const name = p.split(".")[0];
					this.engine.registerPartial(name, this.engine.compile(source));
				}
			}

			result = true;
		}

		return result;
	}
}

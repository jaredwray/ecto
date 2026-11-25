import nodePath from "node:path";
import ejs from "ejs";
import { BaseEngine } from "../base-engine.js";
import { readInsideRoot } from "../confined-read.js";
import type { EngineInterface } from "../engine-interface.js";

export class EJS extends BaseEngine implements EngineInterface {
	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ["ejs"];

		if (options) {
			this.opts = options;
		}

		this.setExtensions(["ejs"]);
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
	 * Render with a copy of the options.
	 * The copy does not change `this.opts`.
	 */
	private renderTemplate(
		source: string,
		data?: Record<string, unknown>,
	): string {
		this.engine ??= ejs;
		return ejs.render(source, data, this.renderOptions()) as string;
	}

	/**
	 * Build options for this render.
	 * The root is set only when this render has a template root.
	 * An include must stay inside that root.
	 */
	private renderOptions(): ejs.Options {
		const options: ejs.Options = {
			...((this.opts ?? {}) as ejs.Options),
		};
		const root = this.rootTemplatePath?.trim();
		if (root) {
			options.root = nodePath.resolve(root);
		} else {
			delete options.root;
		}

		const caller = options.includer;
		options.includer = (originalPath, parsedPath): ejs.IncluderResult => {
			if (caller) {
				const result = caller(originalPath, parsedPath) as {
					filename?: string;
					template?: string;
				};
				if (typeof result?.template === "string") {
					if (typeof result.filename === "string") {
						// The reader resolves a relative name from the template root.
						const filename =
							root && !nodePath.isAbsolute(result.filename)
								? nodePath.resolve(root, result.filename)
								: result.filename;
						return includeResult(result.template, filename);
					}
					return { template: result.template };
				}
				const filename = result?.filename ?? parsedPath;
				const file = this.readInclude(filename, root);
				return includeResult(file.text, file.filename);
			}

			const file = this.readInclude(parsedPath, root);
			return includeResult(file.text, file.filename);
		};
		return options;
	}

	/**
	 * Read an include that stays inside the captured template root.
	 * The caller receives the file text, so EJS does not open the path again.
	 */
	private readInclude(
		parsedPath: string | undefined,
		root: string | undefined,
	): { text: string; filename: string } {
		if (!root) {
			throw new Error(
				"Ecto rejects a file include when the template root is not set.",
			);
		}
		if (!parsedPath || parsedPath.trim() === "") {
			throw new Error("Ecto rejects a file include when the path is empty.");
		}

		return readInsideRoot(root, parsedPath);
	}
}

/**
 * EJS reads `template` and does not open `filename`.
 * The type allows only one of the two fields.
 */
function includeResult(template: string, filename: string): ejs.IncluderResult {
	return { template, filename } as unknown as ejs.IncluderResult;
}

import fs from "node:fs";
import nodePath from "node:path";
import ejs from "ejs";
import { BaseEngine } from "../base-engine.js";
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
		options.includer = (originalPath, parsedPath) => {
			const confined = this.confineInclude(parsedPath, root);
			if (!caller) return { filename: confined };

			const result = caller(originalPath, confined);
			if (result?.filename) {
				return {
					...result,
					filename: this.confineInclude(result.filename, root),
				};
			}
			return result;
		};
		return options;
	}

	/**
	 * Return an include path that stays inside the captured template root.
	 */
	private confineInclude(
		parsedPath: string | undefined,
		root: string | undefined,
	): string {
		if (!root) {
			throw new Error(
				"Ecto rejects a file include when the template root is not set.",
			);
		}
		if (!parsedPath || parsedPath.trim() === "") {
			throw new Error("Ecto rejects a file include when the path is empty.");
		}

		const realRoot = fs.realpathSync(nodePath.resolve(root));
		const candidate = nodePath.resolve(parsedPath);
		let target = candidate;
		try {
			target = fs.realpathSync(candidate);
		} catch {
			target = candidate;
		}

		const relative = nodePath.relative(realRoot, target);
		if (relative.startsWith("..") || nodePath.isAbsolute(relative)) {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
		return target;
	}
}

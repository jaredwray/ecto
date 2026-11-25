import nodePath from "node:path";
import { Liquid as LiquidEngine, type LiquidOptions } from "liquidjs";
import { BaseEngine } from "../base-engine.js";
import type { EngineInterface } from "../engine-interface.js";

export class Liquid extends BaseEngine implements EngineInterface {
	private readonly _engines = new Map<string, LiquidEngine>();

	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ["liquid"];

		if (options) {
			this.opts = options;
		}

		this.setExtensions(["liquid"]);
	}

	async render(
		source: string,
		data?: Record<string, unknown>,
	): Promise<string> {
		return this.engineForRender().parseAndRender(source, data);
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		return this.engineForRender().parseAndRenderSync(source, data) as string;
	}

	/**
	 * Return the engine for this root. Each canonical root gets its own
	 * engine and a copy of the options. An empty root has no file system
	 * root, so includes fail. Liquid must not use the current directory.
	 */
	private engineForRender(): LiquidEngine {
		const root = this.rootForRender();
		const key = root.key;
		const cached = this._engines.get(key);
		if (cached) {
			this.engine = cached;
			return cached;
		}

		const options: LiquidOptions = {
			...(this.opts as LiquidOptions | undefined),
			root: root.value,
		};
		const engine = new LiquidEngine(options);
		this._engines.set(key, engine);
		this.engine = engine;
		return engine;
	}

	/**
	 * Resolve the file root for this render.
	 * A template path wins over `opts.root`.
	 */
	private rootForRender(): { key: string; value: string | string[] } {
		const templateRoot = this.canonicalTemplateRoot();
		if (templateRoot) {
			return { key: templateRoot, value: templateRoot };
		}

		const explicit = this.explicitRoot();
		if (explicit !== undefined) {
			return { key: `options:${JSON.stringify(explicit)}`, value: explicit };
		}

		return { key: "", value: [] };
	}

	private canonicalTemplateRoot(): string | undefined {
		const root = this.rootTemplatePath;
		if (typeof root !== "string" || root.trim() === "") return undefined;
		return nodePath.resolve(root);
	}

	private explicitRoot(): string | string[] | undefined {
		const root = this.opts?.root;
		if (typeof root === "string") {
			return root.trim() === "" ? undefined : root;
		}
		if (!Array.isArray(root)) return undefined;

		const paths = root.filter(
			(entry): entry is string =>
				typeof entry === "string" && entry.trim() !== "",
		);
		return paths.length > 0 ? paths : undefined;
	}
}

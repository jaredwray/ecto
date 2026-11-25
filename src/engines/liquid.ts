import nodePath from "node:path";
import { Liquid as LiquidEngine, type LiquidOptions } from "liquidjs";
import { BaseEngine } from "../base-engine.js";
import type { EngineInterface } from "../engine-interface.js";

type LiquidFilter = Parameters<LiquidEngine["registerFilter"]>[1];
type LiquidTag = Parameters<LiquidEngine["registerTag"]>[1];

export class Liquid extends BaseEngine implements EngineInterface {
	private readonly _engines = new Map<string, LiquidEngine>();
	private readonly _filters = new Map<string, LiquidFilter>();
	private readonly _tags = new Map<string, LiquidTag>();

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
	 * Return the engine for this root. The map keeps that engine only.
	 * A new root replaces it. The engine gets a copy of the options.
	 * Custom filters and tags are copied onto the new engine.
	 * An empty root has no file root, so includes fail.
	 */
	private engineForRender(): LiquidEngine {
		const root = this.rootForRender();
		const cached = this._engines.get(root.key);
		if (cached) {
			this.engine = cached;
			return cached;
		}

		const options: LiquidOptions = {
			...(this.opts as LiquidOptions | undefined),
			root: root.value,
		};
		const engine = this.trackExtensions(new LiquidEngine(options));
		this._engines.clear();
		this._engines.set(root.key, engine);
		this.engine = engine;
		return engine;
	}

	/**
	 * Copy saved filters and tags onto this engine.
	 * Later register calls update the saved set.
	 */
	private trackExtensions(engine: LiquidEngine): LiquidEngine {
		const registerFilter = engine.registerFilter.bind(engine);
		const unregisterFilter = engine.unregisterFilter.bind(engine);
		const registerTag = engine.registerTag.bind(engine);

		for (const [name, filter] of this._filters) {
			registerFilter(name, filter);
		}
		for (const [name, tag] of this._tags) {
			registerTag(name, tag);
		}

		engine.registerFilter = (name, filter) => {
			this._filters.set(name, filter);
			registerFilter(name, filter);
		};
		engine.unregisterFilter = (name) => {
			this._filters.delete(name);
			unregisterFilter(name);
		};
		engine.registerTag = (name, tag) => {
			this._tags.set(name, tag);
			registerTag(name, tag);
		};
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

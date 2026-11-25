import nodePath from "node:path";
import * as nunjucks from "nunjucks";
import { BaseEngine } from "../base-engine.js";
import { readInsideRoot } from "../confined-read.js";
import type { EngineInterface } from "../engine-interface.js";

type ConfinedLoader = {
	cache: Record<string, unknown>;
	isRelative: (filename: string) => boolean;
	resolve: (from: string, to: string) => string;
	getSource: (name: string) => nunjucks.LoaderSource | null;
};

export class Nunjucks extends BaseEngine implements EngineInterface {
	private activeRoot = "\0";
	private activeSignature = "\0";
	private activeEnvironment?: nunjucks.Environment;

	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ["nunjucks"];

		this.engine = nunjucks;

		this.opts = { autoescape: true }; // Default opts

		if (options) {
			this.opts = options;
		}

		this.setExtensions(["njk"]);
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
	 * Render with an environment for this root.
	 * The call does not change the process Nunjucks environment.
	 * An empty root has no file loader.
	 */
	private renderTemplate(
		source: string,
		data?: Record<string, unknown>,
	): string {
		return this.environment().renderString(source, data ?? {});
	}

	private environment(): nunjucks.Environment {
		const root = this.rootTemplatePath?.trim() ?? "";
		const key = root === "" ? "" : nodePath.resolve(root);
		const signature = JSON.stringify(this.opts ?? null);
		if (
			this.activeEnvironment &&
			this.activeRoot === key &&
			this.activeSignature === signature
		) {
			return this.activeEnvironment;
		}

		const noCache = this.opts?.noCache === true || this.opts?.watch === true;
		const loaders: ConfinedLoader[] =
			key === "" ? [] : [createConfinedLoader(key, noCache)];
		const environment = new nunjucks.Environment(
			loaders as unknown as nunjucks.FileSystemLoader[],
			this.opts as nunjucks.ConfigureOptions | undefined,
		);
		this.activeRoot = key;
		this.activeSignature = signature;
		this.activeEnvironment = environment;
		return environment;
	}
}

/**
 * Read a template only when the file stays inside the root.
 * A symlink that leaves the root is rejected.
 */
function createConfinedLoader(root: string, noCache: boolean): ConfinedLoader {
	return {
		cache: {},
		isRelative(filename: string): boolean {
			return filename.startsWith("./") || filename.startsWith("../");
		},
		resolve(from: string, to: string): string {
			return nodePath.resolve(nodePath.dirname(from), to);
		},
		getSource(name: string): nunjucks.LoaderSource | null {
			if (name.includes("\0")) return null;
			try {
				const file = readInsideRoot(root, name);
				return { src: file.text, path: file.filename, noCache };
			} catch {
				return null;
			}
		},
	};
}

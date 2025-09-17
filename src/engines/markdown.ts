import { Writr } from "writr";
import { BaseEngine } from "../base-engine.js";
import type { EngineInterface } from "../engine-interface.js";

export class Markdown extends BaseEngine implements EngineInterface {
	constructor(options?: any) {
		super();

		this.names = ["markdown"];

		if (options) {
			this.opts = options;
		}

		this.engine = new Writr(options);

		this.setExtensions(["md", "markdown"]);
	}

	async render(
		source: string,
		data?: Record<string, unknown>,
	): Promise<string> {
		this.engine.content = source;
		return this.engine.render(data) as Promise<string>;
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		this.engine.content = source;
		return this.engine.renderSync(data) as string;
	}
}

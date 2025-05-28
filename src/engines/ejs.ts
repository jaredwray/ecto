import * as ejs from 'ejs';
import {BaseEngine} from '../base-engine.js';
import type {EngineInterface} from '../engine-interface.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class EJS extends BaseEngine implements EngineInterface {
	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['ejs'];

		if (options) {
			this.opts = options;
		}

		this.setExtensions(['ejs']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		this.engine ??= ejs;

		this.opts ??= {};

		if (this.rootTemplatePath) {
			this.opts.root = this.rootTemplatePath;
		}

		return ejs.render(source, data, this.opts as ejs.Options);
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		this.engine ??= ejs;

		this.opts ??= {};

		if (this.rootTemplatePath) {
			this.opts.root = this.rootTemplatePath;
		}

		return ejs.render(source, data, this.opts as ejs.Options) as string;
	}
}

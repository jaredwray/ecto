import * as pug from 'pug';
import {BaseEngine} from '../base-engine.js';
import type {EngineInterface} from '../engine-interface.js';

export class Pug extends BaseEngine implements EngineInterface {
	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['pug'];

		this.engine = pug;

		if (options) {
			this.opts = options;
		}

		this.setExtensions(['pug', 'jade']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		if (this.rootTemplatePath) {
			if (!this.opts) {
				this.opts = {};
			}

			this.opts.basedir = this.rootTemplatePath;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const template = pug.compile(source, this.opts);

		return template(data);
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		if (this.rootTemplatePath) {
			if (!this.opts) {
				this.opts = {};
			}

			this.opts.basedir = this.rootTemplatePath;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const template = pug.compile(source, this.opts);

		return template(data);
	}
}

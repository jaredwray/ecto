import {Liquid as LiquidEngine} from 'liquidjs';
import {BaseEngine} from '../base-engine.js';
import type {EngineInterface} from '../engine-interface.js';

export class Liquid extends BaseEngine implements EngineInterface {
	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['liquid'];

		if (options) {
			this.opts = options;
		}

		this.setExtensions(['liquid']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		if (this.rootTemplatePath) {
			if (!this.opts) {
				this.opts = {};
			}

			this.opts.root = this.rootTemplatePath;
		}

		if (!this.engine) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			this.engine = new LiquidEngine(this.opts);
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return this.engine.parseAndRender(source, data);
	}
}

import {Liquid as LiquidEngine} from 'liquidjs';
import {BaseEngine} from '../baseEngine';

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
			this.engine = new LiquidEngine(this.opts);
		}

		return await this.engine.parseAndRender(source, data);
	}
}

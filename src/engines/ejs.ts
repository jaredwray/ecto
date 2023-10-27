import * as ejs from 'ejs';
import {BaseEngine} from '../baseEngine.js';

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
		if (!this.engine) {
			this.engine = ejs;
		}

		if (!this.opts) {
			this.opts = {};
		}

		if (this.rootTemplatePath) {
			this.opts.root = this.rootTemplatePath;
		}

		return ejs.render(source, data, this.opts as ejs.Options);
	}
}

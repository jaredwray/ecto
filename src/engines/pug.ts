import * as pug from 'pug';
import {BaseEngine} from '../baseEngine';

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

		const template = pug.compile(source, this.opts);

		return template(data);
	}
}

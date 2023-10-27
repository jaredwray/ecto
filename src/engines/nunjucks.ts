import * as nunjucks from 'nunjucks';
import {BaseEngine} from '../baseEngine';

export class Nunjucks extends BaseEngine implements EngineInterface {
	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['nunjucks'];

		this.engine = nunjucks;

		this.opts = {autoescape: true}; // Default opts

		if (options) {
			this.opts = options;
		}

		this.setExtensions(['njk']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		if (this.rootTemplatePath) {
			nunjucks.configure(this.rootTemplatePath, this.opts);
		} else {
			nunjucks.configure(this.opts);
		}

		if (!data) {
			data = {};
		}

		return nunjucks.renderString(source, data);
	}
}

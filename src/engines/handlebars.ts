import * as handlebars from '@jaredwray/fumanchu';
import * as fs from 'fs-extra';
import * as _ from 'underscore';
import {BaseEngine} from '../base-engine.js';
import type {EngineInterface} from '../engine-interface.js';

export class Handlebars extends BaseEngine implements EngineInterface {
	public partialsPath = ['partials', 'includes', 'templates'];

	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['handlebars', 'mustache'];
		this.opts = options;
		this.engine = handlebars;

		this.setExtensions(['hbs', 'hjs', 'handlebars', 'mustache']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const template = handlebars.compile(source, this.opts);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		let result = template(data, this.opts);
		result = _.unescape(result);

		return result;
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const template = handlebars.compile(source, this.opts);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		let result = template(data, this.opts);
		result = _.unescape(result);

		return result;
	}

	initPartials(): void {
		for (const path of this.partialsPath) {
			const fullPath = `${this.rootTemplatePath}/${path}`;
			this.registerPartials(fullPath);
		}
	}

	registerPartials(partialsPath: string): boolean {
		let result = false;
		if (fs.pathExistsSync(partialsPath)) {
			const partials = fs.readdirSync(partialsPath);

			for (const p of partials) {
				if (fs.statSync(partialsPath + '/' + p).isDirectory()) {
					const dirPartials = fs.readdirSync(partialsPath + '/' + p);
					for (const dp of dirPartials) {
						const source = fs.readFileSync(partialsPath + '/' + p + '/' + dp).toString();
						const name = p + '/' + dp.split('.')[0];
						// eslint-disable-next-line max-depth
						if (handlebars.partials[name] === undefined) {
							handlebars.registerPartial(name, handlebars.compile(source));
						}
					}
				} else {
					const source = fs.readFileSync(partialsPath + '/' + p).toString();
					const name = p.split('.')[0];

					if (handlebars.partials[name] === undefined) {
						handlebars.registerPartial(name, handlebars.compile(source));
					}
				}
			}

			result = true;
		}

		return result;
	}
}

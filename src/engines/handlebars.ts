/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import fs from 'node:fs';
import * as _ from 'underscore';
import {helpers, handlebars} from '@jaredwray/fumanchu';
import {BaseEngine} from '../base-engine.js';
import type {EngineInterface} from '../engine-interface.js';

export class Handlebars extends BaseEngine implements EngineInterface {
	public partialsPath = ['partials', 'includes', 'templates'];

	constructor(options?: Record<string, unknown>) {
		super();

		this.names = ['handlebars', 'mustache'];
		this.opts = options;

		this.engine = handlebars;

		// Register helpers
		helpers({handlebars}, this.opts);

		this.setExtensions(['hbs', 'hjs', 'handlebars', 'mustache']);
	}

	async render(source: string, data?: Record<string, unknown>): Promise<string> {
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		const template = this.engine.compile(source, this.opts);

		let result = template(data, this.opts);
		result = _.unescape(result);

		return result;
	}

	renderSync(source: string, data?: Record<string, unknown>): string {
		// Register partials
		if (this.rootTemplatePath) {
			this.initPartials();
		}

		const template = this.engine.compile(source, this.opts);

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

		if (fs.existsSync(partialsPath)) {
			const partials = fs.readdirSync(partialsPath, {recursive: true, encoding: 'utf8'});

			for (const p of partials) {
				if (fs.statSync(partialsPath + '/' + p).isDirectory()) {
					const directoryPartials = fs.readdirSync(partialsPath + '/' + p, {recursive: true, encoding: 'utf8'});
					for (const dp of directoryPartials) {
						const source = fs.readFileSync(partialsPath + '/' + p + '/' + dp).toString();
						const name = p + '/' + dp.split('.')[0];
						this.engine.registerPartial(name, this.engine.compile(source));
					}
				} else {
					const source = fs.readFileSync(partialsPath + '/' + p, 'utf8');
					const name = p.split('.')[0];
					this.engine.registerPartial(name, this.engine.compile(source));
				}
			}

			result = true;
		}

		return result;
	}
}

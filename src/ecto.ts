import * as fs from 'fs-extra';
import {EngineMap} from './engine-map.js';
import {Markdown} from './engines/markdown.js';
import {Handlebars} from './engines/handlebars.js';
import {EJS} from './engines/ejs.js';
import {Pug} from './engines/pug.js';
import {Nunjucks} from './engines/nunjucks.js';
import {Liquid} from './engines/liquid.js';
import {type BaseEngine} from './base-engine.js';
import type {EngineInterface} from './engine-interface.js';

export class Ecto {
	private readonly __mapping: EngineMap = new EngineMap();
	private readonly __engines: BaseEngine[] = new Array<BaseEngine>();

	private __defaultEngine = 'ejs';

	// Engines
	private readonly __ejs: EJS = new EJS();
	private readonly __markdown: Markdown = new Markdown();
	private readonly __pug: Pug = new Pug();
	private readonly __nunjucks: Nunjucks = new Nunjucks();
	private readonly __handlebars: Handlebars = new Handlebars();
	private readonly __liquid: Liquid = new Liquid();

	constructor(options?: any) {
		// Register engines
		this.__engines.push(this.__ejs, this.__markdown, this.__pug, this.__nunjucks, this.__handlebars, this.__liquid);

		// Register mappings
		this.registerEngineMappings();

		// Set the options
		if (options !== undefined && this.isValidEngine(options.defaultEngine as string)) {
			this.__defaultEngine = options.defaultEngine as string;
		}
	}

	get defaultEngine(): string {
		return this.__defaultEngine;
	}

	set defaultEngine(value: string) {
		value = value.toLowerCase().trim();
		if (this.isValidEngine(value)) {
			this.__defaultEngine = value;
		}
	}

	get mappings(): EngineMap {
		return this.__mapping;
	}

	// Engines
	get ejs(): EJS {
		return this.__ejs;
	}

	get markdown(): Markdown {
		return this.__markdown;
	}

	get pug(): Pug {
		return this.__pug;
	}

	get nunjucks(): Nunjucks {
		return this.__nunjucks;
	}

	get handlebars(): Handlebars {
		return this.__handlebars;
	}

	get liquid(): Liquid {
		return this.__liquid;
	}

	// String Render
	// eslint-disable-next-line max-params
	async render(source: string, data?: Record<string, unknown>, engineName?: string, rootTemplatePath?: string, filePathOutput?: string): Promise<string> {
		let result = '';
		let renderEngineName = this.__defaultEngine;

		// Set the render engine
		if (this.isValidEngine(engineName) && engineName !== undefined) {
			renderEngineName = engineName;
		}

		// Get the render engine
		const renderEngine = this.getRenderEngine(renderEngineName);

		// Set the root template path
		renderEngine.rootTemplatePath = rootTemplatePath;

		// Get the output
		result = await renderEngine.render(source, data);

		// Write out the file
		await this.writeFile(filePathOutput, result);

		return result;
	}

	// Render from File
	// eslint-disable-next-line max-params
	async renderFromFile(filePath: string, data?: Record<string, unknown>, rootTemplatePath?: string, filePathOutput?: string, engineName?: string): Promise<string> {
		let result = '';

		// Select which engine
		if (!engineName) {
			engineName = this.getEngineByFilePath(filePath);
		}

		// Get the source
		const source = await fs.readFile(filePath, 'utf8');

		result = await this.render(source, data, engineName, rootTemplatePath, filePathOutput);

		return result;
	}

	async ensureFilePath(path: string) {
		const pathList = path.split('/');
		pathList.pop();

		const dir = pathList.join('/');

		if (!fs.existsSync(dir)) {
			await fs.ensureDir(dir);
		}
	}

	getEngineByFilePath(filePath: string): string {
		let result = this.__defaultEngine;

		if (filePath !== undefined) {
			const ext = filePath.lastIndexOf('.') >= 0 ? filePath.slice(filePath.lastIndexOf('.') + 1) : '';

			const engExt = this.__mapping.getName(ext);
			if (engExt !== undefined) {
				result = engExt;
			}
		}

		return result;
	}

	// Engines
	isValidEngine(engineName?: string): boolean {
		let result = false;

		if (engineName !== undefined && this.__mapping.get(engineName) !== undefined) {
			result = true;
		}

		return result;
	}

	registerEngineMappings(): void {
		for (const eng of this.__engines) {
			for (const name of eng.names) {
				this.__mapping.set(name, eng.getExtensions());
			}
		}
	}

	getRenderEngine(engineName: string): EngineInterface {
		let result = this.__ejs; // Setting default

		// eslint-disable-next-line default-case
		switch (engineName.trim().toLowerCase()) {
			case 'markdown': {
				result = this.__markdown;
				break;
			}

			case 'pug': {
				result = this.__pug;
				break;
			}

			case 'nunjucks': {
				result = this.__nunjucks;
				break;
			}

			case 'mustache': {
				result = this.__handlebars;
				break;
			}

			case 'handlebars': {
				result = this.__handlebars;
				break;
			}

			case 'liquid': {
				result = this.__liquid;
				break;
			}
		}

		return result;
	}

	private async writeFile(filePath?: string, source?: string) {
		if (filePath && source) {
			await this.ensureFilePath(filePath);
			await fs.writeFile(filePath, source);
		}
	}
}

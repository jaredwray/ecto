import fs from 'node:fs';
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
	private readonly __ejs: EJS;
	private readonly __markdown: Markdown;
	private readonly __pug: Pug;
	private readonly __nunjucks: Nunjucks;
	private readonly __handlebars: Handlebars;
	private readonly __liquid: Liquid;

	constructor(options?: Record<string, unknown>) {
		const engineOptions = {...options};
		delete engineOptions.defaultEngine;

		// Engines
		this.__ejs = new EJS(engineOptions);
		this.__markdown = new Markdown(engineOptions);
		this.__pug = new Pug(engineOptions);
		this.__nunjucks = new Nunjucks(engineOptions);
		this.__handlebars = new Handlebars(engineOptions);
		this.__liquid = new Liquid(engineOptions);

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

	// Render Sync
	// eslint-disable-next-line max-params
	renderSync(source: string, data?: Record<string, unknown>, engineName?: string, rootTemplatePath?: string, filePathOutput?: string): string {
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
		result = renderEngine.renderSync(source, data);

		// Write out the file
		this.writeFileSync(filePathOutput, result);

		return result;
	}

	// Render from File
	// eslint-disable-next-line max-params
	async renderFromFile(filePath: string, data?: Record<string, unknown>, rootTemplatePath?: string, filePathOutput?: string, engineName?: string): Promise<string> {
		let result = '';

		// Select which engine
		engineName ||= this.getEngineByFilePath(filePath);

		// Get the source
		const source = await fs.promises.readFile(filePath, 'utf8');

		result = await this.render(source, data, engineName, rootTemplatePath, filePathOutput);

		return result;
	}

	// Render from File Sync
	// eslint-disable-next-line max-params
	renderFromFileSync(filePath: string, data?: Record<string, unknown>, rootTemplatePath?: string, filePathOutput?: string, engineName?: string): string {
		let result = '';

		// Select which engine
		engineName ||= this.getEngineByFilePath(filePath);

		// Get the source
		const source = fs.readFileSync(filePath, 'utf8');

		result = this.renderSync(source, data, engineName, rootTemplatePath, filePathOutput);

		return result;
	}

	async ensureFilePath(path: string) {
		const pathList = path.split('/');
		pathList.pop();

		const directory = pathList.join('/');

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, {recursive: true});
		}
	}

	ensureFilePathSync(path: string) {
		const pathList = path.split('/');
		pathList.pop();

		const directory = pathList.join('/');

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, {recursive: true});
		}
	}

	getEngineByFilePath(filePath: string): string {
		let result = this.__defaultEngine;

		if (filePath !== undefined) {
			const extension = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.') + 1) : '';

			const engExtension = this.__mapping.getName(extension);
			if (engExtension !== undefined) {
				result = engExtension;
			}
		}

		return result;
	}

	async findTemplateWithoutExtension(path: string, templateName: string): Promise<string> {
		let result = '';

		const files = await fs.promises.readdir(path);

		for (const file of files) {
			if (file.startsWith(templateName + '.')) {
				result = path + '/' + file;
				break;
			}
		}

		return result;
	}

	findTemplateWithoutExtensionSync(path: string, templateName: string): string {
		let result = '';

		const files = fs.readdirSync(path);

		for (const file of files) {
			if (file.startsWith(templateName + '.')) {
				result = path + '/' + file;
				break;
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

		const cleanEngineName = engineName.trim().toLowerCase();
		switch (cleanEngineName) {
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

			default: {
				result = this.__ejs;
				break;
			}
		}

		return result;
	}

	private async writeFile(filePath?: string, source?: string) {
		if (filePath && source) {
			await this.ensureFilePath(filePath);
			await fs.promises.writeFile(filePath, source);
		}
	}

	private writeFileSync(filePath?: string, source?: string) {
		if (filePath && source) {
			this.ensureFilePathSync(filePath);
			fs.writeFileSync(filePath, source);
		}
	}
}

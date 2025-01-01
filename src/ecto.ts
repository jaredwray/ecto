import fs from 'node:fs';
import {Writr} from 'writr';
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

	/**
	 * Get the default engine
	 */
	get defaultEngine(): string {
		return this.__defaultEngine;
	}

	/**
	 * Set the default engine
	 * @param {string} value the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
	set defaultEngine(value: string) {
		value = value.toLowerCase().trim();
		if (this.isValidEngine(value)) {
			this.__defaultEngine = value;
		}
	}

	/**
	 * Get the Engine Mappings. This is used to map file extensions to engines
	 * @returns {EngineMap}
	 */
	get mappings(): EngineMap {
		return this.__mapping;
	}

	/**
	 * Get the EJS Engine
	 * @returns {EJS}
	 */
	get ejs(): EJS {
		return this.__ejs;
	}

	/**
	 * Get the Markdown Engine
	 * @returns {Markdown}
	 */
	get markdown(): Markdown {
		return this.__markdown;
	}

	/**
	 * Get the Pug Engine
	 * @returns {Pug}
	 */
	get pug(): Pug {
		return this.__pug;
	}

	/**
	 * Get the Nunjucks Engine
	 * @returns {Nunjucks}
	 */
	get nunjucks(): Nunjucks {
		return this.__nunjucks;
	}

	/**
	 * Get the Handlebars Engine
	 * @returns {Handlebars}
	 */
	get handlebars(): Handlebars {
		return this.__handlebars;
	}

	/**
	 * Get the Liquid Engine
	 * @returns {Liquid}
	 */
	get liquid(): Liquid {
		return this.__liquid;
	}

	/**
	 * Async render the source with the data
	 * @param {string} source - The source to render
	 * @param {Record<string, unknown} data - data to render with the source
	 * @param {string} [engineName] - The engine to use for rendering
	 * @param {string} [rootTemplatePath] - The root path to the template if using includes / partials
	 * @param {string} [filePathOutput] - The file path to write the output
	 * @returns {Promise<string>}
	 */
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

	/**
	 * Synchronously render the source with the data
	 * @param {string} source - The source to render
	 * @param {Record<string, unknown} data - data to render with the source
	 * @param {string} [engineName] - The engine to use for rendering
	 * @param {string} [rootTemplatePath] - The root path to the template if using includes / partials
	 * @param {string} [filePathOutput] - The file path to write the output
	 * @returns {string}
	 */
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

	/**
	 * Render from a file path
	 * @param {string} filePath - The file path to the source
	 * @param {Record<string, unknown>} data - The data to render with the source
	 * @param {string} [rootTemplatePath] - The root path to the template if using includes / partials
	 * @param {string} [filePathOutput] - The file path to write the output
	 * @param {string} [engineName] - The engine to use for rendering
	 * @returns
	 */
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

	/**
	 * Sync render from a file path
	 * @param {string} filePath - The file path to the source
	 * @param {Record<string, unknown>} data - The data to render with the source
	 * @param {string} [rootTemplatePath] - The root path to the template if using includes / partials
	 * @param {string} [filePathOutput] - The file path to write the output
	 * @param {string} [engineName] - The engine to use for rendering
	 * @returns {string}
	 */
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

	/**
	 * Ensure the file path exists or create it
	 * @param {string} path
	 * @returns {Promise<void>}
	 */
	async ensureFilePath(path: string) {
		const pathList = path.split('/');
		pathList.pop();

		const directory = pathList.join('/');

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, {recursive: true});
		}
	}

	/**
	 * Ensure the file path exists or create it synchronously
	 * @param {string} path
	 * @returns {void}
	 */
	ensureFilePathSync(path: string) {
		const pathList = path.split('/');
		pathList.pop();

		const directory = pathList.join('/');

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, {recursive: true});
		}
	}

	/**
	 * Get the Engine By File Path
	 * @param {string} filePath
	 * @returns {string} - will return the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
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

	/**
	 * Find the template without the extension. This will look in a directory for a file that starts with the template name
	 * @param {string} path - the path to look for the template file
	 * @param {string} templateName
	 * @returns {Promise<string>} - the path to the template file
	 */
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

	/**
	 * Syncronously find the template without the extension. This will look in a directory for a file that starts with the template name
	 * @param {string} path - the path to look for the template file
	 * @param {string} templateName
	 * @returns {string} - the path to the template file
	 */
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

	/**
	 * Is it a valid engine that is registered in ecto
	 * @param engineName
	 * @returns {boolean}
	 */
	isValidEngine(engineName?: string): boolean {
		let result = false;

		if (engineName !== undefined && this.__mapping.get(engineName) !== undefined) {
			result = true;
		}

		return result;
	}

	/**
	 * Register the engine mappings
	 * @returns {void}
	 */
	registerEngineMappings(): void {
		for (const eng of this.__engines) {
			for (const name of eng.names) {
				this.__mapping.set(name, eng.getExtensions());
			}
		}
	}

	/**
	 * Get Render Engine by the engine name. Default is EJS
	 * @param {string} engineName
	 * @returns {EngineInterface}
	 */
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

	/**
	 * Checks if the source has front matter
	 * @param {string} source
	 * @returns {boolean}
	 */
	public hasFrontMatter(source: string): boolean {
		const writr = new Writr(source);
		if (writr.frontMatterRaw !== '') {
			return true;
		}

		return false;
	}

	/**
	 * Get the Front Matter from the source
	 * @param {string} source
	 * @returns {Record<string, unknown>}
	 */
	public getFrontMatter(source: string): Record<string, unknown> {
		const writr = new Writr(source);
		return writr.frontMatter;
	}

	/**
	 * Will set the front matter in the source and return the source
	 * @param {string} source - The source to set the front matter
	 * @param {Record<string, unknown>} data - The front matter data
	 * @returns {string} - The source with the front matter
	 */
	public setFrontMatter(source: string, data: Record<string, unknown>): string {
		const writr = new Writr(source);
		writr.frontMatter = data;
		return writr.content;
	}

	/**
	 * Remove the Front Matter from the source
	 * @param {string} source
	 * @returns {string}
	 */
	public removeFrontMatter(source: string): string {
		const writr = new Writr(source);
		return writr.body;
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

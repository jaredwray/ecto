import fs from 'node:fs';
import {Hookified, type HookifiedOptions} from 'hookified';
import {Writr} from 'writr';
import {Cacheable, CacheableMemory} from 'cacheable';
import {EngineMap} from './engine-map.js';
import {Markdown} from './engines/markdown.js';
import {Handlebars} from './engines/handlebars.js';
import {EJS} from './engines/ejs.js';
import {Pug} from './engines/pug.js';
import {Nunjucks} from './engines/nunjucks.js';
import {Liquid} from './engines/liquid.js';
import {type BaseEngine} from './base-engine.js';
import type {EngineInterface} from './engine-interface.js';

export type EctoOptions = {
	/**
	 * The default engine to use. This can be 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 * @default 'ejs'
	 * @type {string}
	 */
	defaultEngine?: string;
	/**
	 * The engine options to pass to each engine
	 * @type {Record<string, Record<string, unknown>>}
	 * @default {}
	 * @example
	 * {
	 * 	nunjucks: {
	 * 		autoescape: true
	 * 	},
	 * 	markdown: {
	 * 		html: true
	 * 	}
	 * }
	 */
	engineOptions?: Record<string, Record<string, unknown>>;

	/**
	 * Caching for async rendered templates. If set to true, it will use the default cacheable options.
	 * If set to Cacheable instantce, it will use the provided cacheable instance.
	 * @type {boolean | Cacheable}
	 * @default false
	 */
	cache?: boolean | Cacheable;

	/**
	 * If set to true, it will cache the rendered templates synchronously when running renderSync.
	 * If set to CacheableMemory instance, it will use the provided cacheable memory instance.
	 * @type {boolean | CacheableMemory}
	 * @default false
	 */
	cacheSync?: boolean | CacheableMemory;
} & HookifiedOptions;

export enum EctoEvents {
	cacheHit = 'cacheHit',
	cacheMiss = 'cacheMiss',
	warn = 'warn',
	error = 'error',
}

export class Ecto extends Hookified {
	private readonly _mapping: EngineMap = new EngineMap();
	private readonly _engines: BaseEngine[] = new Array<BaseEngine>();

	// Cacheable instance for caching rendered templates
	private _cache: Cacheable | undefined;
	private _cacheSync: CacheableMemory | undefined;

	private _defaultEngine = 'ejs';

	// Engines
	private readonly _ejs: EJS;
	private readonly _markdown: Markdown;
	private readonly _pug: Pug;
	private readonly _nunjucks: Nunjucks;
	private readonly _handlebars: Handlebars;
	private readonly _liquid: Liquid;

	/**
	 * Ecto constructor
	 * @param {EctoOptions} [options] - The options for the ecto engine
	 */
	// eslint-disable-next-line complexity
	constructor(options?: EctoOptions) {
		super();
		// Engines
		this._ejs = new EJS(options?.engineOptions?.ejs);
		this._markdown = new Markdown(options?.engineOptions?.markdown);
		this._pug = new Pug(options?.engineOptions?.pug);
		this._nunjucks = new Nunjucks(options?.engineOptions?.nunjucks);
		this._handlebars = new Handlebars(options?.engineOptions?.handlebars);
		this._liquid = new Liquid(options?.engineOptions?.liquid);

		// Register engines
		this._engines.push(this._ejs, this._markdown, this._pug, this._nunjucks, this._handlebars, this._liquid);

		// Register mappings
		this.registerEngineMappings();

		// Set the cacheable instance if caching is enabled
		if (options?.cache === true) {
			// Set with default options
			this._cache = new Cacheable();
		} else if (options?.cache instanceof Cacheable) {
			this._cache = options.cache;
		}

		// Set the cacheable memory instance if caching is enabled
		if (options?.cacheSync === true) {
			// Set with default options
			this._cacheSync = new CacheableMemory();
		} else if (options?.cacheSync instanceof CacheableMemory) {
			this._cacheSync = options.cacheSync;
		}

		// Set the options
		if (options !== undefined && this.isValidEngine(options.defaultEngine)) {
			this._defaultEngine = options.defaultEngine!;
		}
	}

	/**
	 * Get the default engine
	 * @returns {string} - the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
	public get defaultEngine(): string {
		return this._defaultEngine;
	}

	/**
	 * Set the default engine
	 * @param {string} value the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
	public set defaultEngine(value: string) {
		value = value.toLowerCase().trim();
		if (this.isValidEngine(value)) {
			this._defaultEngine = value;
		} else {
			this.emit(EctoEvents.warn, `Invalid engine name: ${value}. Defaulting to ${this._defaultEngine}.`);
		}
	}

	/**
	 * Get the cacheable instance
	 * @returns {Cacheable | undefined} - The cacheable instance or undefined if caching is disabled
	 */
	public get cache(): Cacheable | undefined {
		return this._cache;
	}

	/**
	 * Set the cacheable instance
	 * @param {Cacheable | undefined} value - The cacheable instance to set. If set to undefined, caching will be disabled.
	 */
	public set cache(value: Cacheable | undefined) {
		this._cache = value;
	}

	/**
	 * Get the cacheable memory instance
	 * @returns {CacheableMemory | undefined} - The cacheable memory instance or undefined if caching is disabled
	 */
	public get cacheSync(): CacheableMemory | undefined {
		return this._cacheSync;
	}

	/**
	 * Set the cacheable memory instance
	 * @param {CacheableMemory | undefined} value - The cacheable memory instance to set. If set to undefined, caching will be disabled.
	 */
	public set cacheSync(value: CacheableMemory | undefined) {
		this._cacheSync = value;
	}

	/**
	 * Get the Engine Mappings. This is used to map file extensions to engines
	 * @returns {EngineMap}
	 */
	public get mappings(): EngineMap {
		return this._mapping;
	}

	/**
	 * Get the EJS Engine
	 * @returns {EJS}
	 */
	public get ejs(): EJS {
		return this._ejs;
	}

	/**
	 * Get the Markdown Engine
	 * @returns {Markdown}
	 */
	public get markdown(): Markdown {
		return this._markdown;
	}

	/**
	 * Get the Pug Engine
	 * @returns {Pug}
	 */
	public get pug(): Pug {
		return this._pug;
	}

	/**
	 * Get the Nunjucks Engine
	 * @returns {Nunjucks}
	 */
	public get nunjucks(): Nunjucks {
		return this._nunjucks;
	}

	/**
	 * Get the Handlebars Engine
	 * @returns {Handlebars}
	 */
	public get handlebars(): Handlebars {
		return this._handlebars;
	}

	/**
	 * Get the Liquid Engine
	 * @returns {Liquid}
	 */
	public get liquid(): Liquid {
		return this._liquid;
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
	public async render(source: string, data?: Record<string, unknown>, engineName?: string, rootTemplatePath?: string, filePathOutput?: string): Promise<string> {
		try {
			const cacheKey = `${engineName ?? this._defaultEngine}-${source}-${JSON.stringify(data)}`;
			if (this._cache) {
				const cachedResult = await this._cache.get<string>(cacheKey);
				if (cachedResult) {
					this.emit(EctoEvents.cacheHit, `Cache hit for key: ${cacheKey}`);
					// Write out the file
					await this.writeFile(filePathOutput, cachedResult);
					// Return the cached result
					return cachedResult;
				}

				this.emit(EctoEvents.cacheMiss, `Cache miss for key: ${cacheKey}`);
			}

			let result = '';
			let renderEngineName = this._defaultEngine;

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

			// If caching is enabled, store the result in the cache
			if (this._cache) {
				await this._cache.set(cacheKey, result);
			}

			// Write out the file
			await this.writeFile(filePathOutput, result);

			return result;
		} catch (error) {
			/* c8 ignore next 3 */
			this.emit(EctoEvents.error, error);
			return '';
		}
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
	public renderSync(source: string, data?: Record<string, unknown>, engineName?: string, rootTemplatePath?: string, filePathOutput?: string): string {
		try {
			const cacheKey = `${engineName ?? this._defaultEngine}-${source}-${JSON.stringify(data)}`;
			if (this._cacheSync) {
				const cachedResult = this._cacheSync.get<string>(cacheKey);
				if (cachedResult) {
					this.emit(EctoEvents.cacheHit, `Cache hit for key: ${cacheKey}`);
					// Write out the file
					this.writeFileSync(filePathOutput, cachedResult);
					// Return the cached result
					return cachedResult;
				}

				this.emit(EctoEvents.cacheMiss, `Cache miss for key: ${cacheKey}`);
			}

			let result = '';
			let renderEngineName = this._defaultEngine;

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

			// If caching is enabled, store the result in the cache
			if (this._cacheSync) {
				this._cacheSync.set(cacheKey, result);
			}

			// Write out the file
			this.writeFileSync(filePathOutput, result);

			return result;
		/* c8 ignore next 3 */
		} catch (error) {
			this.emit(EctoEvents.error, error);
			return '';
		}
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
	public async renderFromFile(filePath: string, data?: Record<string, unknown>, rootTemplatePath?: string, filePathOutput?: string, engineName?: string): Promise<string> {
		let result = '';

		// Select which engine
		engineName ??= this.getEngineByFilePath(filePath);

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
	public renderFromFileSync(filePath: string, data?: Record<string, unknown>, rootTemplatePath?: string, filePathOutput?: string, engineName?: string): string {
		let result = '';

		// Select which engine
		engineName ??= this.getEngineByFilePath(filePath);

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
	public async ensureFilePath(path: string) {
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
	public ensureFilePathSync(path: string) {
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
	public getEngineByFilePath(filePath: string): string {
		let result = this._defaultEngine;

		if (filePath !== undefined) {
			const extension = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.') + 1) : '';

			const engExtension = this._mapping.getName(extension);
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
	public async findTemplateWithoutExtension(path: string, templateName: string): Promise<string> {
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
	public findTemplateWithoutExtensionSync(path: string, templateName: string): string {
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
	public isValidEngine(engineName?: string): boolean {
		let result = false;

		if (engineName !== undefined && this._mapping.get(engineName) !== undefined) {
			result = true;
		}

		return result;
	}

	/**
	 * Register the engine mappings
	 * @returns {void}
	 */
	public registerEngineMappings(): void {
		for (const eng of this._engines) {
			for (const name of eng.names) {
				this._mapping.set(name, eng.getExtensions());
			}
		}
	}

	/**
	 * Get Render Engine by the engine name. Default is EJS
	 * @param {string} engineName
	 * @returns {EngineInterface}
	 */
	public getRenderEngine(engineName: string): EngineInterface {
		let result = this._ejs; // Setting default

		const cleanEngineName = engineName.trim().toLowerCase();
		switch (cleanEngineName) {
			case 'markdown': {
				result = this._markdown;
				break;
			}

			case 'pug': {
				result = this._pug;
				break;
			}

			case 'nunjucks': {
				result = this._nunjucks;
				break;
			}

			case 'mustache': {
				result = this._handlebars;
				break;
			}

			case 'handlebars': {
				result = this._handlebars;
				break;
			}

			case 'liquid': {
				result = this._liquid;
				break;
			}

			default: {
				result = this._ejs;
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

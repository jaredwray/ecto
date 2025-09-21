import fs from "node:fs";
import path from "node:path";
import { Cacheable, CacheableMemory } from "cacheable";
import { Hookified, type HookifiedOptions } from "hookified";
import { Writr } from "writr";
import type { BaseEngine } from "./base-engine.js";
import type { EngineInterface } from "./engine-interface.js";
import { EngineMap } from "./engine-map.js";
import { EJS } from "./engines/ejs.js";
import { Handlebars } from "./engines/handlebars.js";
import { Liquid } from "./engines/liquid.js";
import { Markdown } from "./engines/markdown.js";
import { Nunjucks } from "./engines/nunjucks.js";
import { Pug } from "./engines/pug.js";

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
	cacheHit = "cacheHit",
	cacheMiss = "cacheMiss",
	warn = "warn",
	error = "error",
}

export class Ecto extends Hookified {
	private readonly _mapping: EngineMap = new EngineMap();
	private readonly _engines: BaseEngine[] = [] as BaseEngine[];

	// Cacheable instance for caching rendered templates
	private _cache: Cacheable | undefined;
	private _cacheSync: CacheableMemory | undefined;

	private _defaultEngine = "ejs";

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
		this._engines.push(
			this._ejs,
			this._markdown,
			this._pug,
			this._nunjucks,
			this._handlebars,
			this._liquid,
		);

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
		if (options?.defaultEngine && this.isValidEngine(options.defaultEngine)) {
			this._defaultEngine = options.defaultEngine;
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
			this.emit(
				EctoEvents.warn,
				`Invalid engine name: ${value}. Defaulting to ${this._defaultEngine}.`,
			);
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
	 * Asynchronously render a template source with data using the specified engine
	 * @param {string} source - The template source string to render
	 * @param {Record<string, unknown>} [data] - Data object to pass to the template engine
	 * @param {string} [engineName] - Name of the engine to use (e.g., 'ejs', 'pug'). Defaults to defaultEngine
	 * @param {string} [rootTemplatePath] - Root directory path for template includes/partials resolution
	 * @param {string} [filePathOutput] - Optional file path to write the rendered output to
	 * @returns {Promise<string>} The rendered template output as a string
	 * @example
	 * const result = await ecto.render('<%= name %>', { name: 'World' }, 'ejs');
	 */
	public async render(
		source: string,
		data?: Record<string, unknown>,
		engineName?: string,
		rootTemplatePath?: string,
		filePathOutput?: string,
	): Promise<string> {
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

			let result = "";
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
			/* c8 ignore next 4 */
		} catch (error) {
			this.emit(EctoEvents.error, error);
			return "";
		}
	}

	/**
	 * Synchronously render a template source with data using the specified engine
	 * @param {string} source - The template source string to render
	 * @param {Record<string, unknown>} [data] - Data object to pass to the template engine
	 * @param {string} [engineName] - Name of the engine to use (e.g., 'ejs', 'pug'). Defaults to defaultEngine
	 * @param {string} [rootTemplatePath] - Root directory path for template includes/partials resolution
	 * @param {string} [filePathOutput] - Optional file path to write the rendered output to
	 * @returns {string} The rendered template output as a string
	 * @example
	 * const result = ecto.renderSync('<%= name %>', { name: 'World' }, 'ejs');
	 */
	public renderSync(
		source: string,
		data?: Record<string, unknown>,
		engineName?: string,
		rootTemplatePath?: string,
		filePathOutput?: string,
	): string {
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

			let result = "";
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
			/* c8 ignore next 4 */
		} catch (error) {
			this.emit(EctoEvents.error, error);
			return "";
		}
	}

	/**
	 * Asynchronously render a template from a file path
	 * @param {string} filePath - Path to the template file to render
	 * @param {Record<string, unknown>} [data] - Data object to pass to the template engine
	 * @param {string} [rootTemplatePath] - Root directory for template includes. Defaults to file's directory
	 * @param {string} [filePathOutput] - Optional file path to write the rendered output to
	 * @param {string} [engineName] - Engine to use. If not specified, determined from file extension
	 * @returns {Promise<string>} The rendered template output as a string
	 * @example
	 * const result = await ecto.renderFromFile('./templates/index.ejs', { title: 'Home' });
	 */
	public async renderFromFile(
		filePath: string,
		data?: Record<string, unknown>,
		rootTemplatePath?: string,
		filePathOutput?: string,
		engineName?: string,
	): Promise<string> {
		let result = "";

		// Select which engine
		engineName ??= this.getEngineByFilePath(filePath);

		const templateRootPath = rootTemplatePath ?? path.dirname(filePath);

		// Get the source
		const source = await fs.promises.readFile(filePath, "utf8");

		result = await this.render(
			source,
			data,
			engineName,
			templateRootPath,
			filePathOutput,
		);

		return result;
	}

	/**
	 * Synchronously render a template from a file path
	 * @param {string} filePath - Path to the template file to render
	 * @param {Record<string, unknown>} [data] - Data object to pass to the template engine
	 * @param {string} [rootTemplatePath] - Root directory for template includes. Defaults to file's directory
	 * @param {string} [filePathOutput] - Optional file path to write the rendered output to
	 * @param {string} [engineName] - Engine to use. If not specified, determined from file extension
	 * @returns {string} The rendered template output as a string
	 * @example
	 * const result = ecto.renderFromFileSync('./templates/index.ejs', { title: 'Home' });
	 */
	public renderFromFileSync(
		filePath: string,
		data?: Record<string, unknown>,
		rootTemplatePath?: string,
		filePathOutput?: string,
		engineName?: string,
	): string {
		let result = "";

		// Select which engine
		engineName ??= this.getEngineByFilePath(filePath);

		const templateRootPath = rootTemplatePath ?? path.dirname(filePath);

		// Get the source
		const source = fs.readFileSync(filePath, "utf8");

		result = this.renderSync(
			source,
			data,
			engineName,
			templateRootPath,
			filePathOutput,
		);

		return result;
	}

	/**
	 * Asynchronously ensure that the directory path for a file exists, creating it if necessary
	 * @param {string} path - The full file path (directories will be extracted from this)
	 * @returns {Promise<void>}
	 * @example
	 * await ecto.ensureFilePath('/path/to/file.txt');
	 */
	public async ensureFilePath(path: string) {
		const pathList = path.split("/");
		pathList.pop();

		const directory = pathList.join("/");

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}
	}

	/**
	 * Synchronously ensure that the directory path for a file exists, creating it if necessary
	 * @param {string} path - The full file path (directories will be extracted from this)
	 * @returns {void}
	 * @example
	 * ecto.ensureFilePathSync('/path/to/file.txt');
	 */
	public ensureFilePathSync(path: string) {
		const pathList = path.split("/");
		pathList.pop();

		const directory = pathList.join("/");

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}
	}

	/**
	 * Determine the appropriate template engine based on a file's extension
	 * @param {string} filePath - The file path to analyze
	 * @returns {string} The engine name (e.g., 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid')
	 * @example
	 * const engine = ecto.getEngineByFilePath('template.ejs'); // Returns 'ejs'
	 */
	public getEngineByFilePath(filePath: string): string {
		let result = this._defaultEngine;

		if (filePath !== undefined) {
			const extension = filePath.includes(".")
				? filePath.slice(filePath.lastIndexOf(".") + 1)
				: "";

			const engExtension = this._mapping.getName(extension);
			if (engExtension !== undefined) {
				result = engExtension;
			}
		}

		return result;
	}

	/**
	 * Asynchronously find a template file in a directory by name, regardless of extension
	 * @param {string} path - Directory path to search in
	 * @param {string} templateName - Template name without extension
	 * @returns {Promise<string>} Full path to the found template file, or empty string if not found
	 * @example
	 * const templatePath = await ecto.findTemplateWithoutExtension('./templates', 'index');
	 */
	public async findTemplateWithoutExtension(
		path: string,
		templateName: string,
	): Promise<string> {
		let result = "";

		const files = await fs.promises.readdir(path);

		for (const file of files) {
			if (file.startsWith(`${templateName}.`)) {
				result = `${path}/${file}`;
				break;
			}
		}

		return result;
	}

	/**
	 * Synchronously find a template file in a directory by name, regardless of extension
	 * @param {string} path - Directory path to search in
	 * @param {string} templateName - Template name without extension
	 * @returns {string} Full path to the found template file, or empty string if not found
	 * @example
	 * const templatePath = ecto.findTemplateWithoutExtensionSync('./templates', 'index');
	 */
	public findTemplateWithoutExtensionSync(
		path: string,
		templateName: string,
	): string {
		let result = "";

		const files = fs.readdirSync(path);

		for (const file of files) {
			if (file.startsWith(`${templateName}.`)) {
				result = `${path}/${file}`;
				break;
			}
		}

		return result;
	}

	/**
	 * Check if the given engine name is valid and registered in Ecto
	 * @param {string} [engineName] - The engine name to validate
	 * @returns {boolean} True if the engine is valid and registered, false otherwise
	 * @example
	 * const isValid = ecto.isValidEngine('ejs'); // Returns true
	 */
	public isValidEngine(engineName?: string): boolean {
		let result = false;

		if (
			engineName !== undefined &&
			this._mapping.get(engineName) !== undefined
		) {
			result = true;
		}

		return result;
	}

	/**
	 * Detect the template language/engine from a template string by analyzing its syntax
	 * @param {string} source - The template source string to analyze
	 * @returns {string} The detected engine name ('ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid') or 'unknown'
	 * @example
	 * const engine = ecto.detectLanguage('<%= name %>'); // Returns 'ejs'
	 * const engine2 = ecto.detectLanguage('{{name}}'); // Returns 'handlebars' or 'liquid'
	 * const engine3 = ecto.detectLanguage('# Heading'); // Returns 'markdown'
	 */
	public detectLanguage(source: string): string {
		if (!source || typeof source !== "string") {
			return "unknown";
		}

		// Check for Pug/Jade (indentation-based, no angle brackets for tags)
		if (
			(/^(?:doctype\s+html|html|head|body|div|p|h[1-6]|ul|li|a|img)\b[^<>]*$/m.test(
				source,
			) ||
				/^[ \t]*[a-z][a-z0-9]*\([^)]+\)/m.test(source)) && // Pug attributes syntax
			/^[ \t]*[a-z][a-z0-9]*(?:\.|#|\(|\s|$)/im.test(source) &&
			!/<[^>]+>/.test(source)
		) {
			return "pug";
		}

		// Check for EJS (uses <% %> tags)
		if (
			/<%-?\s*[\s\S]*?\s*%>/.test(source) ||
			/<%=\s*[\s\S]*?\s*%>/.test(source)
		) {
			return "ejs";
		}

		// Check for Liquid first (has unique keywords that Nunjucks doesn't have)
		// Liquid uses {% liquid %}, {% assign %}, {% capture %}, {% case %}, {% when %}
		if (
			/{%\s*(?:liquid|assign|capture|endcapture|case|when|unless|endunless|tablerow|endtablerow|increment|decrement)(?:\s+[\s\S]*?)?\s*%}/.test(
				source,
			) ||
			// Liquid heavily uses filters with pipe syntax
			(/{{[^}]*\|[^}]*}}/.test(source) &&
				!/{%\s*(?:block|extends|macro|import|call)\s+/.test(source))
		) {
			return "liquid";
		}

		// Check for Nunjucks/Jinja2 style (uses {% %} for logic and {{ }} for variables)
		// Nunjucks typically has {% block %}, {% extends %}, {% include %}, {% for %}, {% if %}
		if (
			/{%\s*(?:block|extends|include|import|for|if|elif|else|endif|endfor|set|macro|endmacro|call)\s+[\s\S]*?\s*%}/.test(
				source,
			)
		) {
			return "nunjucks";
		}

		// Check for Handlebars/Mustache (uses {{ }} and {{# }})
		// Handlebars has helpers like {{#if}}, {{#each}}, {{#unless}}
		if (
			/{{#(?:if|each|unless|with|lookup|log)\s+[\s\S]*?}}/.test(source) ||
			/{{\/(?:if|each|unless|with)}}/.test(source) ||
			/{{>\s*\S+/.test(source) || // Partials
			/{{!--[\s\S]*?--}}/.test(source)
		) {
			// Handlebars comments
			return "handlebars";
		}

		// Basic Mustache/Handlebars variable syntax (could be either)
		if (/{{[^}]+}}/.test(source) && !/{%/.test(source)) {
			// Default to handlebars for simple {{ }} syntax since it's more common
			return "handlebars";
		}

		// Check for Markdown indicators
		// Look for markdown headers, lists, code blocks, links, images
		if (
			/^[\t ]*#{1,6}\s+.+$/m.test(source) || // Headers (with leading whitespace)
			/^\s*[-*+]\s+.+$/m.test(source) || // Unordered lists
			/^\s*\d+\.\s+.+$/m.test(source) || // Ordered lists
			/^\s*```[\s\S]*?```\s*$/m.test(source) || // Code blocks
			/\[([^\]]+)\]\(([^)]+)\)/.test(source) || // Links
			/!\[([^\]]*)\]\(([^)]+)\)/.test(source) || // Images
			/^\s*>\s+.+$/m.test(source) || // Blockquotes
			/^\s*\|.+\|.+\|$/m.test(source)
		) {
			// Tables
			// Make sure it's not mixed with template syntax
			if (
				!/<%-?\s*[\s\S]*?\s*%>/.test(source) &&
				!/{[{%]/.test(source) &&
				!/<[^>]+>/.test(source.replace(/```[\s\S]*?```/g, ""))
			) {
				// Ignore HTML in code blocks
				return "markdown";
			}
		}

		// If no specific template syntax is found, return unknown
		return "unknown";
	}

	/**
	 * Register all engine mappings between engine names and file extensions
	 * @returns {void}
	 * @private
	 */
	public registerEngineMappings(): void {
		for (const eng of this._engines) {
			for (const name of eng.names) {
				this._mapping.set(name, eng.getExtensions());
			}
		}
	}

	/**
	 * Get the render engine instance by name
	 * @param {string} engineName - The name of the engine to retrieve
	 * @returns {EngineInterface} The engine instance (defaults to EJS if not found)
	 * @example
	 * const engine = ecto.getRenderEngine('pug');
	 */
	public getRenderEngine(engineName: string): EngineInterface {
		let result = this._ejs; // Setting default

		const cleanEngineName = engineName.trim().toLowerCase();
		switch (cleanEngineName) {
			case "markdown": {
				result = this._markdown;
				break;
			}

			case "pug": {
				result = this._pug;
				break;
			}

			case "nunjucks": {
				result = this._nunjucks;
				break;
			}

			case "mustache": {
				result = this._handlebars;
				break;
			}

			case "handlebars": {
				result = this._handlebars;
				break;
			}

			case "liquid": {
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
	 * Check if the source content contains front matter (YAML metadata)
	 * @param {string} source - The source content to check
	 * @returns {boolean} True if front matter is present, false otherwise
	 * @example
	 * const hasFM = ecto.hasFrontMatter('---\ntitle: Test\n---\nContent');
	 */
	public hasFrontMatter(source: string): boolean {
		const writr = new Writr(source);
		if (writr.frontMatterRaw !== "") {
			return true;
		}

		return false;
	}

	/**
	 * Extract front matter data from the source content
	 * @param {string} source - The source content containing front matter
	 * @returns {Record<string, unknown>} Parsed front matter as an object
	 * @example
	 * const data = ecto.getFrontMatter('---\ntitle: Test\n---\nContent');
	 */
	public getFrontMatter(source: string): Record<string, unknown> {
		const writr = new Writr(source);
		return writr.frontMatter;
	}

	/**
	 * Set or replace front matter in the source content
	 * @param {string} source - The source content
	 * @param {Record<string, unknown>} data - The front matter data to set
	 * @returns {string} The source content with updated front matter
	 * @example
	 * const updated = ecto.setFrontMatter('Content', { title: 'New Title' });
	 */
	public setFrontMatter(source: string, data: Record<string, unknown>): string {
		const writr = new Writr(source);
		writr.frontMatter = data;
		return writr.content;
	}

	/**
	 * Remove front matter from the source content, returning only the body
	 * @param {string} source - The source content with front matter
	 * @returns {string} The source content without front matter
	 * @example
	 * const body = ecto.removeFrontMatter('---\ntitle: Test\n---\nContent');
	 */
	public removeFrontMatter(source: string): string {
		const writr = new Writr(source);
		return writr.body;
	}

	/**
	 * Write content to a file asynchronously, creating directories if needed
	 * @private
	 * @param {string} [filePath] - The path to write the file to
	 * @param {string} [source] - The content to write to the file
	 * @returns {Promise<void>}
	 */
	private async writeFile(filePath?: string, source?: string) {
		if (filePath && source) {
			await this.ensureFilePath(filePath);
			await fs.promises.writeFile(filePath, source);
		}
	}

	/**
	 * Write content to a file synchronously, creating directories if needed
	 * @private
	 * @param {string} [filePath] - The path to write the file to
	 * @param {string} [source] - The content to write to the file
	 * @returns {void}
	 */
	private writeFileSync(filePath?: string, source?: string) {
		if (filePath && source) {
			this.ensureFilePathSync(filePath);
			fs.writeFileSync(filePath, source);
		}
	}
}

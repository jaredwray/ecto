import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import nodePath from "node:path";
import { Cacheable, CacheableMemory, createKeyv } from "cacheable";
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

/**
 * Context passed to beforeRender and beforeRenderSync hooks
 */
export type RenderContext = {
	source: string;
	data?: Record<string, unknown>;
	engineName: string;
	rootTemplatePath?: string;
	filePathOutput?: string;
	cached: boolean;
};

/**
 * Hook failure that should reject the render when `throwOnHookError` is set.
 * Hookified has already emitted `error` when any listeners are attached.
 */
class HookRenderError extends Error {
	constructor(cause: Error) {
		super(cause.message, { cause });
		this.name = "HookRenderError";
	}
}

/**
 * Result passed to afterRender and afterRenderSync hooks
 */
export type RenderResult = {
	result: string;
	context: RenderContext;
};

export enum EctoEvents {
	cacheHit = "cacheHit",
	cacheMiss = "cacheMiss",
	warn = "warn",
	error = "error",
	beforeRender = "beforeRender",
	afterRender = "afterRender",
	beforeRenderSync = "beforeRenderSync",
	afterRenderSync = "afterRenderSync",
}

export class Ecto extends Hookified {
	private readonly _mapping: EngineMap = new EngineMap();
	private readonly _engines: BaseEngine[] = [] as BaseEngine[];

	// Cacheable instance for caching rendered templates
	private _cache: Cacheable | undefined;
	private _cacheSync: CacheableMemory | undefined;

	private _defaultEngine = "ejs";
	private readonly cacheScope = randomUUID();

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
		super(options);
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
			this._cache = new Cacheable({
				primary: createKeyv({
					lruSize: defaultCacheLimit,
					ttl: defaultCacheTtl,
				}),
				ttl: defaultCacheTtl,
			});
		} else if (options?.cache instanceof Cacheable) {
			this._cache = options.cache;
		}

		// Set the cacheable memory instance if caching is enabled
		if (options?.cacheSync === true) {
			this._cacheSync = new CacheableMemory({
				lruSize: defaultCacheLimit,
				ttl: defaultCacheTtl,
			});
		} else if (options?.cacheSync instanceof CacheableMemory) {
			this._cacheSync = options.cacheSync;
		}

		// Set the options
		if (options?.defaultEngine) {
			const name = options.defaultEngine.trim().toLowerCase();
			if (this.engineByName(name) && this.isValidEngine(name)) {
				this._defaultEngine = name;
			}
		}
	}

	/**
	 * Get the default engine
	 * @returns {string} - the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
	public get defaultEngine(): string {
		return this.ensureDefaultEngine();
	}

	/**
	 * Set the default engine
	 * @param {string} value the engine name such as 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid'
	 */
	public set defaultEngine(value: string) {
		value = value.toLowerCase().trim();
		if (this.engineByName(value) && this.isValidEngine(value)) {
			this._defaultEngine = value;
		} else {
			const fallback = this.ensureDefaultEngine();
			this.emit(
				EctoEvents.warn,
				`Invalid engine name: ${value}. Defaulting to ${fallback}.`,
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
	 * Asynchronously render a template source with data using the specified engine.
	 * `beforeRender` can modify the source and data. `afterRender` can modify the returned string.
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
			const renderEngineName = this.resolveEngineName(engineName);
			const cacheKey = this.cacheKey(
				renderEngineName,
				source,
				data,
				rootTemplatePath,
			);
			if (this._cache && cacheKey !== undefined) {
				const cachedResult = await this._cache.get<string>(cacheKey);
				if (cachedResult) {
					this.emit(EctoEvents.cacheHit, `Cache hit for key: ${cacheKey}`);

					// Create context for hooks with cached flag
					const context: RenderContext = {
						source,
						data,
						engineName: renderEngineName,
						rootTemplatePath,
						filePathOutput,
						cached: true,
					};
					await this.invokeHook(EctoEvents.beforeRender, context);

					// Cache stores engine output. afterRender runs on every call.
					const renderResult: RenderResult = { result: cachedResult, context };
					await this.invokeHook(EctoEvents.afterRender, renderResult);

					// Write out the file
					await this.writeFile(context.filePathOutput, renderResult.result);
					return renderResult.result;
				}

				this.emit(EctoEvents.cacheMiss, `Cache miss for key: ${cacheKey}`);
			}

			// Create context for hooks
			const context: RenderContext = {
				source,
				data,
				engineName: renderEngineName,
				rootTemplatePath,
				filePathOutput,
				cached: false,
			};

			// Call beforeRender hook - allows modifying source and data
			await this.invokeHook(EctoEvents.beforeRender, context);

			// Get the render engine
			const renderEngine = this.getRenderEngine(renderEngineName);

			// Set the root template path
			renderEngine.rootTemplatePath = context.rootTemplatePath;

			// Get the output using potentially modified source and data
			const rendered = await renderEngine.render(context.source, context.data);

			// Create render result for afterRender hook
			const renderResult: RenderResult = { result: rendered, context };
			await this.invokeHook(EctoEvents.afterRender, renderResult);

			// Store engine output so a later hit does not run afterRender twice
			if (this._cache && cacheKey !== undefined) {
				await this._cache.set(cacheKey, rendered);
			}

			// Write out the file
			await this.writeFile(context.filePathOutput, renderResult.result);

			return renderResult.result;
		} catch (error) {
			if (error instanceof HookRenderError) {
				throw error.cause;
			}
			this.emit(EctoEvents.error, error);
			return "";
		}
	}

	/**
	 * Synchronously render a template source with data using the specified engine.
	 * `beforeRenderSync` can modify the source and data. `afterRenderSync` can modify the returned string.
	 * Async hook handlers are skipped.
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
			const renderEngineName = this.resolveEngineName(engineName);
			const cacheKey = this.cacheKey(
				renderEngineName,
				source,
				data,
				rootTemplatePath,
			);
			if (this._cacheSync && cacheKey !== undefined) {
				const cachedResult = this._cacheSync.get<string>(cacheKey);
				if (cachedResult) {
					this.emit(EctoEvents.cacheHit, `Cache hit for key: ${cacheKey}`);

					// Create context for hooks with cached flag
					const context: RenderContext = {
						source,
						data,
						engineName: renderEngineName,
						rootTemplatePath,
						filePathOutput,
						cached: true,
					};
					this.invokeHookSync(EctoEvents.beforeRenderSync, context);

					// Cache stores engine output. afterRenderSync runs on every call.
					const renderResult: RenderResult = { result: cachedResult, context };
					this.invokeHookSync(EctoEvents.afterRenderSync, renderResult);

					// Write out the file
					this.writeFileSync(context.filePathOutput, renderResult.result);
					return renderResult.result;
				}

				this.emit(EctoEvents.cacheMiss, `Cache miss for key: ${cacheKey}`);
			}

			// Create context for hooks
			const context: RenderContext = {
				source,
				data,
				engineName: renderEngineName,
				rootTemplatePath,
				filePathOutput,
				cached: false,
			};

			// Call beforeRenderSync hook - allows modifying source and data
			this.invokeHookSync(EctoEvents.beforeRenderSync, context);

			// Get the render engine
			const renderEngine = this.getRenderEngine(renderEngineName);

			// Set the root template path
			renderEngine.rootTemplatePath = context.rootTemplatePath;

			// Get the output using potentially modified source and data
			const rendered = renderEngine.renderSync(context.source, context.data);

			// Create render result for afterRenderSync hook
			const renderResult: RenderResult = { result: rendered, context };
			this.invokeHookSync(EctoEvents.afterRenderSync, renderResult);

			// Store engine output so a later hit does not run afterRenderSync twice
			if (this._cacheSync && cacheKey !== undefined) {
				this._cacheSync.set(cacheKey, rendered);
			}

			// Write out the file
			this.writeFileSync(context.filePathOutput, renderResult.result);

			return renderResult.result;
		} catch (error) {
			if (error instanceof HookRenderError) {
				throw error.cause;
			}
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

		const selected = this.engineNameForFile(filePath, engineName);
		const templateRootPath = rootTemplatePath ?? nodePath.dirname(filePath);

		// Get the source
		const source = await fs.promises.readFile(filePath, "utf8");

		result = await this.render(
			source,
			data,
			selected,
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

		const selected = this.engineNameForFile(filePath, engineName);
		const templateRootPath = rootTemplatePath ?? nodePath.dirname(filePath);

		// Get the source
		const source = fs.readFileSync(filePath, "utf8");

		result = this.renderSync(
			source,
			data,
			selected,
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
		const normalizedPath = nodePath.normalize(path);
		const directory = nodePath.dirname(normalizedPath);

		await fs.promises.mkdir(directory, { recursive: true });
	}

	/**
	 * Synchronously ensure that the directory path for a file exists, creating it if necessary
	 * @param {string} path - The full file path (directories will be extracted from this)
	 * @returns {void}
	 * @example
	 * ecto.ensureFilePathSync('/path/to/file.txt');
	 */
	public ensureFilePathSync(path: string) {
		const normalizedPath = nodePath.normalize(path);
		const directory = nodePath.dirname(normalizedPath);

		fs.mkdirSync(directory, { recursive: true });
	}

	/**
	 * Determine the appropriate template engine based on a file's extension
	 * @param {string} filePath - The file path to analyze
	 * @returns {string} The engine name (e.g., 'ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid')
	 * @example
	 * const engine = ecto.getEngineByFilePath('template.ejs'); // Returns 'ejs'
	 */
	public getEngineByFilePath(filePath: string): string {
		if (filePath !== undefined) {
			const { ext } = nodePath.parse(filePath);
			const extension = ext.startsWith(".") ? ext.slice(1) : ext;
			const engExtension = this._mapping.getName(extension);
			if (
				engExtension !== undefined &&
				this.engineByName(engExtension) &&
				this.isValidEngine(engExtension)
			) {
				return engExtension;
			}
		}

		return this.ensureDefaultEngine();
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
		const files = await fs.promises.readdir(path, { withFileTypes: true });
		return this.matchTemplateFile(path, templateName, files);
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
		const files = fs.readdirSync(path, { withFileTypes: true });
		return this.matchTemplateFile(path, templateName, files);
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
	 * Detect the template engine from a template string by analyzing its syntax
	 * @param {string} source - The template source string to analyze
	 * @returns {string} The detected engine name ('ejs', 'markdown', 'pug', 'nunjucks', 'handlebars', 'liquid') or the default engine
	 * @example
	 * const engine = ecto.detectEngine('<%= name %>'); // Returns 'ejs'
	 * const engine2 = ecto.detectEngine('{{name}}'); // Returns 'handlebars' or 'liquid'
	 * const engine3 = ecto.detectEngine('# Heading'); // Returns 'markdown'
	 * const engine4 = ecto.detectEngine('plain text'); // Returns defaultEngine (e.g., 'ejs')
	 */
	public detectEngine(source: string): string {
		if (!source || typeof source !== "string") {
			return this.ensureDefaultEngine();
		}

		const fences = readFences(source);
		const syntaxSource = fences.text;

		// Check for EJS (uses <% %> tags)
		if (syntaxSource.includes("<%")) {
			if (
				syntaxSource.includes("<%=") ||
				syntaxSource.includes("<%-") ||
				syntaxSource.includes("%>")
			) {
				return this.acceptedEngine("ejs");
			}
		}

		// Check for Liquid first (has unique keywords that Nunjucks doesn't have)
		if (syntaxSource.includes("{%")) {
			// Check for Liquid-specific keywords
			const liquidKeywords = [
				"liquid",
				"assign",
				"capture",
				"endcapture",
				"case",
				"when",
				"unless",
				"endunless",
				"tablerow",
				"endtablerow",
				"increment",
				"decrement",
			];
			for (const keyword of liquidKeywords) {
				if (
					syntaxSource.includes(`{% ${keyword}`) ||
					syntaxSource.includes(`{%${keyword}`)
				) {
					return this.acceptedEngine("liquid");
				}
			}
			// Check for Liquid filters with pipe syntax
			if (
				syntaxSource.includes("{{") &&
				syntaxSource.includes("|") &&
				syntaxSource.includes("}}")
			) {
				// Make sure it's not Nunjucks by checking for Nunjucks-specific keywords
				const nunjucksSpecific = [
					"block",
					"extends",
					"macro",
					"import",
					"call",
				];
				let hasNunjucksKeyword = false;
				for (const keyword of nunjucksSpecific) {
					if (
						syntaxSource.includes(`{% ${keyword}`) ||
						syntaxSource.includes(`{%${keyword}`)
					) {
						hasNunjucksKeyword = true;
						break;
					}
				}
				if (!hasNunjucksKeyword) {
					return this.acceptedEngine("liquid");
				}
			}
		}

		// Check for Nunjucks (uses {% %} for logic)
		if (syntaxSource.includes("{%")) {
			const nunjucksKeywords = [
				"block",
				"extends",
				"include",
				"import",
				"for",
				"if",
				"elif",
				"else",
				"endif",
				"endfor",
				"set",
				"macro",
				"endmacro",
				"call",
			];
			for (const keyword of nunjucksKeywords) {
				if (
					syntaxSource.includes(`{% ${keyword}`) ||
					syntaxSource.includes(`{%${keyword}`)
				) {
					return this.acceptedEngine("nunjucks");
				}
				/* c8 ignore next 3 */
			}
		}

		// Check for Handlebars/Mustache (uses {{ }} and {{# }})
		if (syntaxSource.includes("{{")) {
			// First check if it's Liquid with filters (before assuming Handlebars)
			if (syntaxSource.includes(" | ") && syntaxSource.includes("}}")) {
				// This could be a Liquid filter, check for Liquid-specific keywords
				if (
					syntaxSource.includes("{% assign ") ||
					syntaxSource.includes("{% capture ") ||
					syntaxSource.includes("{% unless ") ||
					syntaxSource.includes("{% increment ") ||
					syntaxSource.includes("{% decrement ") ||
					syntaxSource.includes("{% tablerow ") ||
					syntaxSource.includes("{% case ") ||
					syntaxSource.includes("{% when ") ||
					syntaxSource.includes(" | upcase") ||
					syntaxSource.includes(" | downcase") ||
					syntaxSource.includes(" | capitalize") ||
					syntaxSource.includes(" | minus:") ||
					syntaxSource.includes(" | plus:") ||
					syntaxSource.includes(" | money") ||
					syntaxSource.includes(" | date:")
				) {
					return this.acceptedEngine("liquid");
				}
			}
			// Check for Handlebars helpers
			if (
				syntaxSource.includes("{{#") ||
				syntaxSource.includes("{{/") ||
				syntaxSource.includes("{{>") ||
				syntaxSource.includes("{{!--")
			) {
				return this.acceptedEngine("handlebars");
			}
			// Check for basic mustache/handlebars syntax
			/* v8 ignore next -- @preserve */
			if (syntaxSource.includes("}}") && !syntaxSource.includes("{%")) {
				return this.acceptedEngine("handlebars");
			}
		}

		// Check for Markdown first (before Pug to avoid conflicts)
		const lines = source.split("\n");
		let markdownIndicators = 0;
		let pugIndicators = 0;

		for (const [index, line] of lines.entries()) {
			const trimmed = line.trim();
			if (fences.fenced[index]) {
				if (/^(?:`{3,}|~{3,})/.test(trimmed)) markdownIndicators++;
				continue;
			}

			// Check for markdown headers
			if (
				trimmed.startsWith("# ") ||
				trimmed.startsWith("## ") ||
				trimmed.startsWith("### ") ||
				trimmed.startsWith("#### ") ||
				trimmed.startsWith("##### ") ||
				trimmed.startsWith("###### ")
			) {
				markdownIndicators++;
			}

			// Check for markdown lists
			if (
				trimmed.startsWith("- ") ||
				trimmed.startsWith("* ") ||
				trimmed.startsWith("+ ")
			) {
				markdownIndicators++;
			}

			// Check for ordered lists (e.g., "1. ", "2. ", etc.)
			const firstChar = trimmed.charAt(0);
			if (firstChar >= "0" && firstChar <= "9") {
				const dotIndex = trimmed.indexOf(".");
				if (
					dotIndex > 0 &&
					dotIndex < 4 &&
					trimmed.charAt(dotIndex + 1) === " "
				) {
					markdownIndicators++;
				}
			}

			// Check for blockquotes
			if (trimmed.startsWith("> ")) {
				markdownIndicators++;
			}

			// Check for Pug patterns (only count if it's not markdown)
			if (
				!trimmed.startsWith("# ") &&
				!trimmed.startsWith("- ") &&
				!trimmed.startsWith("* ") &&
				!trimmed.startsWith("+ ") &&
				!trimmed.startsWith("> ")
			) {
				if (pugTagPattern.test(trimmed)) {
					pugIndicators++;
				}
				// A leading class or id is Pug. Parentheses alone are not.
				if (
					trimmed.indexOf(".") === 0 ||
					(trimmed.indexOf("#") === 0 && !trimmed.includes(" "))
				) {
					pugIndicators++;
				}
			}
		}

		// Check for markdown links and images
		/* v8 ignore next -- @preserve */
		if (
			syntaxSource.includes("](") &&
			(syntaxSource.includes("[") || syntaxSource.includes("!["))
		) {
			markdownIndicators++;
		}

		// Check for markdown tables
		if (syntaxSource.includes("|") && syntaxSource.includes("---")) {
			markdownIndicators++;
		}

		// Determine if it's Markdown
		if (markdownIndicators > 0) {
			// Make sure it's not mixed with template syntax
			/* v8 ignore next -- @preserve */
			if (
				!syntaxSource.includes("<%") &&
				!syntaxSource.includes("{{") &&
				!syntaxSource.includes("{%")
			) {
				return this.acceptedEngine("markdown");
			}
		}

		// Check for Pug (indentation-based, no HTML tags)
		const hasHtmlOpenTag =
			syntaxSource.includes("<") && syntaxSource.includes(">");
		const hasHtmlCloseTag = syntaxSource.includes("</");
		if (
			pugIndicators > 0 &&
			!hasHtmlOpenTag &&
			!hasHtmlCloseTag &&
			!syntaxSource.includes("<%") &&
			!syntaxSource.includes("{{") &&
			!syntaxSource.includes("{%")
		) {
			return this.acceptedEngine("pug");
		}

		// If no specific template syntax is found, return the default engine
		return this.ensureDefaultEngine();
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
	 * @returns {EngineInterface} The engine for that name. An unknown name uses the default engine.
	 * @example
	 * const engine = ecto.getRenderEngine('pug');
	 */
	public getRenderEngine(engineName: string): EngineInterface {
		const cleanEngineName = engineName.trim().toLowerCase();
		const selected = this.engineByName(cleanEngineName);
		if (selected && this.isValidEngine(cleanEngineName)) {
			return selected;
		}

		const fallback = this.ensureDefaultEngine();
		if (fallback !== cleanEngineName) {
			const fallbackEngine = this.engineByName(fallback);
			if (fallbackEngine && this.isValidEngine(fallback)) {
				return fallbackEngine;
			}
		}

		throw new Error(`Unknown engine: ${engineName}`);
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
		const block = `---\n${frontMatterJson(data)}\n---\n`;
		const raw = writr.frontMatterRaw;
		if (raw !== "") {
			// frontMatterRaw is a slice of content, so the index is valid.
			const start = writr.content.indexOf(raw);
			return (
				writr.content.slice(0, start) +
				block +
				writr.content.slice(start + raw.length)
			);
		}

		return `${block}${writr.content}`;
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
	 * Run an async render hook.
	 * Hookified throws from `emit('error')` when no error listener is attached.
	 * A temporary listener keeps that from aborting the render unless
	 * `throwOnHookError` is set. Handler failures then reject the render.
	 * @param {EctoEvents} event - Hook event name
	 * @param {T} payload - Context or result object passed to handlers
	 * @returns {Promise<void>}
	 */
	private async invokeHook<T>(event: EctoEvents, payload: T): Promise<void> {
		if (!this.throwOnHookError) {
			const ignoreHookError = () => {};
			const swallowEmpty = this.listenerCount(EctoEvents.error) === 0;
			if (swallowEmpty) {
				this.on(EctoEvents.error, ignoreHookError);
			}
			try {
				await this.hook(event, payload);
			} finally {
				if (swallowEmpty) {
					this.off(EctoEvents.error, ignoreHookError);
				}
			}
			return;
		}

		try {
			await this.hook(event, payload);
		} catch (error) {
			// Hookified reports handler failures as Error instances.
			throw new HookRenderError(error as Error);
		}
	}

	/**
	 * Run a synchronous render hook. Async handlers are skipped by Hookified.
	 * @param {EctoEvents} event - Hook event name
	 * @param {T} payload - Context or result object passed to handlers
	 * @returns {void}
	 */
	private invokeHookSync<T>(event: EctoEvents, payload: T): void {
		if (!this.throwOnHookError) {
			const ignoreHookError = () => {};
			const swallowEmpty = this.listenerCount(EctoEvents.error) === 0;
			if (swallowEmpty) {
				this.on(EctoEvents.error, ignoreHookError);
			}
			try {
				this.hookSync(event, payload);
			} finally {
				if (swallowEmpty) {
					this.off(EctoEvents.error, ignoreHookError);
				}
			}
			return;
		}

		try {
			this.hookSync(event, payload);
		} catch (error) {
			// Hookified reports handler failures as Error instances.
			throw new HookRenderError(error as Error);
		}
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

	/**
	 * Choose a built-in engine for this render.
	 * A blank name or an unknown name uses the default engine.
	 */
	private resolveEngineName(engineName?: string): string {
		const requested = engineName?.trim().toLowerCase() ?? "";
		if (
			requested !== "" &&
			this.engineByName(requested) &&
			this.isValidEngine(requested)
		) {
			return requested;
		}
		return this.ensureDefaultEngine();
	}

	/**
	 * Use the file extension when the caller does not name an engine.
	 */
	private engineNameForFile(filePath: string, engineName?: string): string {
		if (engineName !== undefined && engineName.trim() !== "") {
			return engineName;
		}
		return this.getEngineByFilePath(filePath);
	}

	/**
	 * Keep the default engine on a mapping that still has a renderer.
	 */
	private ensureDefaultEngine(): string {
		if (
			this.engineByName(this._defaultEngine) &&
			this.isValidEngine(this._defaultEngine)
		) {
			return this._defaultEngine;
		}

		for (const name of builtinEngineNames) {
			if (this.engineByName(name) && this.isValidEngine(name)) {
				this._defaultEngine = name;
				return name;
			}
		}

		return this._defaultEngine;
	}

	/**
	 * Return a detected name only when that engine is still registered.
	 */
	private acceptedEngine(name: string): string {
		if (this.engineByName(name) && this.isValidEngine(name)) {
			return name;
		}
		return this.ensureDefaultEngine();
	}

	private engineByName(name: string): EngineInterface | undefined {
		switch (name) {
			case "ejs": {
				return this._ejs;
			}
			case "markdown": {
				return this._markdown;
			}
			case "pug": {
				return this._pug;
			}
			case "nunjucks": {
				return this._nunjucks;
			}
			case "mustache":
			case "handlebars": {
				return this._handlebars;
			}
			case "liquid": {
				return this._liquid;
			}
			default: {
				return undefined;
			}
		}
	}

	/**
	 * Return the first file whose stem and extension match.
	 * A dot file, a directory, and an unknown extension do not match.
	 */
	private matchTemplateFile(
		path: string,
		templateName: string,
		files: fs.Dirent[],
	): string {
		if (!isSafeTemplateName(templateName)) return "";

		for (const file of files) {
			if (!file.isFile()) continue;
			const parsed = nodePath.parse(file.name);
			if (parsed.name !== templateName) continue;
			const extension = parsed.ext.startsWith(".")
				? parsed.ext.slice(1)
				: parsed.ext;
			if (extension === "" || this._mapping.getName(extension) === undefined) {
				continue;
			}
			return nodePath.join(path, file.name);
		}

		return "";
	}

	/**
	 * Build a cache key for plain JSON data.
	 * Data that JSON cannot store is not cached.
	 */
	private cacheKey(
		engineName: string,
		source: string,
		data: Record<string, unknown> | undefined,
		rootTemplatePath?: string,
	): string | undefined {
		const payload = data ?? null;
		if (!isJsonFaithful(payload)) return undefined;

		const body = JSON.stringify({
			scope: this.cacheScope,
			engine: engineName,
			root: normalizeRoot(rootTemplatePath),
			source,
			data: payload,
		});
		return createHash("sha256").update(body).digest("hex");
	}
}

const defaultCacheLimit = 1000;
const defaultCacheTtl = "5m";
const builtinEngineNames = [
	"ejs",
	"markdown",
	"pug",
	"nunjucks",
	"handlebars",
	"mustache",
	"liquid",
] as const;
const pugTagPattern =
	/^(?:doctype|html|head|body|title|div|p|h[1-6])(?:\s|[.#(:]|$)|^(?:a|img)\(/;

function readFences(source: string): { text: string; fenced: boolean[] } {
	const lines = source.split("\n");
	const fenced = Array.from({ length: lines.length }, () => false);
	const kept: string[] = [];
	let inFence = false;
	let fenceChar = "";
	let fenceLength = 0;

	for (const [index, line] of lines.entries()) {
		const trimmed = line.trim();
		const fence = /^(?<marker>`{3,}|~{3,})/.exec(trimmed);
		if (fence?.groups?.marker) {
			const marker = fence.groups.marker;
			const character = marker.charAt(0);
			if (!inFence) {
				inFence = true;
				fenceChar = character;
				fenceLength = marker.length;
				fenced[index] = true;
				continue;
			}
			if (character === fenceChar && marker.length >= fenceLength) {
				inFence = false;
				fenced[index] = true;
				continue;
			}
		}

		if (inFence) {
			fenced[index] = true;
			continue;
		}

		const withoutInline = line.replace(/`[^`\n]*`/g, "");
		kept.push(withoutInline);
	}

	return { text: kept.join("\n"), fenced };
}

function frontMatterJson(data: Record<string, unknown>): string {
	return JSON.stringify(data).replace(/-(?=--)/g, "\\u002d");
}

function normalizeRoot(root?: string): string {
	if (root === undefined || root.trim() === "") return "";
	return nodePath.resolve(root);
}

function isSafeTemplateName(templateName: string): boolean {
	return (
		templateName !== "" &&
		!templateName.startsWith(".") &&
		!templateName.includes("/") &&
		!templateName.includes("\\") &&
		!templateName.includes("\0")
	);
}

function isJsonFaithful(value: unknown, seen = new Set<object>()): boolean {
	if (value === null) return true;
	if (typeof value === "string" || typeof value === "boolean") return true;
	if (typeof value === "number") return Number.isFinite(value);
	if (typeof value !== "object") return false;
	if (seen.has(value)) return false;
	seen.add(value);

	if (Array.isArray(value)) {
		if (Object.getPrototypeOf(value) !== Array.prototype) return false;
		const keys = Reflect.ownKeys(value);
		if (keys.length !== value.length + 1) return false;
		for (let index = 0; index < value.length; index++) {
			const descriptor = Object.getOwnPropertyDescriptor(value, index);
			if (!descriptor || descriptor.get || descriptor.set) return false;
			if (!descriptor.enumerable) return false;
			if (!isJsonFaithful(value[index], seen)) return false;
		}
		return true;
	}

	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) return false;

	for (const key of Reflect.ownKeys(value)) {
		if (typeof key === "symbol") return false;
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor || descriptor.get || descriptor.set) return false;
		if (!descriptor.enumerable) return false;
		if (!isJsonFaithful((value as Record<string, unknown>)[key], seen)) {
			return false;
		}
	}

	return true;
}

// Export base types for developers who want to create custom engines
export type { BaseEngine } from "./base-engine.js";
export type { EngineInterface } from "./engine-interface.js";
// Export all engine classes so developers can use them directly
export { EJS } from "./engines/ejs.js";
export { Handlebars } from "./engines/handlebars.js";
export { Liquid } from "./engines/liquid.js";
export { Markdown } from "./engines/markdown.js";
export { Nunjucks } from "./engines/nunjucks.js";
export { Pug } from "./engines/pug.js";

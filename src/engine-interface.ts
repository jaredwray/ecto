export type EngineInterface = {
	names: string[];
	// biome-ignore lint/suspicious/noExplicitAny: Different engines use different types, any is required for flexibility
	engine: any;
	opts?: Record<string, unknown>;
	rootTemplatePath?: string;
	render(source: string, data?: Record<string, unknown>): Promise<string>;
	renderSync(source: string, data?: Record<string, unknown>): string;
};

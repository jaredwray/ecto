export type EngineInterface = {
	names: string[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	engine: any;
	opts?: Record<string, unknown>;
	rootTemplatePath?: string;
	render(source: string, data?: Record<string, unknown>): Promise<string>;
	renderSync(source: string, data?: Record<string, unknown>): string;
};

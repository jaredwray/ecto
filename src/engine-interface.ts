type EngineInterface = {
	names: string[];
	engine: any;
	opts?: any;
	rootTemplatePath?: string;
	render(source: string, data?: Record<string, unknown>): Promise<string>;
};

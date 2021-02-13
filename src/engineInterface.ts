interface EngineInterface {
    name: string;
    engine: any;
    opts?: any;
    rootTemplatePath?: string;
    render(source:string, data?:object): Promise<string>;
}
interface EngineInterface {
    name: string;
    engine: any;
    opts?: any;
    render(source:string, data?:object): Promise<string>;
}
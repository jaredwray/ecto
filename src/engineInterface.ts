interface EngineInterface {
    name: string;
    engine: any;
    opts?: object;
    render(source:string, data?:object): Promise<string>;
}
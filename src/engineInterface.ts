interface EngineInterface {
    render(source:string, data?:object): Promise<string>;
}
interface EngineInterface {
    name: string;
    engine: any;
    opts?: any;
    render(source:string, data?:object): Promise<string>;
    //renderFromTemplate(templatePath:string, data?:object, partialsPath?:string): Promise<string>;
}
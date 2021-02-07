import { BaseEngine } from "../baseEngine";
import { Liquid as LiquidEngine } from "liquidjs";

export class Liquid extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "liquid";

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["liquid"]);
    }

    async render(source:string, data?:object): Promise<string> {

        if(!this.engine) {
            this.engine = new LiquidEngine(this.opts);
        }

        return await this.engine.parseAndRender(source, data);
    }
} 
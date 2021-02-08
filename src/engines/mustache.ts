import { BaseEngine } from "../baseEngine";
import * as mustache from "mustache";

export class Mustache extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "mustache";

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["mustache"]);
    }

    async render(source:string, data?:object): Promise<string> {

        return this.engine = mustache.render(source, data);
    }
} 
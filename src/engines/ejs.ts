import { BaseEngine } from "../baseEngine";
import * as ejs from "ejs";

export class EJS extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "ejs";

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["ejs"]);
    }

    async render(source:string, data?:object): Promise<string> {

        if(!this.engine) {
            this.engine = ejs;
        }

        return ejs.render(source, data, this.opts);
    }
} 
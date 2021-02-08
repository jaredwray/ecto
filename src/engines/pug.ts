import { BaseEngine } from "../baseEngine";
import * as pug from "pug";

export class Pug extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "pug";

        this.engine = pug;

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["pug", "jade"]);
    }

    async render(source:string, data?:object): Promise<string> {

        let template = pug.compile(source, this.opts);

        return template(data);
    }
} 
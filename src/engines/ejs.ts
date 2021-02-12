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

    async renderFromTemplate(templatePath:string, data?:object, partialsPath?:string): Promise<string> {

        if(!this.engine) {
            this.engine = ejs;
        }

        if(!this.opts) {
            this.opts = {};
        }

        this.opts.root = partialsPath;

        return ejs.renderFile(templatePath, data, this.opts);
    }
} 
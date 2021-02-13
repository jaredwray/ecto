import { BaseEngine } from "../baseEngine";
import * as nunjucks from "nunjucks";

export class Nunjucks extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "nunjucks";

        this.engine = nunjucks;

        this.opts = { autoescape: true }; //default opts

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["njk"]);
    }

    async render(source:string, data?:object): Promise<string> {

        if(this.rootTemplatePath){
            nunjucks.configure(this.rootTemplatePath, this.opts);
        } else {
            nunjucks.configure(this.opts);  
        }

        if(!data) {
            data = {};
        }

        return nunjucks.renderString(source, data);
    }
} 
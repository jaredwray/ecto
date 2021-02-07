import { BaseEngine } from "../baseEngine";
import * as nunjucks from "nunjucks";

export class Nunjucks extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "nunjucks";

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["njk"]);
    }

    async render(source:string, data?:object): Promise<string> {

        if(!this.engine) {
            this.engine = nunjucks;
        }

        if(this.opts){
            nunjucks.configure(this.opts);   
        }

        let nData = {};
        if(data) {
            nData = data;
        }

        return nunjucks.renderString(source, nData);
    }
} 
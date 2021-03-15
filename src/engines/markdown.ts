import { HttpTransportOptions } from "winston/lib/winston/transports";
import { BaseEngine } from "../baseEngine";

export class Markdown extends BaseEngine implements EngineInterface {

    constructor(opts?:any){
        super();

        this.names = ["markdown"];

        if(opts) {
            this.opts = opts;
            
        }

        this.engine = require("marked");

        this.setExtensions(["md", "markdown"]);
    }

    async render(source:string, data?:object): Promise<string> {

        let md = this.engine;

        if(!this.opts) {
            this.opts = {
                pedantic: false,
                gfm: true,
                breaks: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                xhtml: false
              };
        }

        return md(source, this.opts);
    }
} 
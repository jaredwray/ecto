import { BaseEngine } from "../baseEngine";

export class Markdown extends BaseEngine implements EngineInterface {

    constructor(opts?:object){
        super();

        this.name = "markdown";

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["md", "markdown"]);
    }

    async render(source:string, data?:object): Promise<string> {

        let md = this.engine;

        if(md === undefined) {
            
            if(!this.opts) {
                this.opts = { html: true, linkify: true, typographer: true };
            }

            md = this.engine = require('markdown-it')(this.opts);
        }

        return md.render(source);
    }
} 
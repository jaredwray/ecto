import { BaseEngine } from "../baseEngine";
import { marked } from 'marked';

export class Markdown extends BaseEngine implements EngineInterface {

    constructor(opts?:any){
        super();

        this.names = ["markdown"];

        if(opts) {
            this.opts = opts;   
        } else {
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

        this.engine = marked;

        this.engine.setOptions(this.opts);

        this.setExtensions(["md", "markdown"]);
    }

    async render(source:string, data?:object): Promise<string> {

        return this.engine.parse(source);
    }
} 
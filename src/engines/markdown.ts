import { BaseEngine } from "../baseEngine";

export class Markdown extends BaseEngine {

    private __markdown: any;

    constructor(){
        super();

        this.name = "Markdown";

        this.addExtenstions(["md", "markdown"]);
    }

    async render(content:string): Promise<string> {

        let md = this.__markdown;

        if(md === undefined) {
            md = this.__markdown = require('markdown-it')({
                html: true,
                linkify: true,
                typographer: true,
              });
        }

        return md.render(content);
    }
} 
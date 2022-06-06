import { BaseEngine } from "../baseEngine";
import Markdoc from '@markdoc/markdoc';

export class Markdown extends BaseEngine implements EngineInterface {

    constructor(opts?:any){
        super();

        this.names = ["markdown"];

        if(opts) {
            this.opts = opts;
        }

        this.engine = Markdoc;

        this.setExtensions(["md", "markdown"]);
    }

    async render(source:string, data?:object): Promise<string> {
        const ast = this.engine.parse(source)
        const content = this.engine.transform(ast, this.opts);
        return this.engine.renderers.html(content);
    }
}

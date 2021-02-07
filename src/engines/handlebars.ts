import { BaseEngine } from "../baseEngine";
import * as handlebars from "handlebars";
import * as helpers from "handlebars-helpers";


export class Handlebars extends BaseEngine implements EngineInterface {

    private __templates: Map<string, handlebars.Template> = new Map<string, handlebars.Template>();

    constructor(opts?:object){
        super();

        this.name = "handlebars";
        this.opts = opts;

        this.setExtensions(["hbs", "hjs", "handlebars"]);
    }

    async render(source:string, data?:object): Promise<string> {
        helpers({ handlebars: handlebars });
        let template = handlebars.compile(source, this.opts);
        this.__templates.set(source, template);
        return template(data);
    }
} 
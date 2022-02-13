import { BaseEngine } from "../baseEngine";
import * as handlebars from "handlebars";
import * as helpers from "handlebars-helpers";
import * as fs from "fs-extra";
import * as _ from "underscore";

export class Handlebars extends BaseEngine implements EngineInterface {

    public partialsPath: string = "/partials";

    constructor(opts?:object){
        super();

        this.names = ["handlebars", "mustache"];
        this.opts = opts;
        this.engine = handlebars;

        this.setExtensions(["hbs", "hjs", "handlebars", "mustache"]);
    }

    async render(source:string, data?:object): Promise<string> {

        //register partials
        if(this.rootTemplatePath) {
            this.registerPartials(this.rootTemplatePath+this.partialsPath);
        }

        helpers({ handlebars: handlebars });
        let template = handlebars.compile(source, this.opts);

        let result = template(data, this.opts);
        result = _.unescape(result);

        return result;
    }

    registerPartials(partialsPath:string): boolean {
        let result = false;
        if(fs.pathExistsSync(partialsPath)) {
            let partials = fs.readdirSync(partialsPath);

            partials.forEach(p => {
                let source = fs.readFileSync(partialsPath + "/" + p).toString();
                let name = p.split(".")[0];

                if(handlebars.partials[name] === undefined) {
                    handlebars.registerPartial(name, handlebars.compile(source));
                }

            });
            result = true;
        }

        return result;
    }
}

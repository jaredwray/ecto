import { BaseEngine } from "../baseEngine";
import * as handlebars from "handlebars";
import * as fs from "fs-extra";

export class Handlebars extends BaseEngine {

    private __engine: any;

    constructor(){
        super();

        this.name = "Handlebars";

        this.addExtenstions(["hbs", "hls", "handlebars"]);
    }

    async render(content:string): Promise<string> {

        let hjs = this.__engine;

            handlebars.registerHelper('formatDate', require('helper-date'));
            let template: handlebars.Template = handlebars.compile(content);

        return template(content);
    }

    registerPartials(config: any) {
        let result = false;
        let path = config.path + "/templates/partials";
        if(fs.pathExistsSync(path)) {
            let partials = fs.readdirSync(path);
            
            partials.forEach(p => {
                let source = fs.readFileSync(path + "/" + p).toString();
                let name = p.split(".hjs")[0];

                if(handlebars.partials[name] === undefined) {
                    handlebars.registerPartial(name, handlebars.compile(source));
                }

            });
            result = true;
        }

        return result;
    }
} 
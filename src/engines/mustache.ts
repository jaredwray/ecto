import { BaseEngine } from "../baseEngine";
import * as mustache from "mustache";
import * as fs from "fs-extra";

export class Mustache extends BaseEngine implements EngineInterface {

    public partials: any = {};
    public partialsPath: string = "/partials";

    constructor(opts?:object){
        super();

        this.name = "mustache";

        this.engine = mustache;

        if(opts) {
            this.opts = opts;
        }

        this.setExtensions(["mustache"]);
    }

    async render(source:string, data?:object): Promise<string> {

        if(this.rootTemplatePath) {
            if(this.partials) {
                let partialFiles = await fs.readdir(this.rootTemplatePath + this.partialsPath);
                for(let filePath of partialFiles) {
                    let name = filePath.split(".mustache")[0];
                    let fileSource = await fs.readFile(this.rootTemplatePath + this.partialsPath + "/" + filePath, "utf8");
                    this.partials[name] = fileSource;
                }
            }
        }

        return mustache.render(source, data, this.partials);
    }
} 
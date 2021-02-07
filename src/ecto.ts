import { EngineMap } from "./engineMap";
import { Markdown } from "./engines/markdown";
import { Handlebars } from "./engines/handlebars";

export class Ecto {

    private __mapping: EngineMap = new EngineMap();

    private __defaultEngine: string = "ejs";

    //engines
    private __markdown: Markdown = new Markdown();
    private __handlebars: Handlebars = new Handlebars();
    
    constructor() {

        //register mappings
        this.__mapping.set("ejs", ["ejs"]);
        this.__mapping.set("markdown", ["markdown", "md"]);
        this.__mapping.set("pug", ["jade", "pug"]);
        this.__mapping.set("nunjucks", ["njk"]);
        this.__mapping.set("mustache", ["mustache"]);
        this.__mapping.set("handlebars", ["hbs", "hjs", "handlebars"]);
        this.__mapping.set("liquid", ["liquid"]);

    }

    get defaultEngine(): string {
        return this.__defaultEngine;
    }

    get mappings():EngineMap {
        return this.__mapping;
    }

    //Engines
    get markdown(): Markdown {
        return this.__markdown;
    }

    get handlebars(): Handlebars {
        return this.__handlebars;
    }


    //String Render
    async render(source:string, data:object, engineName?:string, filePathOutput?:string): Promise<string> {
        return "";
    }

    //File Render
    async renderFile(templatePath:string, data:object, filePathOutput?:string): Promise<string> {
        return "";
    }

    detectEngineByFilePath(filePath:string): string {
        let result = this.defaultEngine;

        if(filePath !== undefined) {
            let ext = filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);

            let engExt = this.__mapping.getName(ext);
            if(engExt !== undefined) {
                result = engExt;
            }
        }

        return result;
    }



}

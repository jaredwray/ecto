import { EngineMap } from "./engineMap";
import { Markdown } from "./engines/markdown";
import { Handlebars } from "./engines/handlebars";
import { EJS } from "./engines/ejs";
import { Pug } from "./engines/pug";
import { Nunjucks } from "./engines/nunjucks";
import { Mustache } from "./engines/mustache";
import { Liquid } from "./engines/liquid";
import { BaseEngine } from "./baseEngine";

export class Ecto {

    private __mapping: EngineMap = new EngineMap();
    private __engines: Array<BaseEngine> = new Array<BaseEngine>();

    private __defaultEngine: string = "ejs";

    //engines
    private __ejs: EJS = new EJS();
    private __markdown: Markdown = new Markdown();
    private __pug: Pug = new Pug();
    private __nunjucks: Nunjucks = new Nunjucks();
    private __mustache: Mustache = new Mustache();
    private __handlebars: Handlebars = new Handlebars();
    private __liquid: Liquid = new Liquid();
    
    constructor(opts?:any) {

        //register engines
        this.__engines.push(this.__ejs);
        this.__engines.push(this.__markdown);
        this.__engines.push(this.__pug);
        this.__engines.push(this.__nunjucks);
        this.__engines.push(this.__mustache);
        this.__engines.push(this.__handlebars);
        this.__engines.push(this.__liquid);

        //register mappings
        this.registerEngineMappings();

        //set the options
        if(opts) {
            if(this.isValidEngine(opts.defaultEngine)) {
                this.__defaultEngine = opts.defaultEngine;
            }
        }

    }

    get defaultEngine(): string {
        return this.__defaultEngine;
    }

    set defaultEngine(val:string) {
        if(this.isValidEngine(val)) {
            this.__defaultEngine = val;
        }
    }

    get mappings():EngineMap {
        return this.__mapping;
    }

    //Engines
    get ejs(): EJS {
        return this.__ejs;
    }

    get markdown(): Markdown {
        return this.__markdown;
    }

    get pug(): Pug {
        return this.__pug;
    }

    get nunjucks(): Nunjucks {
        return this.__nunjucks;
    }

    get mustache(): Mustache {
        return this.__mustache;
    }

    get handlebars(): Handlebars {
        return this.__handlebars;
    }

    get liquid(): Liquid {
        return this.__liquid;
    }

    //String Render
    async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string> {
        return "";
    }

    //Template Render
    async renderFromTemplate(templatePath:string, data?:object, filePathOutput?:string, rootPath?:string, engineName?:string): Promise<string> {
        return "";
    }

    getEngineByTemplatePath(filePath:string): string {
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

    //Engines
    isValidEngine(engineName:string): Boolean {
        let result = false;

        if(engineName !== undefined && this.__mapping.get(engineName) !== undefined) {
            result = true;
        }

        return result;
    }

    registerEngineMappings():void {
        this.__engines.forEach(eng => {
            this.__mapping.set(eng.name, eng.getExtensions());
        });
    }

    getRenderEngine(engineName:string): EngineInterface {
        let result = this.__ejs; //setting default

        switch(engineName.trim().toLowerCase()){
            case "markdown":
                result = this.__markdown;
                break;
            case "pug":
                result = this.__pug;
                break;
            case "nunjucks":
                result = this.__nunjucks;
                break;
            case "mustache":
                result = this.__mustache;
                break;
            case "handlebars":
                result = this.__handlebars;
                break;
            case "liquid":
                result = this.__liquid;
                break;
        }

        return result;
    }



}

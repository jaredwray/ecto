import { EngineMap } from "./engineMap";

export class TemplateEngine {

    private _mappings: Array<EngineMap> = new Array<EngineMap>();
    private _mappingCache: Map<string, string> = new Map<string, string>();

    private _defaultEngine: string = "hbs";

    baseDirectory = "";
    
    constructor() {
        this._mappings.push(new EngineMap("ejs", ["ejs"]));
        this._mappings.push(new EngineMap("markdown", ["md", "markdown"]));
        this._mappings.push(new EngineMap("hbs", ["hbs", "hjs", "handlebars"]));
        this.generateMappingCache();
    }

    get defaultEngine(): string {
        return this._defaultEngine;
    }

    get mappings():Array<any> {
        return this._mappings;
    }

    addMapping(mapping: EngineMap) {
        
        if(mapping.name !== undefined && mapping.extensions.length > 0) {
            if(this.engineExists(mapping.name) === false) {
                let isDuplicate = false;
                mapping.extensions.forEach(ext => {
                    if(this.getEngineByExtension(ext) !== undefined) {
                        isDuplicate = true;
                    }
                });

                if(isDuplicate === false) {
                    this._mappings.push(mapping);
                    this.generateMappingCache();
                }
            }
        }
    }

    generateMappingCache() {
        this._mappingCache = new Map<string, string>();

        this._mappings.forEach(mapping => {
            mapping.extensions.forEach(extension => {
                this._mappingCache.set(extension, mapping.name);
            });
        });
    }

    detect(filePath:string): string {
        let result = this.defaultEngine;

        if(filePath !== undefined) {
            let ext = filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);

            let engExt = this.getEngineByExtension(ext);
            if(engExt !== undefined) {
                result = engExt;
            }
        }

        return result;
    }

    engineExists(name:string): boolean {
        let result = false;
        
        if(name !== undefined) {
            this._mappings.forEach(mapping => {
                if(mapping.name.toLowerCase().trim() === name.toLowerCase().trim()) {
                    result = true;
                }
            });
        }
        return result;
    }

    getEngineByExtension(ext:string): string | undefined {
        let result = undefined;
        
        let name = this._mappingCache.get(ext);
        if(name !== undefined) {
            result = name;
        }

        return result;
    }

}

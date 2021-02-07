
export class EngineMap {

    private _mappings: Map<string, Array<string>> = new Map<string, Array<string>>();

    constructor() {

    }

    set(name:string, extensions:Array<string>): void {
        if(name !== undefined && extensions !== undefined) {
            let engineName = name.trim().toLowerCase();
            let engineExtensions = new Array<string>();
            //clean engine extensions
            extensions.forEach(ext => {
                ext = ext.trim().toLowerCase();
                if(!engineExtensions.includes(ext)){
                    engineExtensions.push(ext);
                }
            });

            this._mappings.set(engineName, engineExtensions);
        }
    }

    delete(name:string): void {
        this._mappings.delete(name.trim().toLowerCase());
    }

    deleteExtention(name:string, extension:string): void {
        let engineName = name.trim().toLowerCase();
        let extensions = this._mappings.get(engineName);
        if(extensions) {
            let engineExtensions = new Array<string>();
            extensions.forEach(ext => {
                if(ext !== extension.trim().toLowerCase()) {
                    engineExtensions.push(ext);
                }
            });

            this._mappings.set(engineName, engineExtensions);
        }
    }

    get(name:string): Array<string> | undefined {
        return this._mappings.get(name.trim().toLowerCase());
    }

    getName(extension:string): string | undefined {
        let engineName = undefined;
        
        this._mappings.forEach((extensions, name, map) => {
           if(extensions.includes(extension.trim().toLowerCase())) {
               engineName = name;
           } 
        });

        return engineName;
    }





}
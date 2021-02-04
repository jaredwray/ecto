
export class EngineMap {

    _name = "";
    _extensions = new Array<string>();

    constructor(name: string, extensions: Array<string>) {

        if(name !== undefined) {
            this._name = name;  
        }

        if(extensions !== undefined) {
            this._extensions = extensions;
        }
    }

    get name(): string {
        return this._name;
    }

    set name(val:string) {
        this._name = val;
    }

    get extensions(): Array<string> {
        return this._extensions;
    }

    set extensions(val: Array<string>) {
        if(val instanceof Array) {
            this._extensions = val;
        }
    }
}
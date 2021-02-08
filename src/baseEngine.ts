export class BaseEngine {
    
    private __extensions = Array<string>();
    name:string = "";
    opts?:any = undefined;
    engine: any = undefined;

    getExtensions(): Array<string> {
        return this.__extensions;
    }

    setExtensions(extensions:Array<string>): void {
        this.__extensions = new Array<string>();

        extensions.forEach(ext => {
            let newExt = ext.trim().toLowerCase();
            if(!this.__extensions.includes(newExt)) {
                this.__extensions.push(newExt);
            }
        });

    }

    deleteExtension(name: string) {
        
        this.__extensions.forEach( (ext, index) => {
            if(name.toLowerCase().trim() === ext) {
                this.__extensions.splice(index, 1);
            }
        });
    }

}
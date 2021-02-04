export class BaseEngine {
    
    private __extensions = Array<string>();
    private __name = "";

    get name() {
        return this.__name;
    }

    set name(val:string) {
        this.__name = val;
    }

    get extensions() {
        return this.__extensions;
    }

    addExtenstion(name: string) {

        let newExt = name.toLowerCase().trim();
        let exists = false;

        this.__extensions.forEach(ext => {
            if(newExt === ext) {
                exists = true;
            }
        });

        if(!exists) {
            this.__extensions.push(newExt);
        }
    }

    addExtenstions(extension: Array<string>) {
        extension.forEach(ext => {
            this.addExtenstion(ext);
        })
    }

    removeExtension(name: string) {
        
        this.__extensions.forEach( (ext, index) => {
            if(name.toLowerCase().trim() === ext) {
                this.__extensions.splice(index, 1);
            }
        });
    }

}
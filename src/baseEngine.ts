export class BaseEngine {
	private __extensions = new Array<string>();
	names = new Array<string>();
	opts?: any = undefined;
	engine: any;
	rootTemplatePath?: string = undefined;

	getExtensions(): string[] {
		return this.__extensions;
	}

	setExtensions(extensions: string[]): void {
		this.__extensions = new Array<string>();

		for (const ext of extensions) {
			const newExt = ext.trim().toLowerCase();
			if (!this.__extensions.includes(newExt)) {
				this.__extensions.push(newExt);
			}
		}
	}

	deleteExtension(name: string) {
		for (const [index, ext] of this.__extensions.entries()) {
			if (name.toLowerCase().trim() === ext) {
				this.__extensions.splice(index, 1);
			}
		}
	}
}

export class BaseEngine {
	names = new Array<string>();
	opts?: any = undefined;
	engine: any;
	rootTemplatePath?: string = undefined;
	private __extensions = new Array<string>();

	getExtensions(): string[] {
		return this.__extensions;
	}

	setExtensions(extensions: string[]): void {
		this.__extensions = new Array<string>();

		for (const extension of extensions) {
			const newExtension = extension.trim().toLowerCase();
			if (!this.__extensions.includes(newExtension)) {
				this.__extensions.push(newExtension);
			}
		}
	}

	deleteExtension(name: string) {
		for (const [index, extension] of this.__extensions.entries()) {
			if (name.toLowerCase().trim() === extension) {
				this.__extensions.splice(index, 1);
			}
		}
	}
}

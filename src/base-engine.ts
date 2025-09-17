export class BaseEngine {
	names = [] as string[];
	opts?: Record<string, unknown> = undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Different engines use different types, any is required for flexibility
	engine: any;
	rootTemplatePath?: string = undefined;
	private _extensions = [] as string[];

	getExtensions(): string[] {
		return this._extensions;
	}

	setExtensions(extensions: string[]): void {
		this._extensions = [] as string[];

		for (const extension of extensions) {
			const newExtension = extension.trim().toLowerCase();
			if (!this._extensions.includes(newExtension)) {
				this._extensions.push(newExtension);
			}
		}
	}

	deleteExtension(name: string) {
		for (const [index, extension] of this._extensions.entries()) {
			if (name.toLowerCase().trim() === extension) {
				this._extensions.splice(index, 1);
			}
		}
	}
}


export class EngineMap {
	private readonly _mappings: Map<string, string[]> = new Map<string, string[]>();

	constructor() {}

	set(name: string, extensions: string[]): void {
		const engineName = name.trim().toLowerCase();
		const engineExtensions = new Array<string>();

		if (extensions.length > 0 && name !== '') {
			// Clean engine extensions
			for (let ext of extensions) {
				ext = ext.trim().toLowerCase();
				if (!engineExtensions.includes(ext)) {
					engineExtensions.push(ext);
				}
			}

			this._mappings.set(engineName, engineExtensions);
		}
	}

	delete(name: string): void {
		this._mappings.delete(name.trim().toLowerCase());
	}

	deleteExtension(name: string, extension: string): void {
		const engineName = name.trim().toLowerCase();
		const extensions = this._mappings.get(engineName);
		if (extensions) {
			const engineExtensions = new Array<string>();
			for (const ext of extensions) {
				if (ext !== extension.trim().toLowerCase()) {
					engineExtensions.push(ext);
				}
			}

			this._mappings.set(engineName, engineExtensions);
		}
	}

	get(name: string): string[] | undefined {
		return this._mappings.get(name.trim().toLowerCase());
	}

	getName(extension: string): string | undefined {
		let engineName;

		this._mappings.forEach((extensions, name, map) => {
			if (extensions.includes(extension.trim().toLowerCase())) {
				engineName = name;
			}
		});

		return engineName;
	}
}

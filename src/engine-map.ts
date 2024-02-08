
export class EngineMap {
	private readonly _mappings: Map<string, string[]> = new Map<string, string[]>();

	set(name: string, extensions: string[]): void {
		const engineName = name.trim().toLowerCase();
		const engineExtensions = new Array<string>();

		if (extensions.length > 0 && name !== '') {
			// Clean engine extensions
			for (let extension of extensions) {
				extension = extension.trim().toLowerCase();
				if (!engineExtensions.includes(extension)) {
					engineExtensions.push(extension);
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
			for (const extension_ of extensions) {
				if (extension_ !== extension.trim().toLowerCase()) {
					engineExtensions.push(extension_);
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

		for (const [name, extensions] of this._mappings) {
			if (extensions.includes(extension.trim().toLowerCase())) {
				engineName = name;
			}
		}

		return engineName;
	}
}

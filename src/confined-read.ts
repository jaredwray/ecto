import fs from "node:fs";
import nodePath from "node:path";

/**
 * Read one file that stays inside the root.
 * The open and the check use the same descriptor.
 * A symlink is rejected.
 */
export function readInsideRoot(
	root: string,
	candidate: string,
): { text: string; filename: string } {
	const realRoot = fs.realpathSync(root);
	if (!fs.statSync(realRoot).isDirectory()) {
		throw new Error("Ecto rejects an include that leaves the template root.");
	}

	const resolved = nodePath.resolve(realRoot, candidate);
	const relative = nodePath.relative(realRoot, resolved);
	if (relative.startsWith("..") || nodePath.isAbsolute(relative)) {
		throw new Error("Ecto rejects an include that leaves the template root.");
	}

	const parts = relative.split(nodePath.sep);
	let current = realRoot;
	let stat: fs.Stats | undefined;
	for (const part of parts) {
		if (part === "") {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
		current = nodePath.join(current, part);
		stat = fs.lstatSync(current);
		if (stat.isSymbolicLink()) {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
	}

	if (!stat?.isFile()) {
		throw new Error("Ecto rejects an include that leaves the template root.");
	}

	const fd = fs.openSync(
		current,
		fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
	);
	try {
		const opened = fs.fstatSync(fd);
		if (opened.ino !== stat.ino || opened.dev !== stat.dev) {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
		return { text: fs.readFileSync(fd, "utf8"), filename: current };
	} finally {
		fs.closeSync(fd);
	}
}

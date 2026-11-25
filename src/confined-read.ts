import fs from "node:fs";
import nodePath from "node:path";

const directoryFlags =
	fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW;
const fileFlags = fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW;

/**
 * Read one file that stays inside the root.
 * The reader opens each path component from the parent descriptor.
 * The reader rejects a symlink.
 */
export function readInsideRoot(
	root: string,
	candidate: string,
): { text: string; filename: string } {
	const realRoot = fs.realpathSync(root);
	const relative = nodePath.relative(
		realRoot,
		nodePath.resolve(realRoot, candidate),
	);
	if (
		relative === "" ||
		relative.startsWith("..") ||
		nodePath.isAbsolute(relative)
	) {
		throw new Error("Ecto rejects an include that leaves the template root.");
	}

	const parts = relative.split(nodePath.sep);
	const fileName = parts[parts.length - 1] as string;
	let currentFd = fs.openSync(realRoot, directoryFlags);
	try {
		let current = realRoot;
		for (const part of parts.slice(0, -1)) {
			const nextFd = openChild(currentFd, part, directoryFlags);
			fs.closeSync(currentFd);
			currentFd = nextFd;
			current = nodePath.join(current, part);
		}
		const fileFd = openChild(currentFd, fileName, fileFlags);
		fs.closeSync(currentFd);
		currentFd = fileFd;
		if (!fs.fstatSync(currentFd).isFile()) {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
		return {
			text: fs.readFileSync(currentFd, "utf8"),
			filename: nodePath.join(current, fileName),
		};
	} finally {
		fs.closeSync(currentFd);
	}
}

/**
 * Open one child of an open directory.
 * O_NOFOLLOW rejects a symlink at this component.
 */
function openChild(dirfd: number, name: string, flags: number): number {
	try {
		return fs.openSync(`/dev/fd/${dirfd}/${name}`, flags);
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === "ELOOP" || code === "ENOTDIR") {
			throw new Error("Ecto rejects an include that leaves the template root.");
		}
		throw error;
	}
}

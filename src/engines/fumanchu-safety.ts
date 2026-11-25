import { fumanchu } from "@jaredwray/fumanchu";

/**
 * Helpers that read files, resolve paths, emit raw HTML, or walk
 * object prototypes. They stay off unless `unsafeHelpers` is set.
 */
const UNSAFE_HELPERS = [
	"read",
	"readdir",
	"embed",
	"md",
	"markdown",
	"absolute",
	"resolve",
	"get",
	"getObject",
	"merge",
	"forIn",
] as const;

const PATH_HELPERS = ["get", "getObject", "pick", "option", "i18n"] as const;

const KEY_HELPERS = ["merge", "extend", "forIn", "forOwn"] as const;

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

type UnsafeHelperName = (typeof UNSAFE_HELPERS)[number];

type HelperFunction = (this: unknown, ...args: unknown[]) => unknown;

type HelperEngine = {
	helpers: Record<string, HelperFunction | undefined>;
	registerHelper: (name: string, fn: HelperFunction) => void;
	unregisterHelper: (name: string) => void;
};

class BlockedObjectKeyError extends Error {
	constructor(helperName: string) {
		super(`The ${helperName} helper blocks this object key.`);
		this.name = "BlockedObjectKeyError";
	}
}

function isUnsafeHelperName(value: string): value is UnsafeHelperName {
	return (UNSAFE_HELPERS as readonly string[]).includes(value);
}

function enabledUnsafeHelpers(options?: Record<string, unknown>): Set<string> {
	const flag = options?.unsafeHelpers;
	if (flag === true) return new Set(UNSAFE_HELPERS);
	if (!Array.isArray(flag)) return new Set();

	const enabled = new Set<string>();
	for (const name of flag) {
		if (typeof name === "string" && isUnsafeHelperName(name)) {
			enabled.add(name);
		}
	}
	return enabled;
}

function isHelperOptions(
	value: unknown,
): value is { hash?: unknown; fn?: unknown; lookupProperty?: unknown } {
	if (!value || typeof value !== "object") return false;
	return "hash" in value && ("fn" in value || "lookupProperty" in value);
}

/**
 * Return true when a helper path contains a blocked key.
 * A path is a dot string or a list of path parts.
 */
function pathHasBlockedKey(value: unknown): boolean {
	if (typeof value === "string") {
		return value.split(".").some((part) => BLOCKED_KEYS.has(part));
	}
	if (Array.isArray(value)) {
		return value.some((part) => pathHasBlockedKey(part));
	}
	return false;
}

function assertNoBlockedKeys(
	helperName: string,
	value: unknown,
	seen = new WeakSet<object>(),
): void {
	if (!value || typeof value !== "object") return;
	if (seen.has(value)) return;
	seen.add(value);

	if (Array.isArray(value)) {
		for (const item of value) assertNoBlockedKeys(helperName, item, seen);
	} else {
		for (const key of Object.keys(value)) {
			if (BLOCKED_KEYS.has(key)) throw new BlockedObjectKeyError(helperName);
			assertNoBlockedKeys(
				helperName,
				(value as Record<string, unknown>)[key],
				seen,
			);
		}
	}
}

function wrapPathHelper(name: string, fn: HelperFunction): HelperFunction {
	return function pathHelper(this: unknown, ...args: unknown[]) {
		const path = args[0];
		if (!isHelperOptions(path) && pathHasBlockedKey(path)) {
			throw new BlockedObjectKeyError(name);
		}
		return fn.apply(this, args);
	};
}

function wrapKeyHelper(name: string, fn: HelperFunction): HelperFunction {
	return function keyHelper(this: unknown, ...args: unknown[]) {
		const last = args.at(-1);
		if (isHelperOptions(last)) {
			for (const value of args.slice(0, -1)) assertNoBlockedKeys(name, value);
			assertNoBlockedKeys(name, last.hash);
		} else {
			for (const value of args) assertNoBlockedKeys(name, value);
		}
		return fn.apply(this, args);
	};
}

function replaceHelper(
	engine: HelperEngine,
	name: string,
	wrap: (name: string, fn: HelperFunction) => HelperFunction,
): void {
	const current = engine.helpers[name];
	if (typeof current !== "function") return;
	engine.unregisterHelper(name);
	engine.registerHelper(name, wrap(name, current));
}

/**
 * Build a Fumanchu instance. Unsafe helpers stay off unless the
 * caller sets `unsafeHelpers` to true or to a list of helper names.
 */
export function createSafeFumanchu(
	options?: Record<string, unknown>,
): ReturnType<typeof fumanchu> {
	const engine = fumanchu() as ReturnType<typeof fumanchu> & HelperEngine;
	const enabled = enabledUnsafeHelpers(options);

	for (const name of UNSAFE_HELPERS) {
		if (!enabled.has(name) && typeof engine.helpers[name] === "function") {
			engine.unregisterHelper(name);
		}
	}

	for (const name of PATH_HELPERS) replaceHelper(engine, name, wrapPathHelper);
	for (const name of KEY_HELPERS) replaceHelper(engine, name, wrapKeyHelper);

	return engine;
}

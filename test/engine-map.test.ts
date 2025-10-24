import { expect, it } from "vitest";
import { EngineMap } from "../src/engine-map.js";

it("EngineMap - Default Name should be Blank", () => {
	const mappings = new EngineMap();
	expect(mappings.get("ejs")).toBe(undefined);
});

it("EngineMap - set with extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs"]);
	expect(mappings.get("ejs")?.toString()).toBe("ejs");
});

it("EngineMap - set with multiple extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md", "njk"]);
	expect(mappings.get("ejs")?.length).toBe(3);
});

it("EngineMap - set with duplicate extensions should deduplicate", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md", "ejs", "njk", "md"]);
	expect(mappings.get("ejs")?.length).toBe(3);
	expect(mappings.get("ejs")?.toString()).toBe("ejs,md,njk");
});

it("EngineMap - set with no extensions should be undefined", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", []);
	expect(mappings.get("ejs")?.length).toBe(undefined);
});

it("EngineMap - set with no extensions should be undefined", () => {
	const mappings = new EngineMap();
	mappings.set("", ["md"]);
	expect(mappings.get("")?.length).toBe(undefined);
});

it("EngineMap - delete with extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs"]);
	mappings.set("markdown", ["md"]);
	expect(mappings.get("ejs")?.toString()).toBe("ejs");
	mappings.delete("ejs");
	expect(mappings.get("ejs")?.toString()).toBe(undefined);
	expect(mappings.get("markdown")?.toString()).toBe("md");
});

it("EngineMap - deleteExtension with extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md", "njk"]);
	expect(mappings.get("ejs")?.length).toBe(3);
	mappings.deleteExtension("ejs", "njk");
	expect(mappings.get("ejs")?.toString()).toBe("ejs,md");
});

it("EngineMap - deleteExtension from non-existent engine should not error", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md"]);
	// Try to delete extension from an engine that doesn't exist
	mappings.deleteExtension("handlebars", "hbs");
	// Original engine should still be intact
	expect(mappings.get("ejs")?.toString()).toBe("ejs,md");
});

it("EngineMap - getName with extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md", "njk"]);
	expect(mappings.getName("md")).toBe("ejs");
});

it("EngineMap - getName with bad extensions", () => {
	const mappings = new EngineMap();
	mappings.set("ejs", ["ejs", "md", "njk"]);
	expect(mappings.getName("md1")).toBe(undefined);
});

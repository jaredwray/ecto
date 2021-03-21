import { EngineMap } from "../src/engineMap";

test("EngineMap - Default Name should be Blank", () => {
    let mappings = new EngineMap();
    expect(mappings.get("ejs")).toBe(undefined);
});

test("EngineMap - set with extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs"]);
    expect(mappings.get("ejs")?.toString()).toBe("ejs");
});

test("EngineMap - set with multiple extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs", "md", "njk"]);
    expect(mappings.get("ejs")?.length).toBe(3);
});

test("EngineMap - set with no extensions should be undefined", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", []);
    expect(mappings.get("ejs")?.length).toBe(undefined);
});

test("EngineMap - set with no extensions should be undefined", () => {
    let mappings = new EngineMap();
    mappings.set("", ["md"]);
    expect(mappings.get("")?.length).toBe(undefined);
});

test("EngineMap - delete with extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs"]);
    mappings.set("markdown", ["md"]);
    expect(mappings.get("ejs")?.toString()).toBe("ejs");
    mappings.delete("ejs");
    expect(mappings.get("ejs")?.toString()).toBe(undefined);
    expect(mappings.get("markdown")?.toString()).toBe("md");
});

test("EngineMap - deleteExtension with extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs", "md", "njk"]);
    expect(mappings.get("ejs")?.length).toBe(3);
    mappings.deleteExtension("ejs", "njk");
    expect(mappings.get("ejs")?.toString()).toBe("ejs,md");
});

test("EngineMap - getName with extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs", "md", "njk"]);
    expect(mappings.getName("md")).toBe("ejs");
});

test("EngineMap - getName with bad extensions", () => {
    let mappings = new EngineMap();
    mappings.set("ejs", ["ejs", "md", "njk"]);
    expect(mappings.getName("md1")).toBe(undefined);
});


import { BaseEngine } from "../src/baseEngine";

test("BaseEngine - Default Name should be Blank", () => {
    let be = new BaseEngine();
    expect(be.names.toString()).toBe("");
});

test("BaseEngine - Default Name should be Foo", () => {
    let be = new BaseEngine();
    be.names = ["foo"];
    expect(be.names.toString()).toBe("foo");
});

test("BaseEngine - Opts should be undefined", () => {
    let be = new BaseEngine();
    expect(be.opts).toBe(undefined);
});

test("BaseEngine - Opts should Have Data", () => {
    let be = new BaseEngine();
    let opts = { isValid: true};
    be.opts = opts;
    expect(be.opts).toBe(opts);
});

test("BaseEngine - getExtensions should be 0", () => {
    let be = new BaseEngine();
    expect(be.getExtensions().length).toBe(0);
});

test("BaseEngine - setExtensions should be 2", () => {
    let be = new BaseEngine();
    be.setExtensions(["md", "markdown"]);
    expect(be.getExtensions().length).toBe(2);
});

test("BaseEngine - setExtensions should be 2 with duplicate", () => {
    let be = new BaseEngine();
    be.setExtensions(["md", "markdown", "markdown"]);
    expect(be.getExtensions().length).toBe(2);
});

test("BaseEngine - deleteExtension should be 1", () => {
    let be = new BaseEngine();
    be.setExtensions(["md", "markdown"]);
    expect(be.getExtensions().length).toBe(2);
    be.deleteExtension("md");
    expect(be.getExtensions().length).toBe(1);
});

test("BaseEngine - deleteExtension should be 1 with case", () => {
    let be = new BaseEngine();
    be.setExtensions(["md", "markdown"]);
    expect(be.getExtensions().length).toBe(2);
    be.deleteExtension("Md ");
    expect(be.getExtensions().length).toBe(1);
});



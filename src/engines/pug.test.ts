import { Pug } from "./pug";

const exampleSource1 = "p #{name}'s Pug source code!";
const exampleData1 = { name: "John Doe"};
const exampleSource2 = "ul\neach val in items\n\tli= val";
const exampleData2 = { items: [1,2,3,4,5] };

test("Pug - Default Name Pug", () => {
    let engine = new Pug();
    expect(engine.name).toBe("pug");
});

test("Pug - Opts should be undefined by default", () => {
    let engine = new Pug();
    expect(engine.opts).toBe(undefined);
});

test("Pug - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new Pug(opts);
    expect(engine.opts.cool).toBe(true);
});

test("Pug - Extension should be a count of 1", () => {
    let engine = new Pug();
    expect(engine.getExtensions().length).toBe(2);
});

test("Pug - Rendering a simple string", async () => {
    let engine = new Pug();
    expect(await engine.render(exampleSource1, exampleData1)).toBe("<p>John Doe's Pug source code!</p>");
});

test("Pug - Rendering a list in html", async () => {
    let engine = new Pug();
    expect(await engine.render(exampleSource2, exampleData2)).toBe("<ul></ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>");
});

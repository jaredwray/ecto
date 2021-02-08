import { Mustache } from "./mustache";

const exampleSource1 = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
const exampleSource2 = "{{title}} spends {{calc}}";
const exampleData1 = { "name": "Alan", "hometown": "Somewhere, TX", "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
const exampleData2 = { title: "Joe", calc: function () { return 2 + 4; }};

test("Mustache - Default Name mustache", () => {
    let engine = new Mustache();
    expect(engine.name).toBe("mustache");
});

test("Mustache - Opts should be undefined by default", () => {
    let engine = new Mustache();
    expect(engine.opts).toBe(undefined);
});

test("Mustache - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new Mustache(opts);
    expect(engine.opts).toBe(opts);
});

test("Mustache - Extension should be a count of 1", () => {
    let engine = new Mustache();
    expect(engine.getExtensions().length).toBe(1);
});

test("Mustache - Rendering a simple string", async () => {
    let engine = new Mustache();
    expect(await engine.render(exampleSource2, exampleData2)).toContain("6");
});

test("Mustache - Rendering a simple string after inital render", async () => {
    let engine = new Mustache();
    expect(await engine.render(exampleSource1, exampleData1)).toContain("<ul><li>Jimmy is 12</li><li>Sally is 4</li></ul>");
});
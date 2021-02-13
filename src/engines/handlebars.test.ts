import { Handlebars } from "./handlebars";
import * as fs from "fs-extra";

const exampleSource1 = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
const exampleSource2 = "<p>Hello, my name is {{name}}. I am from {{hometown}}. </p>";
const exampleData1 = { "name": "Alan", "hometown": "Somewhere, TX", "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};

const testTemplateDir = "./testing/handlebars";

test("Handlebars - Default Name ejs", () => {
    let engine = new Handlebars();
    expect(engine.name).toBe("handlebars");
});

test("Handlebars - Opts should be undefined by default", () => {
    let engine = new Handlebars();
    expect(engine.opts).toBe(undefined);
});

test("Handlebars - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new Handlebars(opts);
    expect(engine.opts).toBe(opts);
});

test("Handlebars - Extension should be a count of 1", () => {
    let engine = new Handlebars();
    expect(engine.getExtensions().length).toBe(3);
});

test("Handlebars - Rendering a simple string", async () => {
    let engine = new Handlebars();
    expect(await engine.render(exampleSource1, exampleData1)).toContain("Alan");
});

test("Handlebars - Rendering a simple string after inital render", async () => {
    let engine = new Handlebars();
    expect(await engine.render(exampleSource1, exampleData1)).toContain("Alan");
    expect(await engine.render(exampleSource2, exampleData1)).toContain("Somewhere, TX");
});

test("Handlebars - Test Rendering Helper Date", async () => {
    let engine = new Handlebars();
    let source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. {{year}} </p>";
    let year = new Date().getFullYear().toString();
    expect(await engine.render(source, exampleData1)).toContain(year);
});

test("Handlebars - Test Rendering Helper isEmpty Array", async () => {
    let engine = new Handlebars();
    let data = { name: "Joe", hometown: "Somewhere, TX", jobs: []};
    let source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. {{year}} {{isEmpty jobs}} </p>";
    expect(await engine.render(source, data)).toContain("true");
});

test("Handlebars - Rendering with Partials", async () => {
    let engine = new Handlebars();
    let source = await fs.readFile(testTemplateDir + "/example1.hbs", "utf8");
    engine.rootTemplatePath = testTemplateDir;
    
    expect(await engine.render(source, exampleData1)).toContain("Alan's - Header Title");
});
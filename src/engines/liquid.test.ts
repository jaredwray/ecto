import { Liquid } from "../../src/engines/liquid";
import * as fs from "fs-extra";

const exampleSource1 = "{{name | capitalize}}";
const exampleData1 = { name: "john Doe"};
const exampleSource2 = "<ul> {% for todo in todos %} <li>{{forloop.index}} - {{todo}}</li> {% endfor %}</ul>";
const exampleData2 = { todos: ["unit tests", "wash car", "go running", "bycicle"], name: "John Doe" };

const testTemplateDir = "./test-data/liquid";

test("Liquid - Default Name Liquid", () => {
    let engine = new Liquid();
    expect(engine.names.toString()).toContain("liquid");
});

test("Liquid - Opts should be undefined by default", () => {
    let engine = new Liquid();
    expect(engine.opts).toBe(undefined);
});

test("Liquid - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new Liquid(opts);
    expect(engine.opts.cool).toBe(true);
});

test("Liquid - Extension should be a count of 1", () => {
    let engine = new Liquid();
    expect(engine.getExtensions().length).toBe(1);
});

test("Liquid - Rendering a simple string", async () => {
    let engine = new Liquid();
    expect(await engine.render(exampleSource1, exampleData1)).toBe("John Doe");
});

test("Liquid - Rendering a list in html", async () => {
    let engine = new Liquid();
    expect(await engine.render(exampleSource2, exampleData2)).toBe("<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>");
});

test("Liquid - Rendering Partials", async () => {
    let engine = new Liquid();
    let source = await fs.readFile(testTemplateDir + "/example1.liquid", "utf8");
    
    engine.rootTemplatePath = testTemplateDir;

    let output = await engine.render(source, exampleData2);

    expect(output).toContain("<ul>  <li>1 - unit tests</li>  <li>2 - wash car</li>  <li>3 - go running</li>  <li>4 - bycicle</li> </ul>");
    expect(output).toContain("John Doe");

});

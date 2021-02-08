import { Nunjucks } from "./nunjucks";

const exampleSource1 = "Hello {{ username }}";
const exampleData1 = { username: "john.doe" };
const exampleSource2 = "<h1>Posts</h1><ul>{% for item in items %}<li>{{ item.title }}</li>{% else %}<li>This would display if the 'item' collection were empty</li>{% endfor %}</ul>";
const exampleData2 = { items: [{ title: "foo", id: 1 }, { title: "bar", id: 2}] };

test("Nunjucks - Default Name Nunjucks", () => {
    let engine = new Nunjucks();
    expect(engine.name).toBe("nunjucks");
});

test("Nunjucks - Opts should be set by", () => {
    let engine = new Nunjucks();
    expect(engine.opts.autoescape).toBe(true);
});

test("Nunjucks - Opts should be undefined by default", () => {
    let engine = new Nunjucks({ autoescape: false});
    expect(engine.opts.autoescape).toBe(false);
});

test("Nunjucks - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new Nunjucks(opts);
    expect(engine.opts).toBe(opts);
});

test("Nunjucks - Extension should be a count of 1", () => {
    let engine = new Nunjucks();
    expect(engine.getExtensions().length).toBe(1);
});

test("Nunjucks - Rendering a simple string", async () => {
    let engine = new Nunjucks();
    expect(await engine.render(exampleSource1, exampleData1)).toContain("john.doe");
});

test("Nunjucks - Rendering a list / ul html", async () => {
    let engine = new Nunjucks();
    expect(await engine.render(exampleSource2, exampleData2)).toContain("<h1>Posts</h1><ul><li>foo</li><li>bar</li></ul>");
});

test("Nunjucks - Rendering no data", async () => {
    let engine = new Nunjucks();
    expect(await engine.render(exampleSource2, [])).toBe("<h1>Posts</h1><ul><li>This would display if the 'item' collection were empty</li></ul>");
});
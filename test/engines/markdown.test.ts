import { Markdown } from "../../src/engines/markdown";

const exampleSource1 = "# markdown rulezz!";
const exampleSource2 = "_markdown_ rulezz!";

test("Markdown - Default Name markdown", () => {
    let engine = new Markdown();
    expect(engine.names.toString()).toContain("markdown");
});

test("Markdown - Setting Opts on the Constructor", () => {
    let opts = {
        variables: {
            name: 'Variable1',
            frontmatter: {
                title: 'Variable content'
            }
        },
    }
    let engine = new Markdown(opts);
    expect(engine.opts).toBe(opts);
});

test("Markdown - Rendering with default Opts", async () => {
    let engine = new Markdown();
    engine.opts = undefined;
    expect(await engine.render(exampleSource1)).toContain("<h1>markdown rulezz!</h1>");
});

test("Markdown - Extension should be a count of 2", () => {
    let engine = new Markdown();
    expect(engine.getExtensions().length).toBe(2);
});

test("Markdown - Rendering a simple string", async () => {
    let engine = new Markdown();
    expect(await engine.render(exampleSource1)).toContain("</h1>");
});

test("Markdown - Rendering a simple string after inital render", async () => {
    let engine = new Markdown();
    expect(await engine.render(exampleSource1)).toContain("<h1");
    expect(await engine.render(exampleSource2)).toContain("<em>");
});

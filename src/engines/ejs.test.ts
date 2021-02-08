import { EJS } from "./ejs";

const simpleString1 = "<% if (user) { %><h2><%= user.name %></h2><% } %>";
const simpleString2 = "<% if (test) { %><h2><%= test.foo %></h2><% } %>";

test("EJS - Default Name ejs", () => {
    let engine = new EJS();
    expect(engine.name).toBe("ejs");
});

test("EJS - Opts should be undefined by default", () => {
    let engine = new EJS();
    expect(engine.opts).toBe(undefined);
});

test("EJS - Setting Opts on the Constructor", () => {
    let opts = {cool: true};
    let engine = new EJS(opts);
    expect(engine.opts).toBe(opts);
});

test("EJS - Extension should be a count of 1", () => {
    let engine = new EJS();
    expect(engine.getExtensions().length).toBe(1);
});

test("EJS - Rendering a simple string", async () => {
    let engine = new EJS();
    let data = { user: { name: "Joe" } };
    expect(await engine.render(simpleString1, data)).toContain("Joe");
});

test("EJS - Rendering a simple string after inital render", async () => {
    let engine = new EJS();
    let data = { user: { name: "Joe" }, test: { foo: "bar" } };
    expect(await engine.render(simpleString1, data)).toContain("Joe");
    expect(await engine.render(simpleString2, data)).toContain("Bar");
});
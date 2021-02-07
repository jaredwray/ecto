import { Ecto } from "./ecto";

const engines: Array<string> = ["ejs", "markdown", "pug", "nunjucks", "mustache", "handlebars", "liquid"];

test("Init and Verify defaultEngine", () => {
    let ecto = new Ecto();
    expect(ecto.defaultEngine).toBe("ejs");
});

test("Options Should Set defaultEngine", () => {
    let ecto = new Ecto({defaultEngine: "handlebars"});
    expect(ecto.defaultEngine).toBe("handlebars");
});

test("Options Should Stay EJS if invalid defaultEngine", () => {
    let ecto = new Ecto({defaultEngine: "cool"});
    expect(ecto.defaultEngine).toBe("ejs");
});

test("Set defaultEngine as valid", () => {
    let ecto = new Ecto();
    ecto.defaultEngine = "pug";
    expect(ecto.defaultEngine).toBe("pug");
});

test("Set defaultEngine as invalid", () => {
    let ecto = new Ecto();
    ecto.defaultEngine = "cool";
    expect(ecto.defaultEngine).toBe("ejs");
});

test("EJS should be registered", () => {
    let ecto = new Ecto();
    expect(ecto.mappings.get("ejs")?.length).toBe(1);
});

test("Handlebars should be registered", () => {
    let ecto = new Ecto();
    expect(ecto.mappings.get("handlebars")?.length).toBe(3);
});

test("EJS is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.ejs.name).toBe("ejs");
});

test("markdown is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.markdown.name).toBe("markdown");
});

test("pug is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.pug.name).toBe("pug");
});

test("nunjucks is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.nunjucks.name).toBe("nunjucks");
});

test("mustache is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.mustache.name).toBe("mustache");
});

test("handlebars is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.handlebars.name).toBe("handlebars");
});

test("liquid is valid instance", () => {
    let ecto = new Ecto();
    expect(ecto.liquid.name).toBe("liquid");
});

test("isValidEngine should return true", () => {
    let ecto = new Ecto();
    expect(ecto.isValidEngine("pug")).toBe(true);
});

test("isValidEngine should return false because bad name", () => {
    let ecto = new Ecto();
    expect(ecto.isValidEngine("cool")).toBe(false);
});

test("registerEngineMappings should register mappings", () => {
    let ecto = new Ecto();

    ecto.mappings.deleteExtension("handlebars", "hbs");
    expect(ecto.mappings.get("handlebars")?.includes("hbs")).toBe(false);

    ecto.registerEngineMappings();

    expect(ecto.mappings.get("handlebars")?.includes("hbs")).toBe(true);
});

test("getRenderEngine should return the default ejs", () => {
    let ecto = new Ecto();
    
    expect(ecto.getRenderEngine("cool").name).toBe("ejs");
});

test("getRenderEngine should return valid for each", () => {
    let ecto = new Ecto();
    
    engines.forEach(engine => {
        expect(ecto.getRenderEngine(engine).name).toBe(engine);
    });
});

test("getEngineByTemplatePath should return default ejs", () => {
    let ecto = new Ecto();
    
    expect(ecto.getEngineByTemplatePath("foo.html")).toBe("ejs");
});

test("getEngineByTemplatePath should return nunjucks", () => {
    let ecto = new Ecto();
    
    expect(ecto.getEngineByTemplatePath("foo.njk")).toBe("nunjucks");
});

test("getEngineByTemplatePath should return pug for jade", () => {
    let ecto = new Ecto();
    
    expect(ecto.getEngineByTemplatePath("./this/is/a/long/pathfoo.jade")).toBe("pug");
});
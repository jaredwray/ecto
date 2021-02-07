test("Init TemplateEngine", () => {
    let ecto = require("./index");
    expect(ecto.engine.baseDirectory).toBe("");
});
test("Init and Verify defaultEngine", () => {
    const Ecto = require("./index");
    let ecto = new Ecto();
    expect(ecto.defaultEngine).toBe("ejs");
});
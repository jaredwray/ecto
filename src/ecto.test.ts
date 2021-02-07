import { Ecto } from "./ecto";

test("Init TemplateEngine", () => {
    let ecto = new Ecto();
    expect(ecto.defaultEngine).toBe("ejs");
});
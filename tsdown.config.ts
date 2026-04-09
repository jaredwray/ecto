import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/ecto.ts"],
	format: "esm",
	dts: true,
	clean: true,
});

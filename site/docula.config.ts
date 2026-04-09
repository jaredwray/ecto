import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import type { DoculaConsole, DoculaOptions } from "docula";

export const options: Partial<DoculaOptions> = {
	githubPath: "jaredwray/ecto",
	siteTitle: "Ecto",
	siteDescription:
		"Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars",
	siteUrl: "https://ecto.org",
	autoReadme: false,
	themeMode: 'light',
};

export const onPrepare = async (
	config: DoculaOptions,
	doculaConsole?: DoculaConsole,
): Promise<void> => {
	const readmePath = path.join(process.cwd(), "./README.md");
	const readmeSitePath = path.join(config.sitePath, "README.md");
	const readme = await fs.promises.readFile(readmePath, "utf8");
	const updatedReadme = readme.replace(
		/^!\[Ecto\]\(site\/logo\.svg(?:\s+"[^"]*")?\)\s*\n+/,
		"",
	);
	const message = `writing updated readme to ${readmeSitePath}`;
	if (doculaConsole) {
		doculaConsole.info(message);
	} else {
		console.info(message);
	}
	await fs.promises.writeFile(readmeSitePath, updatedReadme);
};

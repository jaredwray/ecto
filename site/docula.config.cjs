const path = require('node:path');
const process = require('node:process');
const fs = require('node:fs');

module.exports.options = {
	githubPath: 'jaredwray/ecto',
	siteTitle: 'Ecto',
	siteDescription: 'Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars',
	siteUrl: 'https://ecto.org',
};

module.exports.onPrepare = async config => {
	const readmePath = path.join(process.cwd(), './README.md');
	const readmeSitePath = path.join(config.sitePath, 'README.md');
	const readme = await fs.promises.readFile(readmePath, 'utf8');
	const updatedReadme = readme.replace('![Ecto](ecto_logo.png "Ecto")\n\n', '');
	console.log('writing updated readme to', readmeSitePath);
	await fs.promises.writeFile(readmeSitePath, updatedReadme);
};

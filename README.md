![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/ecto-build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/ecto-release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/master/graph/badge.svg)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/package/ecto)

-----

## Features
* Zero Config by default.
* Async `render` and `templateRender` functions for ES6 and Typescript. 
* Render via Template File with Automatic Engine Selection. No more selecting which engine to use as it does it for you based on file extension.
* Only the Top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars
* Maintained with Monthly Updates! 

## Only the Top Template Engines and Their Extensions

| Engine     | Monthly Downloads                                                                              | Extensions              |
| ---------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| [EJS](https://www.npmjs.com/package/ejs)        | [![npm](https://img.shields.io/npm/dm/ejs)](https://npmjs.com/package/ejs)                 | .ejs                    |
| [Markdown](https://www.npmjs.com/package/markdown-it)   | [![npm](https://img.shields.io/npm/dm/markdown-it)](https://npmjs.com/package/markdown-it) | .markdown, .md          |
| [Pug](https://www.npmjs.com/package/pug)        | [![npm](https://img.shields.io/npm/dm/pug)](https://npmjs.com/package/pug)                 | .pug, .jade             |
| [Nunjucks](https://www.npmjs.com/package/nunjucks)   | [![npm](https://img.shields.io/npm/dm/nunjucks)](https://npmjs.com/package/nunjucks)       | .njk                    |
| [Mustache](https://www.npmjs.com/package/mustache)   | [![npm](https://img.shields.io/npm/dm/mustache)](https://npmjs.com/package/mustache)       | .mustache               |
| [Handlebars](https://www.npmjs.com/package/handlebars) | [![npm](https://img.shields.io/npm/dm/handlebars)](https://npmjs.com/package/handlebars)   | .handlebars, .hbs, .hls |
| [Liquid](https://www.npmjs.com/package/liquidjs)     | [![npm](https://img.shields.io/npm/dm/liquidjs)](https://npmjs.com/package/liquidjs)       | .liquid                 |               |

-----

## Render via Template File with Automatic Engine Selection

To render via a template file it is as simple as calling the `templateRender` function with a couple simple parameters to be passed in. In this example we are simply passing in the template and it will return a `string`.

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

//templatePath:string, data:object, filePathOutput?:string, engineName?:string
let output = await ecto.templateRender("./path/to/template.ejs", data);

```
In this example we are now asking it to write the output file for us and it will return the output still as a `string`:

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

//templatePath:string, data:object, filePathOutput?:string, engineName?:string
let output = await ecto.templateRender("./path/to/template.ejs", data, "./path/to/output/yourname.html");

```

Notice that in these examples it is using the `./path/to/template.ejs` to use the engine [EJS](https://www.npmjs.com/package/ejs) for the rendering. 

You can override the auto selected engine by adding it on the function as a paramater:

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

//templatePath:string, data:object, filePathOutput?:string, engineName?:string
let output = await ecto.templateRender("./path/to/template.ejs", data, "./path/to/output/yourname.html", "pug");

```

-----

## API

`Render(sourceDir:string, data:obj, fileOutput?:string): string (returns rendered output)`

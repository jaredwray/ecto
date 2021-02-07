![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/ecto-build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/ecto-release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/master/graph/badge.svg)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/package/ecto)

-----

## Getting Started -- It's that Easy!

Step 1: Add Ecto to your Project
```
yarn add ecto
```

Step 2: Declate and Initialize
```javascript
const Ecto = require("ecto");
let ecto = new Ecto();
```

Step 3: Render via String for EJS ([Default Engine](#))
```javascript
let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"}
//async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data);
```

Here is how it looks all together after you have added it as a package via `yarn add ecto`!
```javascript
const Ecto = require("ecto");
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
//async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data);

console.log(output);
```

Next Steps:
* [More examples on Render via String](#render-via-string)
* [More examples on Render via Template File](#render-via-template-file-with-automatic-engine-selection)
* [Examples by Specific Engines](#examples-by-specific-engines)
* [Check out the entire API / Functions](#api)

-----

## Features
* Zero Config by default.
* Async `render` and `templateRender` functions for ES6 and Typescript. 
* Render via Template File with Automatic Engine Selection. No more selecting which engine to use as it does it for you based on file extension.
* Only the Top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars
* Maintained with Monthly Updates! 

## Only the Top Template Engines and Their Extensions

While doing research for other projects one of the reasons we decided to not use other consolidation engines is that the support is all over the place. Some of the packages were unsupported and most likely hard to validate as working. Our goal is to support the top engines which most likely handle the vast majority of use cases. 

| Engine     | Monthly Downloads                                                                              | Extensions              |
| ---------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| [EJS](https://www.npmjs.com/package/ejs)        | [![npm](https://img.shields.io/npm/dm/ejs)](https://npmjs.com/package/ejs)                 | .ejs                    |
| [Markdown](https://www.npmjs.com/package/markdown-it)   | [![npm](https://img.shields.io/npm/dm/markdown-it)](https://npmjs.com/package/markdown-it) | .markdown, .md          |
| [Pug](https://www.npmjs.com/package/pug)        | [![npm](https://img.shields.io/npm/dm/pug)](https://npmjs.com/package/pug)                 | .pug, .jade             |
| [Nunjucks](https://www.npmjs.com/package/nunjucks)   | [![npm](https://img.shields.io/npm/dm/nunjucks)](https://npmjs.com/package/nunjucks)       | .njk                    |
| [Mustache](https://www.npmjs.com/package/mustache)   | [![npm](https://img.shields.io/npm/dm/mustache)](https://npmjs.com/package/mustache)       | .mustache               |
| [Handlebars](https://www.npmjs.com/package/handlebars) | [![npm](https://img.shields.io/npm/dm/handlebars)](https://npmjs.com/package/handlebars)   | .handlebars, .hbs, .hls |
| [Liquid](https://www.npmjs.com/package/liquidjs)     | [![npm](https://img.shields.io/npm/dm/liquidjs)](https://npmjs.com/package/liquidjs)       | .liquid                 |               |

_The `Extensions` are listed above for when we Render via Template file which you can learn about [here](#render-via-template-file-with-automatic-engine-selection)._

-----

## Render via String

As we have shown in [Getting Started -- It's that Easy!](#getting-started----its-that-easy) you can do a render in only a couple lines of code: 
```javascript
const Ecto = require("ecto");
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
//async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data);

console.log(output);
```

Now lets say your engine is not [EJS](https://www.npmjs.com/package/ejs) so you want to specify it. You can either set the [defaultEngine]() parameter or simply pass it in the `render` function. Here we are doing [Handlebars](https://www.npmjs.com/package/handlebars):

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();

let source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
let data = {firstName: "John", lastName: "Doe"};
//async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data, "handlebars");

console.log(output);
```


`render` also can write out the file for you by specifying the `filePathOutput` parameter like below. It will still return the output via `string`:

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
//async render(source:string, data?:object, engineName?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data, undefined, "./path/to/output/file.html");

console.log(output);
```

Notice the `undefined` passed into the `engineName` parameter. This is done because we already have the [defaultEngine]() set to [EJS](https://www.npmjs.com/package/ejs). If you want you can easily add it in by specifying it.

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

You can override the auto selected engine by adding it on the function as a parameter by passing in `pug` in this example:

```javascript
const Ecto = require("ecto");
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

//templatePath:string, data:object, filePathOutput?:string, engineName?:string
let output = await ecto.templateRender("./path/to/template.ejs", data, "./path/to/output/yourname.html", "pug");

```

This will override the auto selection process and render the template using the [Pug](https://www.npmjs.com/package/pug) engine. 

-----

## Examples by Specific Engines

### Markdown

### Handlebars

-----

## API

### Parameter: `defaultEngine:String`
By default the system is set to [EJS](https://www.npmjs.com/package/ejs) but if you are using a different engine no problem as you can easily change the default like so:
```
let ecto = new Ecto();
ecto.defaultEngine = "pug" //we support ejs, markdown, pug, nunjucks, mustache, handlebars, and liquid
```
From there you can do the default `render` and it just works! Now if you want to just pass it on the command line you can by doing the following on render which will overwrite the `defaultEngine`: 
```
let ecto = new Ecto();
let output = await ecto.render(source, data, "pug", "./path/to/output/file.html");
```

### Function: `render(sourceDir:string, data:obj, fileOutput?:string): string (returns rendered output)`

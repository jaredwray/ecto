![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/ecto-build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/ecto-release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/main/graph/badge.svg?token=dpbFqSW5Kh)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/package/ecto)

-----

## Features
* Zero Config by default.
* Async `render` and `renderFromFile` functions for ES6 and Typescript. 
* Render via Template File with Automatic Engine Selection. No more selecting which engine to use as it does it for you based on file extension.
* Only the Top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars
* Maintained with Monthly Updates! 

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
//async render(source:string, data?:object, engineName?:string, rootTemplatePath?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data);
```

Here is how it looks all together after you have added it as a package via `yarn add ecto`!
```javascript
const Ecto = require("ecto");
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
//async render(source:string, data?:object, engineName?:string, rootTemplatePath?:string, filePathOutput?:string): Promise<string>
let output = await ecto.render(source, data);

console.log(output);
```

Next Steps:
* [More examples on Render via String](#render-via-string)
* [More examples on Render via Template File](#render-via-template-file-with-automatic-engine-selection)
* [Examples by Specific Engines](#examples-by-specific-engines)
* [Check out the entire API / Functions](#api)

-----

## Only the Top Template Engines and Their Extensions

While doing research for enabling other projects to handle multiple template engines we decided to not use other consolidation engines as they were all over the place. Some of the packages were unsupported and most likely hard to validate as working. Some had had limited types and ease of use. 

Our goal is to support the top engines which most likely handle the vast majority of use cases and just make it easy. Here are the top engines that we support and make easy:

| Engine     | Monthly Downloads                                                                              | Extensions              |
| ---------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| [EJS](https://www.npmjs.com/package/ejs)        | [![npm](https://img.shields.io/npm/dm/ejs)](https://npmjs.com/package/ejs)                 | .ejs                    |
| [Markdown](https://www.npmjs.com/package/markdown-it)   | [![npm](https://img.shields.io/npm/dm/markdown-it)](https://npmjs.com/package/markdown-it) | .markdown, .md          |
| [Pug](https://www.npmjs.com/package/pug)        | [![npm](https://img.shields.io/npm/dm/pug)](https://npmjs.com/package/pug)                 | .pug, .jade             |
| [Nunjucks](https://www.npmjs.com/package/nunjucks)   | [![npm](https://img.shields.io/npm/dm/nunjucks)](https://npmjs.com/package/nunjucks)       | .njk                    |
| [Mustache](https://www.npmjs.com/package/mustache)   | [![npm](https://img.shields.io/npm/dm/mustache)](https://npmjs.com/package/mustache)       | .mustache               |
| [Handlebars](https://www.npmjs.com/package/handlebars) | [![npm](https://img.shields.io/npm/dm/handlebars)](https://npmjs.com/package/handlebars)   | .handlebars, .hbs, .hjs |
| [Liquid](https://www.npmjs.com/package/liquidjs)     | [![npm](https://img.shields.io/npm/dm/liquidjs)](https://npmjs.com/package/liquidjs)       | .liquid                 |               |

_The `Extensions` are listed above for when we [Render via Template File](#render-via-template-file-with-automatic-engine-selection)._

-----

## Render via String

As we have shown in [Getting Started -- It's that Easy!](#getting-started----its-that-easy) you can do a render in only a couple lines of code: 
```javascript
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
let output = await ecto.render(source, data);

console.log(output);
```

Now lets say your engine is not [EJS](https://www.npmjs.com/package/ejs) so you want to specify it. You can either set the [defaultEngine](#parameter-defaultengine) parameter or simply pass it in the `render` function. Here we are doing [Handlebars](https://www.npmjs.com/package/handlebars):

```javascript
let ecto = new Ecto();

let source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
let data = {firstName: "John", lastName: "Doe"};
let output = await ecto.render(source, data, "handlebars");

console.log(output);
```

`render` also can handle partial files for you standard engines (markdown excluded) by just adding the `rootTemplatePath`:

```javascript
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1><%- include('/relative/path/to/partial'); %>";
let data = {firstName: "John", lastName: "Doe"};
let output = await ecto.render(source, data, undefined, "./path/to/templates");

console.log(output);
```

`render` also can write out the file for you by specifying the `filePathOutput` parameter like below. It will still return the output via `string`:

```javascript
let ecto = new Ecto();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
let output = await ecto.render(source, data, undefined, undefined, "./path/to/output/file.html");

console.log(output);
```

Notice the `undefined` passed into the `engineName` parameter. This is done because we already have the [defaultEngine](#parameter-defaultengine) set to [EJS](https://www.npmjs.com/package/ejs). If you want you can easily add it in by specifying it.

-----

## Render via Template File with Automatic Engine Selection

To render via a template file it is as simple as calling the `renderFromFile` function with a couple simple parameters to be passed in. In this example we are simply passing in the template and it will return a `string`.

```javascript
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

let output = await ecto.renderFromFile("./path/to/template.ejs", data);

```
In this example we are now asking it to write the output file for us and it will return the output still as a `string`:

```javascript
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

let output = await ecto.renderFromFile("./path/to/template.ejs", data, undefined,"./path/to/output/yourname.html");

```

Notice that in these examples it is using the `./path/to/template.ejs` to use the engine [EJS](https://www.npmjs.com/package/ejs) for the rendering. 

You can override the auto selected engine by adding it on the function as a parameter by passing in `pug` in this example:

```javascript
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

let output = await ecto.renderFromFile("./path/to/template.ejs", data, undefined, "./path/to/output/yourname.html", "pug");

```

This will override the auto selection process and render the template using the [Pug](https://www.npmjs.com/package/pug) engine. 

-----

## Examples by Specific Engines

### Markdown

Markdown is a bit differnt as it will not have some of the complexities such as `data` objects or partials and layouts. To render markdown it is this easy:
```javascript
let ecto = Ecto();
let source = "# markdown-it rulezz!";
let output = await ecto.render(source, undefined, "markdown");

console.log(output); //should be <h1>markdown-it rulezz!</h1>
```
Render by File

```javascript
let ecto = Ecto();
let output = await ecto.renderByFile("/path/to/file.md");

console.log(output);
```

### Handlebars



-----

## API

The API is focused on using the main `Ecto` class:

```javascript
const Ecto = require("Ecto");

let ecto = new Ecto();

//ecto.<API> -- functions and parameters

```

### Functions:
* render (`async`) - Render from a string.
    * source:string - the markup/template source that you would like to render
    * data?:object - data to be rendered by the file
    * engineName?:string - to override the `Ecto.defaultEngine` parameter
    * rootTemplatePath?:string - root template path that is used for `patials` and `layouts`
    * filePathOutput?:string - specify the file path if you would like to write out the rendered output. 
* renderFromFile (`async`) - Render from a file path and will auto select what engine to use based off of extension. It will return a `Promise<string>` of the rendered output.
    * filePath?:string - the file that you would like to render
    * data?:object - data to be rendered by the file
    * rootTemplatePath?:string - root template path that is used for `patials` and `layouts`
    * filePathOutput?:string - specify the file path if you would like to write out the rendered output. 
    * engineName?:string - to override the auto selection of the engineName

### Parameters:
* defaultEngine:string = the default engine to use and set by default to `ejs`
* mappings:EngineMap - Mapping class of all the engines registered in the system. 

### Engines

To make it easier to access certain engines and change them all engins supported are provided as parameters directly on the `Ecto` class as `Ecto.<EngineFullName>` such as:
```javascript
let ecto = Ecto();
console.log(ecto.Handlebars.name); // will return "handlebars"
```

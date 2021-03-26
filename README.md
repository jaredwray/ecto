![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/ecto-build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/ecto-release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/main/graph/badge.svg?token=dpbFqSW5Kh)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/package/ecto)

-----

## Features
* Zero Config by default but all properties exposed for flexibility. Check out our easy [API.](#api)
* Async `render` and `renderFromFile` functions for ES6 and Typescript. 
* [Render via Template File](#render-from-file) with Automatic Engine Selection. No more selecting which engine to use, engine choice is automatically decided based on the file extension.
* [Only the Top Template Engines](#only-the-top-template-engines-and-their-extensions): EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars.
* Maintained with Monthly Updates! 

-----

## Getting Started

Follow these steps to add Ecto to a new or existing JavaScript project:

1. Ensure Node.js is installed. For macOS and Linux, you can install Node.js in the terminal using Homebrew:

```
brew install node
```

The [Node.js package manager documentation](https://nodejs.org/en/download/package-manager/) provides the commands needed to complete the install on Windows and other operating systems.

2. Open the terminal for your project and run `npm install ` to ensure all project dependencies are correctly installed.

```
npm install
```

3. Add Ecto to your Project. `yarn` is a package manager you can learn about [here.](https://yarnpkg.com/)

```
yarn add ecto
```

4.  Declare and Initialize.

```javascript
const Ecto = require("ecto").Ecto;
let ecto = new Ecto();
```

OR 

```javascript
const ecto = require("ecto").create();
```

5. Render via String for EJS ([Default Engine](#default-engine))

```javascript
let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"}
ecto.render(source, data).then((output) => {
    console.log(output);
});
```

After running your program you should be greeted by the following output:

```
<h1>Hello John Doe!</h1>
```

------

You can easily set a different [defaultEngine](#default-engine), here we use Handlebars.

```javascript
let ecto = require("ecto").create({defaultEngine: "handlebars"});

let source = "<h1>Hello {{ firstName }} {{ lastName }}!</h1>";
let data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data).then((output) => {
    console.log(output);
});
```

To render from a template file, Ecto uses the `renderFromFile` function. This performs an automatic selection of the engine based on the file extension.

```javascript
let ecto = require("ecto").create();
let data = { firstName: "John", lastName: "Doe"};
//async renderFromFile(filePath:string, data?:object, rootTemplatePath?:string, filePathOutput?:string, engineName?:string): Promise<string>
ecto.renderFromFile("./path/to/template.ejs", data).then((output) => {
    console.log(output)
});
```

Next Steps:
* [More examples on Render from String](#render-from-string)
* [More examples on Render from File](#render-from-file)
* [Examples on setting the Default Engine](#default-engine)
* [Examples by Specific Engines](#examples-by-specific-engines)
* [Check out the entire API / Functions](#api)
* [Learn more about Markdown](#markdown)
* [Learn more about Handlebars / Mustache and Helpers that we added](#handlebars)
* [A Full Deep Dive on Ecto](deep-dive.md)

-----

## Only the Top Template Engines and Their Extensions

We decided to focus on the most popular and well-maintained consolidation engines. Unfortunately other engines suffered from packages that were unsupported, making it difficult to validate them as working fully. Some engines also had limited types and lacked ease of use. 

Our goal is to support the top engines, handling the vast majority of use cases. Here are the top engines that we support:

| Engine     | Monthly Downloads                                                                              | Extensions              |
| ---------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| [EJS](https://www.npmjs.com/package/ejs)        | [![npm](https://img.shields.io/npm/dm/ejs)](https://npmjs.com/package/ejs)                 | .ejs                    |
| [Markdown](https://www.npmjs.com/package/marked)   | [![npm](https://img.shields.io/npm/dm/marked)](https://npmjs.com/package/marked) | .markdown, .md          |
| [Pug](https://www.npmjs.com/package/pug)        | [![npm](https://img.shields.io/npm/dm/pug)](https://npmjs.com/package/pug)                 | .pug, .jade             |
| [Nunjucks](https://www.npmjs.com/package/nunjucks)   | [![npm](https://img.shields.io/npm/dm/nunjucks)](https://npmjs.com/package/nunjucks)       | .njk                    |
| [Mustache](https://www.npmjs.com/package/mustache)   | [![npm](https://img.shields.io/npm/dm/mustache)](https://npmjs.com/package/mustache)       | .mustache               |
| [Handlebars](https://www.npmjs.com/package/handlebars) | [![npm](https://img.shields.io/npm/dm/handlebars)](https://npmjs.com/package/handlebars)   | .handlebars, .hbs, .hjs |
| [Liquid](https://www.npmjs.com/package/liquidjs)     | [![npm](https://img.shields.io/npm/dm/liquidjs)](https://npmjs.com/package/liquidjs)       | .liquid                 |               |

_The `Extensions` are listed above for when we [Render from File](#render-from-file)._

-----

## Render From String

As we have shown in [Getting Started -- It's that Easy!](#getting-started) You can render in only a couple of lines of code: 
```javascript
let ecto = require("ecto").create();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data).then((output) => {
    console.log(output);
});
```

Now let's say your desired engine is not [EJS](https://www.npmjs.com/package/ejs), so you want to specify it explicitly. You can either set the [defaultEngine](#default-engine) parameter, or simply pass it in the `render` function. In this case with the popular engine, [Handlebars](https://www.npmjs.com/package/handlebars):

```javascript
let ecto = require("ecto").create();

let source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
let data = {firstName: "John", lastName: "Doe"}
ecto.render(source, data, "handlebars").then((output) => {
    console.log(output);
});

```

The `render` function also can handle partial files for standard engines (markdown excluded) by simply adding the `rootTemplatePath`:

```javascript
let ecto = require("ecto").create();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1><%- include('/relative/path/to/partial'); %>";
let data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, undefined, "./path/to/templates").then((output) => {
    console.log(output);
});

```

With `render` you can also write to a file. This is accomplished by specifying the `filePathOutput` parameter as below. It will still return the output as a `string`:

```javascript
let ecto = require("ecto").create();

let source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
let data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, undefined, undefined, "./path/to/output/file.html").then((output) => {
    console.log(output);
});
```

Notice the `undefined` value passed into the `engineName` parameter. This is done because we already have the [defaultEngine](#default-engine) set to [EJS](https://www.npmjs.com/package/ejs). If you want you can easily add it in here too.

-----

## Render From File

To render via a template file, it is as simple as calling the `renderFromFile` function with a couple of simple parameters passed in. In this example, we are passing in the template and it will return a `string`. 

_One of the main benefits is that it will automatically select the correct engine based on the file extension._

```javascript
let ecto = require("ecto").create();
let data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data).then((output) => {console.log(output)});
```
In this example, we are writing the output to a HTML file:

```javascript
let ecto = require("ecto").create();
let data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data, undefined, "./path/to/output/yourname.html")
```

Notice that in these examples it is using the `./path/to/template.ejs` to specify [EJS](https://www.npmjs.com/package/ejs) for the rendering. 

You can override the auto-selected engine by passing in the string value of a template engine as a parameter into the `renderFromFile` function. We pass in `pug`, which states we want to render the template using the [Pug](https://www.npmjs.com/package/pug) engine.

```javascript
let ecto = require("ecto").create();
let data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data, undefined, 
"./path/to/output/yourname.html", "pug")
```

-----

## Default Engine

There are several ways to set the default engine to make it flexible.  `Ecto.defaultEngine` is set by default to `ejs`, so if you are using `ejs` no need to change anything.

Here is how you set `liquid` as the default engine while initializing your class:
```javascript
let ecto = require("ecto").create({defaultEngine: "liquid"});
```

Or you can set the default engine as a parameter like so:

```javascript
const Ecto = require("ecto").Ecto;
let ecto = new Ecto();
ecto.defaultEngine = "mustache";

```

You can also set the engine as a parameter on the `render` function, which will override the `Ecto.defaultEngine` parameter:

```javascript
let ecto = require("ecto").create();

let source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
let data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, "handlebars").then((output) => {
    console.log(output);
});
```

You can also override the auto selection on `renderFromFile` like so:

```javascript
let ecto = new Ecto();
let data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data, undefined, 
"./path/to/output/yourname.html", "pug").then((output) => {
    console.log(output)
});
```
## Examples By Specific Engines

### Markdown

Markdown does not contain complexities such as data objects, or partials and layouts. To render markdown its as simple as:

```javascript
let ecto = Ecto();
let source = "# markdown rulezz!";
ecto.render(source, undefined, "markdown").then((output) => {
    console.log(output) //should be <h1 id="markdown-rulezz">markdown rulezz!</h1>
});
```
Render by Markdown file:

```javascript
let ecto = Ecto();
ecto.renderByFile("/path/to/file.md").then((output) => {
    console.log(output)
});
```

With Markdown we have added the following options as they are the most common:
```javascript
{
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
}
```
You can read more about them [here](https://marked.js.org/using_advanced#options).

### Handlebars

In Ecto we use the [handlebars](https://www.npmjs.com/package/handlebars-helpers) engine to render `mustache` related templates. This is because handlebars is based on mustache with just more additional features.

Handlebars is a fantastic template engine, and we've incorporated helpers to make it even better. We added in [handlebars-helpers](https://www.npmjs.com/package/handlebars-helpers) so you can format dates, and more. Here is an example using `Handlebars Helpers` in your template:

```javascript
let ecto = Ecto();
let source = "{{year}}";

ecto.render(source, undefined, "handlebars").then((output) => {
    console.log(output)
});
```


-----

## API

The API is focused on using the main `Ecto` class:

```javascript
const Ecto = require("Ecto").Ecto;

let ecto = new Ecto();

//ecto.<API> -- functions and parameters

```

### Functions:
* render (`async`) - Render from a string.
    * source?:string - the markup/template source that you would like to render
    * data?:object - data to be rendered by the file
    * engineName?:string - to override the `Ecto.defaultEngine` parameter
    * rootTemplatePath?:string - root template path that is used for `partials` and `layouts`
    * filePathOutput?:string - to specify the file path if you want to write the rendered output to a file
* renderFromFile (`async`) - Renders from a file path and will auto-select what engine to use based on the file extension. It will return a `Promise<string>` of the rendered output.
    * filePath?:string - the file that you would like to render
    * data?:object - data to be rendered by the file
    * rootTemplatePath?:string - root template path that is used for `partials` and `layouts`
    * filePathOutput?:string - to specify the file path if you want to write the rendered output to a file
    * engineName?:string - to override the auto-selection of the engineName

### Parameters:
* defaultEngine:string - the default engine to use and set by default to `ejs`
* mappings:EngineMap - Mapping class of all the engines registered in the system. 

### Engines

To make it easier to access and change between engines, all supported engines are provided as parameters on the `Ecto` class as `Ecto.<EngineFullName>`
```javascript
let ecto = Ecto();
console.log(ecto.Handlebars.name); // will return "handlebars"
console.log(ecto.Handlebars.opts); // will return "handlebars" options object
```

To access a specific engine you can do so by going to `ecto.<engine_name>.engine` and setting the [SafeString](https://handlebarsjs.com/api-reference/utilities.html#handlebars-safestring-string):
```javascript
let ecto = Ecto();
ecto.Handlebars.engine.SafeString("<div>HTML Content!</div>");
```

------

### How to Contribute

This is an open-source project under MIT License. If you would like to get involved and contribute to this project, simply follow these steps:

1. Create a fork of this project, this will act as your copy of a GitHub repository allowing you to make changes to code without affecting the original project.
2. Clone this fork to create a local repository.
3. Make the desired changes to your copy of the project, commit, and push those changes when ready.
4. Finally, create a pull request to suggest your changes to the original project.

#### Pull Requests

Pull requests are used in open-source projects or in some corporate workflows to manage changes from contributors and to initiate code review before such changes are merged.

By creating a pull request, you tell others about the changes you've pushed to your fork of a GitHub repository, so that the maintainers of the original repository can review your changes, discuss them, and integrate them into the base branch.

------

### How to Submit an Issue

Issues can be used to keep track of bugs, enhancements, or other requests. Issues can be created based on code from pull requests, comments, or created from the main repository page. 

1. Navigate to the [main page for this repository.](https://github.com/jaredwray/ecto)
2. Under the repository name, jaredwray/ecto, click the "Issues" tab.
3. Click New Issue.
4. Enter the title and description for your issue, and click "Submit new issue".
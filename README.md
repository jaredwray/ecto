![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/main/graph/badge.svg?token=dpbFqSW5Kh)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/package/ecto)

-----

Ecto is a modern template consolidation engine that works with the top template engines like EJS, Markdown, Pug, Nunjucks, Mustache, Handlebars, and Liquid. It consolidates these template engines to a single library, allowing you to use any of them with ease. With features like automatic engine selection, an easy-to-use API, zero-configuration, and regular updates, you can rest assured that Ecto works as expected for all your templating needs.

## Features

* Zero Config by default but all properties exposed for flexibility. Check out our easy [API.](#api)
* Async `render` and `renderFromFile` functions for ES6 and Typescript. 
* [Render via Template File](#render-from-file) with Automatic Engine Selection. No more selecting which engine to use, engine choice is automatically decided based on the file extension.
* [Only the Top Template Engines](#only-the-top-template-engines-and-their-extensions): EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars.
* Maintained with Monthly Updates! 

-----

## Getting Started

The [Node.js package manager documentation](https://nodejs.org/en/download/package-manager/) provides the commands needed to complete the install on Windows and other operating systems.

1. Open the terminal for your project and run `npm install` to ensure all project dependencies are correctly installed.

```
npm install ecto
```

2.  Declare and Initialize.

```javascript
import { Ecto } from `ecto`;

const ecto = new Ecto();
```

5. Render via String for EJS ([Default Engine](#default-engine))

```javascript
const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
const data = {firstName: "John", lastName: "Doe"}
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
* [More about the template engines we support](#the-template-engines-we-support)
* [Learn about the Mappings](#mappings-class)
* [How to Contribute](#how-to-contribute)
* [How to Submit an Issue](#how-to-submit-an-issue)
* [How to use Ecto in Typescript](#using-typescript)

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

## API
The API is focused on using the main Ecto class:

```javascript
const ecto = new Ecto();
//ecto.<API> -- functions and parameters
```

When looking at the API there are two main methods to make note of:
[render](#render-from-string) (async) - Render from a string.
[renderFromFile](#render-from-file) (async) - Renders from a file path and will auto-select what engine to use based on the file extension. It will return a Promise<string> of the rendered output.

Two key parameters to know are:
defaultEngine:string - the [default engine](#default-engine) to use and set by default to ejs.
mappings:EngineMap - [Mapping class](#mappings) of all the engines registered in the system.

## Render From String

As we have shown in [Getting Started -- It's that Easy!](#getting-started) You can render in only a couple of lines of code.

render (`async`) - Render from a string. Here is the render function with all possible arguments shown:

| Name             | Type   | Description                                                  |
| ---------------- | ------ | ------------------------------------------------------------ |
| source           | string | The markup/template source to be rendered.                   |
| data             | object | The data to be rendered by the file.                         |
| engineName       | string | Used to override the `Ecto.defaultEngine` parameter.         |
| rootTemplatePath | string | The root template path that is used for `partials` and `layouts`. |
| filePathOutput   | string | Used to specify the file path, if you want to write the rendered output to a file. |

Here is the simplest example of a render function. We are also showing the required steps you need to take beforehand such as setting up Ecto.

```javascript
const ecto = new Ecto();

const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
const data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data).then((output) => {
    console.log(output);
});
```

Now let's say your desired engine is not [EJS](https://www.npmjs.com/package/ejs), you will need to specify it explicitly. You can either set the [defaultEngine](#default-engine) parameter, or simply pass it in the `render` function. In this case with the popular engine, [Handlebars](https://www.npmjs.com/package/handlebars):

```javascript
const ecto = new Ecto();

const source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
const data = {firstName: "John", lastName: "Doe"}
ecto.render(source, data, "handlebars").then((output) => {
    console.log(output);
});

```

The `render` function also can handle partial files for standard engines (markdown excluded) by simply adding the `rootTemplatePath`:

```javascript
const ecto = new Ecto();

const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1><%- include('/relative/path/to/partial'); %>";
const data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, undefined, "./path/to/templates").then((output) => {
    console.log(output);
});

```

With `render` you can also write to a file. This is accomplished by specifying the `filePathOutput` parameter as below. It will still return the output as a `string`:

```javascript
const ecto = new Ecto();

const source = "<h1>Hello <%= firstName%> <%= lastName %>!</h1>";
const data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, undefined, undefined, "./path/to/output/file.html").then((output) => {
    console.log(output);
});
```

Notice the `undefined` value passed into the `engineName` parameter. This is done because we already have the [defaultEngine](#default-engine) set to [EJS](https://www.npmjs.com/package/ejs). If you want you can easily add it in here too.

-----

## Render From File

To render via a template file, it is as simple as calling the `renderFromFile` function with a couple of simple parameters passed in. 

renderFromFile (`async`) - Renders from a file path and will auto-select what engine to use based on the file extension. It will return a `Promise<string>` of the rendered output. One of the main benefits is that it will automatically select the correct engine based on the file extension. The renderFromFile function takes the following parameters:

| Name             | Type   | Description                                                  |
| ---------------- | ------ | ------------------------------------------------------------ |
| filePath         | string | The file that you would like to render.                      |
| data             | object | The data to be rendered by the file.                         |
| rootTemplatePath | string | The root template path that is used for `partials` and `layouts`. |
| filePathOutput   | string | Used to specify the file path if you want to write the rendered output to a file. |
| engineName       | string | Used to to override the auto-selection of the `engineName`.  |

This simple example showing the `renderFromFile` function shows you the bare minimum required to execute this function successfully, we are passing in the template and it will return a `string`. 

One of the main benefits is that it will automatically select the correct engine based on the file extension.

```javascript
const ecto = new Ecto();
const data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data).then((output) => {console.log(output)});
```
In this example, we are writing the output to a HTML file:

```javascript
const ecto = new Ecto();
const data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data, undefined, "./path/to/output/yourname.html")
```

Notice that in these examples it is using the `./path/to/template.ejs` to specify [EJS](https://www.npmjs.com/package/ejs) for the rendering. 

You can override the auto-selected engine by passing in the string value of a template engine as a parameter into the `renderFromFile` function. We pass in `pug`, which states we want to render the template using the [Pug](https://www.npmjs.com/package/pug) engine.

```javascript
const ecto = new Ecto();
const data = { firstName: "John", lastName: "Doe"};

ecto.renderFromFile("./path/to/template.ejs", data, undefined, 
"./path/to/output/yourname.html", "pug")
```

## Default Engine

This string parameter can be used to set the default template engine for an instance of the Ecto class. Ecto has been designed to support all major engines. 

`Ecto.defaultEngine` is set by default to EJS.If you would like to change the template engine there are several options available to users when setting the value of `defaultEngine`:

##### Set the engine in the arguments of the Ecto constructor

One option for setting the default engine, is to do so in the Ecto constructor:

- `const ecto = new Ecto({defaultEngine: "ejs"});`
- `const ecto = new Ecto({defaultEngine: "markdown"});`
- `const ecto = new Ecto({defaultEngine: "pug"});`
- `const ecto = new Ecto({defaultEngine: "nunjucks"});`
- `const ecto = new Ecto({defaultEngine: "mustache"});`
- `const ecto = new Ecto({defaultEngine: "handlebars"});`
- `const ecto = new Ecto({defaultEngine: "liquid"});`

##### Set the default engine as a parameter

We can also set the default engine as a parameter, like so:

```javascript
const ecto = new Ecto();
ecto.defaultEngine = "mustache";
```

Alternatively, we can set the engine directly on the constructor. This would make our previous example:

```javascript
const ecto = new Ecto({defaultEngine: "liquid"});
ecto.defaultEngine = "mustache";
```

##### Set the engine as a parameter on the render function

You can explicitly override the Ecto.defaultEngine parameter in the render function:

```javascript
const ecto = new Ecto();
const source = "<h1>Hello {{firstName}} {{lastName}}!</h1>";
const data = {firstName: "John", lastName: "Doe"};
ecto.render(source, data, "handlebars").then((output) => {
    console.log(output);
});
```

##### Override the auto selection on renderFromFile

The `renderFromFile` function automatically decides on the template engine, based on the file extension in the file path you specify. However, you can also explicitly set the engine you would like to use. Here we set the engine to be Pug.

```javascript
const ecto = new Ecto();
const data = { firstName: "John", lastName: "Doe"};
ecto.renderFromFile("./path/to/template.ejs", data, undefined, "./path/to/output/yourname.html", "pug").then((output) => {  
	console.log(output)
});
```

To make it easier to access and change between engines, all supported engines are provided as parameters on the `Ecto` class as `Ecto.<EngineFullName>`

```javascript
const ecto = Ecto();
console.log(ecto.Handlebars.name); // will return "handlebars"
console.log(ecto.Handlebars.opts); // will return "handlebars" options object
```

To access a specific engine you can do so by going to `ecto.<engine_name>.engine` and setting the [SafeString](https://handlebarsjs.com/api-reference/utilities.html#handlebars-safestring-string):

```javascript
const ecto = Ecto();
ecto.Handlebars.engine.SafeString("<div>HTML Content!</div>");
```

### Using Typescript
Typescript is the language Ecto is already written in and while many of these examples are in `javascript` they should be compatible with `typescript`. To use Ecto just do an import:
```javascript
import { Ecto } from "ecto";
```

and then simply call it like you do with standard javascript:
```javascript
const ecto = Ecto();
const source = "# markdown rulezz!";
const output = await ecto.render(source, undefined, "markdown");
console.log(output) //should be <h1 id="markdown-rulezz">markdown rulezz!</h1>
```
_NOTE: this example would be in an `async` function._


### Examples By Specific Engines

#### Markdown

Markdown does not contain complexities such as data objects, or partials and layouts. To render markdown its as simple as:

```javascript
const ecto = Ecto();
const source = "# markdown rulezz!";
ecto.render(source, undefined, "markdown").then((output) => {
    console.log(output) //should be <h1 id="markdown-rulezz">markdown rulezz!</h1>
});
```
Render by Markdown file:

```javascript
const ecto = Ecto();
ecto.renderByFile("/path/to/file.md").then((output) => {
    console.log(output)
});
```

We are using [Markdoc](https://markdoc.io/) which has a ton of powerful features.

#### Handlebars

In Ecto we use the [handlebars](https://www.npmjs.com/package/handlebars-helpers) engine to render `mustache` related templates. This is because handlebars is based on mustache with just more additional features.

Handlebars is a fantastic template engine, and we've incorporated helpers to make it even better. We added in [handlebars-helpers](https://www.npmjs.com/package/handlebars-helpers) so you can format dates, and more. Here is an example using `Handlebars Helpers` in your template:

```javascript
const ecto = Ecto();
const source = "{{year}}";

ecto.render(source, undefined, "handlebars").then((output) => {
    console.log(output)
});
```

------



## Mappings Class

Ecto contains a mapping class containing all of the engines registered in the system. The class has been designed to allow users to edit existing engine mappings. Let us explore this class in detail.

The `Map` object has the following structure: `Map<string, Array<string>> `

- The first element of the tuple is the name of the map, such as "handlebars".

*   The second element of the tuple is an array of the extensions for that map, example values may include "handlebars", "hbs","hjs".

From here you can start setting and editing engine mappings.

### Setting an engine mapping - set(name:string, extensions:Array&lt;string>): void

To set an engine mapping with extensions simply write:


```
mappings.set("handlebars", ["handlebars","hbs","hjs"]);
```


This sets the handlebars engine to accept files with the following file extensions:

*   .handlebars
*   .hbs
*   .hjs

### Delete an engine mapping - delete(name:string): void

To delete a mapping entirely you can use the `delete` method.

```
mappings.delete("handlebars");
```

This will remove this engine mapping entirely.

### Delete an extension - deleteExtension(name:string, extension:string): void

To delete an extension for a particular engine mapping, you can use the `deleteExtension` method. This method takes two arguments:

*   `name:string` - the name of the engine you would like to delete the extension for.
*   `extension:string` - the extension you would like to delete.

The following code deletes two of the extensions for our `handlebars` engine mapping. 


```
mappings.deleteExtension("handlebars", "hbs","hjs");
```


After executing this code the only accepted file extension for the Handlebars engine will be `handlebars`.

Other useful methods include `get` and `getName`.

### get method - get(name:string): Array&lt;string> | undefined

The `get` method takes one argument, `name:string `, and will return the extensions for the name you specify. If extensions are found, they are returned as an `Array<string>`. If no engine mapping can be found for the name you specify, ` undefined` is returned. To use the `get` method simply write: 


```
mappings.get("handlebars")
```


This will retrieve the array of extensions assigned to the Handlebars engine.

### getName method - getName(extension:string): string | undefined

The `getName` method takes a single argument, `extension:string`. If a valid extension is given, this method will return the name of the engine mapping that the extension belongs to. For example:


```
mappings.getName("hjs")
```


This will return the string “handlebars”, which is the corresponding engine for this extension. If no match can be found, this method will return `undefined`.

Gaining an understanding of this class will provide you with more options and possibilities when using Ecto.

## How to Contribute

This is an open-source project under MIT License. If you would like to get involved and contribute to this project, simply follow these steps:

1. Create a fork of this project, this will act as your copy of a GitHub repository allowing you to make changes to code without affecting the original project.
2. Clone this fork to create a local repository.
3. Make the desired changes to your copy of the project, commit, and push those changes when ready.
4. Finally, create a pull request to suggest your changes to the original project.

### Pull Requests

Pull requests are used in open-source projects or in some corporate workflows to manage changes from contributors and to initiate code review before such changes are merged.

By creating a pull request, you tell others about the changes you've pushed to your fork of a GitHub repository, so that the maintainers of the original repository can review your changes, discuss them, and integrate them into the base branch.

## How to Submit an Issue

Issues can be used to keep track of bugs, enhancements, or other requests. Issues can be created based on code from pull requests, comments, or created from the main repository page. 

1. Navigate to the [main page for this repository.](https://github.com/jaredwray/ecto)
2. Under the repository name, jaredwray/ecto, click the "Issues" tab.
3. Click New Issue.
4. Enter the title and description for your issue, and click "Submit new issue".

## The Template Engines we support

### What is a Template Engine?

A template engine is a tool that allows developers to write HTML markup that contains the template engine’s defined tags and syntax. These tags are used to insert variables into the final output of the template, or run some programming logic at run-time before sending the final HTML to the browser for display.

### EJS

EJS stands for Embedded JavaScript. It is a templating engine that allows users to generate HTML using plain JavaScript.

You define HTML pages in the EJS syntax and specify where various data will be shown on the page. Then, your application combines data with the template and "renders" a complete HTML page where EJS takes your data and inserts it into the web page according to how you've defined the template. For example, you could have a table of dynamic data from a database and you want EJS to generate the table of data according to your display rules. It saves you from the writing code and logic to dynamically generate HTML based on data.

It is a tool for generating web pages that can include dynamic data and can share templated pieces with other web pages. It is not a front-end framework. While EJS can be used by client-side Javascript to generate HTML on the client-side, it is typically used by your back-end to generate web pages in response to some URL request. EJS is not a client-side framework like Angular or React.

### Markdown

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. Markdown is now one of the world’s most popular markup languages.

Using Markdown is different from using a word and text editor. In an application like Microsoft Word, you click buttons to format words and phrases, and the changes are visible immediately. Markdown isn’t like that. When you create a Markdown-formatted file, you add Markdown syntax to the text to indicate which words and phrases should look different.

There are several reasons why people might choose Markdown instead of standard text editors.

*   Markdown has a wide range of potential uses. It can be used to create websites, documents, notes, books, presentations, email messages, and technical documentation.
*   Files containing Markdown-formatted text can be opened using virtually any application. This differs greatly from word processing applications like Microsoft Word that lock your content into a proprietary file format.
*   You can create Markdown-formatted text on any device running any operating system.
*   Markdown is future proof. Even if the application you’re using stops working at some point in the future, you’ll still be able to read your Markdown-formatted text using a text editing application.
*   Markdown is widely supported. Websites like Reddit and GitHub support Markdown, along with many other desktop and web-based applications.

### PUG

Pug.js is an HTML templating engine that takes simple Pug code, which the Pug compiler will compile into HTML code that browsers can understand. Some features and advantages of the Pug template engine are as follows:

*   Pug has powerful features like conditions, loops, includes, that allows us to render HTML code based on user input or reference data. 
*   Pug supports JavaScript natively.
*   Pug is excellent for handling dynamic, changing data. Imagine we have an email template, with certain fields to be customized depending on who you are sending the email to. Before sending the email we can compile the Pug code to HTML, using the user data to fill the gaps where the dynamic information should go. 

### Nunjucks

Nunjucks is a rich and powerful template engine for JavaScript. Nunjucks is developed by Mozilla and maintained by the Node JS Foundation. Nunjucks can be used in both Node and the browser.

In Node, Nunjucks is installed using npm. It is rich, fast, extensible, and available everywhere. It's highly optimized at just 8kb gzipped.

Some of the advantages of using Nunjucks for your project are:

*   It is a rich templating language with block inheritance, auto-escaping, macros, asynchronous control, and more.
*   Nunjucks is fast, lean, and highly-performant. 
*   Easily extensible with custom filters and extensions.
*   Available in Node and all modern web browsers, along with precompilation options.

### Mustache

Mustache is a logic-less template syntax. It can be used for HTML, config files, source code, and more. It is often referred to as “logic-less” as there are no if statements, else clauses, or for loops. There are only tags. Tags are replaced with actual values at runtime.

Mustache.js is an implementation of the mustache template system in JavaScript. It is often considered the base for JavaScript templating. Since mustache supports various languages, we don’t need a separate templating system on the server side.


```javascript
Mustache.render("Hello, {{name}}", { name: "John" });
// returns: Hello, John
```


We see two braces around `{{ name }}`. This is Mustache syntax to show that it is a placeholder. When Mustache compiles this, it will look for the “name” property in the object we pass in, and replace `{{ name }}` with the actual value, in this case,  “John”.

Mustache is not actually a templating engine. Mustache is a specification for a templating language. In general, we would write templates according to the Mustache specification, and they can then be compiled by a templating engine to be rendered, eventually creating an output.

### Handlebars

Handlebars is a logic-less templating engine that dynamically generates your HTML page. It is an extension of Mustache with a few additional features. Mustache is fully logic-less but Handlebars adds minimal logic thanks to the use of some helpers. These include logic and keywords such as `if`, `with`, `unless`, `each,` and more.

Handlebars can be loaded into the browser just like any other JavaScript file:


```html
<script src="/path/to/handlebars.min.js"></script>
```


The way Handlebars works can be summarized as follows:

1. Handlebars takes a template containing the variables and compiles it into a function.
2. This function is then executed by passing a JSON object as an argument. This JSON object is known as context and it contains the values of the variables used in the template.
3. On its execution, the function returns the required HTML after replacing the variables of the template with their corresponding values.

In Ecto, we use the [Handlebars](https://www.npmjs.com/package/handlebars-helpers) engine to render mustache-related templates.

Handlebars is a fantastic template engine, and we've incorporated helpers to make it even better. We added in [handlebars-helpers](https://www.npmjs.com/package/handlebars-helpers) so you can format dates, and more. Here is an example using Handlebars Helpers in your template:


```javascript
const ecto = Ecto();
const source = "{{year}}";

ecto.render(source, undefined, "handlebars").then((output) => {
    console.log(output)
});
```

#### Liquid

Some refer to Liquid as a template language, while others may call it a template engine. It doesn't really matter which label you apply, in many ways both are right. It has a syntax (like traditional programming languages), has concepts such as output, logic, and loops, and it interacts with variables and data, just as you would with a language such as PHP.

Liquid, like the previous template engines, creates a bridge between an HTML file and a data store. It does this by allowing us to access variables from within a template, or the Liquid file, with a simple and readable syntax.

Liquid files have the extension of `.liquid`. A liquid file is a mix of standard HTML code and Liquid constructs. Its clear syntax is easy to distinguish from HTML when working with a Liquid file. This is made even easier thanks to the use of two sets of delimiters.

The double curly brace delimiters `{{ }}` denote output, and the curly brace percentage delimiters `{% %}` denote logic. You'll become very familiar with these as every Liquid construct begins with one, or the other. Another way of thinking of delimiters is as placeholders. A placeholder can be viewed as a piece of code that will ultimately be replaced by data when the compiled file is sent to the browser.

# License

[MIT License - Copyright (c) 2021-2022 Jared Wray](LICENSE)
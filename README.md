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
* Async render function for ES6 and Typescript. 
* Automatic Engine Selection. No more selecting which engine to use as it does it for you based on file extension.
* Only the Top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars
* Maintained with Monthly Updates! 

## Only The Top Template Engines

| Engine     | Package                                                                                | Monthly Downloads                                                                              | Extensions              |
| :---------- | :-------------------------------------------------------------------------------------- | :---------- | :----------------------- |
| EJS        | [https://www.npmjs.com/package/ejs](https://www.npmjs.com/package/ejs)                 | [![npm](https://img.shields.io/npm/dm/ejs)](https://npmjs.com/package/ejs)                 | .ejs                    |
| Markdown   | [https://www.npmjs.com/package/markdown-it](https://www.npmjs.com/package/markdown-it) | [![npm](https://img.shields.io/npm/dm/markdown-it)](https://npmjs.com/package/markdown-it) | .markdown, .md          |
| Pug        | [https://www.npmjs.com/package/pug](https://www.npmjs.com/package/pug)                 | [![npm](https://img.shields.io/npm/dm/pug)](https://npmjs.com/package/pug)                 | .pug, .jade             |
| Nunjucks   | [https://www.npmjs.com/package/nunjucks](https://www.npmjs.com/package/nunjucks)       | [![npm](https://img.shields.io/npm/dm/nunjucks)](https://npmjs.com/package/nunjucks)       | .njk                    |
| Mustache   | [https://www.npmjs.com/package/mustache](https://www.npmjs.com/package/mustache)       | [![npm](https://img.shields.io/npm/dm/mustache)](https://npmjs.com/package/mustache)       | .mustache               |
| Handlebars | [https://www.npmjs.com/package/handlebars](https://www.npmjs.com/package/handlebars)   | [![npm](https://img.shields.io/npm/dm/handlebars)](https://npmjs.com/package/handlebars)   | .handlebars, .hbs, .hls |
| Liquid     | [https://www.npmjs.com/package/liquidjs](https://www.npmjs.com/package/liquidjs)       | [![npm](https://img.shields.io/npm/dm/liquidjs)](https://npmjs.com/package/liquidjs)       | .liquid                 |

-----

## API

`Render(sourceDir:string, data:obj, fileOutput?:string): string (returns rendered output)`

![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://github.com/jaredwray/ecto/workflows/ecto-build/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![Release Status](https://github.com/jaredwray/ecto/workflows/ecto-release/badge.svg)](https://github.com/jaredwray/ecto/actions)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/master/graph/badge.svg)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/packages/ecto)

-----

## Features
* Zero Config by default.
* Async render function for ES6 and Typescript. 
* Automatic Engine Selection. No more selecting which engine to use as it does it for you based on file extension.
* Support for the top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, Liquid, and Handlebars
* Maintained with Monthly Updates! 

## Auto File Extension Selectors

| Engine         | Extensions   |
| :------------- | :---------- |
| EJS | .ejs   |
| Markdown   | .markdown, .md |
| Pug   | .pug |
| Nunjucks   | .njk | 
| Mustache   | .mustache | 
| Handlebars   | .hbs, .handlebars, .hjs | 
| Liquid   | .liquid | 

-----

## API

`Render(sourceDir:string, data:obj, fileOutput?:string): string (returns rendered output)`

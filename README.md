![Ecto](ecto_logo.png "Ecto")

## Modern Template Consolidation Engine for EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars

[![Build Status](https://travis-ci.org/jaredwray/ecto.svg?branch=master)](https://travis-ci.org/jaredwray/ecto)
[![GitHub license](https://img.shields.io/github/license/jaredwray/ecto)](https://github.com/jaredwray/ecto/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/jaredwray/ecto/branch/master/graph/badge.svg)](https://codecov.io/gh/jaredwray/ecto)
[![npm](https://img.shields.io/npm/dm/ecto)](https://npmjs.com/packages/ecto)

-----

## Features
* Zero Config by default.
* Async render function for ES6 and Typescript. 
* Auto File Extension Selectors for all of the engines. No more selecting which engine to use. It does it for you. 
* Support for the top Template Engines: EJS, Markdown, Pug, Nunjucks, Mustache, and Handlebars
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

## To Do: 
- [ ] Supports Express 3.x.x and 4.x.x

## API

`Render(sourceDir:string, data:obj, fileOutput?:string): string (returns rendered output)`

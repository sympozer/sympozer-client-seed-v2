# Sympozer front-end app V2

Sympozer is a full client side mashup Web application that allows browsing and enriching conference data. Learn more about Sympozer at http://sympozer.liris.cnrs.fr/ .

In 2017, the app architecture has been completely refactored:

  * Its core engine is based on RDF data (instead of JSON), internally served using the <a href="https://github.com/linkeddata/rdflib.js/">rdflib.js</a> library. Feel free to open the console and watch the app sending SPARQL requests to the store.
  * The conference dataset now follows the <a href="https://scholarlydata.org/">ScholarlyData</a> ontology and has been issued using <a href="https://github.com/anuzzolese/cLODg2">cLODg</a> (conference Linked Open Data generator) V2.
  * It fully runs on the client side, and relies on the <a href="https://angular.io/">Angular 2</a> JavaScript framework, using Web components and other advances. The design layer uses <a href="https://material.angular.io/">Angular Material</a>.
  * Users can create their account, enrich their personal information and participate in the votes
  * Admins can get usage data through the Piwik system

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.15.

## Getting started

Clone this repo
Install Git & Npm

then run :

`git clone https://github.com/sympozer/sympozer-client-seed-v2 `

`npm install -g typescript protractor @angular/cli`

`cd sympozer-client-seed-v2/app`

`npm install`

`ng serve`

## Hack broken dependency

There is a missing dependency in the XMLHttpRequest module, which is itself a dependency of other modules. To solve that, browse to `node_modules/xmlhttprequest/lib/XMLHttpRequest.js` and comment the following lines:

`Line 15- var spawn = require("child_process").spawn; `

`Line 503- var syncProc = spawn(process.argv[0], ["-e", execString]);`

`Line 509- syncProc.stdin.end();`

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` option for a production build and `-bh` to set up the base hash that will be included in the index.html file (see examples in `app/package.json` file).

In case you define commands in the `app/package.json`, run them with `npm run <commandName>`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/). 
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

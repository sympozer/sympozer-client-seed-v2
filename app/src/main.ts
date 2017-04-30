//import './polyfills';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {LocalDAOService} from  './app/localdao.service';
import {AppModule} from "./app/app.module";
import {enableProdMode} from '@angular/core';

const platform = platformBrowserDynamic();
enableProdMode();
platform.bootstrapModule(AppModule, [LocalDAOService]);

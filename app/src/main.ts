import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {LocalDAOService} from  './app/localdao.service';
import {AppModule} from "./app/app.module";
const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule, [LocalDAOService]);

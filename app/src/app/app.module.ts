import {Routes, RouterModule} from "@angular/router";
import {AppComponent} from "./app.component";
import {PersonComponent} from "./modules/person/person.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {routing} from "./app.routing";
import {MaterialModule, MdGridListModule} from "@angular/material";
import 'hammerjs';
import {NgModule} from "@angular/core";
import {HomeComponent} from "./modules/home/home.component";
import {AboutComponent} from "./modules/about/about.component";
import {ScheduleComponent} from "./modules/schedule/schedule.component";
import {SearchComponent} from "./modules/search/search.component";
import {PersonsComponent} from "./modules/persons/persons.component";
import {PublicationsComponent} from "./modules/publications/publications.component";
import {PublicationComponent} from "./modules/publication/publication.component";
import {AuthorsComponent} from "./modules/authors/authors.component";
import {RolesComponent} from "./modules/roles/roles.component";
import {OrganizationsComponent} from "./modules/organizations/organizations.component";
import {OrganizationComponent} from "./modules/organization/organization.component";
import {MenuComponent} from "./modules/menu/menu.component";
import {PublicationsByCategoryComponent} from "./modules/publications-by-category/publications-by-category.component";
import {CategoriesForPublicationsComponent} from "./modules/caterogies-for-publications/categories-for-publications.component";
import {PersonByRoleComponent} from "./modules/person-by-role/person-by-role.component";
import {HeaderComponent} from "./modules/header/header.component";
import {WhatsNextComponent} from "./modules/whatsnext/whatsnext.component";
import {EventsComponent} from "./modules/events/events.component";
import {CategoriesComponent} from "./modules/categories/categories.component";
import {LocationsComponent} from "./modules/locations/locations.component";
import {EventByCategoryComponent} from "./modules/event-by-category/event-by-category.component";
import {EventsByLocationComponent} from "./modules/events-by-location/events-by-location.component";
import {EventComponent} from "./modules/event/event.component";
import {ExternPublicationComponent} from "./modules/extern-publication/externpublication.component";
import {AutocompleteComponent} from './modules/autocomplete/autocomplete.component';

import {KeysPipe} from "./keys.pipe";
import {DataLoaderService} from "./data-loader.service";
import {DBLPDataLoaderService} from "./dblpdata-loader.service";
import {LocalDAOService} from "./localdao.service";
import {eventHelper} from "./eventHelper";
import {Encoder} from  './lib/encoder';
import {Ng2Webstorage} from 'ng2-webstorage';


const routes: Routes = [];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        AboutComponent,
        ScheduleComponent,
        SearchComponent,
        PersonComponent,
        PersonsComponent,
        PublicationsComponent,
        PublicationComponent,
        AuthorsComponent,
        RolesComponent,
        OrganizationsComponent,
        OrganizationComponent,
        MenuComponent,
        CategoriesForPublicationsComponent,
        PublicationsByCategoryComponent,
        PersonByRoleComponent,
        HeaderComponent,
        WhatsNextComponent,
        EventsComponent,
        CategoriesComponent,
        LocationsComponent,
        EventsByLocationComponent,
        EventComponent,
        EventByCategoryComponent,
        ExternPublicationComponent,
        KeysPipe,
        AutocompleteComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        RouterModule.forRoot(routes, {useHash: true}),
        MaterialModule.forRoot(),
        MdGridListModule.forRoot(),
        Ng2Webstorage,
    ],
    providers: [
        DataLoaderService, DBLPDataLoaderService, LocalDAOService, eventHelper, Encoder
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import {Routes, RouterModule} from '@angular/router';
import {AppComponent} from './app.component';
import {PersonComponent} from './modules/person/person.component';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {routing} from './app.routing';
import {MatGridListModule, MatDialogModule, MatSnackBarModule} from '@angular/material';
import 'hammerjs';
import {NgModule} from '@angular/core';
import {HomeComponent} from './modules/home/home.component';
import {AboutComponent} from './modules/about/about.component';
import {ScheduleComponent} from './modules/schedule/schedule.component';
import {SearchComponent} from './modules/search/search.component';
import {PersonsComponent} from './modules/persons/persons.component';
import {PublicationsComponent} from './modules/publications/publications.component';
import {PublicationComponent} from './modules/publication/publication.component';
import {AuthorsComponent} from './modules/authors/authors.component';
import {RolesComponent} from './modules/roles/roles.component';
import {OrganizationsComponent} from './modules/organizations/organizations.component';
import {OrganizationComponent} from './modules/organization/organization.component';
import {MenuComponent} from './modules/menu/menu.component';
import {PublicationsByCategoryComponent} from './modules/publications-by-category/publications-by-category.component';
import {CategoriesForPublicationsComponent} from './modules/caterogies-for-publications/categories-for-publications.component';
import {PersonByRoleComponent} from './modules/person-by-role/person-by-role.component';
import {HeaderComponent} from './modules/header/header.component';
import {WhatsNextComponent} from './modules/whatsnext/whatsnext.component';
import {WhatsNowComponent} from './modules/whatsnow/whatsnow.component';
import {EventsComponent} from './modules/events/events.component';
import {CategoriesComponent} from './modules/categories/categories.component';
import {LocationsComponent} from './modules/locations/locations.component';
import {EventByCategoryComponent} from './modules/event-by-category/event-by-category.component';
import {EventsByLocationComponent} from './modules/events-by-location/events-by-location.component';
import {EventComponent} from './modules/event/event.component';
import {ExternPublicationComponent} from './modules/extern-publication/externpublication.component';
import {AutocompleteComponent} from './modules/autocomplete/autocomplete.component';
import {ToolsComponent} from './modules/tools/tools.component';
import {EventsByDate} from './modules/events-by-date/events-by-date';
import {ShareComponent} from './modules/share-button/share-button.component';
import {LoginComponent} from './modules/login/login.component';
import {ScrollLoaderDirective} from './modules/scroll-loader/scroll-loader.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {KeywordsComponent} from './modules/keywords/keywords.component';
import {KeysPipe} from './keys.pipe';
import {DataLoaderService} from './data-loader.service';
import {DBLPDataLoaderService} from './dblpdata-loader.service';
import {LocalDAOService} from './localdao.service';
import {eventHelper} from './eventHelper';
import {Encoder} from './lib/encoder';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {GithubService} from './services/github.service';
import {RequestManager} from './services/request-manager.service';
import {ApiExternalServer} from './services/ApiExternalServer';
import {RessourceDataset} from './services/RessourceDataset';
import {PersonService} from './modules/person/person.service';
import {TimeManager} from './services/timeManager.service';
import {ShareButtonsModule} from 'ngx-sharebuttons';
import {VoteComponent} from './modules/vote/vote.component';
import {VotesComponent} from './modules/votes/votes.component';
import {ConferenceComponent} from './modules/conference/conference.component';
import {VoteService} from './services/vote.service';
import {Angulartics2Module, Angulartics2Piwik} from 'angulartics2';
import {ToolsService} from './services/tools.service';
import {PublicationsByKeywordComponent} from './modules/publications-by-keyword/publications-by-keyword.component';
import {SignupComponent} from './modules/signup/signup.component';
import {SignupWithBadgeComponent} from './modules/signupWithBadge/signupWithBadge.component';
import {UserProfileComponent} from './modules/user-profile/user-profile.component';
import {ForgotPasswordComponent} from './modules/forgotPassword/forgotPassword.component';
import {ActivationMailComponent} from './modules/activationMail/activationMail.component';
import {ChangePasswordComponent} from './modules/changePassword/changePassword.component';
import {QrcodeComponent} from './modules/qrcode/qrcode.component';
import {NgxQRCodeModule } from 'ngx-qrcode3';
import { DialogShareQrComponent } from './modules/dialog-share-qr/dialog-share-qr.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfirmationDialogComponent } from './modules/confirmation-dialog/confirmation-dialog.component';

const routes: Routes = [];

const MATERIAL_MODULES = [
	MatSidenavModule,
	MatIconModule,
	MatCardModule,
	MatChipsModule,
	MatMenuModule,
	MatInputModule,
	MatSlideToggleModule,
	MatFormFieldModule
];

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
        WhatsNowComponent,
        EventsComponent,
        CategoriesComponent,
        LocationsComponent,
        EventsByLocationComponent,
        EventComponent,
        EventByCategoryComponent,
        ExternPublicationComponent,
        AutocompleteComponent,
        ToolsComponent,
        LoginComponent,
        KeysPipe,
        ToolsComponent,
        EventsByDate,
        ShareComponent,
        ScrollLoaderDirective,
        VoteComponent,
        VotesComponent,
        KeywordsComponent,
        ConferenceComponent,
        PublicationsByKeywordComponent,
        SignupComponent,
        SignupWithBadgeComponent,
        UserProfileComponent,
        QrcodeComponent,
        ForgotPasswordComponent,
        ActivationMailComponent,
        ChangePasswordComponent,
        DialogShareQrComponent,
        ConfirmationDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        RouterModule.forRoot(routes, {useHash: true}),
        MatGridListModule,
        ShareButtonsModule.forRoot(),
        NgxWebstorageModule.forRoot(),
        Angulartics2Module.forRoot([Angulartics2Piwik]),
        BrowserModule,
        HttpClientModule,
        NgxQRCodeModule,
        MatDialogModule,
        MatSnackBarModule,
        ScrollingModule,
        MATERIAL_MODULES
    ],
    providers: [
        DataLoaderService,
        DBLPDataLoaderService,
        LocalDAOService,
        eventHelper,
        Encoder,
        GithubService,
        RequestManager,
        PersonService,
        RessourceDataset,
        ApiExternalServer,
        VoteService,
        ToolsService,
        TimeManager,
    ],
    bootstrap: [AppComponent],
    entryComponents:[DialogShareQrComponent, ConfirmationDialogComponent]
})
export class AppModule {
}

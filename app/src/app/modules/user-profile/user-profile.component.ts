import {Component, OnInit, Input, NgModule} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from '@angular/material';
import {Subscription} from 'rxjs/Subscription';
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    logSubscription: Subscription;
    subscriptionHomepage: Subscription;
    subscriptionPhotoUrl: Subscription;
    subscriptionTwitter: Subscription;
    subscriptionLinkedin: Subscription;
    subscriptionFirstname: Subscription;
    subscriptionLastname: Subscription;


    hasLogged: any;
    user;
    private key_localstorage_user = 'user_external_ressource_sympozer';

    constructor(private apiExternalServer: ApiExternalServer,
                private snackBar: MdSnackBar,
                private localStoragexx: LocalStorageService) {
        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            console.log(status);
            this.hasLogged = status;
            if (!this.hasLogged) {
                let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
                window.location.replace(urlHost + '#/home');
            }
            console.log(status)

        });
    }

    ngOnInit() {

        this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
        /*
        console.log(this.user);
        if (this.user) {
            console.log(this.user)
        }
        console.log(this.hasLogged)
        */
    }

    update(user) {
        console.log(user);

        this.apiExternalServer.update(user)
            .then((status) => {
                this.snackBar.open('Update successful.', '', {
                    duration: 2000,
                });
                window.history.back()
            })
            .catch((err) => {
                this.snackBar.open(err, '', {
                    duration: 2000,
                });
            })
    }

}

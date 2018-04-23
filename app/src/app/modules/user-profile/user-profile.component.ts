import { Component, OnInit } from '@angular/core';
import { ApiExternalServer } from '../../services/ApiExternalServer';
import { MdSnackBar } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { LocalStorageService } from 'ng2-webstorage';

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
    firstName: string;
    private key_localstorage_user = 'user_external_ressource_sympozer';
    private key_localstorage_userName = 'username_external_ressource_sympozer';

    constructor(private apiExternalServer: ApiExternalServer,
        private snackBar: MdSnackBar,
        private localStoragexx: LocalStorageService) {
        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            // console.log(status);
            this.hasLogged = status;
            if (!this.hasLogged) {
                const urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
                window.location.replace(urlHost + '#/home');
            }
            // console.log(status)

        });
    }

    ngOnInit() {
        this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
        this.firstName = this.localStoragexx.retrieve(this.key_localstorage_userName);
        //console.log(this.firstName);
        /*
        if (this.user) {
            console.log(this.user)
        }
        console.log(this.hasLogged)
        */
    }

    updateProfile(user) {
        console.log(user);
        this.apiExternalServer.updateProfile(user.firstname, user.lastname)
            .then((status) => {
                this.snackBar.open('Update successful.', '', {
                    duration: 2000,
                });
                const urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
                window.location.replace(urlHost + '#/profile');
            })
            .catch((err) => {
                this.snackBar.open(JSON.parse(err.text()).message, '', {
                    duration: 2000,
                });
            });
    }

    updateUser(token,firstname,lastname,homepage,twitterpage, facebookpage, googlepage, linkedinaccount, photoUrl) {

        this.apiExternalServer.update(token,firstname,lastname,homepage,twitterpage, facebookpage, googlepage, linkedinaccount, photoUrl)
            .then((status) => {
                this.snackBar.open('Update successful.', '', {
                    duration: 2000,
                });
                window.history.back();
            })
            .catch((err) => {
                this.snackBar.open(err, '', {
                    duration: 2000,
                });
            });
    }

    getUserExternal(user) {
        console.log(user);

        this.apiExternalServer.getUserExternal(user.mbox_sha1sum)
            .then((status) => {
               
            })
            .catch((err) => {
               
            })
    }

}

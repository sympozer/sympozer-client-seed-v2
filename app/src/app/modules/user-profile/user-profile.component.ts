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
    online:any;

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
        this.online = navigator.onLine;
    }

    ngOnInit(): void {
        window.addEventListener('online',  this.updateOnlinelogin);
        window.addEventListener('offline', this.updateOfflinelogin);
        if ( ! this.online ) {
            this.updateOfflinelogin();
        }
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
        if(this.online) {
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
    }

    updateUser(token,firstname,lastname,homepage,twitterpage, facebookpage, googlepage, linkedinaccount, photoUrl) {
        if(this.online){
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
    }

    getUserExternal(user) {
        if(this.online){
            console.log(user);

            this.apiExternalServer.getUserExternal(user.mbox_sha1sum)
                .then((status) => {

                })
                .catch((err) => {

                })
        }
    }
    
    updateOfflinelogin() {
        this.online = false;
        var toast = document.getElementById("toast");
        toast.innerText = "Waiting for Wifi connection.., Please try later";
        toast.style.backgroundColor = "#B71C1C";
        toast.className = "show";
        (<HTMLInputElement> document.getElementById("update-btn")).disabled = true;
        (<HTMLInputElement> document.getElementById("update-btn")).style.background = "#9E9E9E";

    }
    updateOnlinelogin(){
        this.online = true;
        var toast = document.getElementById("toast");
        toast.className.replace("show", "");
        toast.innerText = "Connected..";
        toast.style.backgroundColor = "#1B5E20";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        (<HTMLInputElement> document.getElementById("update-btn")).disabled = false;
        (<HTMLInputElement> document.getElementById("update-btn")).style.background = "linear-gradient(#e58307, #F36B12)";
    }

}

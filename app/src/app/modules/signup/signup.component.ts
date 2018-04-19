import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';
import {SignUpService} from './signup.service';


@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    providers: [SignUpService]
})
export class SignupComponent implements OnInit {


    private key_localstorage_user = "user_external_ressource_sympozer";
    online: any ;

    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MdSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private localStoragexx: LocalStorageService) {
        this.online = navigator.onLine;
    }
    ngOnInit(): void {
        window.addEventListener('online',  this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnfflineStatus);
        if( ! this.online ) {
            this.updateOnfflineStatus()
        }
        let user = this.localStoragexx.retrieve(this.key_localstorage_user)
        if(user !== null){
            let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            window.location.replace(urlHost+'#/home');
        }

    }

    updateOnfflineStatus() {
        this.online = false;
        var toast = document.getElementById("toast");
        toast.innerText = "Waiting for Wifi connection.., Please try later";
        toast.style.backgroundColor = "#B71C1C";
        toast.className = "show";
        (<HTMLInputElement> document.getElementById("signup-btn")).disabled = true;
        (<HTMLInputElement> document.getElementById("signup-btn")).style.background = "#9E9E9E";

    }
    updateOnlineStatus(){
        this.online = true;
        var toast = document.getElementById("toast");
        toast.className.replace("show", "");
        toast.innerText = "Connected..";
        toast.style.backgroundColor = "#1B5E20";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        (<HTMLInputElement> document.getElementById("login-btn")).disabled = false;
        (<HTMLInputElement> document.getElementById("login-btn")).style.background = "linear-gradient(#e58307, #F36B12)";
    }

    /**
     * Invoke the signup external server service
     * @param email
     * @param firstname
     * @param lastname
     * @param password
     * @param confirm password
     */

    signup(email, firstname, lastname, password, confirmPassword) {
        if (this.online) {
        const that = this;

        if (!email || email.length === 0) {
            that.snackBar.open('Invalid email address.', "", {
                duration: 3000,
            });
        }

        else if (!firstname || firstname.length === 0) {
            that.snackBar.open('Invalid firstname', "", {
                duration: 3000,
            });
        }

        else if (!lastname || lastname.length === 0) {
            that.snackBar.open('Invalid lastname', "", {
                duration: 3000,
            });
        }
        else if (!password || password.length === 0) {
            that.snackBar.open('Invalid password', "", {
                duration: 3000,
            });
        }

        else if (!confirmPassword || confirmPassword.length === 0) {
            that.snackBar.open('Invalid password', "", {
                duration: 3000,
            });
        }

        else if (password !== confirmPassword) {
            that.snackBar.open('Passwords don\'t match.', "", {
                duration: 3000,
            });
        }

        else {
            this.apiExternalServer.signup(email, firstname, lastname, password)
                .then(() => {

                    that.snackBar.open('Please check your email to validate your account.', '', {
                        duration: 7000,
                    });

                    that.snackBar.open('The account creation request has been accepted by our server.', '', {
                        duration: 4000,
                    });

                    let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname
                    window.location.replace(urlHost + '#/login');

                })
                .catch((err) => {
                    this.snackBar.open(JSON.parse(err.text()).message, '', {
                        duration: 2000,
                    });
                });
        }
    }
    }
}
import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'forgotPassword',
    templateUrl: './forgotPassword.component.html',
    styleUrls: ['./forgotPassword.component.scss'],
    providers: []
})

export class ForgotPasswordComponent implements OnInit {

    private key_localstorage_user = "user_external_ressource_sympozer";
    online:any;

    constructor(private router: Router,
        private apiExternalServer: ApiExternalServer,
        public snackBar: MdSnackBar,
        private DaoService: LocalDAOService,
        private localStoragexx: LocalStorageService ) {
        this.online = navigator.onLine;
    }

    ngOnInit(): void {
        window.addEventListener('online',  this.updateOnlinelogin);
        window.addEventListener('offline', this.updateOfflinelogin);
        if ( ! this.online ) {
            this.updateOfflinelogin();
        }
		let user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if(user !== null){
        	let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            window.location.replace(urlHost+'#/home');
        }
	
    }
    
    /**
	 *
	 * @param email
	 */
	forgotPassword(email){
	    if(this.online) {
            this.apiExternalServer.forgotPassword(email)
                .then(() => {
                    this.snackBar.open("A mail has been sent to your email. Please follow the instruction in the email to reset your password", "", {
                        duration: 3000,
                    });
                    this.snackBar.open("Please follow the instruction in the email to reset your password", "", {
                        duration: 3000,
                    });
                    let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
                    window.location.replace(urlHost + '#/login');
                })
                .catch((err) => {
                    this.snackBar.open(err, "", {
                        duration: 3000,
                    });
                });
        }
    }
    updateOfflinelogin() {
        this.online = false;
        var toast = document.getElementById("toast");
        toast.innerText = "Waiting for Wifi connection.., Please try later";
        toast.style.backgroundColor = "#B71C1C";
        toast.className = "show";
        (<HTMLInputElement> document.getElementById("forgotpass-btn")).disabled = true;
        (<HTMLInputElement> document.getElementById("forgotpass-btn")).style.background = "#9E9E9E";

    }
    updateOnlinelogin(){
        this.online = true;
        var toast = document.getElementById("toast");
        toast.className.replace("show", "");
        toast.innerText = "Connected..";
        toast.style.backgroundColor = "#1B5E20";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        (<HTMLInputElement> document.getElementById("forgotpass-btn")).disabled = false;
        (<HTMLInputElement> document.getElementById("forgotpass-btn")).style.background = "linear-gradient(#e58307, #F36B12)";
    }

}


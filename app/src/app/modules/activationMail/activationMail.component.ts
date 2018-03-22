import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';
import {ActivationMailService} from './activationMail.service';

@Component({
    selector: 'activationMail',
    templateUrl: './activationMail.component.html',
    styleUrls: ['./activationMail.component.scss'],
    providers: [ActivationMailService]
})

export class ActivationMailComponent implements OnInit {

    private key_localstorage_user = "user_external_ressource_sympozer"

    constructor(private router: Router,
        private apiExternalServer: ApiExternalServer,
        public snackBar: MdSnackBar,
        private DaoService: LocalDAOService,
        private localStoragexx: LocalStorageService,
        private ActivationMailService : ActivationMailService ) {

        }

    ngOnInit() {
		let user = this.localStoragexx.retrieve(this.key_localstorage_user)
        if(user !== null){
        	let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            window.location.replace(urlHost+'#/home');
        }
	
    }
    
    /**
	 *
	 * @param email
	 */
	resend(email){
		
		let result;
		this.ActivationMailService.resend(email).subscribe(

			response => {
				result = response;
			},

			err => { 
				console.log(err);
				this.snackBar.open("This email is invalid", "", {
					duration: 7000,
				});
			},

			() => { 
				this.snackBar.open("An email has been sent to your email. Please follow the instruction in the email to reset your password", "", {
					duration: 7000,
				});
				let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            	window.location.replace(urlHost+'#/login');
			}
			)
    }

}


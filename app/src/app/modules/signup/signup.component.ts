import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';


@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {


	private key_localstorage_user = "user_external_ressource_sympozer"

  	constructor(private router: Router,
	            private apiExternalServer: ApiExternalServer,
	            public snackBar: MdSnackBar,
	            private voteService: VoteService,
	            private DaoService: LocalDAOService,
	            private localStoragexx: LocalStorageService) { }

	ngOnInit() {
		let user = this.localStoragexx.retrieve(this.key_localstorage_user)
        if(user !== null){
        	let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            window.location.replace(urlHost+'#/home');
        }
	
	}

  	/**
	 * Invoke the signup external server service
	 * @param email
	 * @param password
	 * @param confirm password
	 */
	signup(email, password, confirmPassword){
		const that = this
	    this.apiExternalServer.signup(email, password, confirmPassword)
	        .then(() => {
	            
	        	this.snackBar.open("Please check your email to validate your account.", "", {
	                duration: 7000,
	            });

	            this.snackBar.open("The account creation request has been accepted by our server.", "", {
	                duration: 4000,
	            });

	            let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
            	window.location.replace(urlHost+'#/login');
	          
	        })
	        .catch((err) => {
	            this.snackBar.open(err, "", {
	                duration: 2000,
	            });
	        });
	}

}

import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor(private router: Router,
	            private apiExternalServer: ApiExternalServer,
	            public snackBar: MdSnackBar,
	            private voteService: VoteService,
	            private DaoService: LocalDAOService) { }

	ngOnInit() {
	
	}

  	/**
	 * Invoke the signup external server service
	 * @param email
	 * @param password
	 * @param confirm password
	 */
	signup(email, password, confirmPassword){
	    this.apiExternalServer.signup(email, password, confirmPassword)
	        .then(() => {
	            this.snackBar.open("Signing up was successful.", "", {
	                duration: 2000,
	            });
	            window.history.back()
	          
	        })
	        .catch((err) => {
	            this.snackBar.open(err, "", {
	                duration: 2000,
	            });
	        });
	}

}

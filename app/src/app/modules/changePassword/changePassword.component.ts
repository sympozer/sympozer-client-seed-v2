import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';
import {ChangePasswordService} from './changePassword.service';

@Component({
    selector: 'changePassword',
    templateUrl: './changePassword.component.html',
    styleUrls: ['./changePassword.component.scss'],
    providers: [ChangePasswordService]
})

export class ChangePasswordComponent implements OnInit {

    private key_localstorage_user = "user_external_ressource_sympozer"

    constructor(private router: Router,
        private apiExternalServer: ApiExternalServer,
        public snackBar: MdSnackBar,
        private DaoService: LocalDAOService,
        private localStoragexx: LocalStorageService,
        private ChangePasswordService : ChangePasswordService ) {

        }

    ngOnInit() {
		let user = this.localStoragexx.retrieve(this.key_localstorage_user);
		//let id = 
        //if(user !== null){
        //	let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
        //    window.location.replace(urlHost+'#/home');
        //}
	
    }
    
    /**
	 * @param currentPassword
	 * @param newPassword
	 */
	changePassword(id,currentPassword, newPassword){

		this.apiExternalServer.changePassword(id,currentPassword, newPassword)
            .then(() => {
                this.snackBar.open("You have successfully updated your password.", "", {
					duration: 3000,
				});
                let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname;
                window.location.replace(urlHost+'#/login');
            })
            .catch((err) => {
                this.snackBar.open(err, "", {
                    duration: 3000,
                });
            });
    }
}


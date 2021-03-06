import { Component, OnInit } from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MatSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ngx-webstorage';

@Component({
    selector: 'changePassword',
    templateUrl: './changePassword.component.html',
    styleUrls: ['./changePassword.component.scss'],
    providers: []
})

export class ChangePasswordComponent implements OnInit {

	private key_localstorage_user = "user_external_ressource_sympozer";
	private key_localstorage_id = 'id_external_ressource_sympozer';

    constructor(private router: Router,
        private apiExternalServer: ApiExternalServer,
        public snackBar: MatSnackBar,
        private DaoService: LocalDAOService,
        private localStoragexx: LocalStorageService) {

        }

    ngOnInit() {
		let user = this.localStoragexx.retrieve(this.key_localstorage_user);

        //if(user !== null){
        //	let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname
        //    window.location.replace(urlHost+'#/home');
        //}

    }

    /**
	 * @param currentPassword
	 * @param newPassword
	 */
	changePassword(currentPassword, newPassword, confirmPassword){

		this.apiExternalServer.changePassword(currentPassword, newPassword, confirmPassword)
            .then(() => {
                this.snackBar.open("You have successfully updated your password.", "", {
					duration: 3000,
				});
                let urlHost = window.location.protocol+'//'+window.location.host + window.location.pathname;
                window.location.replace(urlHost+'#/profile');
            })
            .catch((err) => {
                this.snackBar.open(JSON.parse(err.text()).message, "", {
                    duration: 3000,
                });
            });
    }
}

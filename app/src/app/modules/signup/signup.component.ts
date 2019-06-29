import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MatSnackBar} from '@angular/material';
import {VoteService} from '../../services/vote.service';
import {LocalDAOService} from '../../localdao.service';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    providers: []
})
export class SignupComponent implements OnInit {

    private key_localstorage_user = 'user_external_ressource_sympozer';

    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MatSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        const user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if (user !== null) {
            const urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.location.replace(urlHost + '#/home');
        }
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
        const that = this;

        if (!email || email.length === 0) {
            that.snackBar.open('Invalid email address.', '', {
                duration: 3000,
            });
        } else

        if (!firstname || firstname.length === 0) {
            that.snackBar.open('Invalid firstname', '', {
                duration: 3000,
            });
        } else

        if (!lastname || lastname.length === 0) {
            that.snackBar.open('Invalid lastname', '', {
                duration: 3000,
            });
        } else
        if (!password || password.length === 0) {
            that.snackBar.open('Invalid password', '', {
                duration: 3000,
            });
        } else

        if (!confirmPassword || confirmPassword.length === 0) {
            that.snackBar.open('Invalid password', '', {
                duration: 3000,
            });
        } else

        if (password !== confirmPassword) {
            that.snackBar.open('Passwords don\'t match.', '', {
                duration: 3000,
            });
        } else {
            this.apiExternalServer.signup(email, firstname, lastname, password)
                .then((message: string) => {

                    that.snackBar.open(message, '', {
                        duration: 4000,
                    });

                    const urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
                    window.location.replace(urlHost + '#/login');

                })
                .catch((resp) => {
                    this.snackBar.open(JSON.parse(resp._body)['message'], '', {
                        duration: 2000,
                    });
                });
        }
    }
}

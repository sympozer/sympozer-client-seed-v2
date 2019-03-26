import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MatSnackBar} from '@angular/material';
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from '../../localdao.service';
import {LocalStorageService} from 'ngx-webstorage';


@Component({
    selector: 'signupWithBadge',
    templateUrl: './signupWithBadge.component.html',
    styleUrls: ['./signupWithBadge.component.scss'],
    providers: []
})
export class SignupWithBadgeComponent implements OnInit {


    private key_localstorage_user = 'user_external_ressource_sympozer'

    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MatSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        let user = this.localStoragexx.retrieve(this.key_localstorage_user)
        if (user !== null) {
            let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname
            window.location.replace(urlHost + '#/home');
        }

    }

    /**
     * Invoke the signup external server service
     * @param email
     * @param emailUsed
     * @param firstname
     * @param lastname
     * @param password
     * @param confirm password
     */

    signupWithBadge(email, emailUsed, firstname, lastname, password, confirmPassword) {
        const that = this;

        if (!email || email.length === 0) {
            that.snackBar.open('Invalid email address.', "", {
                duration: 3000,
            });
        }

        if (!emailUsed || emailUsed.length === 0) {
            that.snackBar.open('Invalid email Used address.', "", {
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
            this.apiExternalServer.signupWithBadge(email,emailUsed,firstname, lastname, password)
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

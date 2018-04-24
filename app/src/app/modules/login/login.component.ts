import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from '@angular/material';
import {VoteService} from '../../services/vote.service';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {LocalStorageService} from 'ng2-webstorage';

const sha1 = require('sha-1');

@Component({
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: []
})
export class LoginComponent implements OnInit {

    title = 'Login';
    username = 'User';
    toggleLogin = true;
//    private key_localstorage_token = 'token_external_ressource_sympozer';
    private key_localstorage_user = 'user_external_ressource_sympozer';


    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MdSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        if (document.getElementById('page-title-p')) {
            document.getElementById('page-title-p').innerHTML = this.title;
        }
        const user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if (user !== null) {
            const urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.location.replace(urlHost + '#/home');

        }
    }

    login(email, password) {
        this.apiExternalServer.login(email, password)
            .then((user) => {
                this.snackBar.open('Login successful.', '', {
                    duration: 2000,
                });
                // window.location.href = 'http://www.google.com';
                /*
                this.voteService.votedPublications()
                    .then(() => {
                        this.sendLoginStatus(true)
                    })
                    .catch((err) => {
                        console.log(err);
                        this.snackBar.open("A network error occured. Please try again later.", "", {
                            duration: 2000,
                        });
                    });
                */


                // Retrieve the author by the publication

                const that = this;
                const emailSha1 = sha1('mailto:' + email);
                const query = {'key': emailSha1};
                that.DaoService.query('getPersonBySha', query, (results) => {

                    if (results) {
                        const nodeIdPerson = results['?id'];
                        const nodeLabel = results['?label'];

                        if (!nodeIdPerson || !nodeLabel) {
                            return false;
                        }

                        const idPerson = nodeIdPerson.value;
                        const label = nodeLabel.value;

                        if (!idPerson || !label) {
                            return false;
                        }
                        const username = label.split(' ');
                        that.snackBar.open('You are recognized as ' + label + '.', '', {
                            duration: 3000,
                        });

                    }
                });

                window.history.back();

            })
            .catch((resp) => {
                console.log(resp);
                this.snackBar.open(JSON.parse(resp._body)['message'], '', {
                    duration: 3000,
                });
            });
    }


    sendLoginStatus(status: boolean): void {
        // send status to subscribers via observable subject
        this.apiExternalServer.sendLoginStatus(status);
    }

    sendAuthorizationStatus(status: boolean): void {
        // send status to subscribers via observable subject
        this.apiExternalServer.sendAuthorizationVoteStatus(status);
    }

    /**
     * Send boolean firstname to all subscribers
     * @param firstname
     */
    sendFirstname(firstname: string): void {
        this.apiExternalServer.sendUsername(firstname);
    }



    authGoogle() {
        console.log('HELLLLLLLLLLOOOOO');
        this.apiExternalServer.authGoogleService();
    }

    authLinkedin(){
        console.log('HELLLLLLLLLLOOOOO 1');
        this.apiExternalServer.authLinkedinService();
    }

    authTwitter() {
        console.log('HELLLLLLLLLLOOOOO 2');
        this.apiExternalServer.authTwitterService();
    }

    authFacebook(){
        console.log('HELLLLLLLLLLOOOOO 3');
        this.apiExternalServer.authFacebookService();
    }
}

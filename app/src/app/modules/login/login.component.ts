import {Component, OnInit} from '@angular/core';
import {Config} from "../../app-config";
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {LocalStorageService} from 'ng2-webstorage';

const sha1 = require('sha-1');
const jwtDecode = require('jwt-decode');

@Component({
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: []
})
export class LoginComponent implements OnInit {

    title: string = "Login";
    username: string = "User";
    toggleLogin = true;
    private key_localstorage_token = "token_external_ressource_sympozer";
    private key_localstorage_user = "user_external_ressource_sympozer";


    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MdSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        let user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if (user !== null) {
            let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.location.replace(urlHost + '#/home');

        }
    }

    /**
     * Invoke the login external server service
     * @param email
     * @param password
     */
    /*
    login(email, password) {

        let userResult;
        this.apiLogin.authentification(email,password).subscribe(
            response => {
                userResult = response;
            },
            err => { 
                console.log(err);
                this.snackBar.open("Wrong Username or Password", "", {
                    duration: 2000,
                });
                },
            () => {
                this.localStoragexx.store(this.key_localstorage_token,userResult.token);
                let decoded = jwtDecode(userResult.token);
                console.log(decoded);
                let userInfo;
                this.apiLogin.getUser(decoded.id).subscribe(
                    response => {
                        userInfo = response;
                    },
                    err => {
                        console.log("Error");
                        console.log(err);
                    },
                    () =>  {
                        console.log(userInfo);
                        this.localStoragexx.store(this.key_localstorage_user,userInfo);
                        this.snackBar.open("Login successful.", "", {
                            duration: 2000,
                        });
                        window.history.back();
                    }
                );
            }
        );
    }
    */

    login(email, password) {
        this.apiExternalServer.login(email, password)
            .then((user) => {
                this.snackBar.open("Login successful.", "", {
                    duration: 2000,
                });
                //window.location.href = 'http://www.google.com';
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


                //Retrieve the author by the publication

                const that = this;
                let emailSha1 = sha1('mailto:' + email);
                let query = {'key': emailSha1};
                that.DaoService.query("getPersonBySha", query, (results) => {

                    if (results) {
                        const nodeIdPerson = results['?id'];
                        const nodeLabel = results['?label'];

                        if (!nodeIdPerson || !nodeLabel) {
                            return false;
                        }

                        let idPerson = nodeIdPerson.value;
                        const label = nodeLabel.value;

                        if (!idPerson || !label) {
                            return false;
                        }
                        let username = label.split(' ');
                        that.snackBar.open("You are recognized as " + label + ".", "", {
                            duration: 3000,
                        });
                        
                    }
                });

                window.history.back()

            })
            .catch((err) => {
                this.snackBar.open(JSON.parse(err.text()).message, "", {
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
        this.apiExternalServer.sendUsername(firstname)
    }



    authGoogle() {
        console.log("HELLLLLLLLLLOOOOO"); 
        this.apiExternalServer.authGoogleService();
    }

    authLinkedin(){

    }

    authTwitter() {

    }

    authFacebook(){

    }
}

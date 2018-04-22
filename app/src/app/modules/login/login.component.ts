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
    online:any;


    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MdSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private localStoragexx: LocalStorageService) {
        this.online = navigator.onLine;
    }

    ngOnInit(): void {
        window.addEventListener('online',  this.updateOnlinelogin);
        window.addEventListener('offline', this.updateOfflinelogin);
        if ( ! this.online ) {
            this.updateOfflinelogin();
        }
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        let user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if (user !== null) {
            let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.location.replace(urlHost + '#/home');

        }
    }

    login(email, password) {
        if (this.online) {
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

    update(user, firstname, lastname) {
        if ( this.online ) {
            console.log(user)
            if (user && user.firstname !== null) {
                if (user.firstname !== firstname) {
                    user.firstname = firstname
                    user.lastname = lastname
                    this.apiExternalServer.update(user)
                        .then(() => {
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            }
        }
    }


    authGoogle() {
        console.log("HELLLLLLLLLLOOOOO");
        this.apiExternalServer.authGoogleService();
    }

    authLinkedin(){
        console.log("HELLLLLLLLLLOOOOO 1");
        this.apiExternalServer.authLinkedinService();
    }

    authTwitter() {
        console.log("HELLLLLLLLLLOOOOO 2");
        this.apiExternalServer.authTwitterService();
    }

    authFacebook(){
        console.log("HELLLLLLLLLLOOOOO 3");
        this.apiExternalServer.authFacebookService();
    }
    updateOfflinelogin() {
        this.online = false;
        var toast = document.getElementById("toast");
        toast.innerText = "Waiting for Wifi connection.., Please try later";
        toast.style.backgroundColor = "#B71C1C";
        toast.className = "show";
        (<HTMLInputElement> document.getElementById("login-btn")).disabled = true;
        (<HTMLInputElement> document.getElementById("login-btn")).style.background = "#9E9E9E";

    }
    updateOnlinelogin(){
        this.online = true;
        var toast = document.getElementById("toast");
        toast.className.replace("show", "");
        toast.innerText = "Connected..";
        toast.style.backgroundColor = "#1B5E20";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        (<HTMLInputElement> document.getElementById("login-btn")).disabled = false;
        (<HTMLInputElement> document.getElementById("login-btn")).style.background = "linear-gradient(#e58307, #F36B12)";
    }
}
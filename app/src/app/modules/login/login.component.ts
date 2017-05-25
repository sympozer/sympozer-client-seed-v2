import {Component, OnInit} from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {LocalStorageService} from 'ng2-webstorage';
//import {Sha1} from '../../services/sha1'


//var sha1 = require('../../services/sha1')

@Component({
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class LoginComponent implements OnInit {

    title: string = "Login";
    username: string = "User"
    toggleLogin = true
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
        let user = this.localStoragexx.retrieve(this.key_localstorage_user)
        if(user !== null){
            let urlHost = window.location.protocol+'//'+window.location.host
            window.location.replace(urlHost+'/#/home');
        }
    }

    /**
     * Invoke the login external server service
     * @param email
     * @param password
     */
    login(email, password) {
        this.apiExternalServer.login(email, password)
            .then((user) => {
                this.snackBar.open("Login successful.", "", {
                    duration: 2000,
                });
                //window.location.href = 'http://www.google.com';
                this.voteService.votedPublications()
                    .then(()=>{
                        this.sendLoginStatus(true)
                    })
                    .catch((err)=>{
                        console.log(err)
                        this.snackBar.open("A network error occured. Please try again later.", "", {
                            duration: 2000,
                        });
                    })

                window.history.back()
                 console.log(user)
                
            /**
             * Retrieve the author by the publication
             */
            const that = this
            let emailSha1 = 'cb6e61ece04f3d3a91c1ed15388beacd6fa1affa'
            let query = {'key': emailSha1};
            this.DaoService.query("getPersonBySha", query, (results) => {
                
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
                    console.log("You are " + label)
                    idPerson = that.encoder.encode(idPerson);
                    if (!idPerson) {
                        return false;
                    }

                   
                }
            });
                })
            .catch((err) => {
                this.snackBar.open(err, "", {
                    duration: 2000,
                });
            });
    }

    sendLoginStatus(status : boolean): void {
        // send status to subscribers via observable subject
        this.apiExternalServer.sendLoginStatus(status);
    }

    sendAuthorizationStatus(status : boolean): void {
        // send status to subscribers via observable subject
        this.apiExternalServer.sendAuthorizationVoteStatus(status);
    }

    

}

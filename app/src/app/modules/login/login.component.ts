import {Component, OnInit} from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import {VoteService} from '../../services/vote.service'
import {LocalDAOService} from "../../localdao.service";

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
    private key_localstorage_username = "username_external_ressource_sympozer";
    constructor(private router: Router,
                private apiExternalServer: ApiExternalServer,
                public snackBar: MdSnackBar,
                private voteService: VoteService,
                private DaoService: LocalDAOService) {
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
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
                window.history.back()
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

                 console.log(user)
                 
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

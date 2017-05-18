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
            .then(() => {
                this.snackBar.open("Login successful.", "", {
                    duration: 2000,
                });
                window.history.back()
                this.voteService.votedPublications()
                    .then(()=>{
                        this.sendLoginStatus(true)
                    })
                    .catch((err)=>{
                        this.snackBar.open("A network error occured. Please try again later.", "", {
                            duration: 2000,
                        });
                    })


                    let query = {'key': "260fe2621184e204687dd63e25eeb65c84eeecff"};
                    const that = this
                    console.log("about to test")
                    this.DaoService.query("getPersonBySha", query, (results) => {
                        console.log(results);
                        if(results){
                            const nodeLabel = results['?label'];
                            const nodeId = results['?id'];

                            if(nodeLabel && nodeId){
                                const label = nodeLabel.value;
                                let id = nodeId.value;

                                if(label && id){
                                    console.log(label)
                                    that.sendAuthorizationStatus(true)
                                }
                            }
                        }
                        else{
                            that.sendAuthorizationStatus(false)
                        }

                    });
                })
            .catch((err) => {
                this.snackBar.open("A network occured during login. Please try again later.", "", {
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

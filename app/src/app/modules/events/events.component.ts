import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {GithubService} from '../../services/github.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-events',
    templateUrl: 'events.component.html',
    styleUrls: ['events.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventsComponent implements OnInit {
    events;
    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private githubService: GithubService) {
        this.events = [];
    }

    ngOnInit() {
        /*console.log("auth is being tested")
        //console.log(this.githubService.auth("1dcc9dbbdf85a10cbcbe84c87abbb1f4255ab0b1"))
        //this.githubService.getRate()
        //this.githubService.getLastHashCommit()
        console.log(this.githubService.getDiff());
        console.log("diff called")

        this.githubService.parseDiffFileForEswc("diff --git a/app/dataESWC.md b/app/dataESWC.md");*/

        //this.events = this.DaoService.query("getAllEvents", null);
        const that = this;
        this.DaoService.query("getAllEvents", null, (results) => {
            if(results){

            }
        });
        console.log(this.events);
    }
    search(text) {
        this.githubService.parseDiffFileForEswc(text);
    }


}
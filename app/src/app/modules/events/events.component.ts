import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {GithubService} from '../../services/github.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-events',
    templateUrl: 'events.component.html',
    styleUrls: ['events.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventsComponent implements OnInit {
    events;
    title: string = "Events";

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private githubService: GithubService) {
        this.events = [];
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
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
            if (results) {
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if (nodeId && nodeLabel) {
                    let id = nodeId.value;
                    const label = nodeLabel.value;

                    if (id && label) {
                        id = that.encoder.encode(id);
                        if (id) {
                            that.events = that.events.concat({
                                id: id,
                                label: label,
                            });

                            that.events.sort((a, b) => {
                                return a.label > b.label ? 1 : -1;
                            });
                        }
                    }
                }
            }
        });
    }

    search(text) {
        this.githubService.parseDiffFileForEswc(text);
    }
}
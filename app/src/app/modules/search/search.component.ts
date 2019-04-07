import {Component, OnInit}      from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}              from '@angular/common';
import {routerTransition} from '../../app.router.animation';
import { Subscription } from 'rxjs/Subscription';
import {ApiExternalServer} from '../../services/ApiExternalServer';


@Component({
    selector: 'search',
    templateUrl: 'search.component.html',
    styleUrls: ['./search.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class SearchComponent implements OnInit {
    testId: String;
    title: string = "";
    logSubscription: Subscription;
    hasLogged: any;

    constructor(private location: Location,
                private route: ActivatedRoute, private apiExternalServer: ApiExternalServer) {
                    this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
                        this.hasLogged = status;
                    });
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
            let id = params['id'];
            this.testId = id;
            if (this.testId == 'event')
                this.title = "Find an " + this.testId;
            else if (this.testId == 'vote')
                this.title = "Find an Election";
            else
                this.title = "Find a " + this.testId;
            if (document.getElementById("page-title-p"))
                document.getElementById("page-title-p").innerHTML = this.title;
        });
    }

}

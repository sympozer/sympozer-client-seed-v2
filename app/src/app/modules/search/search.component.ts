import {Component, OnInit}      from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}              from '@angular/common';


@Component({
    selector: 'search',
    templateUrl: 'search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    testId: String;

    constructor(private location: Location,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
            let id = params['id'];
            this.testId = id;
            //console.log("id : " + id);
        });
    }

}

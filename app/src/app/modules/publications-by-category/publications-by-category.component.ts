import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }              from '@angular/common';

@Component({
    selector: 'publications-by-category',
    templateUrl: './publications-by-category.component.html',
    styleUrls: ['./publications-by-category.component.css']
})
export class PublicationsByCategoryComponent implements OnInit {
    testId: String;

    constructor(
        private location: Location,
        private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
            let id = params['id'];
            this.testId = id;
            //console.log("id : " + id);
        });
    }

}

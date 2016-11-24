import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }              from '@angular/common';

@Component({
    selector: 'person-by-role',
    templateUrl: './person-by-role.component.html',
    styleUrls: ['./person-by-role.component.css']
})
export class PersonByRoleComponent implements OnInit {
    testId: String;
    ref: String;

    constructor(
        private location: Location,
        private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.testId = params['id'];
            this.ref = params['ref'];
            //console.log("id : " + id);
        });
    }
}


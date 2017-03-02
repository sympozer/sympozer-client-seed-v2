import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'person-by-role',
    templateUrl: './person-by-role.component.html',
    styleUrls: ['./person-by-role.component.css']
})
export class PersonByRoleComponent implements OnInit {
    persons;

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private DaoService: LocalDAOService,  
        private encoder: Encoder) {}

    ngOnInit(): void {
        // propriété personLinkMapByRole
        // this.persons = this.DaoService.query("getPersonsByRole", null);
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['ref'];
            let query = { 'key' : this.encoder.decodeForURI(id) };
            this.persons = this.DaoService.query("getPersonsByRole", query);
            console.log("persons : " + JSON.stringify(this.persons)); 
        });
    }
}


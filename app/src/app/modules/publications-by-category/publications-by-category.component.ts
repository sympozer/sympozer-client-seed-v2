import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }              from '@angular/common';
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'publications-by-category',
    templateUrl: './publications-by-category.component.html',
    styleUrls: ['./publications-by-category.component.css']
})
export class PublicationsByCategoryComponent implements OnInit {
    private category;
    private publications = {};

    constructor(
        private route: ActivatedRoute,
        private DaoService : LocalDAOService,
        private encoder: Encoder) {}

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
            let query = { 'key' : this.encoder.decodeForURI(params['id'])};
            this.category = this.DaoService.query("getCategory", query);

            for(let i in this.category.publications){
                let query = { 'key' : this.category.publications[i] };
                this.publications[i] = this.DaoService.query("getPublicationLink",query);
            }
            console.log(this.publications);

            //console.log("id : " + id);
        });
    }

}

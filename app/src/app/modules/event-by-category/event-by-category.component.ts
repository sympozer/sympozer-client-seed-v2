import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";

import * as moment from 'moment';

@Component({
    selector: 'app-event-by-category',
    templateUrl: 'event-by-category.component.html',
    styleUrls: ['event-by-category.component.css'],
})
export class EventByCategoryComponent implements OnInit {
    private eventCategory;
    private events = {};
    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private route: ActivatedRoute,  private encoder: Encoder) {
    }

    ngOnInit() {
        //this.events = this.DaoService.query("getAllEvents", null);
        //console.log(this.events);
        this.route.params.forEach((params: Params) => {
            let query = { 'key' : this.encoder.decodeForURI(params['id'])};
            this.eventCategory = this.DaoService.query("getCategory", query);
            for(let i in this.eventCategory.events){
                let query = { 'key' : this.eventCategory.events[i] };
                this.events[i] = this.DaoService.query("getEventLink",query);
            }
            console.log(this.eventCategory);
            console.log(this.events);
        });
    }

}

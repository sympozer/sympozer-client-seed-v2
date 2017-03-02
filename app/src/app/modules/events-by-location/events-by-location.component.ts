import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";

import * as moment from 'moment';

@Component({
    selector: 'app-events-by-location',
    templateUrl: 'events-by-location.component.html',
    styleUrls: ['events-by-location.component.css'],
})
export class EventsByLocationComponent implements OnInit {
    private eventsLocation;
    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private route: ActivatedRoute,  private encoder: Encoder) {
    }

    ngOnInit() {
        //this.events = this.DaoService.query("getAllEvents", null);
        //console.log(this.events);
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = { 'key' : this.encoder.decodeForURI(id) };
            this.eventsLocation = this.DaoService.query("getLocationLink", query);
            for(let i in this.eventsLocation.events){
                this.eventsLocation.events[i].startsAt = moment(this.eventsLocation.events[i].startsAt).format('LLLL');
                this.eventsLocation.events[i].endsAt = moment(this.eventsLocation.events[i].endsAt).format('LLLL');
                this.eventsLocation.events[i].duration = moment.duration(this.eventsLocation.events[i].duration).humanize();
            }
            console.log(this.eventsLocation);
        });
    }

}

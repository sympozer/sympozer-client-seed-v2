import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";

import * as moment from 'moment';


@Component({
    selector: 'app-event',
    templateUrl: 'event.component.html',
    styleUrls: ['event.component.css'],
})
export class EventComponent implements OnInit {
    private event;
    private partof;
    private publications = {};
    private locations = {};
    private contents = {};
    private startsAt;
    private endsAt;
    private duration;

    constructor(private router:Router,private route: ActivatedRoute,
                private DaoService: LocalDAOService,  private encoder: Encoder) {

    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = { 'key' : this.encoder.decodeForURI(id) };
            this.event = this.DaoService.query("getEvent", query);
            console.log(this.event);
            this.startsAt = moment(this.event.startsAt).format('LLLL');
            this.endsAt = moment(this.event.endsAt).format('LLLL');
            this.duration = moment.duration(this.event.duration).humanize();

            for(let i in this.event.papers){
                let query = { 'key' : this.event.papers[i] };
                this.publications[i] = this.DaoService.query("getPublicationLink",query);
            }
            if(this.event.parent != null){
                let query = { 'key' : this.event.parent };
                this.partof = this.DaoService.query("getEventLink", query);
            }
            for(let i in this.event.locations){
                let query = { 'key' : this.event.locations[i] };
                this.locations[i] = this.DaoService.query("getLocationLink",query);
                this.locations[i].id = this.encoder.encodeForURI(this.locations[i].id);
            }
            for(let i in this.event.children){
                let query = { 'key' : this.event.children[i] };
                this.contents[i] = this.DaoService.query("getEvent",query);
            }
        });
    }
}

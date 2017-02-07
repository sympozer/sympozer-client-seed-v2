import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
@Component({
    selector: 'app-events',
    templateUrl: 'events.component.html',
    styleUrls: ['events.component.css'],
})
export class EventsComponent implements OnInit {
    events;
    constructor(private router:Router,
                private DaoService : LocalDAOService) {
    }

    ngOnInit() {
        this.events = this.DaoService.query("getAllEvents", null);
        console.log(this.events);
    }

}

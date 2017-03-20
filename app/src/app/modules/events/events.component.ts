import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-events',
    templateUrl: 'events.component.html',
    styleUrls: ['events.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
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

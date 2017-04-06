import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params}   from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import * as moment from 'moment';

@Component({
    selector: 'whatsnext',
    templateUrl: 'whatsnext.component.html',
    styleUrls: ['whatsnext.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class WhatsNextComponent implements OnInit {
    schedules;

    constructor(private location: Location,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService) {
    }

    ngOnInit() {
        this.schedules = this.DaoService.query("getWhatsNext", null);
        for (let i in this.schedules) {
            this.schedules[i].startsAt = moment(this.schedules[i].startsAt).format('LLLL');
            this.schedules[i].endsAt = moment(this.schedules[i].endsAt).format('LLLL');
            this.schedules[i].duration = moment.duration(this.schedules[i].duration).humanize();
        }
        console.log(this.schedules);

    }
}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params}   from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'whatsnext',
    templateUrl: 'whatsnext.component.html',
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
        console.log(this.schedules);

    }
}

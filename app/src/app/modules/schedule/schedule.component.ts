import {Component, OnInit, trigger, transition, style, animate, state} from '@angular/core';
import {ActivatedRoute, Params}   from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import * as moment from 'moment';

@Component({
    selector: 'schedule',
    templateUrl: 'schedule.component.html',
    styleUrls: ['./schedule.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ScheduleComponent implements OnInit {
    schedule;
    schedules;
    test = false;
    dayPerDay = [];
    title: string = "Schedule";

    constructor(private location: Location,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService) {
    }

    ngOnInit() {
        const that = this;
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;

        that.DaoService.query("getDayPerDay", null, (results) => {
            if (results) {
                const nodeStartDate = results['?startDate'];
                if (nodeStartDate) {
                    const startDate = moment(nodeStartDate.value);
                    if (startDate) {
                        const beginStartDate = startDate.startOf('day');
                        if (beginStartDate) {
                            const find = that.dayPerDay.find((dpd) => {
                                return dpd.date === beginStartDate.format();
                            });

                            if (find) {
                                return false;
                            }

                            that.dayPerDay = that.dayPerDay.concat({
                                date: beginStartDate.format(),
                                showDate: beginStartDate.format('LL'),
                            });

                            that.dayPerDay.sort((a, b) => {
                                return a.showDate > b.showDate ? 1 : -1;
                            });
                        }
                    }
                }
            }
        });
    }

    toggleVisible(schedule) {
        if (schedule.visible == false)
            schedule.visible = true;
        else
            schedule.visible = false;
    }
}
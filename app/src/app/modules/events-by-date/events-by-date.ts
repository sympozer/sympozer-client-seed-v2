import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params}   from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import * as moment from 'moment';
import {Encoder} from "../../lib/encoder";
import {RessourceDataset} from '../../services/RessourceDataset';
import {TimeManager} from '../../services/timeManager.service';

@Component({
    selector: 'eventsbydate',
    templateUrl: 'events-by-date.html',
    styleUrls: ['events-by-date.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventsByDate implements OnInit {
    schedules;
    day;

    constructor(private location: Location,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.schedules = [];
        this.day = '';
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let date = params['date'];
            if (date) {
                const momentStartDate = moment(date);
                that.day = momentStartDate.format('LL');
                if (document.getElementById("page-title-p"))
                    document.getElementById("page-title-p").innerHTML = that.day;
                let end = moment(date);
                end.add(1, 'days');
                end = moment(end.format());

                if (momentStartDate) {
                    that.DaoService.query("getEventByDateDayPerDay", {
                        startDate: momentStartDate,
                        endDate: end,
                    }, (results) => {
                        if (results) {
                            const nodeId = results['?id'];
                            const nodeLabel = results['?label'];
                            const nodeStartDate = results['?startDate'];
                            const nodeEndDate = results['?endDate'];
                            const nodeType = results['?type'];

                            if (nodeId && nodeLabel && nodeStartDate && nodeEndDate && nodeType) {
                                let id = nodeId.value;
                                const label = nodeLabel.value;
                                const startDate = nodeStartDate.value;
                                const endDate = nodeEndDate.value;
                                let type = nodeType.value;

                                if (id && label && startDate && endDate && type) {
                                    id = that.encoder.encode(id);
                                    if (id) {

                                        const momentStartDate = moment(startDate);
                                        const momentEndDate = moment(endDate);

                                        if (momentEndDate && momentStartDate) {
                                            const strDuration = TimeManager.startAndEndTimeToString(momentStartDate, momentEndDate);

                                            //On récup le type dans l'URI
                                            type = that.ressourceDataset.extractType(type, label);

                                            that.schedules = that.schedules.concat({
                                                id: id,
                                                label: label,
                                                startDate: momentStartDate.format('LLLL'),
                                                duration: strDuration,
                                                dateForSort: momentStartDate.format(),
                                                type: type,
                                                compare: momentStartDate,
                                            });

                                            /*that.schedules.sort((a, b) => {
                                             const momentA = moment(a.dateForSort);
                                             const momentB = moment(b.dateForSort);
                                             return momentA.isSameOrAfter(momentB) ? 1 : -1;
                                             });*/

                                            that.schedules.sort((a, b) => {
                                                return a.compare.isAfter(b.compare) ? 1 : -1;
                                                //return a.compare > b.beginStartDate ? 1 : -1;
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
        /*this.schedules = this.DaoService.query("getWhatsNext", null);
         for (let i in this.schedules) {
         this.schedules[i].startsAt = moment(this.schedules[i].startsAt).format('LLLL');
         this.schedules[i].endsAt = moment(this.schedules[i].endsAt).format('LLLL');
         this.schedules[i].duration = moment.duration(this.schedules[i].duration).humanize();
         }
         console.log(this.schedules);*/

    }
}

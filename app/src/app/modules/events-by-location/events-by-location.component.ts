import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {LocalDAOService} from  '../../localdao.service';

import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

import * as moment from 'moment';
import {TimeManager} from "../../services/timeManager.service";

@Component({
    selector: 'app-events-by-location',
    templateUrl: 'events-by-location.component.html',
    styleUrls: ['events-by-location.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventsByLocationComponent implements OnInit {
    public eventsLocation = [];
    public nameLocation : String;
    public geo = null;

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private route: ActivatedRoute,
                private encoder: Encoder,
                private sanitizer: DomSanitizer
              ) {
    }

    ngOnInit() {
        //this.events = this.DaoService.query("getAllEvents", null);
        //console.log(this.events);
        const that = this;
        this.route.params.forEach((params: Params) => {
            let name = params['name'];
            let query = {'key': this.encoder.decode(name)};
            that.nameLocation = name;

            that.DaoService.query("getGeoByLabel", query, (results) => {
                  if (results && results['?geo']) {
                      that.geo = that.sanitizer.bypassSecurityTrustUrl(results['?geo'].value);
                  }
            });

            that.DaoService.query("getEventByLocation", query, (results) => {

/*
                if(results)
                {
                    const nodeId = results['?id'];

                    if(nodeId){
                        let id = nodeId.value;
                    }

                    if(id)
                    {

                    }

                }
  */

                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];
                    const nodeStartDate = results['?startDate'];
                    const nodeEndDate = results['?endDate'];

                    if (nodeId && nodeLabel && nodeStartDate && nodeEndDate) {
                        let id = nodeId.value;
                        const label = nodeLabel.value;
                        const startDate = nodeStartDate.value;
                        const endDate = nodeEndDate.value;

                        if (id && label && startDate && endDate) {
                            id = that.encoder.encode(id);

                            if (id) {

                                const momentStartDate = moment(startDate);
                                const momentEndDate = moment(endDate);

                                if (momentEndDate && momentStartDate) {
                                    const strDuration = TimeManager.startAndEndTimeToString(momentStartDate, momentEndDate);

                                    const find = that.eventsLocation.find((e) => {
                                       return e.id === id;
                                    });

                                    if(find){
                                        return false;
                                    }

                                    that.eventsLocation = that.eventsLocation.concat({
                                        id: id,
                                        label: label,
                                        startDate: momentStartDate.format('LLLL'),
                                        duration: strDuration,
                                        endDate: momentEndDate.format('LLLL'),
                                        dateForSort: momentStartDate.format(),
                                    });

                                    that.eventsLocation.sort((a, b) => {
                                        const momentA = moment(a.dateForSort);
                                        const momentB = moment(b.dateForSort);
                                        return momentA.isSameOrAfter(momentB) ? 1 : -1;
                                    });

                                    /*that.eventsLocation.sort((a, b) => {
                                        return a.startsAt.isAfter(b.startsAt) ? 1 : -1;
//										const momentA = moment(a.dateForSort);
//										const momentB = moment(b.dateForSort);
//										return momentA.isSameOrAfter(momentB) ? 1 : -1;
//                                        return a.label > b.label ? 1 : -1;
                                    });*/
                                }
                            }
                        }
                    }
                }
            });
        });
    }

}

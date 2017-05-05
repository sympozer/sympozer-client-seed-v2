import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

import * as moment from 'moment';

@Component({
    selector: 'app-event-by-category',
    templateUrl: 'event-by-category.component.html',
    styleUrls: ['event-by-category.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventByCategoryComponent implements OnInit {
    public trackName;
    public events = [];

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private route: ActivatedRoute,
                private encoder: Encoder) {
    }

    ngOnInit() {
        //this.events = this.DaoService.query("getAllEvents", null);
        //console.log(this.events);
        const that = this;
        this.route.params.forEach((params: Params) => {
            that.trackName = params['name'];
            if (document.getElementById("page-title-p"))
                document.getElementById("page-title-p").innerHTML = that.trackName;
            let query = {'key': this.encoder.decode(params['id'])};
            this.DaoService.query('getEventByTrack', query, (results) => {
                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if (nodeId && nodeLabel) {
                        let id = nodeId.value;
                        const label = nodeLabel.value;

                        if (id && label) {
                            id = that.encoder.encode(id);
                            if (id) {
                                that.events = that.events.concat({
                                    id: id,
                                    label: label,
                                });
                            }
                        }
                    }
                }
            });
        });
    }

}

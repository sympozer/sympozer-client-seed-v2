import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

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
                private DaoService : LocalDAOService,
                private encoder: Encoder) {
        this.events = [];
    }

    ngOnInit() {
        const that = this;
        this.DaoService.query("getAllEvents", null, (results) => {
            if(results){
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if(nodeId && nodeLabel){
                    let id = nodeId.value;
                    const label = nodeLabel.value;

                    if(id && label){
                        id = that.encoder.encode(id);
                        if(id){
                            that.events = that.events.concat({
                                id: id,
                                label: label,
                            });

                            that.events.sort((a, b) => {
                                return a.label > b.label ? 1 : -1;
                            });
                        }
                    }
                }
            }
        });
    }

}

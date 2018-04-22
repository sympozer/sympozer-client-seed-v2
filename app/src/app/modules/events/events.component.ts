import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";
import {RessourceDataset} from '../../services/RessourceDataset';

let cache: Array<Object> = null;

@Component({
    selector: 'app-events',
    templateUrl: 'events.component.html',
    styleUrls: ['events.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventsComponent implements OnInit {
    events;
    title: string = "Events";
    private mutex: any;

    tabEvents: Array<Object> = new Array();

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.events = [];
        if (cache === null) {
            cache = [];
            DaoService.registerShortLivedCache(cache);
        }
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;

        if (cache.length > 0) {
            that.events = cache;
        } else {
            let seen = new Set();
            let eventsBuffer = [];
            this.DaoService.query("getAllEvents", null, (results) => {
                if (results) {
                    // only keep events with no related publication
                    if (results['?paper']) { return false; }

                    let id = results['?id'].value;
                    if (seen.has(id)) { return false; }
                    seen.add(id);

                    const label = results['?label'].value;
                    //let type = results['?type'].value; // removed from SPARQL for perf

                    id = that.encoder.encode(id);
                    if (id) {
                        //On récup le type dans l'URI
                        //type = that.ressourceDataset.extractType(type, label);

                        eventsBuffer.push({
                            id: id,
                            label: label,
                            //type: type
                        });
                    }
                }
            }, () => {
                eventsBuffer.sort((a, b) => {
                    return a.label > b.label ? 1 : -1;
                });
                that.events = eventsBuffer; // force GUI refresh
                cache.push(...eventsBuffer);
            });
        }
    }

}

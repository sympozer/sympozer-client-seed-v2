import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";
import {RessourceDataset} from '../../services/RessourceDataset';

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
    tabEvents: Array<Object> = new Array();    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.events = [];
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;
        this.DaoService.query("getAllEvents", null, (results) => {
            if(results){
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];
                const nodeType = results['?type'];

                if (nodeId && nodeLabel && nodeType) {
                    let id = nodeId.value;
                    const label = nodeLabel.value;
                    let type = nodeType.value;

                    if (id && label && type) {
                        id = that.encoder.encode(id);
                        if (id) {
                            //On récup le type dans l'URI
                            type = that.ressourceDataset.extractType(type, label);

                            that.events = that.events.concat({
                                id: id,
                                label: label,
                                type: type
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

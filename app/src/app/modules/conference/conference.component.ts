import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';
import {RessourceDataset} from '../../services/RessourceDataset';

import * as moment from 'moment';


@Component({
    selector: 'app-event',
    templateUrl: 'conference.component.html',
    styleUrls: ['conference.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ConferenceComponent implements OnInit {
    public event;
    public publications = {};
    public locations = {};
    public contents = {};
    public startsAt;
    public endsAt;
    public duration;
    public subEventOf;
    private mutex;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.event = {};
        this.subEventOf = [];
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];

            let query = {'key': this.encoder.decode(id)};
            this.DaoService.query("getConference", query, (results, err) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeEndDate = results['?endDate'];
                    const nodeStartDate = results['?startDate'];
                    const nodeLocation = results['?location'];

                    if (nodeLabel && nodeEndDate && nodeStartDate) {
                        const label = nodeLabel.value;
                        let endDate = nodeEndDate.value;
                        let startDate = nodeStartDate.value;

                        let location = null;
                        if (nodeLocation) {
                            location = nodeLocation.value;
                        }

                        if (label && endDate && startDate) {
                            startDate = moment(startDate);
                            endDate = moment(endDate);

                            const duration = moment.duration(endDate.diff(startDate));

                            var hours = parseInt(duration.asHours().toString());
                            var minutes = parseInt(duration.asMinutes().toString()) - hours * 60;

                            let strDuration = "";
                            if (hours > 0) {
                                if (hours < 2) {
                                    strDuration = hours + " hour and ";
                                }
                                else {
                                    strDuration = hours + " hours and ";
                                }
                            }
                            if (minutes > 0) {
                                if (minutes < 2) {
                                    strDuration += minutes + " minute";
                                }
                                else {
                                    strDuration += minutes + " minutes";
                                }
                            }

                            that.event = {
                                label: label,
                                startsAt: startDate.format('LLLL'),
                                endsAt: endDate.format('LLLL'),
                                duration: strDuration,
                                location: location,
                            };
                            if (document.getElementById("page-title-p"))
                                document.getElementById("page-title-p").innerHTML = label;
                        }
                    }
                }
            });

            that.DaoService.query("getSubEventOfConference", query, (results) => {
                console.log(results);
                if(results){
                    const nodeSubEvent = results['?subEvent'];
                    const nodeType = results['?type'];

                    if(nodeSubEvent && nodeType){
                        const subEvent = nodeSubEvent.value;
                        const typeRessourceTemp = nodeType.value;

                        let type;
                        if(typeRessourceTemp){
                            const tab = typeRessourceTemp.split('#');
                            if(tab.length !== 2) {
                                return false;
                            }

                            type = tab[1];
                        }

                        if(subEvent && type){
                            let idEncoded = that.encoder.encode(subEvent);

                            const find = that.subEventOf.find((s) => {
                                return idEncoded === s.id;
                            });

                            if(find){
                                return false;
                            }

                            const sub = {
                                id: idEncoded,
                                label: '',
                                urlToSearch: '',
                            };

                            that.subEventOf = that.subEventOf.concat(sub);

                            that.DaoService.query("getLabelById", {
                                key: subEvent
                            }, (results) => {
                                if(results){
                                    const nodeLabel = results['?label'];

                                    if(nodeLabel){
                                        const label = nodeLabel.value;

                                        if(!label){
                                            return false;
                                        }

                                        type = type.toLowerCase();

                                        let urlToSearch;

                                        if(type === "track"){
                                            urlToSearch = '/event-by-category/';
                                        }
                                        else {
                                            urlToSearch = '/event/';
                                        }

                                        sub.label = label;
                                        sub.urlToSearch = urlToSearch;
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    }
}

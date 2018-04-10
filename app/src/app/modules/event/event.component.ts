import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';
import {RessourceDataset} from '../../services/RessourceDataset';
import {Mutex} from 'async-mutex';
import {Config} from "../../app-config";
//import {ICS} from "ics";
var ICS = require('ics');

import * as moment from 'moment';
import {TimeManager} from "../../services/timeManager.service";


@Component({
    selector: 'app-event',
    templateUrl: 'event.component.html',
    styleUrls: ['event.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class EventComponent implements OnInit {
    public event;
    public partof;
    public publications = {};
    public locations = {};
    public contents = {};
    public startsAt;
    public endsAt;
    public duration;
    public encodedID;
    public subEventOf;
    public hasSubEvent;
    private mutex;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.event = {};
        this.subEventOf = [];
        this.mutex = new Mutex();
        this.hasSubEvent = [];
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decode(id)};
            this.encodedID = this.encoder.decode(id);
            this.DaoService.query("getEventById", query, (results, err) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeDescription = results['?description'];
                    const nodeEndDate = results['?endDate'];
                    const nodeStartDate = results['?startDate'];
                    const nodeHasSubEvent = results['?hasSubEvent'];
                    const nodeIsSubEventOf = results['?isSubEventOf'];
                    const nodeType = results['?type'];
                    const nodeHomepage = results['?homepage'];
                    const nodeLocation = results['?location1'] || results['?location2'];
                    const nodeLocationId = results['?locId1'] || results['?locId2'];

                    if (nodeLabel && nodeDescription && nodeEndDate && nodeStartDate && nodeType) {
                        const label = nodeLabel.value;
                        const description = nodeDescription.value;
                        let endDate = nodeEndDate.value;
                        let startDate = nodeStartDate.value;
                        let type = nodeType.value;

                        let homepage = nodeHomepage ? nodeHomepage.value : null;
                        let location = nodeLocation ? nodeLocation.value : null;
                        let locationId = nodeLocationId ? nodeLocationId.value : null;

                        if (label && description && endDate && startDate && type) {
                            startDate = moment(startDate);
                            endDate = moment(endDate);

                            const strDuration = TimeManager.startAndEndTimeToString(startDate, endDate);

                            //On récup le type dans l'URI
                            type = that.ressourceDataset.extractType(type, label);

                            const typeIsIntoLabel = that.ressourceDataset.isIncludeIntoLabel(type, label);

                            that.event = {
                                label: label,
                                description: description,
                                startsAt: startDate.format('LLLL'),
                                endsAt: endDate.format('LLLL'),
                                duration: strDuration,
                                homepage: homepage,
                                location: location,
                                locationId: locationId,
                                publications: [],
                                tracks: [],
                                type: typeIsIntoLabel ? null : type,
                            };
                            if (document.getElementById("page-title-p"))
                                document.getElementById("page-title-p").innerHTML = label;
                            //On regarde si il y a des sub event of
                            if (nodeIsSubEventOf) {
                                const subEventOfBase = nodeIsSubEventOf.value;

                                const subEventOf = that.encoder.encode(subEventOfBase);

                                if (subEventOf) {

                                    that.DaoService.query("getIsSubEvent", {key: subEventOfBase}, (results) => {
                                        if (results) {
                                            const nodeLabel = results['?label'];

                                            if (nodeLabel) {
                                                const label = nodeLabel.value;

                                                if (label) {
                                                    that.mutex
                                                        .acquire()
                                                        .then(function (release) {
                                                            //On regade si on l'a déjà
                                                            const find = that.subEventOf.find((evOf) => {
                                                                return evOf.idCompare === subEventOfBase;
                                                            });

                                                            if (!find) {
                                                                const idEncode = that.encoder.encode(subEventOfBase);

                                                                that.subEventOf = that.subEventOf.concat({
                                                                    id: idEncode,
                                                                    label: label,
                                                                    idCompare: subEventOfBase,
                                                                    isConference: subEventOfBase.includes('conference')
                                                                });
                                                            }

                                                            release();
                                                        });
                                                }
                                            }
                                        }
                                    });
                                }
                            }

                            //Check if we have hasSubEvent
                            if(nodeHasSubEvent){
                                const hasSubEvent = nodeHasSubEvent.value;

                                if(hasSubEvent){
                                    that.DaoService.query("getTalkById", {key: hasSubEvent}, (results) => {
                                        if(results){
                                            const nodeLabel = results['?label'];
                                            const nodeIsEventRelatedTo = results['?isEventRelatedTo'];

                                            if(nodeLabel && nodeIsEventRelatedTo){
                                                const label = nodeLabel.value;
                                                const isEventRelatedTo = nodeIsEventRelatedTo.value;
                                                if(label){
                                                    that.mutex
                                                        .acquire()
                                                        .then(function (release) {
                                                            //On regade si on l'a déjà
                                                            const find = that.hasSubEvent.find((subOf) => {
                                                                return subOf.idCompare === hasSubEvent;
                                                            });

                                                            if (!find) {
                                                                const idEncode = that.encoder.encode(hasSubEvent);
                                                                const isEventRelatedToEncoded = that.encoder.encode(isEventRelatedTo);

                                                                that.hasSubEvent = that.hasSubEvent.concat({
                                                                    id: isEventRelatedToEncoded,
                                                                    label: label,
                                                                    idCompare: hasSubEvent,
                                                                });

                                                                that.hasSubEvent.sort((a, b) => {
                                                                    return a.label > b.label ? 1 : -1;
                                                                });
                                                            }

                                                            release();
                                                        });
                                                }
                                            }
                                        }
                                    });
                                }
                            }

                            that.DaoService.query("getPublicationsByEvent", query, (results) => {
                                if (results) {
                                    const nodeId = results['?id'];
                                    const nodeLabel = results['?label'];

                                    if (nodeId && nodeLabel) {
                                        let id = nodeId.value;
                                        const label = nodeLabel.value;

                                        if (document.getElementById("page-title-p"))
                                            document.getElementById("page-title-p").innerHTML = label;

                                        if (id && label) {
                                            id = that.encoder.encode(id);

                                            if (id) {
                                                //On regarde si on a pas déjà l'event
                                                const find = that.event.publications.find((event) => {
                                                    return event.id === id;
                                                });

                                                if (find) {
                                                    return false;
                                                }

                                                //Si l'event est de type Track et qu'on est ici (au moin une publi)
                                                // alors on redirige sur la publi
                                                if (type && type.length > 0 && type.toLowerCase() === "talk") {
                                                    return that.router.navigate(['/publication/' + label + '/' + id]);
                                                }

                                                that.event.publications = that.event.publications.concat({
                                                    id: id,
                                                    label: label,
                                                });
                                            }
                                        }
                                    }
                                }
                            });

                            that.DaoService.query("getTrackByEvent", query, (results) => {
                                if (results) {
                                    const nodeId = results['?id'];
                                    const nodeLabel = results['?label'];

                                    if (nodeId && nodeLabel) {
                                        let id = nodeId.value;
                                        const label = nodeLabel.value;

                                        if (id && label) {
                                            id = that.encoder.encode(id);
                                            if (id) {
                                                //On regarde si on a pas déjà le track
                                                const find = that.event.tracks.find((track) => {
                                                    return track.id === id;
                                                });

                                                if (find) {
                                                    return false;
                                                }

                                                that.event.tracks = that.event.tracks.concat({
                                                    id: id,
                                                    label: label,
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    }

    /**
     * Constructs a realistic ICS description of the event, that can be imported in a calendar
     */
    createICS = () => {
        var ics = new ICS();
        const that = this

        let calendar = ics.buildEvent({
            uid: '', // (optional)
            start: that.event.startsAt,
            end: that.event.endsAt,
            title: that.event.label,
            description: that.event.description,
            location: that.event.location, //
            url: that.event.publications.id,
            status: 'confirmed',
            geo: {lat: 45.515113, lon: 13.571873,},
            attendees: [
                //{ name: 'Adam Gibbons', email: 'adam@example.com' }
            ],
            categories: that.event.session,
            alarms: [
                {action: 'DISPLAY', trigger: '-PT24H', description: 'Reminder', repeat: true, duration: 'PT15M'},
                {action: 'AUDIO', trigger: '-PT30M'}
            ]
        });
        window.open("data:text/calendar;charset=utf8," + encodeURIComponent(calendar));
    }
}

import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

import {Subscription} from 'rxjs/Subscription';
import * as moment from 'moment';
import {TimeManager} from "../../services/timeManager.service";
var ICS = require('ics');

@Component({
    selector: 'app-publication',
    templateUrl: 'publication.component.html',
    styleUrls: ['publication.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationComponent implements OnInit {
    public publication;
    public authors;
    public events = [];
    public track = {};
    public keywords = [];
    public publicationId;
    public trackId;
    public eventType;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.authors = [];
        this.publication = {
            label: undefined,
            abstract: undefined
        };

    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decode(id)};
            this.publicationId = query.key;
            /**
             * Retrieve the publication
             */
            this.DaoService.query("getPublication", query, (results) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeAbstract = results['?abstract'];

                    if (!nodeLabel || !nodeAbstract) {
                        return false;
                    }

                    const label = nodeLabel.value;
                    const abstract = nodeAbstract.value;

                    if (!label || !abstract) {
                        return false;
                    }

                    that.publication.label = label;
                    that.publication.abstract = abstract;
                    if (document.getElementById("page-title-p"))
                        document.getElementById("page-title-p").innerHTML = label;
                }
            });

            /**
             * Retrieve the author by the publication
             */
            /*this.DaoService.query("getAuthorLinkPublication", query, (results) => {
             console.log('getAuthorLinkPublication : ', results);
             if (results) {
             const nodeIdPerson = results['?idPerson'];
             const nodeLabel = results['?label'];

             if (!nodeIdPerson || !nodeLabel) {
             return false;
             }

             let idPerson = nodeIdPerson.value;
             const label = nodeLabel.value;

             if (!idPerson || !label) {
             return false;
             }

             idPerson = that.encoder.encode(idPerson);
             if (!idPerson) {
             return false;
             }

             const find = that.authors.find((a) => {
             return a.id === idPerson;
             });

             if(find){
             return false;
             }

             that.authors.push({
             id: idPerson,
             label: label,
             });
             }
             });*/
            console.log("Query Author");
            this.DaoService.query("getAuthorLinkPublication", query, (results) => {
                if (results) {
                    that.authorlistitem(results);
                }

            });

            /**
             * Retrieve the event from the publication
             */
            that.DaoService.query("getEventFromPublication", query, (results) => {
                if (results) {
                    const nodeId = results['?id'];

                    if (nodeId) {
                        let idBase = nodeId.value;

                        if (idBase) {

                            const label = results['?label'].value;
                            const startDate = results['?startDate'].value;
                            const endDate = results['?endDate'].value;
                            const sessionId = results['?sessionId'].value;
                            const sessionLabel = results['?sessionLabel'].value;
                            const locationId = results['?locationId'].value;
                            const locationLabel = results['?locationLabel'].value;

                            const startsAt = moment(startDate);
                            const endsAt = moment(endDate);
                            const strDuration = TimeManager.startAndEndTimeToString(startsAt, endsAt);

                            const id = that.encoder.encode(idBase);
                            if (id) {

                               const find = that.events.find((e) => {
                                    return e.id === id;
                                });

                                if (find) {
                                    return false;
                                }

                                let event = {
                                    id: id,
                                    label: label,
                                    startDate: startDate,
                                    endDate: endDate,
                                    startsAt: startsAt,
                                    duration: strDuration,
                                    endsAt: endsAt,
                                    location: locationLabel,
                                    locationId: locationId,
                                    session: sessionLabel,
                                    sessionId: this.encoder.encode(sessionId)
                                };

                                that.events = that.events.concat(event);

                                that.events.sort((a, b) => {
                                    return a.label > b.label ? 1 : -1;
                                });
                            }
                        }
                    }
                }
            });

            /**
             * Retrive track from the publication
             */
            that.DaoService.query("getPublicationTrack", query, (results) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeId = results['?track'];

                    if (nodeLabel && nodeId) {
                        const label = nodeLabel.value;
                        let id = nodeId.value;

                        if (label && id) {
                            that.trackId = id;
                            id = that.encoder.encode(id);

                            if (id) {
                                that.eventType = id;
                                that.track = {
                                    id: id,
                                    label: label,
                                };
                            }
                        }
                    }
                }
            });

            /**
             * Retrieve keywords from publication
             */
            that.DaoService.query("getKeywordsFromPublication", query, (results) => {
                if (results) {
                    const nodeKeywords = results['?keywords'];

                    if (nodeKeywords) {
                        const keyword = nodeKeywords.value;

                        if (keyword && keyword.length > 0) {
                            that.keywords.push(keyword);
                        }
                    }
                }
            });

            /*for(let i in this.publication.authors){
             let query = { 'key' : this.publication.authors[i] };
             this.authors[i] = this.DaoService.query("getPersonLink",query);
             }*/
        });
    }

    authorlistitem = (results) => {
        const that = this;
        if (results) {
            const nodeIdPerson = results['?idPerson'];
            const nodeLabel = results['?label'];

            if (!nodeIdPerson || !nodeLabel) {
                return false;
            }

            let idPerson = nodeIdPerson.value;
            const label = nodeLabel.value;

            if (!idPerson || !label) {
                return false;
            }

            idPerson = that.encoder.encode(idPerson);
            if (!idPerson) {
                return false;
            }

            const find = that.authors.find((a) => {
                return a.id === idPerson;
            });

            if (find) {
                return false;
            }

            console.log(idPerson + " " + label);
            that.authors.push({
                id: idPerson,
                label: label,
            });
        }
        console.log(that.authors);
    };
    /*
    authorlistitem = (stream) => {
        const that = this;
        if (stream) {
            const nodeIdAuhtorList = stream['?id'];

            if (nodeIdAuhtorList) {
                let idAuhtorList = nodeIdAuhtorList.value;

                if (idAuhtorList) {
                    console.log("Get id by Person");
                    that.DaoService.query("getIdPersonByAuthorListItem", {key: idAuhtorList}, (results) => {
                        if (results) {
                            const nodeIdPerson = results['?id'];

                            if (nodeIdPerson) {
                                let idPerson = nodeIdPerson.value;

                                if (idPerson) {
                                    const idPersonEncoded = that.encoder.encode(idPerson);
                                    console.log("Get Person");
                                    that.DaoService.query("getPerson", {key: idPerson}, (results) => {
                                        if (results) {
                                            const nodeLabel = results['?label'];

                                            if (nodeLabel) {
                                                const label = nodeLabel.value;

                                                if (label) {
                                                    const find = that.authors.find((a) => {
                                                        return a.id === idPersonEncoded;
                                                    });

                                                    if (find) {
                                                        return false;
                                                    }

                                                    console.log("Données User");
                                                    console.log(idPersonEncoded);
                                                    console.log(label);
                                                    that.authors = that.authors.concat({
                                                        id: idPersonEncoded,
                                                        label: label
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    };
    */

    /**
     * Constructs a realistic ICS description of the talk, that can be imported in a calendar
     */
    createICS = () => {
        const ics = new ICS();
        const that = this;
        const talk = that.events[0];

        const calendar = ics.buildEvent({
            uid: '', // (optional)
            start: talk.startDate,
            end: talk.endDate,
            title: talk.label,
            description: talk.description,
            location: talk.location, //
            url: that.publicationId,
            status: 'confirmed',
            geo: {lat: 45.764043, lon: 4.835658999999964,}, //Lyon coordinates
            attendees: [
                // { name: 'Adam Gibbons', email: 'adam@example.com' }
            ],
            categories: ['Talk'],
            alarms: [
                {action: 'DISPLAY', trigger: '-PT24H', description: 'Reminder', repeat: true, duration: 'PT15M'},
                {action: 'AUDIO', trigger: '-PT30M'}
            ]
        });
        window.open('data:text/calendar;charset=utf8,' + encodeURIComponent(calendar));
    }
}

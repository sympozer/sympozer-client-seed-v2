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
    public talk: any;

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

            this.DaoService.query("getFirstAuthorLinkPublication", query, (results) => {
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
                    const nodeLabel = results['?label'];
                    const nodeType = results['?type'];

                    if (nodeId && nodeLabel && nodeType) {
                        let idBase = nodeId.value;
                        const label = nodeLabel.value;
                        let type = nodeType.value;

                        if (idBase && label) {
                            const id = that.encoder.encode(idBase);
                            if (id) {

                                const find = that.events.find((e) => {
                                    return e.id === id;
                                });

                                if (find) {
                                    return false;
                                }

                                //On va chercher les infos du Talk
                                that.DaoService.query("getTalkById", {key: idBase}, (results) => {
                                    console.log('results talk : ', results);
                                    if (results) {
                                        const nodeLabel = results['?label'];
                                        const nodeDescription = results['?description'];
                                        const nodeEndDate = results['?endDate'];
                                        const nodeStartDate = results['?startDate'];
                                        const nodeIsEventRelatedTo = results['?isEventRelatedTo'];
                                        const nodeIsSubEventOf = results['?isSubEventOf'];
                                        const nodeLocation = results['?location'];

                                        if (nodeLabel && nodeDescription && nodeEndDate && nodeStartDate) {
                                            const label = nodeLabel.value;
                                            const description = nodeDescription.value;
                                            let endDate = nodeEndDate.value;
                                            let startDate = nodeStartDate.value;

                                            let location = null;
                                            if (nodeLocation) {
                                                location = nodeLocation.value;
                                            }

                                            if (label && description && endDate && startDate) {
                                                startDate = moment(startDate);
                                                endDate = moment(endDate);

                                                const strDuration = TimeManager.startAndEndTimeToString(startDate, endDate);

                                                that.talk = {
                                                    label: label,
                                                    description: description,
                                                    startsAt: startDate.format('LLLL'),
                                                    endsAt: endDate.format('LLLL'),
                                                    duration: strDuration,
                                                    location: location,
                                                };
                                            }
                                        }
                                    }
                                });
                                that.events = that.events.concat({
                                    id: id,
                                    label: label,
                                    //type: type,
                                });

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
                console.log(results);
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeId = results['?isSubEventOf'];

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

    authorlistitem = (stream) => {
        const that = this;
        if (stream) {
            const nodeIdAuhtorList = stream['?id'];

            if (nodeIdAuhtorList) {
                let idAuhtorList = nodeIdAuhtorList.value;

                if (idAuhtorList) {
                    that.DaoService.query("getIdPersonByAuthorListItem", {key: idAuhtorList}, (results) => {
                        if (results) {
                            const nodeIdPerson = results['?id'];

                            if (nodeIdPerson) {
                                let idPerson = nodeIdPerson.value;

                                if (idPerson) {
                                    const idPersonEncoded = that.encoder.encode(idPerson);
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

                                                    that.authors = that.authors.concat({
                                                        id: idPersonEncoded,
                                                        label: label
                                                    });

                                                    that.DaoService.query("getNextAuthorLinkPublication", {key: idAuhtorList}, (results) => {
                                                        if(results){
                                                            that.authorlistitem(results);
                                                        }
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

    /**
     * Constructs a realistic ICS description of the talk, that can be imported in a calendar
     */
    createICS = () => {
        var ics = new ICS();
        const that = this

        let calendar = ics.buildEvent({
            uid: '', // (optional)
            start: that.talk.startsAt,
            end: that.talk.endsAt,
            title: that.talk.label,
            description: that.talk.description,
            location: that.talk.location, //
            url: that.publicationId,
            status: 'confirmed',
            geo: {lat: 45.515113, lon: 13.571873,},
            attendees: [
                //{ name: 'Adam Gibbons', email: 'adam@example.com' }
            ],
            categories: ['Talk'],
            alarms: [
                {action: 'DISPLAY', trigger: '-PT24H', description: 'Reminder', repeat: true, duration: 'PT15M'},
                {action: 'AUDIO', trigger: '-PT30M'}
            ]
        });
        window.open("data:text/calendar;charset=utf8," + encodeURIComponent(calendar));
    }
}

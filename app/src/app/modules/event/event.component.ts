import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';
import {RessourceDataset} from '../../services/RessourceDataset';
import {Config} from "../../app-config";
//import {ICS} from "ics";
var ICS = require('ics');

import * as moment from 'moment';


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
    public encodedID

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private ressourceDataset: RessourceDataset) {
        this.event = {};
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decode(id)};
            this.encodedID = this.encoder.decode(id)
            this.DaoService.query("getEventById", query, (results, err) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    const nodeDescription = results['?description'];
                    const nodeEndDate = results['?endDate'];
                    const nodeStartDate = results['?startDate'];
                    const nodeIsEventRelatedTo = results['?isEventRelatedTo'];
                    const nodeIsSubEventOf = results['?isSubEventOf'];
                    const nodeType = results['?type'];
                    const nodeLocation = results['?location'];

                    if (nodeLabel && nodeDescription && nodeEndDate && nodeStartDate && nodeType) {
                        const label = nodeLabel.value;
                        const description = nodeDescription.value;
                        let endDate = nodeEndDate.value;
                        let startDate = nodeStartDate.value;
                        let type = nodeType.value;

                        let location = null;
                        if(nodeLocation)
                        {
                            location = nodeLocation.value;
                        }

                        if (label && description && endDate && startDate && type) {
                            startDate = moment(startDate);
                            endDate = moment(endDate);

                            const duration = moment.duration(endDate.diff(startDate));

                            var hours = parseInt(duration.asHours().toString());
                            var minutes = parseInt(duration.asMinutes().toString()) - hours * 60;

                            let strDuration = "";
                            if (hours > 0) {
                                if(hours < 2){
                                    strDuration = hours + " hour and ";
                                }
                                else{
                                    strDuration = hours + " hours and ";
                                }
                            }
                            if (minutes > 0) {
                                if(minutes < 2){
                                    strDuration += minutes + " minute";
                                }
                                else{
                                    strDuration += minutes + " minutes";
                                }
                            }

                            //On récup le type dans l'URI
                            type = that.ressourceDataset.extractType(type, label);

                            const typeIsIntoLabel = that.ressourceDataset.isIncludeIntoLabel(type, label);

                            that.event = {
                                label: label,
                                description: description,
                                startsAt: startDate.format('LLLL'),
                                endsAt: endDate.format('LLLL'),
                                duration: strDuration,
                                location: location,
                                publications: [],
                                eventsRelatedTo: [],
                                subEventsOf: [],
                                tracks: [],
                                type: typeIsIntoLabel ? null : type,
                            };

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
                                                if(type && type.length > 0 && type.toLowerCase() === "talk"){
                                                    return that.router.navigate(['/publication/'+label+'/'+id]);
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
            /*console.log(this.event);
             this.startsAt = moment(this.event.startsAt).format('LLLL');
             this.endsAt = moment(this.event.endsAt).format('LLLL');
             this.duration = moment.duration(this.event.duration).humanize();
             this.event.description = this.event.description.split('<')[0];

             for (let i in this.event.papers) {
             let query = {'key': this.event.papers[i]};
             this.publications[i] = this.DaoService.query("getPublicationLink", query);
             }
             if (this.event.parent != null) {
             let query = {'key': this.event.parent};
             this.partof = this.DaoService.query("getEventLink", query);
             }
             for (let i in this.event.locations) {
             let query = {'key': this.event.locations[i]};
             this.locations[i] = this.DaoService.query("getLocationLink", query);
             this.locations[i].id = this.encoder.encodeForURI(this.locations[i].id);
             }
             for (let i in this.event.children) {
             let query = {'key': this.event.children[i]};
             this.contents[i] = this.DaoService.query("getEvent", query);
             }*/
        });
    }

    /**
     * Constructs a realistic ICS description of the event, that can be imported in a calendar
     */
    createICS = () =>{
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
          geo: { lat: 45.515113, lon: 13.571873, },
          attendees: [
            //{ name: 'Adam Gibbons', email: 'adam@example.com' }
          ],
          categories: that.event.session,
          alarms:[
            { action: 'DISPLAY', trigger: '-PT24H', description: 'Reminder', repeat: true, duration: 'PT15M' },
            { action: 'AUDIO', trigger: '-PT30M' }
          ]
        });
        window.open( "data:text/calendar;charset=utf8," + encodeURIComponent(calendar));
    }
}

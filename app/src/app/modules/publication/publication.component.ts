import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

@Component({
    selector: 'app-publication',
    templateUrl: 'publication.component.html',
    styleUrls: ['publication.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationComponent implements OnInit {
    subscription: Subscription;
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
                    console.log(results)
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
            this.DaoService.query("getAuthorLinkPublication", query, (results) => {
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

                    that.authors.push({
                        id: idPerson,
                        label: label,
                    });
                }
            });

            /**
             * Retrieve the event from the publication
             */
            that.DaoService.query("getEventFromPublication", query, (results) => {
                if(results){
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];
                    const nodeType = results['?type'];

                    if(nodeId && nodeLabel && nodeType){
                        let idBase = nodeId.value;
                        const label = nodeLabel.value;
                        let type = nodeType.value;

                        if(idBase && label){
                            const id = that.encoder.encode(idBase);
                            if(id){

                                //On va chercher les infos du Talk
                                that.DaoService.query("getTalkById", {key: idBase}, (results) => {
                                    console.log('results talk : ', results);
                                   if(results){
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
               if(results){
                   const nodeLabel = results['?label'];
                   const nodeId = results['?isSubEventOf'];

                   if(nodeLabel && nodeId){
                       const label = nodeLabel.value;
                       let id = nodeId.value;

                       if(label && id){
                           that.trackId = id
                           id = that.encoder.encode(id);

                           if(id){
                               that.eventType = id
                               
                               console.log(label, id);
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
                if(results){
                    const nodeKeywords = results['?keywords'];

                    if(nodeKeywords){
                        const keyword = nodeKeywords.value;

                        if(keyword && keyword.length > 0){
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
}

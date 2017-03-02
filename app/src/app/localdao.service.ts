import { Injectable }     from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import { Conference} from './model/conference';
import 'rxjs/add/operator/toPromise';

import { Config } from  './app-config';
import { Dataset } from  './dataset';
import { eventHelper } from  './eventHelper';
import { Encoder } from  './lib/encoder';
import {DataLoaderService} from "./data-loader.service";
import {LocalStorageService} from 'ng2-webstorage';



@Injectable()
export class LocalDAOService {
	//private conferenceURL = 'https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json';
    private conferenceURL = 'http://dev.sympozer.com/conference/www2012/file-handle/writer/json';
    private localData;

	private conference: Conference = new Conference();

	//Persons
    private personMap = {}; //Global map, containing all person data
    private personLinkMap = {}; //Map containing only data necessary for displaying person list
    private authorLinkMap = {}; //Same thing only for persons who made a publication
    private personLinkMapByRole = {}; //several maps, according to the holdsRole property

    //Organizations
    private organizationMap = {}; //Global and complete map
    private organizationLinkMap = {}; // Restricted map (cf. personLinkMap)

    //Roles
    private roleMap = {};

    //Publications
    private publicationMap = {};
    private publicationLinkMap = {};

    //Categories
    private categoryMap = {};
    private categoryForPublicationsMap = {};
    private categoryLinkMap = {};

    //Events
    private eventMap = {};
    private eventLinkMap = {};
    private eventLinkMapByLocation = {};

    //Conference schedule (ordered)
    private confScheduleList = [];

    //Locations
    private locationLinkMap = {};

    constructor(private http: Http, private ev: eventHelper, private encoder: Encoder, private dataloader: DataLoaderService , private localStoragexx: LocalStorageService) { }

    getData(): Promise<Conference> {
    // Vérifier la différence de version du fichier entre le local et le distant, et enregistrer en local si besoin (nouvelle version)
    return this.http.get(this.conferenceURL)
      .toPromise()
       .then(LocalDAOService.extractData)
      .catch(this.handleError)
    };

	private static extractData (res: Response)
	{
	    //Server should wrap the data inside `data` property !!!!!!
	    let body = res.json();
	    console.log(body);
	    // Enregistrer dans le localStorage
	    localStorage.setItem("dataset", body || {});
	    return body || {};
	    // return body.data || {}
	}
	private handleError(error: any): Promise<any> {
	    console.error('An error occurred', error); // for demo purposes only
	    return Promise.reject(error.message || error);
	}

	getPictureUri(uri){
        //Assume the image, if present, is located either at an HTTP* URI or in the image folder stated in the config file
        if(uri && typeof uri === 'string') {
            //TODO put that somewhere else
            //Emulate string startsWith functions for browsers that don't have it.
            //Code found at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.lastIndexOf(searchString, position) === position;
                };
            }
            if(!uri.startsWith("http")) {
                return Config.app.imageFolder + uri;
            }
            return uri;
        }
        return null;
    }

    initialize(){

       // this.dataloader.getDataUrl(this.conferenceURL).then(conference => {
       //     this.localData = conference;
        let storage = this.localStoragexx.retrieve('dataset');
        if(storage == null){
            this.localStoragexx.store('dataset', Dataset);
            storage = Dataset;
        }

            this.localData = storage;
            //let localData = DataLoaderService.getData(this.conferenceURL);
            //Persons
            let personData = this.localData.persons.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all persons in DAO...");
            for(let i in personData) {
                let tempPerson = personData[i];
                tempPerson.depiction = this.getPictureUri(tempPerson.depiction);

                let tempPersonLink = {
                    id: this.encoder.encodeForURI(tempPerson.id),
                    name: tempPerson.name,
                    depiction: tempPerson.depiction
                };

                //personMap
                this.personMap[tempPerson.id] = tempPerson;
                //personLinkMap
                this.personLinkMap[tempPerson.id] = tempPersonLink;
                //authorLinkMap
                if(tempPerson.made) {
                    this.authorLinkMap[tempPerson.id] = this.personLinkMap[tempPerson.id];
                }




                //Extract both role map and personLinkMapByRole from person descriptions
                for(let j=0; j< tempPerson.holdsRole.length; j++){
                    let role = tempPerson.holdsRole[j];
                    if(!this.personLinkMapByRole[role]) {
                        //Very simple role description
                        this.roleMap[role] = {
                            "id": this.encoder.encode(role),
                            "label": role
                        };
                        this.personLinkMapByRole[role] = [];
                    }
                    this.personLinkMapByRole[role].push(tempPersonLink);
                }
                /*foreach(tempPerson.holdsRole, function(j) {
                 let role = tempPerson.holdsRole[j];
                 if(!this.personLinkMapByRole[role]) {
                 //Very simple role description
                 this.roleMap[role] = {
                 "id": role,
                 "label": role
                 };
                 this.personLinkMapByRole[role] = [];
                 }
                 this.personLinkMapByRole[role].push(tempPersonLink);
                 });*/

            }

            //Organizations
            let organizationData = this.localData.organizations.sort(function (a, b) {
                if (a.label > b.label)
                    return 1;
                if (a.label < b.label)
                    return -1;
                return 0;
            });
            console.log("Retrieving all organizations in DAO...");
            for(let j in organizationData) {
                let tempOrga = organizationData[j];
                //Little hack: in some datasets, organizations have a label and in others, they have a name.
                if(tempOrga.label && !("name" in tempOrga)) {
                    tempOrga["name"] = tempOrga.label;
                }
                this.organizationMap[tempOrga.id] = tempOrga;
                this.organizationLinkMap[tempOrga.id] = {
                    id: this.encoder.encodeForURI(tempOrga.id),
                    name: this.encoder.encodeForURI(tempOrga["name"]),
                    sanitizeName: tempOrga["name"],
                    depiction: this.getPictureUri(("depiction" in tempOrga)?tempOrga["depiction"]:null)
                }
            }

            //Categories (1/2)
            //Must be initialized before events and publications
            //Construct and sort a map of all categories
            let categoryData = this.localData.categories.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all categories in DAO...");
            for(let m in categoryData) {
                let tempCategory = categoryData[m];
                this.categoryMap[tempCategory.id] = tempCategory;
                this.categoryMap[tempCategory.id].events = [];
                this.categoryForPublicationsMap[tempCategory.id] = tempCategory;
                this.categoryForPublicationsMap[tempCategory.id].publications = [];
            }

            //Publications
            let publicationData = this.localData.publications.sort(function (a, b) {
                if (a.title > b.title)
                    return 1;
                if (a.title < b.title)
                    return -1;
                return 0;
            });
            console.log("Retrieving all publications in DAO...");
            for(let k in publicationData) {
                let tempPubli = publicationData[k];
                tempPubli.thumbnail = this.getPictureUri(tempPubli.thumbnail);
                this.publicationMap[tempPubli.id] = tempPubli;
                this.publicationLinkMap[tempPubli.id] = {
                    id: this.encoder.encodeForURI(tempPubli.id),
                    title: this.encoder.encodeForURI(tempPubli.title),
                    //In the ESWC2015 dataset, publication images are identified as "thumbnail"
                    thumbnail: this.getPictureUri(tempPubli.thumbnail)
                }
            }

            //Locations
            let locationData = this.localData.locations.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all locations in DAO...");
            for(let o in locationData) {
                let tempLocation = locationData[o];
                this.locationLinkMap[tempLocation.id] = tempLocation;
                //Initialize eventLinkMapByLocation[o]
                this.eventLinkMapByLocation[tempLocation.id] = tempLocation;
                this.eventLinkMapByLocation[tempLocation.id].events = [];
            }

            //Events
            let eventData = this.localData.events.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            let tempEventList = []; // unordered event list from the DAO
            console.log("Retrieving all events in DAO...");
            for(let l in eventData) {
                let tempEvent = eventData[l];
                let tempEventLink = {
                    id: this.encoder.encodeForURI(tempEvent.id),
                    name: tempEvent.name,
                    //Yet, no property named "thumbnail" exists, but why not...
                    thumbnail: this.getPictureUri(("thumbnail" in tempEvent)?tempEvent["thumbnail"]:null),
                    startsAt: tempEvent.startsAt,
                    endsAt: tempEvent.endsAt,
                    duration: tempEvent.duration,
                    location: tempEvent.locations != null? this.locationLinkMap[tempEvent.locations[0]].name:null
                };

                //Push into the corresponding maps
                this.eventMap[tempEvent.id] = tempEvent;
                this.eventLinkMap[tempEvent.id] = tempEventLink;
                //Pushing the full eventLink in the map -> don't need nested query
                for(let r in tempEvent.locations) {
                    this.eventLinkMapByLocation[tempEvent.locations[r]].events.push(tempEventLink);
                }

                //Add the event to the categories it refers to.
                for(let n in tempEvent.categories) {
                    let tempCategoryMap = this.categoryMap[tempEvent.categories[n]];
                    tempCategoryMap.events.push(tempEvent.id);
                }

                //Get main events (direct children of the conference)
                if(tempEvent.parent === Config.conference.baseUri) {
                    tempEventList.push(tempEventLink);
                }
            }
            //Sort events according to start and end dates
            this.confScheduleList = this.ev.doubleSortEventsInArray(tempEventList);

            //Construct the event category hierarchies
            let constructCategoryHierarchy = (eventId) =>  {
                for(let i in this.eventMap[eventId].categories) {
                    let tempCat = this.eventMap[eventId].categories[i];
                    if(tempCat !== Config.app.presentationEventCategory && tempCat !== Config.app.sessionEventCategory)
                        return tempCat;
                }
                if(this.eventMap[eventId].parent) {
                    return constructCategoryHierarchy(this.eventMap[eventId].parent);
                }
                return null;
            };
            for(let q in this.eventLinkMap) {
                this.eventMap[q].mainCategory = this.eventLinkMap[q].mainCategory = constructCategoryHierarchy(q);

                //Construct categoryForPublication map
                for(let t in this.eventMap[q].papers) {
                    let tempCategoryForPublicationsMap = this.categoryForPublicationsMap[this.eventMap[q].mainCategory];
                    tempCategoryForPublicationsMap.publications.push(this.eventMap[q].papers[t]);
                }
            }

            //Categories (2/2)
            //Remove unused categories
            for(let p in this.categoryMap) {
                let tempCategory = this.categoryMap[p];
                if(tempCategory.events.length == 0) {
                    this.categoryMap[p] = undefined;
                } else {
                    this.categoryLinkMap[p] = {
                        id: this.encoder.encodeForURI(p),
                        name: tempCategory.name,
                        label: tempCategory.label,
                        //Yet, no property named "thumbnail" exists, but why not...
                        thumbnail: tempCategory.thumbnail ? tempCategory.thumbnail : null
                    }
                }
            }
            for(let u in this.categoryForPublicationsMap) {
                let tempCategory = this.categoryForPublicationsMap[u];
                if(tempCategory.publications.length == 0) {
                    this.categoryForPublicationsMap[u] = undefined;
                }
            }

            //TODO: remove this.
            console.log("DAO INITIALIZATION FINISHED");
        //});

    }

    query(command, query) {
        //Returning an object with the appropriate methods
        switch(command) {
            case "getPerson":
                return this.personMap[query.key];
            case "getPersonLink":
                return this.personLinkMap[query.key];
            case "getAllPersons":
                return this.personLinkMap;
            case "getAuthor":
                return this.authorLinkMap[query.key];
            case "getAllAuthors":
                return this.authorLinkMap;
            case "getPersonsByRole":
                return this.personLinkMapByRole[query.key];
            case "getOrganization":
                return this.organizationMap[query.key];
            case "getOrganizationLink":
                return this.organizationLinkMap[query.key];
            case "getAllOrganizations":
                return this.organizationLinkMap;
            case "getAllRoles":
                return this.roleMap;
            case "getRole":
                return this.roleMap[query.key];
            //For the moment, it's the same thing, since we haven't role complete descriptions.
            case "getRoleLink":
                return this.roleMap[query.key];
            case "getPublication":
                return this.publicationMap[query.key];
            case "getPublicationLink":
                return this.publicationLinkMap[query.key];
            case "getAllPublications":
                return this.publicationLinkMap;
            case "getEvent":
                return this.eventMap[query.key];
            case "getConferenceEvent":
                return this.eventMap[query.key];
            case "getEventIcs":
                return this.eventMap[query.key];
            case "getEventLink":
                return this.eventLinkMap[query.key];
            case "getAllEvents":
                return this.eventLinkMap;
            case "getLocation":
                return this.eventLinkMapByLocation[query.key];
            case "getCategory":
                return this.categoryMap[query.key];
            case "getCategoryForPublications":
                return this.categoryForPublicationsMap[query.key];
            case "getCategoryLink":
                return this.categoryLinkMap[query.key];
            case "getAllCategories":
                return this.categoryLinkMap;
            case "getAllCategoriesForPublications":
                return this.categoryForPublicationsMap;
            case "getConferenceSchedule":
                return this.confScheduleList;
            //Only need the event URIs, as the ICS will be calculated in the model callback
            case "getConferenceScheduleIcs":
                return Object.keys(this.eventLinkMap);
            case "getWhatsNext":
                return this.confScheduleList;
            case "getAllLocations":
                return this.locationLinkMap;
            case "getLocationLink":
                return this.locationLinkMap[query.key];
            default:
                return null;
        }
    }
  

}


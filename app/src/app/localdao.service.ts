import {Injectable}     from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {Conference} from './model/conference';
import 'rxjs/add/operator/toPromise';

import {Config} from  './app-config';
import {Dataset} from  './dataset';
import {eventHelper} from  './eventHelper';
import {Encoder} from  './lib/encoder';
import {DataLoaderService} from "./data-loader.service";
import {LocalStorageService} from 'ng2-webstorage';

const $rdf = require('rdflib');


@Injectable()
export class LocalDAOService {
    //private conferenceURL = 'https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json';
    private useJsonld = true;
    private localstorage_jsonld = 'dataset-sympozer-jsonld';
    private store;
    private $rdf;
    private conferenceURL;
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

    constructor(private http: Http,
                private ev: eventHelper,
                private encoder: Encoder,
                private dataloader: DataLoaderService,
                private localStoragexx: LocalStorageService) {
        this.conferenceURL = this.useJsonld
            ? 'http://serenitecoex.com/conference.ttl'//'http://serenitecoex.com/dataset-conf.jsonld'
            : 'http://dev.sympozer.com/conference/www2012/file-handle/writer/json';

        this.$rdf = $rdf;
        this.loadDataset();
    }

    loadDataset() {
        const store = this.$rdf.graph();
        const timeout = 5000; // 5000 ms timeout
        const fetcher = new $rdf.Fetcher(store, timeout);
        const that = this;

        fetcher.nowOrWhenFetched(this.conferenceURL, function (ok, body, xhr) {
            if (!ok) {
                console.log("Oops, something happened and couldn't fetch data");
            } else {
                console.log('success');
                that.store = store;

                that.store.fetcher = null;
            }
        });
    }

    getData(): Promise<Conference> {
        // Vérifier la différence de version du fichier entre le local et le distant, et enregistrer en local si besoin (nouvelle version)
        return this.http.get(this.conferenceURL)
            .toPromise()
            .then(LocalDAOService.extractData)
            .catch(this.handleError)
    };

    getDataJsonLd(): Promise<Conference> {
        const that = this;
        // Vérifier la différence de version du fichier entre le local et le distant, et enregistrer en local si besoin (nouvelle version)
        return this.http.get(this.conferenceURL)
            .toPromise()
            .then(res => {
                const body = res.json();
                if (body) {
                    that.localStoragexx.store(that.localstorage_jsonld, body || {});
                    //localStorage.setItem(that.localstorage_jsonld, body || {});
                    return Promise.resolve(body);
                }

                return Promise.reject(null);
            })
            .catch(this.handleError)
    };

    private static extractData(res: Response) {
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

    getPictureUri(uri) {
        //Assume the image, if present, is located either at an HTTP* URI or in the image folder stated in the config file
        if (uri && typeof uri === 'string') {
            //TODO put that somewhere else
            //Emulate string startsWith functions for browsers that don't have it.
            //Code found at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.lastIndexOf(searchString, position) === position;
                };
            }
            if (!uri.startsWith("http")) {
                return Config.app.imageFolder + uri;
            }
            return uri;
        }
        return null;
    }

    initialize() {
        this.useJsonld
            ? this.initializeJsonld()
            : this.initializeJson();
    }

    private initializeJsonld() {
        const that = this;
        //On récup le dataset jsonld en local storage
        let storage = this.localStoragexx.retrieve(this.localstorage_jsonld);

        //Si on l'a pas, on le télécharge
        let promise;
        if (!storage) {
            console.log('loading graph jsonld ...');
            promise = this.getDataJsonLd();
        }

        Promise.all([promise])
            .then(() => {
                //On récup de nouveau le graph dans le local storage
                storage = that.localStoragexx.retrieve(that.localstorage_jsonld);
                //On regarde si on a bien le graph
                if (storage) {
                }
            })
            .catch(() => {
                console.log('error');
            });
    }

    private initializeJson() {
        // this.dataloader.getDataUrl(this.conferenceURL).then(conference => {
        //     this.localData = conference;
        let storage = this.localStoragexx.retrieve('dataset');
        if (storage == null) {
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
        for (let i in personData) {
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
            if (tempPerson.made) {
                this.authorLinkMap[tempPerson.id] = this.personLinkMap[tempPerson.id];
            }


            //Extract both role map and personLinkMapByRole from person descriptions
            for (let j = 0; j < tempPerson.holdsRole.length; j++) {
                let role = tempPerson.holdsRole[j];
                if (!this.personLinkMapByRole[role]) {
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
        for (let j in organizationData) {
            let tempOrga = organizationData[j];
            //Little hack: in some datasets, organizations have a label and in others, they have a name.
            if (tempOrga.label && !("name" in tempOrga)) {
                tempOrga["name"] = tempOrga.label;
            }
            this.organizationMap[tempOrga.id] = tempOrga;
            this.organizationLinkMap[tempOrga.id] = {
                id: this.encoder.encodeForURI(tempOrga.id),
                name: this.encoder.encodeForURI(tempOrga["name"]),
                sanitizeName: tempOrga["name"],
                depiction: this.getPictureUri(("depiction" in tempOrga) ? tempOrga["depiction"] : null)
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
        for (let m in categoryData) {
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
        for (let k in publicationData) {
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
        for (let o in locationData) {
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
        for (let l in eventData) {
            let tempEvent = eventData[l];
            let tempEventLink = {
                id: this.encoder.encodeForURI(tempEvent.id),
                name: tempEvent.name,
                //Yet, no property named "thumbnail" exists, but why not...
                thumbnail: this.getPictureUri(("thumbnail" in tempEvent) ? tempEvent["thumbnail"] : null),
                startsAt: tempEvent.startsAt,
                endsAt: tempEvent.endsAt,
                duration: tempEvent.duration,
                location: tempEvent.locations != null ? this.locationLinkMap[tempEvent.locations[0]].name : null
            };

            //Push into the corresponding maps
            this.eventMap[tempEvent.id] = tempEvent;
            this.eventLinkMap[tempEvent.id] = tempEventLink;
            //Pushing the full eventLink in the map -> don't need nested query
            for (let r in tempEvent.locations) {
                this.eventLinkMapByLocation[tempEvent.locations[r]].events.push(tempEventLink);
            }

            //Add the event to the categories it refers to.
            for (let n in tempEvent.categories) {
                let tempCategoryMap = this.categoryMap[tempEvent.categories[n]];
                tempCategoryMap.events.push(tempEvent.id);
            }

            //Get main events (direct children of the conference)
            if (tempEvent.parent === Config.conference.baseUri) {
                tempEventList.push(tempEventLink);
            }
        }
        //Sort events according to start and end dates
        this.confScheduleList = this.ev.doubleSortEventsInArray(tempEventList);

        //Construct the event category hierarchies
        let constructCategoryHierarchy = (eventId) => {
            for (let i in this.eventMap[eventId].categories) {
                let tempCat = this.eventMap[eventId].categories[i];
                if (tempCat !== Config.app.presentationEventCategory && tempCat !== Config.app.sessionEventCategory)
                    return tempCat;
            }
            if (this.eventMap[eventId].parent) {
                return constructCategoryHierarchy(this.eventMap[eventId].parent);
            }
            return null;
        };
        for (let q in this.eventLinkMap) {
            this.eventMap[q].mainCategory = this.eventLinkMap[q].mainCategory = constructCategoryHierarchy(q);

            //Construct categoryForPublication map
            for (let t in this.eventMap[q].papers) {
                let tempCategoryForPublicationsMap = this.categoryForPublicationsMap[this.eventMap[q].mainCategory];
                tempCategoryForPublicationsMap.publications.push(this.eventMap[q].papers[t]);
            }
        }

        //Categories (2/2)
        //Remove unused categories
        for (let p in this.categoryMap) {
            let tempCategory = this.categoryMap[p];
            if (tempCategory.events.length == 0) {
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
        for (let u in this.categoryForPublicationsMap) {
            let tempCategory = this.categoryForPublicationsMap[u];
            if (tempCategory.publications.length == 0) {
                this.categoryForPublicationsMap[u] = undefined;
            }
        }

        //TODO: remove this.
        console.log("DAO INITIALIZATION FINISHED");
        //});
    }

    launchQuerySparql = (query, callback) => {
        const that = this;
        const querySparql = that.$rdf.SPARQLToQuery(query, false, that.store);

        that.store.query(querySparql, callback);
    };

    query(command, data, callback) {
        //Returning an object with the appropriate methods
        const that = this;
        if (that.useJsonld && that.store && callback) {
            let query;
            switch (command) {
                case "getMemberPersonByOrganisation":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?idPerson ?name  \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Organisation . \n" +
                        " ?idPerson a scholary:Person . \n" +
                        " ?idPerson schema:label ?name . \n" +
                        " ?idPerson scholary:hasAffiliation ?hasAffiliation . \n" +
                        " ?hasAffiliation scholary:withOrganisation <" + data.key + "> . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getPerson":
                    query =
                        "PREFIX person: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "SELECT DISTINCT ?label ?box \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a person:Person . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        " <" + data.key + "> foaf:mbox_sha1sum ?box . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                //return this.personMap[data.key];
                case "getPersonLink":
                    return this.personLinkMap[data.key];
                case "getAllPersons":
                    query = "PREFIX person: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " ?id a person:Person . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                //return this.personLinkMap;
                case "getAllAuthors":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX purl: <http://purl.org/dc/elements/1.1/> \n" +
                        "SELECT DISTINCT ?idPerson ?name \n" +
                        "WHERE {\n" +
                        " ?proceeding a scholary:InProceedings . \n" +
                        " ?idPerson a scholary:Person . \n" +
                        " ?proceeding purl:creator ?idPerson . \n" +
                        " ?idPerson schema:label ?name . \n" +
                        "} GROUP BY ?idPerson";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getPersonsByRole":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:Person . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id scholary:holdsRole ?idHoldRole . \n" +
                        " ?idHoldRole scholary:withRole <" + data.key + "> . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getOrganization":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?label \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Organisation . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                case "getOrganizationLink":
                    query =
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?name ?id \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> scholary:hasAffiliation ?affiliation . \n" +
                        " ?affiliation scholary:withOrganisation ?id . \n" +
                        " ?id schema:label ?name . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getAllOrganizations":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " ?id a scholary:Organisation . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getAllRoles":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?idRole ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:RoleDuringEvent . \n" +
                        " ?id scholary:withRole ?idRole. \n" +
                        " ?idRole schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getRole":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?idRole ?label \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Person . \n" +
                        " <" + data.key + "> scholary:holdsRole ?idHoldRole . \n" +
                        " ?idHoldRole scholary:withRole ?idRole . \n" +
                        " ?idRole schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                //For the moment, it's the same thing, since we haven't role complete descriptions.
                case "getRoleLink":
                    return this.roleMap[data.key];
                case "getPublication":
                    query =
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?label ?abstract \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:InProceedings . \n" +
                        " <" + data.key + "> scholary:abstract ?abstract . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getAuthorLinkPublication":
                    query =
                        "PREFIX purl: <http://purl.org/dc/elements/1.1/> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?idPerson ?label \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:InProceedings . \n" +
                        " <" + data.key + "> purl:creator ?idPerson . \n" +
                        " ?idPerson schema:label ?label . \n" +
                        "} GROUP BY ?idPerson";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getPublicationLink":
                    query =
                        "PREFIX purl: <http://purl.org/dc/elements/1.1/> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?abstract \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id purl:creator <" + data.key + "> . \n" +
                        " ?id scholary:abstract ?abstract . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";
                    console.log(query);
                    that.launchQuerySparql(query, callback);
                    break;
                case "getAllPublications":
                    query =
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getEvent":
                    return this.eventMap[data.key];
                case "getConferenceEvent":
                    return this.eventMap[data.key];
                case "getEventIcs":
                    return this.eventMap[data.key];
                case "getEventLink":
                    return this.eventLinkMap[data.key];
                case "getAllEvents":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX person: <http://www.scholarlydata.org/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a person:InProceedings . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getLocation":
                    return this.eventLinkMapByLocation[data.key];
                case "getCategory":
                    return this.categoryMap[data.key];
                case "getCategoryForPublications":
                    return this.categoryForPublicationsMap[data.key];
                case "getCategoryLink":
                    return this.categoryLinkMap[data.key];
                case "getAllCategories":
                    return this.categoryLinkMap;
                case "getAllCategoriesForPublications":
                    query =
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:Track . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getConferenceSchedule":
                    console.log(this.confScheduleList);
                    return this.confScheduleList;
                //Only need the event URIs, as the ICS will be calculated in the model callback
                case "getConferenceScheduleIcs":
                    return Object.keys(this.eventLinkMap);
                case "getWhatsNext":
                    return this.confScheduleList;
                case "getAllLocations":
                    return this.locationLinkMap;
                case "getLocationLink":
                    return this.locationLinkMap[data.key];
                default:
                    return null;
            }
        }
        else {
            switch (command) {
                case "getPerson":
                    return this.personMap[data.key];
                case "getPersonLink":
                    return this.personLinkMap[data.key];
                case "getAllPersons":
                    return this.personLinkMap;
                case "getAllAuthors":
                    return this.authorLinkMap;
                case "getPersonsByRole":
                    return this.personLinkMapByRole[data.key];
                case "getOrganization":
                    return this.organizationMap[data.key];
                case "getOrganizationLink":
                    return this.organizationLinkMap[data.key];
                case "getAllOrganizations":
                    return this.organizationLinkMap;
                case "getAllRoles":
                    return this.roleMap;
                case "getRole":
                    return this.roleMap[data.key];
                //For the moment, it's the same thing, since we haven't role complete descriptions.
                case "getRoleLink":
                    return this.roleMap[data.key];
                case "getPublication":
                    return this.publicationMap[data.key];
                case "getPublicationLink":
                    return this.publicationLinkMap[data.key];
                case "getAllPublications":
                    return this.publicationLinkMap;
                case "getEvent":
                    return this.eventMap[data.key];
                case "getConferenceEvent":
                    return this.eventMap[data.key];
                case "getEventIcs":
                    return this.eventMap[data.key];
                case "getEventLink":
                    return this.eventLinkMap[data.key];
                case "getAllEvents":
                    return this.eventLinkMap;
                case "getLocation":
                    return this.eventLinkMapByLocation[data.key];
                case "getCategory":
                    return this.categoryMap[data.key];
                case "getCategoryForPublications":
                    return this.categoryForPublicationsMap[data.key];
                case "getCategoryLink":
                    return this.categoryLinkMap[data.key];
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
                    return this.locationLinkMap[data.key];
                default:
                    return null;
            }
        }
    }
}


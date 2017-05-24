import {Inject, Injectable}     from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {Conference} from './model/conference';
import 'rxjs/add/operator/toPromise';
import * as moment from 'moment';

import {Config} from  './app-config';
import {Dataset} from  './dataset';
import {eventHelper} from  './eventHelper';
import {Encoder} from  './lib/encoder';
import {DataLoaderService} from "./data-loader.service";
import {LocalStorageService} from 'ng2-webstorage';
import {ManagerRequest} from "./services/ManagerRequest";
import {DOCUMENT} from '@angular/platform-browser';

const $rdf = require('rdflib');


@Injectable()
export class LocalDAOService {
    //private conferenceURL = 'https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json';
    private useJsonld = true;
    private localstorage_jsonld = 'dataset-sympozer';
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

    private queryWaiting = [];

    constructor(private http: Http,
                private ev: eventHelper,
                private encoder: Encoder,
                private dataloader: DataLoaderService,
                private localStoragexx: LocalStorageService,
                private managerRequest: ManagerRequest,
                @Inject(DOCUMENT) private document: any) {
        const domain = this.document.location.hostname;
        if (domain) {
            this.localstorage_jsonld += "-" + domain;
        }

        this.conferenceURL = this.useJsonld
            ? Config.conference.updateUri//'http://serenitecoex.com/dataset-conf.jsonld'
            : 'http://dev.sympozer.com/conference/www2012/file-handle/writer/json';

        this.$rdf = $rdf;
    }

    resetDataset() {
        try {
            const that = this;

            //On récup le dataset jsonld en local storage
            //that.localStoragexx.clear(this.localstorage_jsonld);
            let storage = that.localStoragexx.retrieve(that.localstorage_jsonld);
            if (!storage) {
                return false;
            }

            return that.saveDataset(storage);
        }
        catch (err) {
            return false;
        }
    }

    loadDataset(): Promise<boolean> {

        const that = this;
        return new Promise((resolve, reject) => {
            //On récup le dataset jsonld en local storage
            console.log(that.localstorage_jsonld);
            let storage = that.localStoragexx.retrieve(that.localstorage_jsonld);

            //Si on l'a pas, on le télécharge
            // if (!storage) {
            console.log('loading graph jsonld ...');
            this.managerRequest.get_safe(this.conferenceURL)
                .then((response) => {
                    try {
                        if (response && response._body) {
                            console.log(this.conferenceURL);
                            that.saveDataset(response._body);
                            that.localStoragexx.store(that.localstorage_jsonld, response._body);
                            return resolve(true);
                        }

                        return reject(false);
                    }
                    catch (e) {
                        return reject(false);
                    }
                })
                .catch(() => {
                    return reject(false);
                });
            // // }
            // if(storage) {
            //     try {
            //         console.log('have localstorage');
            //         that.saveDataset(storage);
            //         return resolve(true);
            //     } catch (err) {
            //         console.log(err);
            //         return reject(false);
            //     }
            // }
        });
    }

    saveDataset(dataset: string) {
        const that = this;
        const mimeType = 'text/turtle';
        const store = that.$rdf.graph();

        try {
            that.$rdf.parse(dataset, store, this.conferenceURL, mimeType);
            that.store = store;
            that.store.fetcher = null;

            //We if we have query waiting
            for (const qw of that.queryWaiting) {
                that.query(qw.command, qw.data, qw.callback);
            }

            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }

    getData(): Promise<Conference> {
        // Vérifier la différence de version du fichier entre le local et le distant, et enregistrer en local si besoin (nouvelle version)
        return this.http.get(this.conferenceURL)
            .toPromise()
            .then(LocalDAOService.extractData)
            .catch(this.handleError)
    };

    private static extractData(res: Response) {
        //Server should wrap the data inside `data` property !!!!!!
        let body = res.json();
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

    launchQuerySparql = (query, callback) => {
        const that = this;
        const querySparql = that.$rdf.SPARQLToQuery(query, false, that.store);

        that.store.query(querySparql, callback);
    };

    query(command, data, callback) {
        //Returning an object with the appropriate methods
        const that = this;
        const types = ["Panel", "Session", 'Talk', 'Tutorial', 'Workshop', 'Track', 'Conference'];
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
                case "getPersonBySha":
                    console.log(data.key)
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:Person . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id foaf:mbox_sha1sum " + data.key + " . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                //return this.personMap[data.key];
                case "getPersonLink":
                    return this.personLinkMap[data.key];
                case "getAllPersons":
                    query = "PREFIX person: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " ?id a person:Person . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id foaf:mbox_sha1sum ?box . \n" +
                        "} LIMIT 10";
                    console.log(query);
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
                case "getKeywordsFromPublication":
                    query =
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?keywords \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:InProceedings . \n" +
                        " <" + data.key + "> scholary:keyword ?keywords . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getPublicationTrack":
                    console.log(data.key);
                    query =
                        "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "SELECT DISTINCT ?isSubEventOf ?label \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:InProceedings . \n" +
                        " <" + data.key + "> scholary:relatesToEvent ?relatesToEvent . \n" +
                        " ?relatesToEvent scholary:isSubEventOf ?isSubEventOf . \n" +
                        " ?isSubEventOf a scholary:Track . \n" +
                        " ?isSubEventOf schema:label ?label . \n" +
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
                        "SELECT DISTINCT ?id ?label ?abstract \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id purl:creator <" + data.key + "> . \n" +
                        " ?id scholary:abstract ?abstract . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";
                    that.launchQuerySparql(query, callback);
                    break;
                case "getPublicationLinkByTrack":
                    query =
                        "PREFIX purl: <http://purl.org/dc/elements/1.1/> \n" +
                        "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id scholary:relatesToEvent ?talk . \n" +
                        " ?talk a scholary:Talk . \n" +
                        " ?talk scholary:isSubEventOf <" + data.key + "> . \n" +
                        " <" + data.key + "> a scholary:Track . \n" +
                        "}";
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
                    const localType = ["workshop", "tutorial", "session", "panel"];
                    for (const type of types) {
                        let t = type.toLowerCase();
                        if (!that.arrayIncludes(localType, t)) {
                            continue;
                        }

                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?id ?label ?type \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            "}";

                        that.launchQuerySparql(query, (results) => {
                            results['?type'] = {value: type};
                            callback(results);
                        });
                    }
                    break;
                case "getEventById":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a ?type . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        " <" + data.key + "> scholary:description ?description . \n" +
                        " <" + data.key + "> scholary:endDate ?endDate . \n" +
                        " <" + data.key + "> scholary:startDate ?startDate . \n" +
                        " <" + data.key + "> scholary:isSubEventOf ?isSubEventOf . \n" +
                        " OPTIONAL { <" + data.key + "> scholary:location ?location . } \n" +
                        " OPTIONAL { <" + data.key + "> scholary:isEventRelatedTo ?isEventRelatedTo . } \n" +
                        " OPTIONAL { <" + data.key + "> scholary:hasSubEvent ?hasSubEvent . } \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;

                case "getConference":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Conference . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        " <" + data.key + "> scholary:endDate ?endDate . \n" +
                        " <" + data.key + "> scholary:startDate ?startDate . \n" +
                        " <" + data.key + "> scholary:location ?location . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;

                case "getTalkById":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Talk . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        " <" + data.key + "> scholary:description ?description . \n" +
                        " <" + data.key + "> scholary:endDate ?endDate . \n" +
                        " <" + data.key + "> scholary:startDate ?startDate . \n" +
                        " <" + data.key + "> scholary:isSubEventOf ?isSubEventOf . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getTrackByEvent":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " ?id a scholary:Track . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id scholary:hasSubEvent <" + data.key + "> . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getTrackById":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Track . \n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getLocation":
                    return this.eventLinkMapByLocation[data.key];
                case "getEventByTrack":
                    const localTypeEventByTrack = ["Workshop", "Tutorial", "Session", "Panel"];
                    for (const type of localTypeEventByTrack) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?label ?id ?type \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            " ?id a ?type . \n" +
                            " ?id scholary:isSubEventOf <" + data.key + "> . \n" +
                            "}";

                        that.launchQuerySparql(query, callback);
                    }
                    break;
                case "getPublicationsByEvent":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?label ?id \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id scholary:relatesToEvent <" + data.key + "> . \n" +
                        " ?id schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
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
                    //On récup les dates
                    let dateStart = moment();
                    let dateEnd = moment().endOf('day');

                    for (const type of types) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            " ?id scholary:startDate ?startDate . \n" +
                            " ?id scholary:endDate ?endDate . \n" +
                            "}";
                        that.launchQuerySparql(query, (results) => {
                            const nodeStartDate = results['?startDate'];
                            const nodeEndDate = results['?endDate'];

                            if (nodeStartDate && nodeEndDate) {
                                const startDate = moment(nodeStartDate.value);
                                const endDate = moment(nodeEndDate.value);

                                //if(dateStart.isBefore(startDate) && dateEnd.isAfter(endDate)){
                                if (dateStart.isAfter(startDate) && dateEnd.isAfter(endDate)) {
                                    results['?type'] = {value: type};
                                    console.log(results);
                                    callback(results);
                                }
                            }
                        });
                    }
                    break;
                case "getDayPerDay":
                    for (const type of types) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?id ?startDate \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id scholary:startDate ?startDate . \n" +
                            "}";
                        that.launchQuerySparql(query, callback);
                    }
                    break;

                case "getIsSubEvent":
                    for (const type of types) {
                        if (type.toLowerCase() === "track") {
                            continue;
                        }

                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?label \n" +
                            "WHERE {\n" +
                            " <" + data.key + "> a scholary:" + type + " . \n" +
                            " <" + data.key + "> schema:label ?label . \n" +
                            "}";
                        that.launchQuerySparql(query, callback);
                    }
                    break;
                case "getEventByDate":
                    const originStartDate = moment(data.startDate);
                    const originEndDate = moment(data.endDate);
                    for (const type of types) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            " ?id scholary:startDate ?startDate . \n" +
                            " ?id scholary:endDate ?endDate . \n" +
                            "}";
                        that.launchQuerySparql(query, (results) => {
                            const nodeStartDate = results['?startDate'];
                            const nodeEndDate = results['?endDate'];

                            if (nodeStartDate && nodeEndDate) {
                                const startDate = moment(nodeStartDate.value);
                                const endDate = moment(nodeEndDate.value);

                                //if(dateStart.isBefore(startDate) && dateEnd.isAfter(endDate)){
                                if (startDate.isSameOrAfter(originStartDate) && endDate.isSameOrBefore(originEndDate)) {
                                    results['?type'] = {value: type};
                                    callback(results);
                                }
                            }
                        });
                    }
                    break;
                case "getEventByDateDayPerDay":
                    const localTypesDayPerDay = ["Workshop", "Tutorial", "Session", "Panel"];
                    const originStartDateDayPerDay = moment(data.startDate);
                    const originEndDateDayPerDay = moment(data.endDate);

                    for (const type of localTypesDayPerDay) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            " ?id scholary:startDate ?startDate . \n" +
                            " ?id scholary:endDate ?endDate . \n" +
                            "}";
                        that.launchQuerySparql(query, (results) => {
                            const nodeStartDate = results['?startDate'];
                            const nodeEndDate = results['?endDate'];

                            if (nodeStartDate && nodeEndDate) {
                                const startDate = moment(nodeStartDate.value);
                                const endDate = moment(nodeEndDate.value);

                                //if(dateStart.isBefore(startDate) && dateEnd.isAfter(endDate)){
                                if (startDate.isSameOrAfter(originStartDateDayPerDay) && endDate.isSameOrBefore(originEndDateDayPerDay)) {
                                    results['?type'] = {value: type};
                                    callback(results);
                                }
                            }
                        });
                    }
                    break;
                case "getEventFromPublication":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label ?type \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:InProceedings . \n" +
                        " <" + data.key + "> scholary:relatesToEvent ?id . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id a ?type . \n" +
                        "}";
                    that.launchQuerySparql(query, callback);
                    break;
                case "getAllKeywords":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?keywords \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id scholary:keyword ?keywords . \n" +
                        "}";
                    that.launchQuerySparql(query, callback);
                    break;
                case "getPublicationsByKeyword":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
                        "SELECT DISTINCT ?id ?label \n" +
                        "WHERE {\n" +
                        " ?id a scholary:InProceedings . \n" +
                        " ?id schema:label ?label . \n" +
                        " ?id scholary:keyword \"" + data.keyword + "\"^^<http://www.w3.org/2001/XMLSchema#string> . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getAllLocations":
                    query =
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?location \n" +
                        "WHERE {\n" +
                        " ?id a scholary:OrganisedEvent . \n" +
                        " ?id scholary:location ?location . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                case "getEventByLocation":
                    const localTypesEventByLocation = ["Workshop", "Tutorial", "Session", "Panel"];
                    for (const type of localTypesEventByLocation) {
                        query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                            "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                            "SELECT DISTINCT ?label ?id ?startDate ?endDate \n" +
                            "WHERE {\n" +
                            " ?id a scholary:" + type + " . \n" +
                            " ?id schema:label ?label . \n" +
                            " ?id scholary:location \"" + data.key + "\" . \n" +
                            " ?id scholary:startDate ?startDate . \n" +
                            " ?id scholary:endDate ?endDate . \n" +
                            "}";

                        that.launchQuerySparql(query, callback);
                    }
                    break;

                case "getSubEventOfConference":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?subEvent ?type \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> a scholary:Conference . \n" +
                        " <" + data.key + "> scholary:hasSubEvent ?subEvent . \n" +
                        " ?subEvent a ?type . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;

                case "getLabelById":
                    query = "PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?subEvent \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> schema:label ?label . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                default:
                    return null;
            }
        }
        else {
            that.queryWaiting.push({
                command: command,
                data: data,
                callback: callback,
            });
        }
    }

    arrayIncludes = (array, str) => {
        for (const a of array) {
            if (a === str) {
                return true;
            }
        }

        return false;
    };
}


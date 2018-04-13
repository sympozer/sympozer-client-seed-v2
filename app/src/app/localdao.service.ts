import {Inject, Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Conference} from './model/conference';
import 'rxjs/add/operator/toPromise';
import * as moment from 'moment';

import {Config} from './app-config';
import {eventHelper} from './eventHelper';
import {Encoder} from './lib/encoder';
import {DataLoaderService} from './data-loader.service';
import {ManagerRequest} from './services/ManagerRequest';
import {DOCUMENT} from '@angular/platform-browser';

const $rdf = require('rdflib');


@Injectable()
export class LocalDAOService {
    private localstorage_jsonld = 'dataset-sympozer';
    private $rdf = $rdf;
    private store = $rdf.graph();

    // Persons
    private personMap = {}; // Global map, containing all person data
    private personLinkMap = {}; // Map containing only data necessary for displaying person list
    private authorLinkMap = {}; // Same thing only for persons who made a publication
    private personLinkMapByRole = {}; // several maps, according to the holdsRole property

    // Organizations
    private organizationMap = {}; // Global and complete map
    private organizationLinkMap = {}; // Restricted map (cf. personLinkMap)

    // Roles
    private roleMap = {};

    // Publications
    private publicationMap = {};
    private publicationLinkMap = {};

    // Categories
    private categoryMap = {};
    private categoryForPublicationsMap = {};
    private categoryLinkMap = {};

    // Events
    private eventMap = {};
    private eventLinkMap = {};
    private eventLinkMapByLocation = {};

    // Conference schedule (ordered)
    private confScheduleList = [];

    // Locations
    private locationLinkMap = {};

    private queryWaiting = [];

    constructor(private http: Http,
                private ev: eventHelper,
                private encoder: Encoder,
                private dataloader: DataLoaderService,
                private managerRequest: ManagerRequest,
                @Inject(DOCUMENT) private document: any) {
        const domain = this.document.location.hostname;
        if (domain) {
            this.localstorage_jsonld += '-' + domain;
        }
        window['query'] = (sparql, limit, filter) => {
            sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX : <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#>'
                + sparql;
            if (typeof(limit) === 'function' && filter === undefined) {
                filter = limit;
                limit = undefined;
            }
            if (limit === undefined) {
                limit = 10;
                console.log("query: default limit of 10 applied");
            }
            if (filter === undefined) {
                filter = (x => x);
            }
            let count = 0;
            this.launchQuerySparql(sparql, (result) => {
                count += 1;
                if (count <= limit) {
                  result = filter(result);
                  if (result !== undefined) {
                    console.log(result);
                  }
                }
            });
        }
        window['queryCount'] = (sparql, filter) => {
          sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX : <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#>'
              + sparql;
          if (filter === undefined) {
              filter = (x => x);
          }
          let count = 0;
          let to = setTimeout(() => console.log(count), 500);
          this.launchQuerySparql(sparql, (result) => {
              clearTimeout(to);
              count += 1;
              to = setTimeout(() => console.log(count), 100);
          });
        }
        window['RDF'] = this.store;
    }

    resetDataset() {
        /*
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
        */
    }

    loadDataset(uri: string): Promise<boolean> {

        const that = this;
        return new Promise((resolve, reject) => {

            // Si on l'a pas, on le télécharge
            // if (!storage) {
            this.managerRequest.get_safe(uri)
                .then((response) => {
                    try {
                        if (response && response._body) {
                            that.saveDataset(response._body, uri);
                            return resolve(true);
                        }

                        return reject(false);
                    } catch (e) {
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

    saveDataset(dataset: string, uri: string) {
        const that = this;
        // TODO move to config
        const mimeType = 'text/turtle';


        try {
            that.$rdf.parse(dataset, that.store, uri, mimeType);
            that.store.fetcher = null;
            console.log(that.store.statements.length, "triples in store");

            // We if we have query waiting
            for (const qw of that.queryWaiting) {
                that.query(qw.command, qw.data, qw.callback);
            }

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    getData(uri: string): Promise<Conference> {
        // Vérifier la différence de version du fichier entre le local et le distant, et enregistrer en local si besoin (nouvelle version)
        return this.http.get(uri)
            .toPromise()
            .then(LocalDAOService.extractData)
            .catch(this.handleError);
    };

    private static extractData(res: Response) {
        // Server should wrap the data inside `data` property !!!!!!
        const body = res.json();
        // Enregistrer dans le localStorage
        localStorage.setItem('dataset', body || {});
        return body || {};
        // return body.data || {}
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

    getPictureUri(uri) {
        // Assume the image, if present, is located either at an HTTP* URI or in the image folder stated in the config file
        if (uri && typeof uri === 'string') {
            // TODO put that somewhere else
            // Emulate string startsWith functions for browsers that don't have it.
            // Code found at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.lastIndexOf(searchString, position) === position;
                };
            }
            if (!uri.startsWith('http')) {
                return Config.app.imageFolder + uri;
            }
            return uri;
        }
        return null;
    }

    launchQuerySparql = (query, callback) => {
        console.log("LAST_QUERY =\n", query);
        window['LAST_QUERY'] = query;
        const that = this;
        const querySparql = that.$rdf.SPARQLToQuery(query, false, that.store);
        if (querySparql.pat.statements.length === 0) {
        }
        that.store.query(querySparql, callback);
    }

    query(command, data, callback) {
        // Returning an object with the appropriate methods
        const that = this;
        const types = ['Panel', 'Session', 'Talk', 'Tutorial', 'Workshop', 'Track', 'Conference'];
        const abstractTypes = new Set([
           'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#OrganisedEvent',
           'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#AcademicEvent',
           'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#NonAcademicEvent',
        ]);
        const noAcademicEventTypes = ['Meal', 'SocialEvent', 'Break'];
        if (that.store && callback) {
            let query;
            switch (command) {
                case 'getMemberPersonByOrganisation':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?idPerson ?name  \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Organisation . \n' +
                        ' ?idPerson a scholary:Person . \n' +
                        ' ?idPerson schema:label ?name . \n' +
                        ' ?idPerson scholary:hasAffiliation ?hasAffiliation . \n' +
                        ' ?hasAffiliation scholary:withOrganisation <' + data.key + '> . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPerson':
                    query =
                        'PREFIX person: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'SELECT DISTINCT ?label ?box \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a person:Person . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        ' OPTIONAL { <' + data.key + '> foaf:mbox_sha1sum ?box . } \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPersonBySha':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'SELECT DISTINCT ?id ?label \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:Person . \n' +
                        ' ?id schema:label ?label . \n' +
                        ' ?id foaf:mbox_sha1sum ' + data.key + ' . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                // return this.personMap[data.key];
                case 'getPersonLink':
                    return this.personLinkMap[data.key];
                case 'getAllPersons':
                    query = 'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' ?id a sd:Person . \n' +
                        ' ?id rdfs:label ?fullName . \n' +
                        ' OPTIONAL { ?id sd:givenName ?givenName . } \n' +
                        ' OPTIONAL { ?id sd:familyName ?familyName . } \n' +
                        // " OPTIONAL { ?id foaf:mbox_sha1sum ?box . } \n" +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                // return this.personLinkMap;
                case 'getAllAuthors':
                    query =
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX dc: <http://purl.org/dc/elements/1.1/> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        //' ?idPubli a sd:InProceedings . \n' +
                        ' ?idPubli dc:creator ?idPerson . \n' +
                        ' ?idPubli rdfs:label ?title . \n' +
                        //' ?idPerson a sd:Person . \n' +
                        ' ?idPerson rdfs:label ?fullName . \n' +
                        ' OPTIONAL { ?idPerson sd:givenName ?givenName . } \n' +
                        ' OPTIONAL { ?idPerson sd:familyName ?familyName . } \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPersonsByRole':
                    query =
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' ?id a sd:Person . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' OPTIONAL { ?id sd:givenName ?givenName . } \n' +
                        ' OPTIONAL { ?id sd:familyName ?familyName . } \n' +
                        ' ?id sd:holdsRole ?idHoldRole . \n' +
                        ' ?idHoldRole sd:withRole <' + data.key + '> . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getOrganization':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?label \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Organisation . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getOrganizationLink':
                    query =
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?name ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> scholary:hasAffiliation ?affiliation . \n' +
                        ' ?affiliation scholary:withOrganisation ?id . \n' +
                        ' ?id schema:label ?name . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAllOrganizations':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:Organisation . \n' +
                        ' ?id schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAllRoles':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?idRole ?label \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:RoleDuringEvent . \n' +
                        ' ?id scholary:withRole ?idRole. \n' +
                        ' ?idRole schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getRole':
                    query =
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?idRole ?label \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Person . \n' +
                        ' <' + data.key + '> scholary:holdsRole ?idHoldRole . \n' +
                        ' ?idHoldRole scholary:withRole ?idRole . \n' +
                        ' ?idRole schema:label ?label . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                // For the moment, it's the same thing, since we haven't role complete descriptions.
                case 'getRoleLink':
                    return this.roleMap[data.key];
                case 'getPublication':
                    query =
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?label ?abstract \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:InProceedings . \n' +
                        ' <' + data.key + '> scholary:abstract ?abstract . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getKeywordsFromPublication':
                    query =
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?keywords \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:InProceedings . \n' +
                        ' <' + data.key + '> scholary:keyword ?keywords . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPublicationTrack':
                    query =
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?track ?label \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> sd:relatesToTrack ?track . \n' +
                        ' ?track rdfs:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAuthorLinkPublication':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?idPerson ?label \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:InProceedings . \n' +
                        ' <' + data.key + '> purl:creator ?idPerson . \n' +
                        ' ?idPerson schema:label ?label . \n' +
                        '} GROUP BY ?idPerson';

                    that.launchQuerySparql(query, callback);
                    break;

                case 'getFirstAuthorLinkPublication':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:InProceedings . \n' +
                        ' <' + data.key + '> scholary:hasAuthorList ?firstAuthorList . \n' +
                        ' ?firstAuthorList scholary:hasFirstItem ?id . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;

                case 'getNextAuthorLinkPublication':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:ListItem . \n' +
                        ' <' + data.key + '> scholary:next ?id . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;

                case 'getIdPersonByAuthorListItem':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:ListItem . \n' +
                        ' <' + data.key + '> scholary:hasContent ?id . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPublicationLink':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label ?abstract \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id purl:creator <' + data.key + '> . \n' +
                        ' ?id scholary:abstract ?abstract . \n' +
                        ' ?id schema:label ?label . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPublicationLinkByTrack':
                    query =
                        'PREFIX purl: <http://purl.org/dc/elements/1.1/> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label \n' +
                        'WHERE {\n' +
                        ' ?id a sd:InProceedings . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:relatesToTrack <' + data.key + '> . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAllPublications':
                    query =
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id schema:label ?label . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getEvent':
                    return this.eventMap[data.key];
                case 'getConferenceEvent':
                    return this.eventMap[data.key];
                case 'getEventIcs':
                    return this.eventMap[data.key];
                case 'getEventLink':
                    return this.eventLinkMap[data.key];
                case 'getAllEvents':
                    const localType = ['Workshop', 'Tutorial', 'Session', 'Panel'];
                    const allTypesAllEvents = localType.concat(noAcademicEventTypes);
                    for (const type of allTypesAllEvents) {

                        query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                            'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                            'SELECT DISTINCT ?id ?label ?type \n' +
                            'WHERE {\n' +
                            ' ?id a scholary:' + type + ' . \n' +
                            ' ?id schema:label ?label . \n' +
                            ' ?id a ?type . \n' +
                            '}';

                        /*that.launchQuerySparql(query, (results) => {
                            //results['?type'] = {value: type};
                            callback(results);
                        });*/
                        that.launchQuerySparql(query, callback);
                    }
                    break;
                case 'getEventById':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a ?type . \n' +
                        ' <' + data.key + '> rdfs:label ?label . \n' +
                        ' <' + data.key + '> sd:description ?description . \n' +
                        ' <' + data.key + '> sd:endDate ?endDate . \n' +
                        ' <' + data.key + '> sd:startDate ?startDate . \n' +
                        ' <' + data.key + '> sd:isSubEventOf ?isSubEventOf . \n' +
                        ' OPTIONAL { <' + data.key + '> foaf:homepage ?homepage . } \n' +
                        ' OPTIONAL { <' + data.key + '> sd:hasSite ?locId1 . ' +
                                    '?locId1 rdfs:label ?location1 . } \n' +
                        ' OPTIONAL { <' + data.key + '> sd:hasSuperEvent ?super . ' +
                                    '?super sd:hasSite ?locId2 . ' +
                                    '?locId2 rdfs:label ?location2 . } \n' +
                        ' OPTIONAL { <' + data.key + '> sd:isEventRelatedTo ?isEventRelatedTo . } \n' +
                        ' OPTIONAL { <' + data.key + '> sd:hasSubEvent ?hasSubEvent . ' +
                                    '?hasSubEvent rdfs:label ?subEventLabel . ' +
                                    '?hasSubEvent sd:startDate ?subEventStart . ' +
                                    'OPTIONAL { ?hasSubEvent sd:isEventRelatedTo ?paper . } } \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;

                case 'getConference':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Conference . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        ' <' + data.key + '> scholary:endDate ?endDate . \n' +
                        ' <' + data.key + '> scholary:startDate ?startDate . \n' +
                        ' <' + data.key + '> scholary:location ?location . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;

                /* not used anymore
                case "getTalkById":
                    query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT * \n" +
                        "WHERE {\n" +
                        " <" + data.key + "> rdfs:label ?label . \n" +
                        " <" + data.key + "> sd:endDate ?endDate . \n" +
                        " <" + data.key + "> sd:startDate ?startDate . \n" +
                        " <" + data.key + "> sd:isEventRelatedTo ?isEventRelatedTo . \n" +
                        "}";

                    that.launchQuerySparql(query, callback);
                    break;
                */
                case 'getTrackByEvent':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:Track . \n' +
                        ' ?id schema:label ?label . \n' +
                        ' ?id scholary:hasSubEvent <' + data.key + '> . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getTrackById':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Track . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getLocation':
                    return this.eventLinkMapByLocation[data.key];
                case 'getEventsByTrack':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a sd:OrganisedEvent . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:relatesToTrack <' + data.key + '> . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPublicationsByEvent':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id scholary:relatesToEvent <' + data.key + '> . \n' +
                        ' ?id schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getCategoryForPublications':
                    return this.categoryForPublicationsMap[data.key];
                case 'getCategoryLink':
                    return this.categoryLinkMap[data.key];
                case 'getAllCategories':
                    return this.categoryLinkMap;
                case 'getAllCategoriesForPublications':
                    query =
                        'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:Track . \n' +
                        ' ?id schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getConferenceSchedule':
                    return this.confScheduleList;
                // Only need the event URIs, as the ICS will be calculated in the model callback
                case 'getConferenceScheduleIcs':
                    return Object.keys(this.eventLinkMap);
                case 'getWhatsNext':
                    const now = moment();
                    const until = now.clone().add(Config.preferences.whatsNextDuration, 'hour');
                    const seeWhatsNext = new Set();

                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n' +
                        'WHERE {\n' +
                        ' ?id a ?type . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        ' ?id sd:endDate ?endDate . \n' +
                        ' ?id sd:isSubEventOf ?conf . \n' +
                        ' ?conf a sd:Conference . \n' +
                        '}';
                    that.launchQuerySparql(query, (results) => {
                        const nodeId = results['?id'];
                        const nodeType = results['?type'];
                        const nodeStartDate = results['?startDate'];
                        const nodeEndDate = results['?endDate'];

                        if (nodeId && nodeType && nodeStartDate && nodeEndDate) {
                            if (seeWhatsNext.has(nodeId.value) || abstractTypes.has(nodeType.value)) {
                              // skip events we have already seen,
                              // and those with an abstract type
                              // (wait for the result with a more concrete type)
                              return;
                            };
                            seeWhatsNext.add(nodeId.value);
                            const startDate = moment(nodeStartDate.value);

                            if (startDate.isAfter(now) && startDate.isBefore(until)) {
                                callback(results);
                            }
                        }
                    });
                    break;
                case "getWhatsNow":
                    const now2 = moment();
                    //const now = moment("2018-04-25T14:30:00+02:00") // DEBUG
                    let seenWhatsNow = new Set();

                    query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
                        "PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n" +
                        "SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n" +
                        "WHERE {\n" +
                        " ?id a ?type . \n" +
                        " ?id rdfs:label ?label . \n" +
                        " ?id sd:startDate ?startDate . \n" +
                        " ?id sd:endDate ?endDate . \n" +
                        " ?id sd:isSubEventOf ?conf . \n" +
                        " ?conf a sd:Conference . \n" +
                        "}";
                    that.launchQuerySparql(query, (results) => {
                        const id = results['?id'].value;
                        const type = results['?type'].value;
                        if (seenWhatsNow.has(id) || abstractTypes.has(type)) {
                          // skip events we have already seen,
                          // and those with an abstract type
                          // (wait for the result with a more concrete type)
                          return
                        }
                        seenWhatsNow.add(id);
                        const startDate = moment(results['?startDate'].value);
                        const endDate = moment(results['?endDate'].value);

                        if (startDate <= now2 && now2 <= endDate) {
                            callback(results);
                        }
                    });
                    break;
                case 'getDayPerDay':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?startDate \n' +
                        'WHERE {\n' +
                        ' ?id a sd:Session . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;

                case 'getIsSubEvent':
                    for (const type of types) {
                        if (type.toLowerCase() === 'track') {
                            continue;
                        }

                        query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                            'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                            'SELECT DISTINCT ?label \n' +
                            'WHERE {\n' +
                            ' <' + data.key + '> a scholary:' + type + ' . \n' +
                            ' <' + data.key + '> schema:label ?label . \n' +
                            '}';
                        that.launchQuerySparql(query, callback);
                    }
                    break;
                /* not used anywhere...
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

                                //if(now.isBefore(startDate) && until.isAfter(endDate)){
                                if (startDate.isSameOrAfter(originStartDate) && endDate.isSameOrBefore(originEndDate)) {
                                    results['?type'] = {value: type};
                                    callback(results);
                                }
                            }
                        });
                    }
                    break;
                */
                case 'getEventByDateDayPerDay':
                    const originStartDateDayPerDay = moment(data.startDate);
                    const originEndDateDayPerDay = moment(data.endDate);
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?label ?startDate ?endDate ?type \n' +
                        'WHERE {\n' +
                        ' ?id a ?type . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        ' ?id sd:endDate ?endDate . \n' +
                        ' ?id sd:isSubEventOf ?conf . \n' +
                        ' ?conf a sd:Conference . \n' +
                        '}';
                    const seenEventByDateDayPerDay = new Set();
                    that.launchQuerySparql(query, (results) => {
                        const nodeId = results['?id'];
                        const nodeStartDate = results['?startDate'];
                        const nodeEndDate = results['?endDate'];
                        const nodeType = results['?type'];

                        if (nodeId && nodeStartDate && nodeEndDate && nodeType) {
                            if (seenEventByDateDayPerDay.has(nodeId.value) || abstractTypes.has(nodeType.value)) {
                              // skip events we have already seen,
                              // and those with an abstract type
                              // (wait for the result with a more concrete type)
                              return;
                            };
                            seenEventByDateDayPerDay.add(nodeId.value);
                            const startDate = moment(nodeStartDate.value);
                            const endDate = moment(nodeEndDate.value);

                            // if(now.isBefore(startDate) && until.isAfter(endDate)){
                            if (startDate.isSameOrAfter(originStartDateDayPerDay) && endDate.isSameOrBefore(originEndDateDayPerDay)) {
                                callback(results);
                            }
                        }
                    });
                    break;
                case 'getEventFromPublication':
                    query = 'PREFIX foo: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> sd:relatesToEvent ?id . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        ' ?id sd:endDate ?endDate . \n' +
                        ' ?id sd:isSubEventOf ?sessionId . \n' +
                        ' ?sessionId rdfs:label ?sessionLabel . \n' +
                        ' ?sessionId sd:hasSite ?locationId . \n' +
                        ' ?locationId rdfs:label ?locationLabel . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAllKeywords':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?keywords \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id scholary:keyword ?keywords . \n' +
                        '}';
                    that.launchQuerySparql(query, callback);
                    break;
                case 'getPublicationsByKeyword':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n' +
                        'SELECT DISTINCT ?id ?label \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id schema:label ?label . \n' +
                        ' ?id scholary:keyword \"' + data.keyword + '\"^^<http://www.w3.org/2001/XMLSchema#string> . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getAllLocations':
                    query =
                        'PREFIX sch: <http://schema.org/> \n' +
                        'PREFIX scholar: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?location \n' +
                        'WHERE {\n' +
                        ' ?id ?o scholar:Site . \n' +
                        ' ?id rdfs:label ?location . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                case 'getEventByLocation':
                    const localTypesEventByLocation = ['Workshop', 'Tutorial', 'Session', 'Panel'];
                    const allTypesEventByLocation = localTypesEventByLocation.concat(noAcademicEventTypes);
                    for (const type of allTypesEventByLocation) {
                        query = 'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n' +
                            'PREFIX scholar: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                            'SELECT DISTINCT ?label ?id ?startDate ?endDate \n' +
                            'WHERE {\n' +
                            ' ?id ?p scholar:' + type + '. \n' +
                            ' ?id rdfs:label ?label . \n' +
                            ' ?id scholar:hasSite ?idName . \n' +
                            ' ?idName rdfs:label \"' + data.key + '\" . \n' +
                            ' ?id scholar:startDate ?startDate . \n' +
                            ' ?id scholar:endDate ?endDate . \n' +
                            '}';

                        that.launchQuerySparql(query, callback);
                    }
                    break;

                case 'getSubEventOfConference':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?subEvent ?type \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Conference . \n' +
                        ' <' + data.key + '> scholary:hasSubEvent ?subEvent . \n' +
                        ' ?subEvent a ?type . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;

                case 'getLabelById':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?subEvent \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchQuerySparql(query, callback);
                    break;
                default:
                    return null;
            }
        } else {
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
    }
}

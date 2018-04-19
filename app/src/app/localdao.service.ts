import {Inject, Injectable} from '@angular/core';
import * as moment from 'moment';
import {Config} from './app-config';
import {RequestManager} from './services/request-manager.service';
import {DOCUMENT} from '@angular/platform-browser';
import {MdSnackBar} from '@angular/material';

const $rdf = require('rdflib');

const types = ['Panel', 'Session', 'Talk', 'Tutorial', 'Workshop', 'Track', 'Conference'];
const abstractTypes = new Set([
    'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#OrganisedEvent',
    'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#AcademicEvent',
    'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#NonAcademicEvent',
]);
const noAcademicEventTypes = ['Meal', 'SocialEvent', 'Break'];

@Injectable()
export class LocalDAOService {
    // Contains one graph per dataset (all queried together)
    private store = $rdf.graph();

    // Set to true when all datasets have been parsed
    private ready = false;
    // Stores queries until all datasets are parsed
    private pendingQueries = [];

    private shortLivedCaches = [];

    constructor(private requestManager: RequestManager,
                public snackBar: MdSnackBar,
                @Inject(DOCUMENT) private document: any) {

        window['query'] = (sparql, limit, filter) => {
            sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
                + 'PREFIX : <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#>'
                + sparql;
            if (typeof(limit) === 'function' && filter === undefined) {
                filter = limit;
                limit = undefined;
            }
            if (limit === undefined) {
                limit = 10;
                console.log('query: default limit of 10 applied');
            }
            if (filter === undefined) {
                filter = (x => x);
            }
            let count = 0;
            this.launchSparqlQuery('query', sparql, (result) => {
                count += 1;
                if (count <= limit) {
                    result = filter(result);
                    if (result !== undefined) {
                        console.log(result);
                    }
                }
            });
        };
        window['queryCount'] = (sparql, filter) => {
            sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
                + 'PREFIX : <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#>'
                + sparql;
            if (filter === undefined) {
                filter = (x => x);
            }
            let count = 0;
            // TODO find out why this timeout...
            let to = setTimeout(() => console.log(count), 500);
            this.launchSparqlQuery('queryCount', sparql, (result) => {
                clearTimeout(to);
                count += 1;
                to = setTimeout(() => console.log(count), 100);
            });
        };
        window['RDF'] = this.store;
    }

    // Launched in the main component's constructor
    async initDatasets() {
        const that = this;
        const toBeParsed = [];
        for (const name in Config.conference.datasets) {
            if (Config.conference.datasets.hasOwnProperty(name)) {
                const uri = Config.conference.datasets[name];
                try {
                    const stream = await this.requestManager.getSynchronously(uri);
                    if (stream) {
                        toBeParsed.push(new Promise((resolve, reject) => {
                            that.parseDataset(stream, uri, resolve, reject);
                        }));
                    } else {
                        throw new Error('Invalid content for uri at ' + uri);
                    }
                } catch (error) {
                    this.snackBar.open(error.message, '', {duration: 3000});
                }
            }
        }
        Promise.all(toBeParsed).then(() => {
            console.log('Local DAO ready.');
            that.ready = true;
            // Process waiting queries
            for (const qw of that.pendingQueries) {
                that.query(qw.command, qw.data, qw.callback, qw.done);
            }
        });
    }

    public reloadDataset(uri: string) {
        const that = this;
        return new Promise((resolve, reject) => {

            this.requestManager.get(uri)
                .then((response) => {
                    try {
                        if (response) {
                            that.parseDataset(response, uri);
                            for (let cache of that.shortLivedCaches) {
                                cache.splice(0);
                            }
                            resolve();
                        } else {
                            reject(new Error('Empty dataset at ' + uri));
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
                .catch(reject);
        });
    }

    public registerShortLivedCache(cache: Array<Object>) {
        this.shortLivedCaches.push(cache);
    }

    private parseDataset(dataset, uri: string, resolve?, reject?) {
        const that = this;
        // TODO move to config
        const mimeType = 'text/turtle';
        const res = resolve ? resolve : () => {
            console.log('Dataset at ' + uri + ' parsed.');
        };

        try {
            $rdf.parse(dataset, that.store, uri, mimeType, res);
            console.log('Parsed ' + that.store.statements.length + ' triples in store');
        } catch (e) {
            if (reject) {
                reject(e);
            } else {
                throw e;
            }
        }
    }

    // Actually performs the query in the store
    private launchSparqlQuery(command, query, callback, done?) {
        console.log('LAST_QUERY (' + command + ') =\n', query);
        window['LAST_QUERY'] = query;
        const that = this;

        const querySparql = $rdf.SPARQLToQuery(query, false, that.store);
        if (querySparql && querySparql.pat.statements.length === 0) {
            console.warn("The SPARQL is probably wrong (0 statements parsed)");
        }
        that.store.query(querySparql, callback, undefined, done);
    }

    query(command, data, callback, done?) {
        // Returning an object with the appropriate methods
        const that = this;

        if (that.ready && callback) {
            let query: string;
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                // return this.personMap[data.key];
                /*
                                case 'getPersonLink':
                                    return this.personLinkMap[data.key];
                */
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
                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                // return this.personLinkMap;
                case 'getAllAuthors':
                    query =
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX dc: <http://purl.org/dc/elements/1.1/> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        // ' ?idPubli a sd:InProceedings . \n' +
                        ' ?idPubli dc:creator ?idPerson . \n' +
                        ' ?idPubli rdfs:label ?title . \n' +
                        // ' ?idPerson a sd:Person . \n' +
                        ' ?idPerson rdfs:label ?fullName . \n' +
                        ' OPTIONAL { ?idPerson sd:givenName ?givenName . } \n' +
                        ' OPTIONAL { ?idPerson sd:familyName ?familyName . } \n' +
                        '}';
                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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
                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                // For the moment, it's the same thing, since we haven't role complete descriptions.
                /*
                                case 'getRoleLink':
                                    return this.roleMap[data.key];
                */
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getTracksOf':
                    query =
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'SELECT DISTINCT ?track ?label \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> sd:relatesToTrack ?track . \n' +
                        ' ?track rdfs:label ?label . \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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
                    that.launchSparqlQuery(command, query, callback, done);
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
                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getAllEvents':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' ?id a sd:OrganisedEvent . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:isSubEventOf ?parent . \n' + // filter out the Conference itself
                        ' ?id a ?type . \n' +
                        ' OPTIONAL { ?id sd:isEventRelatedTo ?paper . } \n' + // used to filter out events associated with a paper
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getEventById':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'PREFIX foaf: <http://xmlns.com/foaf/0.1/> \n' +
                        'SELECT DISTINCT ?label ?description ?endDate ?startDate ?isSubEventOf ?isEventRelatedTo ?hasSubEvent ?type ?location \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a ?type . \n' +
                        ' <' + data.key + '> rdfs:label ?label . \n' +
                        ' <' + data.key + '> sd:endDate ?endDate . \n' +
                        ' <' + data.key + '> sd:startDate ?startDate . \n' +
                        ' <' + data.key + '> sd:isSubEventOf ?isSubEventOf . \n' +
                        ' OPTIONAL { <' + data.key + '> sd:description ?description . } \n' +
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

                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
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
                case 'getTrackByEvent':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:Track . \n' +
                        ' ?id schema:label ?label . \n' +
                        ' ?id scholary:hasSubEvent <' + data.key + '> . \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                    */
                case 'getTrackById':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> a scholary:Track . \n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getEventsByTrack':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?label ?id \n' +
                        'WHERE {\n' +
                        ' ?id a sd:OrganisedEvent . \n' +
                        ' ?id rdfs:label ?label . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        ' ?id sd:endDate ?endDate . \n' +
                        ' ?id sd:relatesToTrack <' + data.key + '> . \n' +
                        '}';
                    that.launchSparqlQuery(command, query, callback, done);
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
                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getAllCategoriesFor':
                    query =
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' ?super sd:hasSubTrack ?sub . \n' +
                        ' ?sub rdfs:label ?subL . \n' +
                        ' ?super rdfs:label ?superL . \n' +
                        ' ?idEvent sd:relatesToTrack ?sub . \n' +
                        ' ?idEvent a sd:' +  data.key + ' . \n' +
                        ' OPTIONAL { ?super <http://open.vocab.org/terms/sortLabel> ?sortLabel. } \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                /*
                                case 'getConferenceSchedule':
                                    return this.confScheduleList;
                                // Only need the event URIs, as the ICS will be calculated in the model callback
                                case 'getConferenceScheduleIcs':
                                    return Object.keys(this.eventLinkMap);
                */
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
                    that.launchSparqlQuery(command, query, (results) => {
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
                            }
                            seeWhatsNext.add(nodeId.value);
                            const startDate = moment(nodeStartDate.value);

                            if (startDate.isAfter(now) && startDate.isBefore(until)) {
                                callback(results);
                            }
                        }
                    }, done);
                    break;
                case 'getWhatsNow':
                    const now2 = moment();
                    // const now = moment("2018-04-25T14:30:00+02:00") // DEBUG
                    const seenWhatsNow = new Set();

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
                    that.launchSparqlQuery(command, query, (results) => {
                        const id = results['?id'].value;
                        const type = results['?type'].value;
                        if (seenWhatsNow.has(id) || abstractTypes.has(type)) {
                            // skip events we have already seen,
                            // and those with an abstract type
                            // (wait for the result with a more concrete type)
                            return;
                        }
                        seenWhatsNow.add(id);
                        const startDate = moment(results['?startDate'].value);
                        const endDate = moment(results['?endDate'].value);

                        if (startDate <= now2 && now2 <= endDate) {
                            callback(results);
                        }
                    }, done);
                    break;
                case 'getDayPerDay':
                    query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?startDate \n' +
                        'WHERE {\n' +
                        ' ?id a sd:Session . \n' +
                        ' ?id sd:startDate ?startDate . \n' +
                        '}';
                    that.launchSparqlQuery(command, query, callback, done);
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
                        that.launchSparqlQuery(command, query, callback, done);
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
                    that.launchSparqlQuery(command, query, (results) => {
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
                            }
                            seenEventByDateDayPerDay.add(nodeId.value);
                            const startDate = moment(nodeStartDate.value);
                            const endDate = moment(nodeEndDate.value);

                            // if(now.isBefore(startDate) && until.isAfter(endDate)){
                            if (startDate.isSameOrAfter(originStartDateDayPerDay) && endDate.isSameOrBefore(originEndDateDayPerDay)) {
                                callback(results);
                            }
                        }
                    }, done);
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
                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getAllKeywords':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?keywords \n' +
                        'WHERE {\n' +
                        ' ?id a scholary:InProceedings . \n' +
                        ' ?id scholary:keyword ?keywords . \n' +
                        '}';
                    that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getAllLocations':
                    query =
                        'PREFIX sch: <http://schema.org/> \n' +
                        'PREFIX sd: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?id ?location \n' +
                        'WHERE {\n' +
                        ' ?id ?o sd:Site . \n' +
                        ' ?id rdfs:label ?location . \n' +
                        ' ?evt sd:hasSite ?id . \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
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

                        that.launchSparqlQuery(command, query, callback, done);
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

                    that.launchSparqlQuery(command, query, callback, done);
                    break;

                case 'getLabelById':
                    query = 'PREFIX schema: <http://www.w3.org/2000/01/rdf-schema#> \n' +
                        'PREFIX scholary: <https://w3id.org/scholarlydata/ontology/conference-ontology.owl#> \n' +
                        'SELECT DISTINCT ?subEvent \n' +
                        'WHERE {\n' +
                        ' <' + data.key + '> schema:label ?label . \n' +
                        '}';

                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                case 'getGeoByLabel':
                    query = 'PREFIX s: <http://schema.org/> \n' +
                        'SELECT DISTINCT * \n' +
                        'WHERE {\n' +
                        ' ?id rdfs:label "' + data.key + '" . \n' +
                        ' ?id s:geo ?geo . \n' +
                        '}';
                    that.launchSparqlQuery(command, query, callback, done);
                    break;
                default:
                    console.error("Unknown command " + command)
                    return null;
            }
        } else {
            that.pendingQueries.push({
                command: command,
                data: data,
                callback: callback,
                done: done,
            });
        }
    }
}

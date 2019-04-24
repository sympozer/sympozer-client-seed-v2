import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {RequestManager} from './services/request-manager.service';

@Injectable()
export class DBLPDataLoaderService {
    uri = 'http://dblp.rkbexplorer.com/sparql/';

    constructor(private requestManager: RequestManager) {
    }

    public getAuthorPublications(name: string): Promise<any> {
        const prefix = 'PREFIX akt:  <http://www.aktors.org/ontology/portal#>';

        const query = `SELECT DISTINCT ?publiUri ?publiTitle
                    WHERE {
                     { ?publiUri akt:has-author ?o
                        ?o akt:full-name "${name}".
                        ?publiUri akt:has-title ?publiTitle.
                      }
                    }`;

        return this.query(prefix, query);
    }

    public getExternPublicationAuthors = (publicationUri: string): Promise<any> => {
        const prefix = 'PREFIX akt:  <http://www.aktors.org/ontology/portal#>';

        const query = ' SELECT DISTINCT ?authorUri  ?authorName WHERE { ' +
            '	<' + publicationUri + '> akt:has-author ?authorUri ' +
            '	?authorUri  akt:full-name ?authorName. ' +
            '}  ';
        return this.query(prefix, query);
    }

    public getExternPublicationInfo = (publicationUri: string): Promise<any> => {
        const prefix = ` PREFIX akt:  <http://www.aktors.org/ontology/portal#>
                       PREFIX akts: <http://www.aktors.org/ontology/support#>       `;
        const query = ' SELECT DISTINCT ?publiTitle ?publiDate ?publiJournal ?publiLink ?publiResume WHERE {  ' +
            '	OPTIONAL { <' + publicationUri + '>   akt:article-of-journal ?publiJournalUri. ' +
            '	?publiJournalUri akt:has-title ?publiJournal   . }' +
            '	OPTIONAL {<' + publicationUri + '>   akt:has-date  ?year. ' +
            '   ?year				   akts:year-of ?publiDate. }' +
            '	OPTIONAL {<' + publicationUri + '>   akt:has-title ?publiTitle. } ' +
            '	OPTIONAL {<' + publicationUri + '>  akt:cites-publication-reference ?publiResumeUri. ' +
            '	?publiResumeUri akt:has-title  ?publiResume . } ' +
            '	OPTIONAL {<' + publicationUri + '>   akt:has-web-address ?publiLink. }' +
            ' } ';
        return this.query(prefix, query);
    }

    private query = (prefix: string, query: string, format: string = 'json') => {
        /*
        const params: URLSearchParams = new URLSearchParams();
        const queryString = `${prefix}
                            ${query}`;
        params.set('format', format);
        params.set('query', queryString);
        return this.requestManager.get_json(this.uri, {search: params}).catch(this.handleError);
        */
        //upgrading from URLSearchParams to HttpParams
        let params = new HttpParams();
        const queryString = `${prefix}
                            ${query}`;
        params = params.append('format', format);
        params = params.append('query', queryString);
        return this.requestManager.get_json(this.uri, { params })
    }

    handleError(error: any): Promise<any> {
//        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}

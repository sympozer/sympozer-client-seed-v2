import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';

@Injectable()
export class DBLPDataLoaderService {
    uri:string = "http://dblp.rkbexplorer.com/sparql/";

    constructor(private http:Http) {
    }

    public getAuthorPublications(name:string):Promise<any> {
        let prefix = "PREFIX akt:  <http://www.aktors.org/ontology/portal#>";

        let query = `SELECT DISTINCT ?publiUri ?publiTitle 
                    WHERE {
                     { ?publiUri akt:has-author ?o 
                        ?o akt:full-name "${name}". 
                        ?publiUri akt:has-title ?publiTitle. 
                      }
                    }`;
        return this.query(prefix, query);
    }

    public getExternPublicationAuthors = (publicationUri:string):Promise<any> => {
        let prefix = "PREFIX akt:  <http://www.aktors.org/ontology/portal#>";

        let query = ' SELECT DISTINCT ?authorUri  ?authorName WHERE { ' +
            '	<' + publicationUri + '> akt:has-author ?authorUri ' +
            '	?authorUri  akt:full-name ?authorName. ' +
            '}  ';
        return this.query(prefix, query);
    };

    public getExternPublicationInfo = (publicationUri:string):Promise<any> => {
        let prefix = ` PREFIX akt:  <http://www.aktors.org/ontology/portal#>              
                       PREFIX akts: <http://www.aktors.org/ontology/support#>       `;
        let query = ' SELECT DISTINCT ?publiTitle ?publiDate ?publiJournal ?publiLink ?publiResume WHERE {  ' +
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
    };

    private query = (prefix:string, query:string, format:string = 'json')=> {
        let params:URLSearchParams = new URLSearchParams();
        let queryString = `${prefix}
                            ${query}`;
        params.set('format', format);
        params.set('query', queryString);
        return this.http.get(this.uri, {search: params})
            .toPromise()
            .then(response => {
                return response.json();
            }).catch(this.handleError);
    };

    handleError(error:any):Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
}
}

import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from "@angular/http";

@Injectable()
export class GoogleDataLoaderService {
    uri:string = "http://api.duckduckgo.com/";

    constructor(private http:Http) {
    }

    public getAuthorPersonalPage  = (authorName:string)=> {
        let params:URLSearchParams = new URLSearchParams();
        params.set('q', authorName);
        params.set('format', 'json');
        params.set('pretty', 1);
        params.set('no_redirect', 1);
        params.set('output', 'json');
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
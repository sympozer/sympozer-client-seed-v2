import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable()
export class GoogleDataLoaderService {
    uri:string = "http://api.duckduckgo.com/";

    constructor(private http:HttpClient) {
    }

    public getAuthorPersonalPage  = (authorName:string)=> {
        let params = new HttpParams();
        params = params.append('q', authorName);
        params = params.append('format', 'json');
        params = params.append('pretty', "1");
        params = params.append('no_redirect', "1");
        params = params.append('output', 'json');
        return this.http.get(this.uri, {params})
            .toPromise()
            .then(response => {
                return response;
            }).catch(this.handleError);
    };

    handleError(error:any):Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}

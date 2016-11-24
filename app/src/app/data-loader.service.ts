import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Conference} from "./model/conference";

@Injectable()
export class DataLoaderService {
    private conferenceURL = 'https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json';

    constructor(private http:Http) {
    }

    getData():Promise<Conference> {

        return this.http.get(this.conferenceURL)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    getDataUrl(url:string):Promise<Conference> {
        let params:URLSearchParams = new URLSearchParams();
        params.set('format', 'json');
        return this.http.get(url,{search: params})
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    private extractData(res:Response) {
        // Server should wrap the data inside `data` property !!!!!!
        let body = res.json();
        console.log("extractdata");
        console.log(body);
        return body || {};
        // return body.data || {}
    }

    private handleError(error:any):Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}

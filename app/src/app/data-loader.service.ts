import {Injectable} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {Http, Response, URLSearchParams} from '@angular/http';

import {Conference} from './model/conference';

@Injectable()
export class DataLoaderService {

    private static extractData(res: Response) {
        // Server should wrap the data inside `data` property !!!!!!
        const body = res.json();
        console.log('extractdata');
        console.log(body);
        return body || {};
        // return body.data || {}
    }

    private static handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    constructor(private http: Http) {
    }

    getData(url: string): Promise<Conference> {

        return this.http.get(url)
            .toPromise()
            .then(DataLoaderService.extractData)
            .catch(DataLoaderService.handleError);
    };

    getDataUrl(url: string): Promise<Conference> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('format', 'json');
        return this.http.get(url, {search: params})
            .toPromise()
            .then(DataLoaderService.extractData)
            .catch(DataLoaderService.handleError);
    };
}

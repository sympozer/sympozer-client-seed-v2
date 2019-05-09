import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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

    constructor(private http: HttpClient) {
    }

    getData(url: string): Promise<Conference> {

        return this.http.get(url)
            .toPromise()
            .then(DataLoaderService.extractData)
            .catch(DataLoaderService.handleError);
    };

    getDataUrl(url: string): Promise<Conference> {
        let params = new HttpParams();
        params = params.append('format', 'json');
        return this.http.get(url, {params})
            .toPromise()
            .then(DataLoaderService.extractData)
            .catch(DataLoaderService.handleError);
    };
}

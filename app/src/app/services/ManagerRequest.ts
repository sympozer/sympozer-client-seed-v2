/**
 * Created by pierremarsot on 23/01/2017.
 */

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from "@angular/core";

@Injectable()
export class ManagerRequest {
    constructor(private http: Http) {

    }

    get(url) {
        return this.http.get(url)
            .toPromise()
            .then((response) => response.json())
            .then((json) => {
                return json;
            })
            .catch(() => {
                return null;
            });
    }

    get_safe(url) {
        return this.http.get(url)
            .toPromise()
            .then((response) => {
                return response
            })
            .catch((response) => {
                return response;
            });
    }

    post_safe(url, body, options?) {
        return this.http.post(url, body, options)
            .toPromise()
            .then((response) => {
                return response
            })
            .catch((response) => {
                return response;
            });
    }
}
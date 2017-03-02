/**
 * Created by pierremarsot on 23/01/2017.
 */

import {Http} from '@angular/http';
import {Injectable} from "@angular/core";

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
}
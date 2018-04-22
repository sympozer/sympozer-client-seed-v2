/**
 * Created by pierremarsot on 23/01/2017.
 */

import {Http, Response} from '@angular/http';
import {Injectable} from '@angular/core';
import 'rxjs/operator/toPromise';

@Injectable()
export class RequestManager {
    constructor(private http: Http) { }

    get_json(url, params?) {
        let req: any;
        if (params) {
            req = this.http.get(url, params);
        } else {
            req = this.http.get(url);
        }
        return req.toPromise()
            .then((response) => response.json())
            .then((json) => {
                return json;
            })
            .catch(() => {
                return null;
            });
    }
    get(url,options?) {
        return this.http.get(url,options)
            .toPromise()
            .then((response: Response) => {
                return response.text();
            })
            .catch((error) => {
                throw error;
            });
    }

    // What's inside .Promise() ?...
    getResponseText(url) {
        const prom = new Promise((resolve, reject) => {
            let resp = '';
            this.http.get(url).subscribe((x: Response) => resp += x.text(), (err: any) => reject(err), () => resolve(resp));
        });
        return prom;
    }

    // WARNING: Need to send the complete response (and not only response.text()), as the response status is used in vote.service.ts
    post(url, body, options?) {
        return this.http.post(url, body, options)
            .toPromise()
            .then((response) => {
                return response;
            })
            .catch((error) => {
                throw error;
            });
    }

    // Removing asynchronous aspects in the loading process so that the app doesn't start while datasets are not loaded
    async getSynchronously(uri: string) {
        return await this.getResponseText(uri);
    }
}


import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Config} from '../../app-config';

@Injectable()
export class ActivationMailService {

    constructor(private http: HttpClient) {
    }

    resend(email: string): Observable<any> {

        const headers = new HttpHeaders();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email;

        return this.http
            .post(Config.serverLogin.url + '/api/v1/resend', data, {headers: headers}).pipe(
            //map(res => res.json()),
            catchError(this.handleError),);
    }

    private handleError(error: Response) {
        return observableThrowError(JSON.parse(error['_body']).message);
    }
}

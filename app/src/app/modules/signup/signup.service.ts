
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Config} from '../../app-config';

@Injectable()
export class SignUpService {

    constructor(private http: HttpClient) {
    }

    register(email: string, firstname: string, lastname: string, password: string): Observable<any> {

        const headers = new HttpHeaders();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email + '&' + 'firstname=' + firstname + '&' + 'lastname=' + lastname + '&' + 'password=' + password;

        return this.http
            .post( Config.apiLogin.url + '/api/v1/register', data, {headers: headers}).pipe(
            //map(res => res.json()),
            catchError(this.handleError),);
    }

    private handleError(error: Response) {
        return observableThrowError(error.statusText);
    }
}

import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Config} from '../../app-config';

@Injectable()
export class SignUpService {

    constructor(private http: Http) {
    }

    register(email: string, firstname: string, lastname: string, password: string): Observable<any> {

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email + '&' + 'firstname=' + firstname + '&' + 'lastname=' + lastname + '&' + 'password=' + password;

        return this.http
            .post( Config.apiLogin.url + '/api/v1/register', data, {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error.statusText);
    }
}

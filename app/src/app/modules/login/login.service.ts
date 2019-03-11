
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Config} from '../../app-config';

@Injectable()
export class LoginService {

    constructor(private http: HttpClient) {
    }

    authentification(email: string, password: string): Observable<any>{

        const headers = new HttpHeaders();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'username=' + email + '&' + 'password=' + password;

        return this.http
            .post( Config.serverLogin.url + '/login/www2018/login', data, {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    } 

    signup(email: string, firstname: string, lastname: string , password: string): Observable<any> {
        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email + '&' + 'firstname=' + firstname + 'lastname=' + lastname + 'password=' + password;

        return this.http
            .post( Config.serverLogin.url + '/api/v1/register', data, {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    refresh(refresh_token: string): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const data = 'refresh_token=' + refresh_token;

        return this.http
            .post( Config.serverLogin.url + '/login/www2018/refresh', data, {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    } 

    logout(access_token: string, refresh_token: string): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const data = 'access_token=' + access_token + '&' + 'refresh_token=' + refresh_token;
       
        return this.http
            .post( Config.serverLogin.url + '/login/www2018/logout', data, {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    } 
    

    getUser(id: string): Observable<any>{

        const headers = new HttpHeaders();
        headers.set('Accept', 'application/json');

        return this.http
            .get( Config.serverLogin.url + '/api/v1/user/' + id, {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    }

    private handleError(error: Response) {
        return observableThrowError(error.statusText);
    }
}

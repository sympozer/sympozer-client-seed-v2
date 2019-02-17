
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

        const data = 'email=' + email + '&' + 'password=' + password;

        return this.http
            .post( Config.serverLogin.url + '/login/www2018/login', data, {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    } 

    refresh(): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
       
        return this.http
            .post( Config.serverLogin.url + '/login/www2018/refresh',  {headers: headers}).pipe(
                //map(res => res.json()),
                catchError(this.handleError),);
    } 

    logout(): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

       
        return this.http
            .post( Config.serverLogin.url + '/login/www2018/logout',  {headers: headers}).pipe(
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

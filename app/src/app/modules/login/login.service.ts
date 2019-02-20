import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Config} from '../../app-config';

@Injectable()
export class LoginService {

    constructor(private http: Http) {
    }

    authentification(email: string, password: string): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email + '&' + 'password=' + password;

        return this.http
            .post( Config.serverLogin.url + '/login/www2018/login', data, {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    } 

    signup(email: string, firstname: string, lastname: string, password: string): Observable<any> {
        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        const data = 'email=' + email + '&' + 'firstname=' + firstname + 'lastname=' + lastname + 'password=' + password;

        return this.http
            .post( Config.serverLogin.url + '/login/www2018/createPassword', data, {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    refresh(): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
       
        return this.http
            .post( Config.serverLogin.url + '/login/www2018/refresh',  {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    } 

    logout(): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

       
        return this.http
            .post( Config.serverLogin.url + '/login/www2018/logout',  {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    } 
    

    getUser(id: string): Observable<any>{

        const headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http
            .get( Config.serverLogin.url + '/api/v1/user/' + id, {headers: headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error.statusText);
    }
}
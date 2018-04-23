import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Observable} from 'rxjs/Observable';
import {Config} from "../../app-config";

@Injectable()
export class LoginService {

    constructor(private http: Http) {
    }

    authentification(email: string, password:string):Observable<any>{

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        let data = "email=" + email + "&" + "password=" + password;  

        return this.http
            .post( Config.apiLogin.url + "/api/v1/auth", data, {headers:headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    getUser(id: string):Observable<any>{

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http
            .get( Config.apiLogin.url + "/api/v1/user/" + id, {headers:headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error.statusText);
    }
}
import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Observable} from 'rxjs/Observable';
import {Config} from "../../app-config";

@Injectable()
export class ActivationMailService {

    constructor(private http: Http) {
    }

    resend(email: string):Observable<any>{
        
        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        let data = "email=" + email;

        return this.http
            .post( Config.apiLogin.url + "/api/v1/resend", data, {headers:headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error.statusText);
    }
}
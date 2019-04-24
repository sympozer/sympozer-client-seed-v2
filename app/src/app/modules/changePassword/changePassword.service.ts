
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Config} from "../../app-config";

@Injectable()
export class ChangePasswordService {

    constructor(private http: Http) {
    }

    changePassword(currentPassword:string, newPassword: string):Observable<any>{
        
        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        let data = "currentPassword=" + currentPassword + "&" + "newPassword=" + newPassword;

        return this.http
            .post( Config.apiLogin.url + "/api/v1/updatePassword", data, {headers:headers}).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    private handleError(error: Response) {
        return observableThrowError(error.statusText);
    }
}
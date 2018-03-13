import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LoginService {

    private loginModuleUrl = "https://login.sympozer.com";

    constructor(private http: Http) {
    }

    authentification(email: string, password:string):Observable<any>{

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.append('Content-Type', ' multipart/form-data');
        /*
        let formData = new FormData();
        formData.append("email",email);
        formData.append("password",password);
        */

        let data = {
            "email" : email,
            "password" : password
        };

        return this.http
            .post( this.loginModuleUrl + "/api/v1/auth", JSON.stringify(data), {headers:headers})
            .map((response: Response) =>{
                return response;
            })
    }
}
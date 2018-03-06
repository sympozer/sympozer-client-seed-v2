import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LoginService {

    private loginModuleUrl = "login.sympozer.com";

    constructor(private http: Http) {
    }

    authentification(email: string, password:string){
        /*
        return this.http
            .post(this.loginModuleUrl + "/api/v1/auth", {email : email , password : password})
            .map((response: Response) =>{
                console.log(response);
                return response;
            });
         */
    }
}
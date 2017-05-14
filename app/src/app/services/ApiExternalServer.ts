/**
 * Created by pierremarsot on 27/02/2017.
 */
import {Injectable} from "@angular/core";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import {Http} from "@angular/http";
import {ManagerRequest} from "./ManagerRequest";
import {Config} from "../app-config";
import {LocalStorageService} from 'ng2-webstorage';


@Injectable()
export class ApiExternalServer {
    private subjectLogin = new Subject<any>();
    private key_localstorage_token = "token_external_ressource_sympozer";

    constructor(private http: Http,
                private managerRequest: ManagerRequest,
                private localStoragexx: LocalStorageService) {

    }

    checkUserLogin(){
        let token = this.localStoragexx.retrieve(this.key_localstorage_token)
        if(token && token.length > 0)
            return true;
        return false;
    }

    login = (email, password) => {
        return new Promise((resolve, reject) => {
            if (!email || email.length === 0) {
                return reject('Votre email n\'est pas valide');
            }

            if (!password || password.length === 0) {
                return reject('Votre password n\'est pas valide');
            }

            const that = this;
            that.managerRequest.get_safe(Config.externalServer.url + '/api/login?email=' + email + '&password=' + password)
                .then((request) => {
                    console.log(request)
                    const user = JSON.parse(request._body);
                    if (!user || !user.token) {
                        return reject('Erreur lors de la récupération de vos informations');
                    }

                    that.localStoragexx.store(that.key_localstorage_token, user.token);
                    return resolve(user.token);
                })
                .catch((request) => {
                    return reject();
                });
        });
    };

    logoutUser(){
        this.localStoragexx.clear(this.key_localstorage_token)
    }

    /**
     * Send to all subscribers Login status
     * @param message
     */
    sendLoginStatus(status: boolean) {
        console.log(status)
        this.subjectLogin.next(status);
    }

    /**
     * Clear the Login status
     */
    clearLoginStatus() {
        this.subjectLogin.next();
    }

    /**
     * Retrieve the Login status
     * @returns {Observable<any>}
     */
    getLoginStatus(): Observable<any> {
        console.log("get login status")
        return this.subjectLogin.asObservable();
    }

   
}
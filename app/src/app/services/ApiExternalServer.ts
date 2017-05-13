/**
 * Created by pierremarsot on 27/02/2017.
 */
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {ManagerRequest} from "./ManagerRequest";
import {Config} from "../app-config";
import {LocalStorageService} from 'ng2-webstorage';

@Injectable()
export class ApiExternalServer {
    private key_localstorage_token = "token_external_ressource_sympozer";

    constructor(private http: Http,
                private managerRequest: ManagerRequest,
                private localStoragexx: LocalStorageService) {

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

   
}
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

    vote = (id_ressource) => {
        return new Promise((resolve, reject) => {
            if (!id_ressource || id_ressource.length === 0) {
                return reject('Erreur lors de la récupération de l\'identifiant de la ressource');
            }

            const that = this;
            const token = that.localStoragexx.retrieve(that.key_localstorage_token);

            if (!token || token.length === 0) {
                return reject('Vous devez vous connectez avant de pouvoir voter');
            }

            that.managerRequest.get_safe(Config.externalServer.url + '/api/vote?token=' + token + '&id_ressource=' + id_ressource)
                .then((request) => {
                    if (request && request._body) {
                        return resolve(request._body);
                    }

                    return reject(null);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    };
}
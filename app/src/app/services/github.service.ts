/**
 * Created by pierremarsot on 27/02/2017.
 */
import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions} from "@angular/http";
import {LocalStorageService} from 'ngx-webstorage';
const github = require('octonode');

@Injectable()
export class GithubService {
    private urlRepoGithub = 'sympozer/sympozer-client-seed-v2';
    private lastHash = 'dd11e471f9c2a278202bd4c7916643251b0d1329';
    private access_token = '1dcc9dbbdf85a10cbcbe84c87abbb1f4255ab0b1';
    private clientGitHub = null;
    private repoGitHub = null;
    private localstorage_jsonld = 'dataset-sympozer-jsonld';
    diffExample = {_body : ''};

    constructor(private http: Http,
                private localStoragexx: LocalStorageService) {

    }

    /**
     * Permet de s'authentifier via un token
     * @param token - Le token d'authentification
     * @returns {Promise<T>}
     */
    auth = (token) => {
        return new Promise((resolve, reject) => {
            try {
                if (!token) {
                    return reject();
                }

                this.clientGitHub = github.client(token);

                //this.clientGitHub = github.client();
                return resolve();
            }
            catch (e) {
                return reject();
            }
        });
    };

    /**
     * Permet d'obtenir les rates de l'utilisateur courant (comme le nombre effectué / restant / max de requêtes)
     * @returns {Promise<T>}
     */
    getRate = () => {
        return new Promise((resolve, reject) => {
            try {
                if (!this.clientGitHub) {
                    return reject();
                }

                this.clientGitHub.limit(function (err, left, max, reset) {
                    console.log(left); // 4999
                    console.log(max);  // 5000
                    console.log(reset);  // 1372700873 (UTC epoch seconds)
                });

                return resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    };

    /**
     * Permet de récupérer le repo de l'user
     * @returns {Promise<T>}
     */
    getRepo = () => {
        return new Promise((resolve, reject) => {
            try {
                let promise = [];

                //Si on a pas le client, on le crée
                if (!this.clientGitHub) {
                    promise.push(this.auth(this.access_token));
                }

                Promise.all(promise)
                    .then(() => {
                        this.repoGitHub = this.clientGitHub.repo(this.urlRepoGithub);
                        return resolve(this.repoGitHub !== null);
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            }
            catch (e) {
                return false;
            }
        });
    };

    /**
     * Permet de récupérer le hash du dernier commit
     * @returns {Promise<T>}
     */
    getLastHashCommit = () => {
        const that = this;
        return new Promise((resolve, reject) => {
            try {
                let promises = [];

                //Si on a pas le repo, on l'initialise
                if (!this.repoGitHub) {
                    promises.push(this.getRepo());
                }

                Promise.all(promises)
                    .then(() => {
                        //On récup tous les commits
                        this.repoGitHub.commits((error, response) => {
                            //Si erreur, on stop
                            if (error) {
                                this.lastHash = null;
                                reject(error);
                                return false;
                            }

                            //Si réponse vide, on stop
                            if (!response || response.length === 0) {
                                reject('Erreur lors de la récupération des commits');
                                return false;
                            }

                            //On récup le dernier commit (premier de la liste)
                            const lastCommit = response[0];
                            console.log(response)
                            if (!lastCommit) {
                                reject('Erreur lors de la récupération du dernier commit');
                                return false;
                            }

                            //On regarde si on a la propriété "sha" dans l'objet du commit
                            if (!lastCommit.hasOwnProperty("sha")) {
                                reject('Erreur lors de la récupération du sha du dernier commit');
                                return false;
                            }

                            console.log(lastCommit.sha);

                            //On retourne le sha
                            resolve(lastCommit.sha);
                            return true;
                        });
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            }
            catch (e) {
                return reject(e);
            }
        });
    };

    /**
     * Permet de faire la diff entre un commit et le master
     * @returns {Promise<T>}
     */
    getDiff = () => {
        const that = this;
        return new Promise((resolve, reject) => {
            let promises = [];

            //Si on a pas le repo, on l'initialise
            if (!this.repoGitHub) {
                promises.push(this.getRepo());
            }

            Promise.all(promises)
                .then(() => {
                    promises = [];

                    //On récupère le hash du dernier commit
                    this.getLastHashCommit()
                        .then((last_sha_commit) => {
                            //Si on a pas le hash, on stop
                            if (!last_sha_commit) {
                                return reject();
                            }

                            //Si le hash est égal au hash que l'on a en local, on stop car ça veut dire qu'on a pas eu d'update sur github
                            if (last_sha_commit === this.lastHash) {
                                return reject("Sha commit is the same");
                            }

                            this.getRate()
                                .then(() => {
                                    //On récup le ficheir de diff
                                    this.getFileDiff()
                                        .then((file) => {
                                            //On affecte le nouveau (dernier) hash
                                            this.lastHash = last_sha_commit as string;
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                })
                .catch((error) => {
                    return reject(error);
                });

        });
    };

    /**
     * Permet de récupérer le fichier de diff entre un commit et le master
     * @returns {Promise<T>}
     */
    private getFileDiff = () => {
        return new Promise((resolve, reject) => {
            try {
                //On demande à github de faire une comparaison entre le commit que l'on a et la branche master
                this.repoGitHub.compare(this.lastHash, 'dev-front', (error, response) => {
                    if (error || !response) {
                        reject(error);
                        return false;
                    }

                    //On regarde si on a l'url vers le fichier de diff
                    if (!response.diff_url) {
                        reject('Erreur lors de la récupération de l\'url de diff');
                        return false;
                    }
                    console.log(response.diff_url)
                    //On télécharge le fichier de diff
                    console.log(this.http)
                    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});
                    let options = new RequestOptions({ headers: headers });
                    this.http.get(response.diff_url)
                        .toPromise()
                        .then((response) => {
                            console.log('then diff url');
                            console.log(response);
                            resolve(true);
                        })
                        .catch((error) => {
                            console.log('catch diff url');
                            console.log(error);
                            reject('Erreur lors de la récupération du fichier de diff');
                        });
                });
            }
            catch (e) {
                console.log(e);
                reject(e);
                return false;
            }
        });
    };

    parseDiffFileForEswc = (text) => {
        return new Promise((resolve, reject) => {
            console.log("in function")
            var patternDiffConference = /^diff.*conference_test\.ttl\n(^(?!diff).*\n?)*/m

            var res = text.match(patternDiffConference)
            if(res !== null){
                let headers = new Headers({'Content-Type': 'application/json',});
                let options = new RequestOptions({ headers: headers });
                this.http.get("https://raw.githubusercontent.com/sympozer/sympozer-client-seed-v2/dev-front/app/src/app/conference_test.ttl")
                    .toPromise()
                    .then((response) => {
                        console.log('raw');
                        console.log(response);
                        //this.extractContent(response)
                        resolve(true);
                    })
                    .catch((error) => {
                        console.log('err raw');
                        console.log(error);
                        reject('Erreur lors de la récupération du fichier de diff');
                    });
                //return true
                //var diff = patternDiffConference.exec(text)
                var diffMatch = res[0]
                var patternDiffByLine = /^\@\@.*\n(^(?!\@).*\n?)*/gm
                var getDiffByLine = diffMatch.match(patternDiffByLine)
                let storage = this.localStoragexx.retrieve(this.localstorage_jsonld);
                /*if(storage !== null){
                    //console.log(storage)
                    if(getDiffByLine){
                        //console.log(getDiffByLine)
                        var patternAtStartOfLine = /^@.*\n/gm
                        var patternSpaceStartOfLine = /^\ /gm
                        var patternPlusStartOfLine = /^\++.*\n?/gm
                        var patternMinusStartOfLine = /^\-+.*\n?/gm
                        var patternOnlyPlusStartOfLine = /^\++/gm
                        var patternOnlyMinusStartOfLine = /^\-+/gm
                        for(var i = 0; i < getDiffByLine.length; i++){
                            var getWithoutAt = getDiffByLine[i].match(patternAtStartOfLine)
                            if(getWithoutAt){
                                getWithoutAt = getDiffByLine[i].replace(patternAtStartOfLine,"")
                                getWithoutAt = getWithoutAt.replace(patternSpaceStartOfLine,"")
                                var getWithoutAtDuplicate = getWithoutAt

                                var getOldVersion = getWithoutAt.replace(patternPlusStartOfLine,"")
                                getOldVersion = getOldVersion.replace(patternOnlyMinusStartOfLine,"")
                                getOldVersion.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/gm, "\\$&");
                                console.log(getOldVersion)

                                var getNewVersion = getWithoutAtDuplicate.replace(patternMinusStartOfLine,"")
                                getNewVersion = getNewVersion.replace(patternOnlyPlusStartOfLine,"")
                                if(storage.includes(getOldVersion))
                                    console.log("found")
                                else
                                    console.log("not found")
                                console.log(getNewVersion)
                                storage.replace("Talk: Efficient", "Talk: Efficients")
                                console.log("done")
                            }
                        }
                        console.log(storage)
                        console.log("done")
                    }

                }*/
                //let storage = this.localStoragexx.retrieve(this.localstorage_jsonld);
                //console.log(storage)
                resolve(true)
            }
            console.log("returned false")
            reject("returned false");
        });
    };

}
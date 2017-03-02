/**
 * Created by pierremarsot on 27/02/2017.
 */
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
const github = require('octonode');

@Injectable()
export class GithubService {
    private urlRepoGithub = 'octocat/Hello-World';
    private lastHash = '762941318ee16e59dabbacb1b4049eec22f0d303';
    private access_token = 'c9b1dbfd7d09c531cc60f14071ac520c24e9a2d3';
    private clientGitHub = null;
    private repoGitHub = null;

    constructor(private http: Http) {

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
                            if (!lastCommit) {
                                reject('Erreur lors de la récupération du dernier commit');
                                return false;
                            }

                            //On regarde si on a la propriété "sha" dans l'objet du commit
                            if (!lastCommit.hasOwnProperty("sha")) {
                                reject('Erreur lors de la récupération du sha du derneir commit');
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
                                return reject();
                            }

                            this.getRate()
                                .then(() => {
                                    //On récup le ficheir de diff
                                    this.getFileDiff()
                                        .then((file) => {
                                            //On affecte le nouveau (dernier) hash
                                            this.lastHash = last_sha_commit;
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
                this.repoGitHub.compare(this.lastHash, 'master', (error, response) => {
                    if (error || !response) {
                        reject(error);
                        return false;
                    }

                    //On regarde si on a l'url vers le fichier de diff
                    if (!response.diff_url) {
                        reject('Erreur lors de la récupération de l\'url de diff');
                        return false;
                    }

                    //On télécharge le fichier de diff
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
}
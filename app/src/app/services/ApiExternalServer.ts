/**
 * Created by pierremarsot on 27/02/2017.
 */
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpParams, HttpErrorResponse} from '@angular/common/http';
import {RequestManager} from './request-manager.service';
import {Config} from '../app-config';
import {LocalStorageService} from 'ngx-webstorage';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';


@Injectable()
export class ApiExternalServer {
    private subjectLogin = new Subject<any>();
    private subjectAuthorization = new Subject<any>();
    private subjectUsername = new Subject<any>();
    private subjectLastname = new Subject<any>();
    private subjectAvatar = new Subject<any>();
    private subjectTwitter = new Subject<any>();
    private subjectLinkedin = new Subject<any>();
    private subjectHomepage = new Subject<any>();
    private subjectGoogle = new Subject<any>();
    private subjectFacebook = new Subject<any>();

    private key_localstorage_token = 'token_external_ressource_sympozer';
    private key_localstorage_refreshToken = 'refreshtoken_external_ressource_sympozer';
    private key_localstorage_user = 'user_external_ressource_sympozer';
    private key_localstorage_id = 'id_external_ressource_sympozer';
    private key_localstorage_username = 'username_external_ressource_sympozer';
    private key_localstorage_avatar = 'avatar_external_ressource_sympozer';
    private key_localstorage_sessionState = 'sessionstate_external_ressource_sympozer';
    private key_localstorage_election = 'election_external_ressource_sympozer';
    private key_localstorage_ballotsByElection = 'ballotsbyelection_external_ressource_sympozer';


    constructor(private http: HttpClient,
                private managerRequest: RequestManager,
                private localStoragexx: LocalStorageService) {

    }

    checkUserLogin() {
        const token = this.localStoragexx.retrieve(this.key_localstorage_token);
        if (token && token.length > 0) {
            return true;
        }
        return false;
    }



    update(token, firstname, lastname, homepage, twitterpage, facebookpage, googlepage, linkedinaccount, photoUrl) {
        return new Promise((resolve, reject) => {
            const token = this.localStoragexx.retrieve(this.key_localstorage_token);
            if (!token || token.length === 0) {
                return reject('You are not logged in.');
            }

            const that = this;

            const bodyRequest = {
                token: token,
                firstname: firstname,
                lastname: lastname,
                homepage: homepage,
                photoUrl: photoUrl,
                twitterpage: twitterpage,
                facebookpage: facebookpage,
                googlepage: googlepage,
                linkedinaccount: linkedinaccount
            };

            that.managerRequest.post(Config.externalServer.url + '/api/person', bodyRequest)
                .then((request) => {
                    const person = JSON.parse(JSON.stringify(request));
                    /*if (request.status === 403) {
                        return reject('Couldn\'t update.');
                    }
                    if (request.status === 404) {
                        return reject('A network error has occurred. Please try again later.');
                    }
                    */
                    if (person.error) {
                        return reject(person.error);
                    }

                    if (person.firstname && person.firstname.length > 0) {
                        this.sendUsername(person.firstname);
                    }
                    if (person.photoUrl && person.photoUrl.length > 0) {
                        this.sendAvatar(person.photoUrl);
                        that.localStoragexx.store(that.key_localstorage_avatar, person.photoUrl);
                    }
                    that.localStoragexx.store(that.key_localstorage_user, request);
                    return resolve(person);
                })
                .catch((request) => {
                    //console.log('catch');
                    (err : any)=>{
                      if (err.status == 403){
                        return reject('Couldn\'t update.');
                      }
                      if (err.status == 404){
                        return reject('A network error has occurred. Please try again later.');
                      }
                    }
                    return reject(request);
                });
        });
    }

    getUserExternal(hashmail) {
        return new Promise((resolve, reject) => {
            const token = this.localStoragexx.retrieve(this.key_localstorage_token);
            // const user = this.localStoragexx.retrieve(this.key_localstorage_token);

            if (!token || token.length === 0) {
                return reject('You are not logged in.');
            }

            const that = this;

            const bodyRequest = {
                // 'iri': user,
                'mbox_sha1sum': hashmail
            };

            that.managerRequest.get(Config.externalServer.url + '/api/person', bodyRequest)
                .then((request) => {
                    console.log('THEN');
                    console.log(request);

                })
                .catch((request) => {
                    console.log('CATCH');
                    return reject(request);
                });
        });
    }

    updateProfile(firstname, lastname) {
        return new Promise((resolve, reject) => {
            const token = this.localStoragexx.retrieve(this.key_localstorage_token);
            if (!token || token.length === 0) {
                return reject('You are not logged in.');
            }

            const that = this;

            const bodyRequest = {
                token: token,
                firstname: firstname,
                lastname: lastname,
            };

            that.managerRequest.post(Config.serverLogin.url + '/api/v1/user/updateProfile/', bodyRequest)
                .then((request) => {
                    //const person = JSON.parse(request);

                    //if (person.error) {
                    //    return reject(person.error);
                    //}

                    if (bodyRequest.firstname && bodyRequest.firstname.length > 0) {
                        this.sendUsername(bodyRequest.firstname);
                        that.localStoragexx.store(that.key_localstorage_username, bodyRequest.firstname);
                    }

                    if (bodyRequest.lastname && bodyRequest.lastname.length > 0 && bodyRequest.firstname && bodyRequest.firstname.length > 0) {
                        this.sendLastname(bodyRequest.lastname);
                        that.localStoragexx.store(that.key_localstorage_user, bodyRequest);
                    }

                    return resolve(request);
                })
                .catch((request) => {
                  (err : any)=>{
                    if (err.status == 403){
                      return reject('Couldn\'t update.');
                    }
                    if (err.status == 404){
                      return reject('A network error has occurred. Please try again later.');
                    }
                  }
                    return reject(request);
                });
        });
    }

    login = (email, password) => {
        return new Promise((resolve, reject) => {
            if (!email || email.length === 0) {
                return reject('Email not valid');
            }

            if (!password || password.length === 0) {
                return reject('Password not valid');
            }

            const that = this;

            const bodyRequest = {
                'username': email,
                'password': password
            };

            that.managerRequest.post(Config.serverLogin.url + '/login', bodyRequest)
                .then((request) => {
                    console.log('dans req');
                    const resultPromise = JSON.parse(JSON.stringify(request));
                    console.log('user:');
                    const user = resultPromise.user_id;
                    const err = resultPromise.error;
                    console.log(resultPromise);
                    if (!resultPromise || !user) {
                        return reject('Error while retrieving your data. Please try again later.');
                    }
                    if (!user) {
                        return reject('Error while retrieving your data. Please try again later.');
                    }
                    if(!err) {
                        if (user.username && user.username.length > 0) {
                            this.sendUsername(user.username);
                            that.localStoragexx.store(that.key_localstorage_username, user.username);
                        }
                        if (user.linkedin && user.linkedin.length > 0) {
                            this.sendLinkedin(user.linkedin);
                        }
                        if (user.twitter && user.twitter.length > 0) {
                            this.sendTwitter(user.twitter);
                        }
                        if (user.facebook && user.facebook.length > 0) {
                            this.sendFacebook(user.facebook);
                        }
                        if (user.google && user.google.length > 0) {
                            this.sendGoogle(user.google);
                        }
                        if (user.lastname && user.lastname.length > 0) {
                            this.sendLastname(user.lastname);
                        }
                    } else {
                        return reject('Password not valid.');

                    }

                    this.sendLoginStatus(true);
                    that.localStoragexx.store(that.key_localstorage_token, resultPromise.access_token);
                    that.localStoragexx.store(that.key_localstorage_refreshToken, resultPromise.refresh_token);
                    that.localStoragexx.store(that.key_localstorage_user, user);
                    that.localStoragexx.store(that.key_localstorage_sessionState, resultPromise.session_state);
                    
                    resolve(user);
                })
                .catch((request) => {
                    console.log('exception');
                    reject(request);
                });
        });
    }

    signup = (email, firstname, lastname, password) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                email: email,
                firstname: firstname,
                lastname: lastname,
                password: password,
                confirmPassword: password
            };

            that.managerRequest.post(Config.serverLogin.url + '/api/v1/register', bodyRequest)
                .then((response) => {
                    
                    console.log('a ', response);
                    resolve(JSON.parse(JSON.stringify(response)).message);
                
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    createPassword = (email, unique_token, password) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                'email': email,
                'unique_token': unique_token,
                'password': password
            };

            that.managerRequest.post(Config.serverLogin.url + '/createPassword', bodyRequest)
                .then((response) => {
                  
                    console.log('a ', response);
                    resolve(JSON.parse(JSON.stringify(response)).message);                

                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    signupWithBadge = (email, emailUsed, firstname, lastname, password) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                email: email,
                emailUsed: emailUsed,
                firstname: firstname,
                lastname: lastname,
                password: password,
                confirmPassword: password
            };

            that.managerRequest.post(Config.serverLogin.url + '/api/v1/registerFromBadge', bodyRequest)
                .then((request) => {
                    const resultPromise = JSON.parse(JSON.stringify(request));
                    
                      if (!resultPromise){
                        return reject(resultPromise.message);
                      }
                    
                    return resolve(true);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    forgotPassword = (email) => {
        return new Promise((resolve, reject) => {
            if (!email || email.length === 0) {
                return reject('Invalid email address.');
            }

            const that = this;
            const bodyRequest = {
                email: email,
            };

            that.managerRequest.post(Config.serverLogin.url + '/api/v1/forgotpassword', bodyRequest)
                .then((request) => {
                    const resultPromise = JSON.parse(JSON.stringify(request));
                    
                      if (!resultPromise) {
                          return reject(resultPromise.message);
                      }
                    
                    return resolve(true);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    changePassword = (currentPassword, newPassword, confirmPassWord) => {
        return new Promise((resolve, reject) => {

            const id = this.localStoragexx.retrieve(this.key_localstorage_id);

            const token = this.localStoragexx.retrieve(this.key_localstorage_token);
            if (!token || token.length === 0) {
                return reject('You are not logged in.');
            }

            if (!currentPassword || currentPassword.length === 0 || !newPassword || newPassword.length === 0 || !confirmPassWord || confirmPassWord.length === 0) {
                return reject('Invalid password.');
            }

            if (newPassword !== confirmPassWord) {
                return reject('The new and confirm password must be the same.');
            }

            const that = this;

            const bodyRequest = {
                id: id,
                currentPassword: currentPassword,
                newPassword: newPassword
            };

            that.managerRequest.post(Config.serverLogin.url + '/api/v1/user/updatePassword/', bodyRequest)
                .then((request) => {
                    const resultPromise = JSON.parse(JSON.stringify(request));
                    
                      if (!resultPromise) {
                          return reject(resultPromise.message);
                      }
                    
                    return resolve(true);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    logout = (access_token, refresh_token) => {        
        
        // this.localStoragexx.clear(this.key_localstorage_avatar);

        return new Promise((resolve, reject) => { 
          
            const that = this;
            const bodyRequest = {
                'access_token': access_token,
                'refresh_token': refresh_token
            };
           
            console.log('avant req');

            that.managerRequest.post(Config.serverLogin.url + '/logout', bodyRequest)
                .then((request) => {
                    console.log('dans req logout');
                    this.localStoragexx.clear(this.key_localstorage_token);
                    //this.localStoragexx.clear(this.key_localstorage_refreshToken);
                    this.localStoragexx.clear(this.key_localstorage_username);
                    this.localStoragexx.clear(this.key_localstorage_user);
                    this.localStoragexx.clear(this.key_localstorage_id);
                    resolve(request);
                })
                .catch((request) => {
                    console.log('exception:' + request);
                    reject(request);
                });
        });
    }

    refresh = (refresh_token) => {        
        
            return new Promise((resolve, reject) => {
                const token = this.localStoragexx.retrieve(this.key_localstorage_token);
                console.log("token = " + token);
                if (!token || token.length === 0 || token == "null") {
                    return reject('You are not logged in.');
                } else {
                    const that = this;
                    const bodyRequest = {
                        'refresh_token': refresh_token
                    };
                    console.log('avant req refresh');

                    that.managerRequest.post(Config.serverLogin.url + '/refresh', bodyRequest)
                        .then((request) => {
                            console.log('dans req');
                            const resultPromise = JSON.parse(JSON.stringify(request));
                            console.log(resultPromise);
                            that.localStoragexx.store(that.key_localstorage_refreshToken, resultPromise.refresh_token);
                            that.localStoragexx.store(that.key_localstorage_token, resultPromise.access_token);
                            
                            setTimeout(() => {
                                this.refresh(this.getRefreshToken());
                                console.log('timeout success in refresh!!');
                            }, 1800000);
                        
                        })
                        .catch((request) => {
                            console.log('exception');
                            reject(request);
                        });
                }
            });
       
    }


    getToken() {
        return this.localStoragexx.retrieve(this.key_localstorage_token);
    }

    getRefreshToken() {
        return this.localStoragexx.retrieve(this.key_localstorage_refreshToken);
    }


    authGoogleService() {
        return new Promise((resolve, reject) => {

            const that = this;

            that.managerRequest.get(Config.serverLogin.url + '/api/v1/auth/google')
                .then((request) => {
                    console.log('REQUEST!!!!!!!!!!!');
                    console.log(request);
                    return resolve(request);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    authLinkedinService() {
        return new Promise((resolve, reject) => {

            const that = this;

            that.managerRequest.get(Config.serverLogin.url + '/api/v1/auth/linkedin')
                .then((request) => {
                    console.log('REQUEST!!!!!!!!!!!');
                    console.log(request);
                    return resolve(request);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    authTwitterService() {
        return new Promise((resolve, reject) => {

            const that = this;

            that.managerRequest.get(Config.serverLogin.url + '/api/v1/auth/twitter')
                .then((request) => {
                    console.log('REQUEST!!!!!!!!!!!');
                    console.log(request);
                    return resolve(request);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    authFacebookService() {
        return new Promise((resolve, reject) => {

            const that = this;

            that.managerRequest.get(Config.serverLogin.url + '/api/v1/auth/facebook')
                .then((request) => {
                    console.log('REQUEST!!!!!!!!!!!');
                    console.log(request);
                    return resolve(request);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    /**
     * Send to all subscribers Login Login status
     * @param message
     */
    sendLoginStatus(status: boolean) {
        this.subjectLogin.next(status);
    }

    /**
     * Send boolean status to all subscribers
     * @param status
     */
    sendLoginStatus2(status: boolean): void {
        this.sendLoginStatus(status);
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
        return this.subjectLogin.asObservable();
    }

    /**
     * Send to all subscribers Authorization status
     * @param message
     */
    sendAuthorizationVoteStatus(status: boolean) {
        this.subjectAuthorization.next(status);
    }

    /**
     * Clear the Authorization status
     */
    clearAuthorizationVoteStatus() {
        this.subjectAuthorization.next();
    }

    /**
     * Retrieve the Login status
     * @returns {Observable<any>}
     */
    getAuthorizationVoteStatus(): Observable<any> {
        return this.subjectAuthorization.asObservable();
    }


    /**
     * Send to all subscribers Username status
     * @param message
     */
    sendUsername(firstname: string) {
        this.subjectUsername.next(firstname);
    }

    /**
     * Clear the Username status
     */
    clearUsername() {
        this.subjectUsername.next('User');
    }

    /**
     * Retrieve the Username status
     * @returns {Observable<any>}
     */
    getUsername(): Observable<any> {
        return this.subjectUsername.asObservable();
    }


    /**
     * Send to all subscribers Avatar status
     * @param message
     */
    sendAvatar(avatar: string) {
        this.subjectAvatar.next(avatar);
    }

    /**
     * Clear the Avatar status
     */
    clearAvatar() {
        this.subjectAvatar.next();
    }

    /**
     * Retrieve the Avatar status
     * @returns {Observable<any>}
     */
    getAvatar(): Observable<any> {
        return this.subjectAvatar.asObservable();
    }

    /**
     * Send to all subscribers Twitter status
     * @param message
     */
    sendTwitter(Twitter: string) {
        this.subjectTwitter.next(Twitter);
    }

    /**
     * Clear the Twitter status
     */
    clearTwitter() {
        this.subjectTwitter.next();
    }

    /**
     * Retrieve the Twitter status
     * @returns {Observable<any>}
     */
    getTwitter(): Observable<any> {
        return this.subjectTwitter.asObservable();
    }

    /**
     * Send to all subscribers Linkedin status
     * @param message
     */
    sendLinkedin(Linkedin: string) {
        this.subjectLinkedin.next(Linkedin);
    }

    /**
     * Clear the Linkedin status
     */
    clearLinkedin() {
        this.subjectLinkedin.next();
    }

    /**
     * Retrieve the Linkedin status
     * @returns {Observable<any>}
     */
    getLinkedin(): Observable<any> {
        return this.subjectLinkedin.asObservable();
    }

    /**
     * Send to all subscribers Homepage status
     * @param message
     */
    sendHomepage(Homepage: string) {
        this.subjectHomepage.next(Homepage);
    }

    /**
     * Clear the Homepage status
     */
    clearHomepage() {
        this.subjectHomepage.next();
    }

    /**
     * Retrieve the Homepage status
     * @returns {Observable<any>}
     */
    getHomepage(): Observable<any> {
        return this.subjectHomepage.asObservable();
    }

    /**
     * Send to all subscribers Lastname status
     * @param message
     */
    sendLastname(Lastname: string) {
        this.subjectLastname.next(Lastname);
    }

    /**
     * Clear the Lastname status
     */
    clearLastname() {
        this.subjectLastname.next();
    }

    /**
     * Retrieve the Lastname status
     * @returns {Observable<any>}
     */
    getLastname(): Observable<any> {
        return this.subjectLastname.asObservable();
    }

    /**
     * Send to all subscribers Google status
     * @param message
     */
    sendGoogle(google: string) {
        this.subjectGoogle.next(google);
    }

    /**
     * Clear the Google status
     */
    clearGoogle() {
        this.subjectGoogle.next();
    }

    /**
     * Retrieve the Google status
     * @returns {Observable<any>}
     */
    getGoogle(): Observable<any> {
        return this.subjectGoogle.asObservable();
    }

    /**
     * Send to all subscribers Google status
     * @param message
     */
    sendFacebook(facebook: string) {
        this.subjectFacebook.next(facebook);
    }

    /**
     * Clear the Google status
     */
    clearFacebook() {
        this.subjectFacebook.next();
    }

    /**
     * Retrieve the Google status
     * @returns {Observable<any>}
     */
    getFacebook(): Observable<any> {
        return this.subjectFacebook.asObservable();
    }

    createElection = (idUser, sessionState, name, description, idResource, dateBegin, dateEnd, listCandidates) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                idUser: idUser,
                token: sessionState,
                name: name,
                description: description,
                idResource: idResource,
                dateBegin: dateBegin,
                dateEnd: dateEnd,
                listCandidates: listCandidates
            };

            that.managerRequest.post(Config.vote.url + '/createElection', bodyRequest)
                .then((response) => {
                   
                    resolve(JSON.parse(JSON.stringify(response)).message);
                       
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    showElectionById = (idElection) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                id: idElection                
            };

            that.managerRequest.post(Config.vote.url + '/showElectionById', bodyRequest)
                .then((response) => {
                    const resultPromise = JSON.parse(JSON.stringify(response));
                    const election = resultPromise;
                    console.log("avant err ");
                     
                        if (election) {
                            resolve(JSON.parse(JSON.stringify(response)).message);
                            console.log("elec api " +JSON.stringify(election));
                            that.localStoragexx.store(that.key_localstorage_election, election);
                        } else {
                            reject(JSON.parse(response['_body']).message);
                        }
                    
                })
                .catch((request) => {
                    return reject(request);
                });
        });        
    }

    createVote = (idElection, idVoter, sessionState, idCandidate) => {
        return new Promise((resolve, reject) => {

            const that = this;

            const bodyRequest = {
                idElection: idElection,
                idVoter: idVoter,
                token: sessionState,
                idCandidate: idCandidate         
            };

            that.managerRequest.post(Config.vote.url + '/createVote', bodyRequest)
                .then((response) => {
                    
                    console.log('createVote ', response);
                    resolve(JSON.parse(JSON.stringify(response)).message);
                     
                    
                })
                .catch((request) => {
                    return reject(request);
                });
        });        
    }

    showBallotsByElection = (idElection, idUser,sessionState) => {
        return new Promise((resolve, reject) => {
            const that = this;

            const bodyRequest = {
                idElection: idElection,
                idUser: idUser,
                token: sessionState                
            };

            that.managerRequest.post(Config.vote.url + '/showBallotsByElection', bodyRequest)
                .then((response) => {
                    const resultPromise = JSON.parse(JSON.stringify(response));
                    const ballots = resultPromise;

                   
                        if (ballots) {
                            resolve(JSON.parse(JSON.stringify(response)).message);
                            that.localStoragexx.store(that.key_localstorage_ballotsByElection, ballots);
                        } else {
                            reject(JSON.parse(response['_body']).message);
                        }
                    
                })
                .catch((request) => {
                    return reject(request);
                });
        });        


    }

    
}

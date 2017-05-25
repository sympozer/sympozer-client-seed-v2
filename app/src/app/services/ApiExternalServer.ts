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
    private subjectAuthorization = new Subject<any>();
    private subjectUsername = new Subject<any>();
    private subjectLastname = new Subject<any>();
    private subjectAvatar = new Subject<any>();
    private subjectTwitter = new Subject<any>();
    private subjectLinkedin = new Subject<any>();
    private subjectHomepage = new Subject<any>();

    private key_localstorage_token = "token_external_ressource_sympozer";
    private key_localstorage_user = "user_external_ressource_sympozer"
    private key_localstorage_username = "username_external_ressource_sympozer";
    private key_localstorage_avatar = "avatar_external_ressource_sympozer";

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

    update(user){
        return new Promise((resolve, reject) => {
            let token = this.localStoragexx.retrieve(this.key_localstorage_token)
            if (!token || token.length === 0) {
                return reject('You are not logged in.');
            }

            const that = this;

            let bodyRequest = {
                token :  token,
                homepage: user.homepage,
                photoUrl : user.photoUrl,
                twitterpage: user.twitterpage,
                linkedinaccount: user.linkedinaccount
            }

            that.managerRequest.post_safe(Config.externalServer.url + '/api/ressource/person', bodyRequest)
                .then((request) => {
                    const user = JSON.parse(request._body);
                    if(request.status === 403){
                        return reject("Couldn\'t update.");
                    }
                    if(request.status === 404){
                        return reject("A network error has occured. Please try again later.");
                    }

                    if(user.error){
                        return reject(user.error);
                    }

                    if(user.firstname && user.firstname.length > 0){
                        this.sendUsername(user.firstname)
                    }
                    if(user.photoUrl && user.photoUrl.length > 0){
                        this.sendAvatar(user.photoUrl)
                        that.localStoragexx.store(that.key_localstorage_avatar, user.photoUrl);
                    }
                    that.localStoragexx.store(that.key_localstorage_user, request._body);
                    return resolve(user);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
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

            let bodyRequest = {
                email : email,
                password: password 
            };
            that.managerRequest.post_safe(Config.externalServer.url + '/api/login', bodyRequest)
                .then((request) => {
                    const user = JSON.parse(request._body);
                    if(request.status === 403){
                        return reject("Invalid username or password")
                    }
                    if(request.status === 404){
                        return reject("A network error has occured. Please try again later.");
                    }
                    if (!user || !user.token) {
                        return reject('Error while retrieving your data. Please try again later.');
                    }
                    if(user.firstname && user.firstname.length > 0){
                        this.sendUsername(user.firstname)
                        that.localStoragexx.store(that.key_localstorage_username, user.firstname);
                    }
                    if(user.photoUrl && user.photoUrl.length > 0){
                        this.sendAvatar(user.photoUrl)
                        that.localStoragexx.store(that.key_localstorage_avatar, user.photoUrl);
                    }
                    if(user.linkedinaccount && user.linkedinaccount.length > 0){
                        this.sendLinkedin(user.linkedinaccount)
                    }
                    if(user.twitterpage && user.twitterpage.length > 0){
                        this.sendTwitter(user.twitterpage)
                    }
                    if(user.homepage && user.homepage.length > 0){
                        this.sendHomepage(user.homepage)
                    }

                    if(user.lastname && user.lastname.length > 0){
                        this.sendLastname(user.lastname)
                    }
                    that.localStoragexx.store(that.key_localstorage_token, user.token);
                    that.localStoragexx.store(that.key_localstorage_user, request._body);
                    return resolve(user);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    };

    loginWithToken = (token) => {
        return new Promise((resolve, reject) => {
            if (!token || token.length === 0) {
                return reject('An error occured. Please re-login.');
            }
            const that = this;
            
            that.managerRequest.get_safe(Config.externalServer.url + '/api/user?token='+token)
                .then((request) => {
                    const user = JSON.parse(request._body);
                    if(request.status === 403){
                        return reject("Invalid username or password")
                    }
                    if(request.status === 404){
                        return reject("A network error has occured. Please try again later.");
                    }
                    if(user.firstname && user.firstname.length > 0){
                        this.sendUsername(user.firstname)
                        that.localStoragexx.store(that.key_localstorage_username, user.firstname);
                    }
                    if(user.photoUrl && user.photoUrl.length > 0){
                        this.sendAvatar(user.photoUrl)
                        that.localStoragexx.store(that.key_localstorage_avatar, user.photoUrl);
                    }

                    if(user.linkedinaccount && user.linkedinaccount.length > 0){
                        this.sendLinkedin(user.linkedinaccount)
                    }

                    if(user.twitterpage && user.twitterpage.length > 0){
                        this.sendTwitter(user.twitterpage)
                    }
                    if(user.homepage && user.homepage.length > 0){
                        this.sendHomepage(user.homepage)
                    }

                    if(user.lastname && user.lastname.length > 0){
                        this.sendLastname(user.lastname)
                    }
                    this.sendLoginStatus(true)
                    that.localStoragexx.store(that.key_localstorage_user, request._body);
                    return resolve(user);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    };

    signup(email, password, confirmPassWord){
        return new Promise((resolve, reject) => {
            if (!email || email.length === 0) {
                return reject('Invalid email address.');
            }

            if (!password || password.length === 0) {
                return reject('Invalid password');
            }

            if (!confirmPassWord || confirmPassWord.length === 0) {
                return reject('Invalid password');
            }

            if(password !== confirmPassWord){
                return reject('Passwords don\'t match.');
            }

            const that = this;

            let bodyRequest = {
                email: email,
                password: password,
                confirmPassword: password
            }

            that.managerRequest.post_safe(Config.externalServer.url + '/api/register',bodyRequest)
                .then((request) => {
                    const user = JSON.parse(request._body);
                    if(request.status === 403){
                        return reject("Invalid email or password.")
                    }
                    if(request.status === 404){
                        return reject("A network error has occured. Please try again later.");
                    }

                    return resolve(true);
                })
                .catch((request) => {
                    return reject(request);
                });
        });
    }

    logoutUser(){
        this.localStoragexx.clear(this.key_localstorage_token)
        this.localStoragexx.clear(this.key_localstorage_username)
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
     * Send boolean status to all subscribers
     * @param status
     */
    sendLoginStatus2(status: boolean): void {
        this.sendLoginStatus(status)
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
        console.log("requesting status..")
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
        this.subjectUsername.next("User");
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


}
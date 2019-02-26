import {Component, Input} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {Subscription} from 'rxjs/Subscription';
import {MdSnackBar} from '@angular/material';
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'header-app',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    logSubscription: Subscription;
    userSubscription: Subscription;
    avatarSubscription: Subscription;
    @Input() sidenav;
    hasLogged: any;
    public username: any;
    public avatar: any;
    private key_localstorage_username = 'username_external_ressource_sympozer';
    private key_localstorage_avatar = 'avatar_external_ressource_sympozer';

    constructor(private apiExternalServer: ApiExternalServer,
                private localStoragexx: LocalStorageService,
                public snackBar: MdSnackBar) {

        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            this.hasLogged = status;
        });

        this.userSubscription = this.apiExternalServer.getUsername().subscribe(firstname => {
            this.username = firstname;
        });

        this.avatarSubscription = this.apiExternalServer.getAvatar().subscribe(avatar => {
            this.avatar = avatar;
        });
    }

    ngOnInit(): void {
        this.hasLogged = this.apiExternalServer.checkUserLogin();
        if (this.username == undefined || this.username === '') {
            this.apiExternalServer.sendUsername(this.localStoragexx.retrieve(this.key_localstorage_username))
            if (this.username == undefined || this.username === '') {
                this.username = 'User';
            }
        }
        if (this.avatar == undefined || this.avatar === '') {
            this.apiExternalServer.sendAvatar(this.localStoragexx.retrieve(this.key_localstorage_avatar))
        }
    }

    logout = () => {
        this.apiExternalServer.logoutUser(this.apiExternalServer.getRefreshToken());
        this.apiExternalServer.sendLoginStatus(false);
        this.apiExternalServer.sendUsername('User');
        this.apiExternalServer.sendAvatar(null);
        this.snackBar.open('Logout successful', '', {
            duration: 5000,
        });
    }


}

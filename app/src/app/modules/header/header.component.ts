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
    }

    ngOnInit(): void {
        
        //console.log(this.avatar)
    }

    logout = () => {
        
    }


}

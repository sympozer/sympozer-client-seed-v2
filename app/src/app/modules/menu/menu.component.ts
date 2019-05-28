import {Component, OnInit} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import { Subscription } from 'rxjs/Subscription';
import {LocalStorageService} from 'ng2-webstorage';



@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
    logSubscription: Subscription;
    hasLogged: any;
    private key_localstorage_user = 'user_external_ressource_sympozer';
	
    constructor(private apiExternalServer: ApiExternalServer, private localStoragexx: LocalStorageService) {
        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            this.hasLogged = status;
        });
        const user = this.localStoragexx.retrieve(this.key_localstorage_user);
        if (user !== null) {
            this.hasLogged = true;
        }
    	
    }

    ngOnInit(): void {
    	
    }


}

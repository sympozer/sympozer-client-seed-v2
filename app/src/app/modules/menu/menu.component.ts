import {Component, OnInit} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
    logSubscription: Subscription;
    hasLogged: any;
	
    constructor(private apiExternalServer: ApiExternalServer) {
        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            this.hasLogged = status;
        });
    	
    }

    ngOnInit(): void {
    	
    }


}

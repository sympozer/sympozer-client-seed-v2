import {Component, OnInit} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {ApiExternalServer} from '../../services/ApiExternalServer';


@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
	logSubscription: Subscription;
	hasLogged: any
    constructor(private apiExternalServer: ApiExternalServer) {
    	this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
            this.hasLogged = status; 
        });
    }

    ngOnInit(): void {
    	console.log(this.hasLogged)
    }


}

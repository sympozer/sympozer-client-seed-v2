import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import { Router, NavigationEnd } from '@angular/router';
import {routerTransition} from './app.router.animation';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(private DaoService:LocalDAOService, private router: Router) {
    }


    ngOnInit():void {
        this.DaoService.initialize();
        let persons = this.DaoService.query("getAllPersons", null);

        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }

}

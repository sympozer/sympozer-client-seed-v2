import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {routerTransition} from './app.router.animation';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    constructor(private DaoService: LocalDAOService,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }


    ngOnInit(): void {
        this.DaoService.loadDataset();

        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
                window.scrollTo(0, 0);
            });
    }

}

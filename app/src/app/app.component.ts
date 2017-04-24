import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {routerTransition} from './app.router.animation';
import {LocalStorageService} from 'ng2-webstorage';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    constructor(private DaoService: LocalDAOService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private localStoragexx: LocalStorageService) {
    }


    ngOnInit(): void {
        let storage = this.localStoragexx.retrieve("zoomLevel");
        if (storage) {
            document.documentElement.style.fontSize = storage + "%";
        } else {
            let fontSize: number = 100;
            this.localStoragexx.store("zoomLevel", fontSize);
        }

        this.localStoragexx.store("fullScreen", false);

        storage = this.localStoragexx.retrieve("darkTheme");
        if (storage) {
            let html = document.documentElement;
            if (!html.classList.contains("dark")) {
                html.classList.add('dark');
            }
        }

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
                window.scrollTo(0, 1);
            });
    }

}

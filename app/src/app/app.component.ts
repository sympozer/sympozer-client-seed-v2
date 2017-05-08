import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {routerTransition} from './app.router.animation';
import {LocalStorageService} from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';
import {ToolsService} from './services/tools.service';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public backHistory;
    public iOS;
    public fullscreen: any;
    subscription: Subscription;
    constructor(private DaoService: LocalDAOService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private localStoragexx: LocalStorageService,
                private toolService: ToolsService) {

        this.subscription = this.toolService.getFullScreenStatus().subscribe(status => { 
            this.fullscreen = status; 
        });
    }


    ngOnInit(): void {
        let storage = this.localStoragexx.retrieve("zoomLevel");
        if (storage) {
            document.documentElement.style.fontSize = storage + "%";
        } else {
            let fontSize: number = 100;
            this.localStoragexx.store("zoomLevel", fontSize);
        }

        storage = this.localStoragexx.retrieve("socialShare");
        if (storage != null && storage == false) {
            if (document.getElementById("share"))
                document.getElementById("share").style.display = "none";
        } else {
            this.localStoragexx.store("socialShare", true);
        }

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
        this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if(window.history.length > 1)
            this.backHistory = true
        this.fullscreen = this.localStoragexx.retrieve("fullscreen")
    }

    goBack = () =>{
        window.history.back()
    }

    


}

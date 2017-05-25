import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {Component, OnInit, HostListener} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {routerTransition} from './app.router.animation';
import {LocalStorageService} from 'ng2-webstorage';
import {ApiExternalServer} from './services/ApiExternalServer';

import { Angulartics2Piwik } from 'angulartics2';
import {Subscription} from 'rxjs/Subscription';
import {ToolsService} from './services/tools.service';
import {VoteService} from './services/vote.service'
import {MdSnackBar} from "@angular/material";
const screenfull = require('screenfull');


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
    private key_localstorage_token = "token_external_ressource_sympozer";

    constructor(private DaoService: LocalDAOService,
                private apiExternalServer: ApiExternalServer,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private localStoragexx: LocalStorageService,
                private angulartics2Piwik: Angulartics2Piwik,
                private toolService: ToolsService,
                private voteService: VoteService,
                public snackBar: MdSnackBar) {

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

        storage = this.localStoragexx.retrieve("material");
        if (storage != null && storage == false) {
            let html = document.documentElement;
            if (!html.classList.contains("no-material")) {
                html.classList.add('no-material');
            }
        } else {
            this.localStoragexx.store("material", true);
        }

        storage = this.localStoragexx.retrieve("darkTheme");
        if (storage) {
            let html = document.documentElement;
            if (!html.classList.contains("dark")) {
                html.classList.add('dark');
            }
        }

        this.DaoService.loadDataset()
            .then(()=>{

            })
            .catch((err)=>{
                this.snackBar.open("A network error occured. Please try again later.", "", {
                    duration: 2000,
                });
            });

        let token = this.localStoragexx.retrieve(this.key_localstorage_token)
        if(token && token.length > 0)
            this.apiExternalServer.loginWithToken(token)
        else
            this.apiExternalServer.sendLoginStatus(false)
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
        this.fullscreen = screenfull.isFullscreen;

        setInterval(() => {
            if(this.localStoragexx.retrieve("token_external_ressource_sympozer"))
              this.voteService.votedPublications()
        }, 300000)
    }

    goBack(){
        window.history.back()
    }

    @HostListener("document:webkitfullscreenchange") updateFullScreen() {
        this.fullscreen = screenfull.isFullscreen;
    }

    @HostListener("document:mozfullscreenchange") updateFullScreenMoz() {
        this.fullscreen = screenfull.isFullscreen;
    }

    @HostListener("document:msfullscreenchange") updateFullScreenIE() {
        this.fullscreen = screenfull.isFullscreen;
    }

    @HostListener("document:webkitfullscreenchange") updateFullScreenOther() {
        this.fullscreen = screenfull.isFullscreen;
    }


}

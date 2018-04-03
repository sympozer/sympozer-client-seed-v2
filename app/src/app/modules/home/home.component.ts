import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';
import {window} from "rxjs/operator/window";
import {WindowReference} from '../../window-reference';
import {LocalStorageService} from 'ng2-webstorage';
import '../../../assets/twitter.js';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class HomeComponent implements OnInit {
    title: string = "The Web Conference 2018";

    constructor(private router: Router,
                private localdao: LocalDAOService,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
                document.getElementById("page-title-p").innerHTML = this.title;
        let storage = this.localStoragexx.retrieve("darkTheme");
        let twiiterTag = document.getElementById("twitter");
        if (storage) {
            if (twiiterTag.getAttribute("data-theme") != "dark")
                twiiterTag.setAttribute("data-theme", "dark");
        } else {
            twiiterTag.setAttribute("data-theme", "light");
        }

        let win = WindowReference.get();
        win.twttr.widgets.load();


        if (document.getElementById("page-title-p")) {
            document.getElementById("page-title-p").innerHTML = "";

        }
    }

}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';
import {window} from "rxjs/operator/window";
import {WindowReference} from '../../window-reference';
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class HomeComponent implements OnInit {

    constructor(private router: Router,
                private localdao: LocalDAOService,
                private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        let storage = this.localStoragexx.retrieve("darkTheme");
        let twiiterTag = document.getElementById("twitter");
        if (storage) {
            if (twiiterTag.getAttribute("data-theme") != "dark")
                twiiterTag.setAttribute("data-theme", "dark");
        } else {
            twiiterTag.setAttribute("data-theme", "light");
        }

        let win = WindowReference.get();
        setTimeout(() => {
            win.twttr.widgets.load();
        }, 0);


        if (document.getElementById("page-title-p")) {
            document.getElementById("page-title-p").innerHTML = "";

        }
    }

}

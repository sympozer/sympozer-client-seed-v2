import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';
import {window} from "rxjs/operator/window";
import {WindowReference} from '../../window-reference';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class HomeComponent implements OnInit {

    constructor(private router: Router, private localdao: LocalDAOService) {
    }

    ngOnInit() {
        let win = WindowReference.get();

        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = "";

        //
        // let twttr = (function (d, s, id) {
        //     var js, fjs = d.getElementsByTagName(s)[0],
        //         t = twttr || {};
        //     if (d.getElementById(id)) return t;
        //     js = d.createElement(s);
        //     js.id = id;
        //     js.src = "https://platform.twitter.com/widgets.js";
        //     fjs.parentNode.insertBefore(js, fjs);
        //
        //     t._e = [];
        //     t.ready = function (f) {
        //         t._e.push(f);
        //     };
        //
        //     return t;
        // }(document, "script", "twitter-wjs"));

        win.twttr.widgets.load();
    }

}

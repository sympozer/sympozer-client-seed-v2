import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';
import {window} from "rxjs/operator/window";

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
         if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = "";
    }
}

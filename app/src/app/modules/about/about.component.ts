import {Component, OnInit} from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'about',
    templateUrl: 'about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class AboutComponent implements OnInit {

    title: string = "About";

    constructor(private router: Router) {
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
    }
}

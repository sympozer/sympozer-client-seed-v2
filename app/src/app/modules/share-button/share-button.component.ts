import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routerTransition } from '../../app.router.animation';


@Component({
    selector: 'share',
    templateUrl: 'share-button.component.html',
    styleUrls: ['./share-button.component.scss'],
    animations: [routerTransition()],
    host: { '[@routerTransition]': '' }
})

export class Share {
    url: string;
    urlShare: string;


    private key_localstorage_user = 'user_external_ressource_sympozer';

    constructor(private router: Router,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
    }

    setRoute() {
        this.url = window.location.href;

    }
}

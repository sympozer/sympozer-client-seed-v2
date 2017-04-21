import {Component} from '@angular/core';
import {ActivatedRoute, Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'share',
    templateUrl: 'share-button.component.html',
    styleUrls: ['./share-button.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class Share {
    url: string;

    constructor(private router: Router,
                private route: ActivatedRoute) {
    }

    setRoute() {
        this.url = window.location.href;
    }
}

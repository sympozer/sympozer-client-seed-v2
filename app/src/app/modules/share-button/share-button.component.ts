import {Component} from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'share',
    templateUrl: 'share-button.component.html',
    styleUrls: ['./share-button.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class Share {

    constructor(private router: Router) {
    }
}

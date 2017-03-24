import {Component} from '@angular/core';
import {Router}            from '@angular/router';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'about',
    templateUrl: 'about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class AboutComponent {

    constructor(private router: Router) {
    }
}

import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class HomeComponent {

    constructor(private router: Router) {
    }
}

import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';
import {Ng2TweetComponent} from 'ng2-tweet';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class HomeComponent {

    constructor(private router: Router, private localdao: LocalDAOService) {
    }

    loadDataset() {
        console.log('load dataset');
        this.localdao.loadDataset();
    }

    resetDataset(){
        this.localdao.resetDataset();
    }
}

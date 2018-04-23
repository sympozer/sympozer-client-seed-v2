import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {routerTransition} from '../../app.router.animation';
import {Config} from '../../app-config';

@Component({
    selector: 'share',
    templateUrl: 'share-button.component.html',
    styleUrls: ['./share-button.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ShareComponent {
    url: string;
    hashTags: string = Config.conference.hashtag;
    constructor(private router: Router,
                private route: ActivatedRoute) {
    }

    setRoute() {
        this.url = window.location.href;
    }
}

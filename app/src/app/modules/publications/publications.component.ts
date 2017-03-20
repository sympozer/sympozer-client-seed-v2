import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-publications',
    templateUrl: 'publications.component.html',
    styleUrls: ['publications.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsComponent implements OnInit {
    publications;
    constructor(private router:Router,
                private DaoService : LocalDAOService) {
    }

    ngOnInit() {
        this.publications = this.DaoService.query("getAllPublications", null);
        console.log(this.publications);
    }

}

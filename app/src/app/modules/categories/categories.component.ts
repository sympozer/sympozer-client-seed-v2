import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-categories',
    templateUrl: 'categories.component.html',
    styleUrls: ['categories.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class CategoriesComponent implements OnInit {
    categories;
    constructor(private router:Router,
                private DaoService : LocalDAOService) {
    }

    ngOnInit() {
        this.categories = this.DaoService.query("getAllCategories", null);
        console.log(this.categories);
    }

}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
@Component({
    selector: 'app-categories',
    templateUrl: 'categories.component.html',
    styleUrls: ['categories.component.css'],
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

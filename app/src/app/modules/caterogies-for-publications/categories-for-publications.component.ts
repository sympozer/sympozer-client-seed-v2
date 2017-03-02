import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';

@Component({
    selector: 'categories-for-publications',
    templateUrl: './categories-for-publications.component.html',
    styleUrls: ['./categories-for-publications.component.css']
})
export class CategoriesForPublicationsComponent implements OnInit {
    private categories = {};
    constructor(
        private DaoService : LocalDAOService) { }

    ngOnInit() {
        let allCat = this.DaoService.query("getAllCategoriesForPublications", null);
        for(let i in allCat){
            if(allCat[i] != null){
                let query = { 'key' : i };
                this.categories[i] = this.DaoService.query("getCategoryLink",query);
            }
        }
        console.log(this.categories);
    }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';

@Component({
    selector: 'categories-for-publications',
    templateUrl: './categories-for-publications.component.html',
    styleUrls: ['./categories-for-publications.component.css']
})
export class CategoriesForPublicationsComponent implements OnInit {
    constructor() { }

    ngOnInit() {
    }

}

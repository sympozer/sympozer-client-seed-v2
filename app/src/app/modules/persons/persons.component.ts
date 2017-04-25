import {Component, OnInit, ViewChild} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from  '../../localdao.service';
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Person} from "../../model/person";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-person',
    templateUrl: 'persons.component.html',
    styleUrls: ['persons.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonsComponent implements OnInit {
    @ViewChild('itemListViewWrapper') itemListViewWrapper;
    conference: Conference = new Conference();
    persons: Object;
    tabPersons: Array<Object> = new Array();
    sum: number = 20;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {
    }

    ngOnInit() {
        this.persons = this.DaoService.query("getAllPersons", null);
        this.addItems(0, this.sum);
        console.log(this.tabPersons);

    }

    addItems(startIndex, endIndex) {
        let keyTab = Object.keys(this.persons).sort();
        if (endIndex > keyTab.length)
            endIndex = keyTab.length; //Si on est à la dernière insertion
        for (let i = startIndex; i < endIndex; ++i) {
            this.tabPersons.push(this.persons[keyTab[i]]);
        }
    }

    onScroll() {
        if (this.isScrolledIntoView()) {
            const start = this.sum;
            this.sum += 20;
            this.addItems(start, this.sum);
        }
    }

    isScrolledIntoView() {
        let elementTop = this.itemListViewWrapper.nativeElement.scrollTop;
        let elementScrollHeight = this.itemListViewWrapper.nativeElement.scrollHeight;
        let elementInitialHeight = this.itemListViewWrapper.nativeElement.clientHeight;
        return (elementTop + elementInitialHeight) / elementScrollHeight > 0.97;
    }

}

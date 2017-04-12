import {Component, OnInit, ViewChild} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from  '../../localdao.service';
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Encoder} from "../../lib/encoder";
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
    persons: Array<Object> = new Array();
    tabPersons: Array<Object> = new Array();
    sum: number = 20;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {
    }

    ngOnInit() {
        console.log('Init Persons Comp');
        const that = this;

        that.DaoService.query("getAllPersons", null, (person) => {
            if (person) {
                const nodeId = person['?id'];
                const nodeName = person['?label'];

                if (!nodeId || !nodeName) {
                    return false;
                }

                const id = nodeId.value;
                const name = nodeName.value;

                if (!id || !name) {
                    return false;
                }

                that.persons = that.persons.concat({
                    id: that.encoder.encode(id),
                    name: name,
                });

                that.persons.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                });
            }
        });
    }

    addItems(startIndex, endIndex) {
        console.log("Enterd");
        if (endIndex > this.persons.length)
            endIndex = this.persons.length; //Si on est à la dernière insertion
        for (let i = startIndex; i < endIndex; ++i) {
            this.tabPersons.push(this.persons[i]);
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
        return (elementTop + elementInitialHeight) / elementScrollHeight > 0.90;
    }

}

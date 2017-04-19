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
    conference: Conference = new Conference();
    persons;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {
        this.persons = [];
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

                that.persons = that.persons.concat([{
                    id: that.encoder.encode(id),
                    name: name,
                }]);

                that.persons.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                });
            }
        });

    }



}

import {Component, ElementRef, OnInit, Renderer, ViewChild} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from  '../../localdao.service';
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Encoder} from "../../lib/encoder";
import {Person} from "../../model/person";
import {routerTransition} from '../../app.router.animation';
import {ManagerRequest} from "../../services/ManagerRequest";
import {Mutex} from 'async-mutex';

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
    tabPersons: Array<Object> = new Array();
    title: string = "Persons";

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private dBPLDataLoaderService: DBLPDataLoaderService,
                private managerRequest: ManagerRequest) {
        this.persons = [];
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;

        that.DaoService.query("getAllPersons", null, (results) => {
            if (results) {
                const nodeId = results['?id'];
                const nodeName = results['?label'];
                const nodeBox = results['?box'];

                if (!nodeId || !nodeName) {
                    return false;
                }

                let id = nodeId.value;
                const name = nodeName.value;

                if (!id || !name) {
                    return false;
                }
                id = that.encoder.encode(id);
                if (!id) {
                    return false;
                }

                const find = that.persons.find((p) => {
                   return p.id === id;
                });

                if(find){
                    return false;
                }

                const person = {
                    id: id,
                    name: name,
                };

                that.persons = that.persons.concat(person);

                that.persons.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                });
            }
        });
    }
}

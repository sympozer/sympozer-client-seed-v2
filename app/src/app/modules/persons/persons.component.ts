import {Component, OnInit} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from  '../../localdao.service';
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Person} from "../../model/person";


@Component({
    selector: 'app-person',
    templateUrl: 'persons.component.html',
    styleUrls: ['persons.component.css']
})
export class PersonsComponent implements OnInit {
    conference: Conference = new Conference();
    persons;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {
    }

    ngOnInit() {
        console.log('Init Persons Comp');

        this.persons = this.DaoService.query("getAllPersons", null);
        console.log(this.persons);

    }

    /*getPublication(person: Person) {
        // this.dBPLDataLoaderService.getAuthorPublications(person.value.name).then(response => {
            this.dBPLDataLoaderService.getAuthorPublications(person.name).then(response => {
            console.log(response);
            person.publications = [];
            if (response.results) {
                for (let result of response.results.bindings) {
                    person.publications.push(result);
                }
                console.log(person.publications);
            }

        });
    }

    getPublicationExternAuthors = (publication: any)=> {
        this.dBPLDataLoaderService.getExternPublicationAuthors(publication.publiUri.value).then(response => {
                console.log(response);
                publication.authors = [];
                if (response.results) {
                    for (let result of response.results.bindings) {
                        publication.authors.push(result);
                    }
                }
            }
        );
    };

    getPublicationExternInfo = (publication: any) => {
        this.dBPLDataLoaderService.getExternPublicationInfo(publication.publiUri.value).then((response => {
            console.log(`Got Publication ${publication.publiUri.value} info: `);
            console.log(response);
            publication.informations = [];
            if (response.results) {
                for (let result of response.results.bindings) {
                    publication.informations.push(result);
                }
            }

        }))
    }*/

}

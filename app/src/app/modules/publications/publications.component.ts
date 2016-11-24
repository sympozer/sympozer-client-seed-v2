import {Component, OnInit} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';
@Component({
    selector: 'app-person',
    templateUrl: 'publications.component.html',
    styleUrls: ['publications.component.css'],
})
export class PublicationsComponent implements OnInit {
    conference:Conference = new Conference();

    constructor(private router:Router,
                private dataLoaderService:DataLoaderService) {
    }

    ngOnInit() {
        this.dataLoaderService.getData().then((conference) => {
            this.conference = conference;
            console.log(this.conference);
        });
    }

}

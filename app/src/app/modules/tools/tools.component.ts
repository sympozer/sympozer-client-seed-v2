import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}              from '@angular/common';
import {routerTransition} from '../../app.router.animation';
import {LocalDAOService} from '../../localdao.service';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ToolsComponent implements OnInit {

    constructor(private location: Location,
                private route: ActivatedRoute,
                private localdao: LocalDAOService) {
    }

    ngOnInit() {
    }


    loadDataset() {
        console.log('load dataset');
        this.localdao.loadDataset();
    }

    resetDataset() {
        this.localdao.resetDataset();
    }
}

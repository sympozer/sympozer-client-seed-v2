import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'categories-for-publications',
    templateUrl: './categories-for-publications.component.html',
    styleUrls: ['./categories-for-publications.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class CategoriesForPublicationsComponent implements OnInit {
    private tracks = [];
    constructor(
        private DaoService : LocalDAOService,
        private encoder: Encoder) {

    }

    ngOnInit() {
        const that = this;
        this.DaoService.query("getAllCategoriesForPublications", null, (results) => {
            console.log(results);
            if(results){
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if(!nodeLabel || !nodeId)
                {
                    return false;
                }

                let id = nodeId.value;
                const label = nodeLabel.value;

                if(!id || !label)
                {
                    return false;
                }

                id = that.encoder.encode(id);
                if(!id)
                {
                    return false;
                }

                that.tracks.push({
                    id: id,
                    label: label,
                });
            }
        });
    }

}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-categories',
    templateUrl: 'categories.component.html',
    styleUrls: ['categories.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class CategoriesComponent implements OnInit {
    tracks;

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.tracks = [];
    }

    ngOnInit() {
        const that = this;
        this.DaoService.query("getAllCategoriesForPublications", null, (results) => {
            console.log(results);
            if (results) {
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if (!nodeLabel || !nodeId) {
                    return false;
                }

                let id = nodeId.value;
                const label = nodeLabel.value;

                if (!id || !label) {
                    return false;
                }

                id = that.encoder.encode(id);
                if (!id) {
                    return false;
                }

                that.tracks = that.tracks.concat({
                    id: id,
                    label: label,
                });

                that.tracks.sort((a, b) => {
                    return a.label > b.label ? 1 : -1;
                });
            }
        });
    }

}

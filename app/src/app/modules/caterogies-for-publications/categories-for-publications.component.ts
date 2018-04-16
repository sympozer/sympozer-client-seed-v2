import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
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
    public tracks = [];
    public title: string = "Tracks";

    constructor(private DaoService: LocalDAOService,
                private encoder: Encoder) {

    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;
        let seen = new Set();
        this.DaoService.query("getAllCategoriesForPublications", null, (results) => {
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

                if (seen.has(id)) {
                    return false;
                }
                seen.add(id);

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

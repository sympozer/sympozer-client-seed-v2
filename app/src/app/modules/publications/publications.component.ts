import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {routerTransition} from '../../app.router.animation';

let cache: Array<Object> = null;

@Component({
    selector: 'app-publications',
    templateUrl: 'publications.component.html',
    styleUrls: ['publications.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsComponent implements OnInit {
    title = 'Publications';
    publications;
    tabPubli: Array<Object> = new Array();

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.publications = [];
    }

    ngOnInit() {
        if (document.getElementById('page-title-p')) {
            document.getElementById('page-title-p').innerHTML = this.title;
        }
        const that = this;
        if (cache) {
            this.publications = cache;
            console.log('Retrieved from cache.');
        } else {
            that.DaoService.query('getAllPublications', null, (results) => {
                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if (!nodeId || !nodeLabel) {
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

                    const find = that.publications.find((p) => {
                        return p.id === id;
                    });

                    if (find) {
                        return false;
                    }

                    that.publications = that.publications.concat({
                        id: id,
                        label: label,
                    });

                    that.publications.sort((a, b) => {
                        return a.label > b.label ? 1 : -1;
                    });
                }
            }, () => {
                cache = this.publications;
            });
        }
    }
}

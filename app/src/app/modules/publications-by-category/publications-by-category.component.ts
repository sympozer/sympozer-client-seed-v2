import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'publications-by-category',
    templateUrl: './publications-by-category.component.html',
    styleUrls: ['./publications-by-category.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsByCategoryComponent implements OnInit {
    public labelTrack;
    public publications = [];

    constructor(private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.publications = [];
        this.labelTrack = '';
    }

    ngOnInit(): void {
        const that = this;
        this.route.params.forEach((params: Params) => {
            const id = params['id'];
            const labelTrack = params['name'];

            if(labelTrack){
                that.labelTrack = labelTrack;
                 if (document.getElementById("page-title-p"))
                        document.getElementById("page-title-p").innerHTML = labelTrack + " publications";
            }

            if (!id) {
                return false;
            }

            let query = {'key': this.encoder.decode(id)};
            this.DaoService.query("getPublicationLinkByTrack", query, (results) => {
                console.log(results);
                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if (nodeId && nodeLabel) {
                        let id = nodeId.value;
                        const label = nodeLabel.value;

                        if (id && label) {
                            id = that.encoder.encode(id);
                            if (id) {
                                const find = that.publications.find((p) => {
                                    return p.id === id;
                                });

                                if(find){
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
                        }
                    }
                }
            });
        });
    }

}

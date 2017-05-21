import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-publication-by-keyword',
    templateUrl: 'publications-by-keyword.html',
    styleUrls: ['publications-by-keyword.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsByKeyword implements OnInit {
    title: string = "Publications by keyword";
    public publications;

    constructor(private router: Router, private route: ActivatedRoute,
                private DaoService: LocalDAOService, private encoder: Encoder) {
        this.publications = [];
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let keyword = params['keyword'];

            if (!keyword || keyword.length === 0) {
                return false;
            }

            that.DaoService.query("getPublicationsByKeyword", {
                keyword: keyword
            }, (results) => {
                console.log(results);
                if(results){
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if(nodeId && nodeLabel){
                        let id = nodeId.value;
                        const label = nodeLabel.value;

                        if(id && label){
                            id = that.encoder.encode(id);
                            if(id){
                                that.publications.push({
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

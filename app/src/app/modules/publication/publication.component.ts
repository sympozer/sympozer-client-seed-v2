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
    selector: 'app-publication',
    templateUrl: 'publication.component.html',
    styleUrls: ['publication.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationComponent implements OnInit {
    private publication;
    private authors;

    constructor(private router:Router,private route: ActivatedRoute,
                private DaoService: LocalDAOService,  private encoder: Encoder) {
        this.authors = [];
        this.publication = {
            label: undefined,
            abstract: undefined
        };
    }

    ngOnInit() {
        console.log("Init publication Component");
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decode(id)};
            console.log(query);
            this.DaoService.query("getPublication", query, (results) => {
                if(results){
                    const nodeLabel = results['?label'];
                    const nodeAbstract = results['?abstract'];

                    if(!nodeLabel || !nodeAbstract)
                    {
                        return false;
                    }

                    const label = nodeLabel.value;
                    const abstract = nodeAbstract.value;

                    if(!label || !abstract){
                        return false;
                    }

                    that.publication.label = label;
                    that.publication.abstract = abstract;
                }
            });

            this.DaoService.query("getAuthorLinkPublication", query, (results) => {
                console.log('getAuthorLinkPublication : ', results);
                if(results){
                    const nodeIdPerson = results['?idPerson'];
                    const nodeLabel = results['?label'];

                    if(!nodeIdPerson || !nodeLabel)
                    {
                        return false;
                    }

                    let idPerson = nodeIdPerson.value;
                    const label = nodeLabel.value;

                    if(!idPerson || !label){
                        return false;
                    }

                    idPerson = that.encoder.encode(idPerson);
                    if(!idPerson)
                    {
                        return false;
                    }

                    that.authors.push({
                        id: idPerson,
                        label: label,
                    });
                }
            });

            /*for(let i in this.publication.authors){
                let query = { 'key' : this.publication.authors[i] };
                this.authors[i] = this.DaoService.query("getPersonLink",query);
            }*/
        });
    }
}

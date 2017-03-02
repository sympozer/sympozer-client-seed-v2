import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-extern-publication',
    templateUrl: 'externpublication.component.html',
    styleUrls: ['externpublication.component.css'],
})
export class ExternPublicationComponent implements OnInit {
    private publication = {};
    private authors = {};

    constructor(private router:Router,private route: ActivatedRoute,
    private encoder: Encoder,
    private  dBPLDataLoaderService: DBLPDataLoaderService) {

    }

    ngOnInit() {

        this.route.params.forEach((params: Params) => {
            let id = this.encoder.decodeForURI(params['id']);
            this.publication['id'] = id;
            this.getPublicationExternInfo(this.publication);
            this.getPublicationExternAuthors(this.publication);
            // let query = {'key': this.encoder.decodeForURI(id)};
            // for(let i in this.publication.authors){
            //     let query = { 'key' : this.publication.authors[i] };
            //     this.authors[i] = this.DaoService.query("getPersonLink",query);
            // }
            // console.log(this.publication);
        });
    }

    getPublicationExternAuthors = (publication: any)=> {
        this.dBPLDataLoaderService.getExternPublicationAuthors(publication.id).then(response => {
                console.log(response);
                publication.authors = [];
                if (response.results) {
                    for (let result of response.results.bindings) {
                        result.authorUri.value = this.encoder.encodeForURI(result.authorUri.value)
                        publication.authors.push(result);
                    }
                }
                console.log(publication);
            }
        );
    };

    getPublicationExternInfo = (publication: any) => {
        this.dBPLDataLoaderService.getExternPublicationInfo(publication.id).then((response => {
            console.log(`Got Publication ${publication.id} info: `);
            console.log(response);
            publication.informations = [];
            if (response.results) {
                for (let result of response.results.bindings) {
                    publication.informations.push(result);
                }
            }

        }))
    }
}

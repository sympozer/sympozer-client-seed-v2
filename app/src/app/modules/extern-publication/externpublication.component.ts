
import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {DBLPDataLoaderService} from '../../dblpdata-loader.service';
import {Encoder} from '../../lib/encoder';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-extern-publication',
    templateUrl: 'externpublication.component.html',
    styleUrls: ['externpublication.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ExternPublicationComponent implements OnInit {
    public publication: any = {};
    public authors = {};

    constructor(private router: Router, private route: ActivatedRoute,
                private encoder: Encoder,
                private dBPLDataLoaderService: DBLPDataLoaderService) {

    }

    ngOnInit() {

        this.route.params.forEach((params: Params) => {
            const id = this.encoder.decodeForURI(params['id']);
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

    getPublicationExternAuthors = (publication: any) => {
        this.dBPLDataLoaderService.getExternPublicationAuthors(publication.id).then(response => {
                console.log(response);
                publication.authors = [];
                if (response && response.results) {
                    for (const result of response.results.bindings) {
                        result.authorUri.value = this.encoder.encodeForURI(result.authorUri.value);
                        publication.authors.push(result);
                    }
                }
                console.log(publication);
            }
        );
    }

    getPublicationExternInfo = (publication: any) => {
        this.dBPLDataLoaderService.getExternPublicationInfo(publication.id).then((response => {
            console.log(`Got Publication ${publication.id} info: `);
            console.log(response);
            publication.informations = [];
            if (response && response.results) {
                for (const result of response.results.bindings) {
                    publication.informations.push(result);
                }
            }

        }));
    }
}

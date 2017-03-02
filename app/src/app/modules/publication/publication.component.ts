import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-publication',
    templateUrl: 'publication.component.html',
    styleUrls: ['publication.component.css'],
})
export class PublicationComponent implements OnInit {
    private publication;
    private authors = {};

    constructor(private router:Router,private route: ActivatedRoute,
                private DaoService: LocalDAOService,  private encoder: Encoder) {

    }

    ngOnInit() {
        console.log("Init publication Component");

        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decodeForURI(id)};
            this.publication = this.DaoService.query("getPublication", query);
            for(let i in this.publication.authors){
                let query = { 'key' : this.publication.authors[i] };
                this.authors[i] = this.DaoService.query("getPersonLink",query);
            }
            console.log(this.publication);
        });
    }
}

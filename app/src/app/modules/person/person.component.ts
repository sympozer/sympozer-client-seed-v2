import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {Person} from "../../model/person";

@Component({
    selector: 'app-person',
    templateUrl: 'person.component.html',
    styleUrls: ['person.component.css'],
})
export class PersonComponent implements OnInit {
    private person;
    private roles = {};
    private orgas = {};
    private publiConf = {};

    constructor(private router:Router,private route: ActivatedRoute,
                private DaoService: LocalDAOService,  private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {

    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = { 'key' : this.encoder.decodeForURI(id) };
            this.person = this.DaoService.query("getPerson", query);
            for(let i in this.person.made){
                let query = { 'key' : this.person.made[i] };
                this.publiConf[i] = this.DaoService.query("getPublicationLink",query);
            }
            for(let j in this.person.affiliation){
                let queryOrga = { 'key' : this.person.affiliation[j] };
                this.orgas[j] = this.DaoService.query("getOrganizationLink",queryOrga);
            }
            for(let k in this.person.holdsRole){
                let queryRole = { 'key' : this.person.holdsRole[k] };
                this.roles[k] = this.DaoService.query("getRole",queryRole);
            }

            this.getPublication(this.person);

        });
    }

     getPublication(person: any) {
        // this.dBPLDataLoaderService.getAuthorPublications(person.value.name).then(response => {
            this.dBPLDataLoaderService.getAuthorPublications(person.name).then(response => {
            console.log(response);
            person.publications = [];
            if (response.results) {
                for (let result of response.results.bindings) {
                    result.publiUri.value = this.encoder.encodeForURI(result.publiUri.value);// encoder l'url
                    person.publications.push(result); 
                }
                console.log(person.publications);
            }

        });
    };
}

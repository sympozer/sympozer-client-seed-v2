import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {Person} from "../../model/person";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-person',
    templateUrl: 'person.component.html',
    styleUrls: ['person.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonComponent implements OnInit {
    private person;
    private roles = {};
    private orgas = {};
    private publiConf = {};
    private externPublications = {};

    constructor(private router: Router, private route: ActivatedRoute,
                private DaoService: LocalDAOService, private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {

    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = {'key': this.encoder.decodeForURI(id)};
            this.person = this.DaoService.query("getPerson", query);
            for (let i in this.person.made) {
                let query = {'key': this.person.made[i]};
                this.publiConf[i] = this.DaoService.query("getPublicationLink", query);
            }
            for (let j in this.person.affiliation) {
                let queryOrga = {'key': this.person.affiliation[j]};
                this.orgas[j] = this.DaoService.query("getOrganizationLink", queryOrga);
            }
            for (let k in this.person.holdsRole) {
                let queryRole = {'key': this.person.holdsRole[k]};
                this.roles[k] = this.DaoService.query("getRole", queryRole);
            }

            this.getPublication(this.person);
        });
    }

    getPublication(person: any) {
        // this.dBPLDataLoaderService.getAuthorPublications(person.value.name).then(response => {
        this.dBPLDataLoaderService.getAuthorPublications(person.name).then(response => {
            if (response.results) {
                let i = 0;
                for (let result of response.results.bindings) {
                    let parsedResult = {
                        id: this.encoder.encodeForURI(result.publiUri.value),
                        name: result.publiTitle.value
                    };
                    this.externPublications[i] = parsedResult;
                    i++;
                }
            }
            console.log(this.externPublications);

        });
    };
}

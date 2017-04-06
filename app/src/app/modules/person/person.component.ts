import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {PersonService} from "./person.service";
import {Mutex} from 'async-mutex';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-person',
    templateUrl: 'person.component.html',
    styleUrls: ['person.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonComponent implements OnInit {
    private externPublications = [];
    public person;
    public roles = [];
    public orgas = [];
    public publiConf = [];
    private mutex: any;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private personService: PersonService,
                private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService) {
        this.person = this.personService.defaultPerson();
        this.mutex = new Mutex();
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];

            if (!id || !name) {
                return false;
            }

            let query = {'key': this.encoder.decode(id)};
            this.DaoService.query("getPerson", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.person = {
                            name: results['?label'].value
                        };
                        release();
                    });
            });

            this.DaoService.query("getPublicationLink", query, (results, err) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.publiConf = that.personService.generatePublicationLinkFromStream(that.publiConf, results);
                        release();
                    });
            });

            this.DaoService.query("getOrganizationLink", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.orgas = that.personService.generateOrgasFromStream(that.orgas, results);
                        release();
                    });
            });

            this.DaoService.query("getRole", query, (results) => {
                console.log('roles: ', results);
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.roles = that.personService.generateRolesFromStream(that.roles, results);
                        release();
                    });
            });
        });
    }

    getPublication(person: any) {
        // this.dBPLDataLoaderService.getAuthorPublications(person.value.name).then(response => {
        this.dBPLDataLoaderService.getAuthorPublications(person.name).then(response => {
            if (response.results) {
                let i = 0;
                for (let result of response.results.bindings) {
                    this.externPublications[i] = {
                        id: this.encoder.encodeForURI(result.publiUri.value),
                        name: result.publiTitle.value
                    };
                    i++;
                }
            }
        });
    };
}

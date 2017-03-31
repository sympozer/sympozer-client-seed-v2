import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {Person} from "../../model/person";
import {PersonService} from "./person.service";
import {Mutex, MutexInterface} from 'async-mutex';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-person',
    templateUrl: 'person.component.html',
    styleUrls: ['person.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonComponent implements OnInit {
    public person;
    public roles = [];
    public orgas = [];
    public publiConf = [];
    private mutex: any;

    constructor(private router:Router,
                private route: ActivatedRoute,
                private personService: PersonService,
                private DaoService: LocalDAOService,
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

            if(!id || !name)
            {
                return false;
            }

            let query = { 'key' : this.encoder.decode(id) };
            this.DaoService.query("getPerson", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function(release) {
                        that.person = that.personService.generatePersonFromStream(that.person, results);
                        release();
                    });
            });

            this.DaoService.query("getPublicationLink", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function(release) {
                        that.publiConf = that.personService.generatePublicationLinkFromStream(that.publiConf, results);
                        release();
                    });
            });

            this.DaoService.query("getOrganizationLink", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function(release) {
                        that.orgas = that.personService.generateOrgasFromStream(that.orgas, results);
                        release();
                    });
            });

            this.DaoService.query("getRole", query, (results) => {
                that.mutex
                    .acquire()
                    .then(function(release) {
                        that.orgas = that.personService.generateRolesFromStream(that.roles, results);
                        release();
                    });
            });
            /*for(let i in this.person.made){
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

            this.getPublication(this.person);*/

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

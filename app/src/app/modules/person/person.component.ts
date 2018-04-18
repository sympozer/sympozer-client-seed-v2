import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {DBLPDataLoaderService} from '../../dblpdata-loader.service';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {PersonService} from './person.service';
import {Mutex} from 'async-mutex';
import {routerTransition} from '../../app.router.animation';
import {RequestManager} from '../../services/request-manager.service';
import {Config} from '../../app-config';
import {ApiExternalServer} from '../../services/ApiExternalServer';

@Component({
    selector: 'person',
    templateUrl: 'person.component.html',
    styleUrls: ['person.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonComponent implements OnInit {
    public externPublications = [];
    public photoUrl: any;
    public twitterUrl: any;
    public facebookUrl: any;
    public googlePlusUrl: any;
    public linkedInUrl: any;
    public homepage: any;
    public person;
    public roles = [];
    public orgas = [];
    public publiConf = [];
    private mutex: any;
    private mutex_box: any;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private personService: PersonService,
                private encoder: Encoder,
                private dBPLDataLoaderService: DBLPDataLoaderService,
                private managerRequest: RequestManager,
                private apiExternalServer: ApiExternalServer,
                ) {
        this.person = this.personService.defaultPerson();
        this.mutex = new Mutex();
        this.mutex_box = new Mutex();
    }

    ngOnInit() {
        const that = this;
        this.route.params.forEach((params: Params) => {
            const id = params['id'];
            const name = params['name'];

            if (!id || !name) {
                return false;
            }

            if (document.getElementById('page-title-p')) {
                document.getElementById('page-title-p').innerHTML = name;
            }

            that.getPublication(name);

            const query = {'key': this.encoder.decode(id)};
            this.DaoService.query('getPerson', query, (results) => {
//                console.log(results);
                that.mutex
                    .acquire()
                    .then(function (release) {
                        const nodeLabel = results['?label'];
                        const nodeBox = results['?box'];

                        if (nodeLabel) {
                            const label = nodeLabel.value;

                            if (label) {
                                let boxs = [];

                                that.person = {
                                    name: label,
                                    boxs: boxs,
                                };

                                if (nodeBox) {
                                    const boxs_temp = nodeBox.value;
                                    if (boxs_temp) {
                                        switch (typeof boxs_temp) {
                                            case 'string':
                                                boxs = [boxs_temp];
                                                break;
                                            default:
                                                boxs = boxs_temp;
                                                break;
                                        }
                                    }

                                    that.managerRequest.get(Config.externalServer.url + '/user/sha1?email_sha1=' + boxs + '&id_ressource=' + id)
                                        .then((response) => {
                                            if (response && response) {
                                                const user = JSON.parse(response);
//                                                console.log(user);
                                                if (user && user.photoUrl) {
                                                    that.photoUrl = user.photoUrl;
                                                }
                                                if (user) {
                                                    let twitterpage = user.twitterpage;

                                                    if (twitterpage && twitterpage.length > 0) {
                                                        if (twitterpage.includes('@')) {
                                                            twitterpage = twitterpage.replace('@', '');
                                                        }
                                                    }

                                                    that.twitterUrl = twitterpage;
                                                    that.facebookUrl = user.facebookpage;
                                                    that.googlePlusUrl = user.googleaccount;
                                                    that.linkedInUrl = user.linkedinaccount;
                                                    that.homepage = user.homepage;
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            throw error;
                                        });
                                }
                            }
                        }
                        release();
                    });
            });

            this.DaoService.query('getPublicationLink', query, (results, err) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.publiConf = that.personService.generatePublicationLinkFromStream(that.publiConf, results);
                        release();
                    });
            });

            this.DaoService.query('getOrganizationLink', query, (results) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.orgas = that.personService.generateOrgasFromStream(that.orgas, results);
                        release();
                    });
            });

            this.DaoService.query('getRole', query, (results) => {
                that.mutex
                    .acquire()
                    .then(function (release) {
                        that.roles = that.personService.generateRolesFromStream(that.roles, results);
                        release();
                    });
            });
        });
    }

    getPublication(name: any) {
        // this.dBPLDataLoaderService.getAuthorPublications(person.value.name).then(response => {
        this.dBPLDataLoaderService.getAuthorPublications(name).then(response => {
            if (response && response.results) {
                let i = 0;
                for (const result of response.results.bindings) {
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

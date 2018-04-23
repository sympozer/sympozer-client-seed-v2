import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {DBLPDataLoaderService} from '../../dblpdata-loader.service';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {ParticipantService} from './participant.service';
import {Mutex} from 'async-mutex';
import {routerTransition} from '../../app.router.animation';
import {RequestManager} from '../../services/request-manager.service';
import {Config} from '../../app-config';
import {ApiExternalServer} from '../../services/ApiExternalServer';

@Component({
    selector: 'participant',
    templateUrl: 'participant.component.html',
    styleUrls: ['participant.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ParticipantComponent implements OnInit {
    public externPublications = [];
    public photoUrl: any;
    public twitterUrl: any;
    public facebookUrl: any;
    public googlePlusUrl: any;
    public linkedInUrl: any;
    public homepage: any;
    public participant;
    public roles = [];
    public orgas = [];
    public publiConf = [];
    private mutex: any;
    private mutex_box: any;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private participantService: ParticipantService,
                private encoder: Encoder,
                private dBPLDataLoaderService: DBLPDataLoaderService,
                private managerRequest: RequestManager,
                private apiExternalServer: ApiExternalServer) {

        this.participant = this.participantService.defaultPerson();
        this.mutex = new Mutex();
        this.mutex_box = new Mutex();
    }

    ngOnInit() {
        

        /* case where there is no matching participant in the dataset */
        this.route.params.forEach((params: Params) => {
            const name = params['name'];

            //console.log(name);  
            this.participant.name = name;
        });

        
    }

}

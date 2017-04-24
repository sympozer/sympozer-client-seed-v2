import {Component, OnInit, ViewChild} from '@angular/core';
import {Conference} from '../../model/conference';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from  '../../localdao.service';
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {Encoder} from "../../lib/encoder";
import {Person} from "../../model/person";
import {routerTransition} from '../../app.router.animation';
import {ManagerRequest} from "../../services/ManagerRequest";
import {Mutex} from 'async-mutex';

@Component({
    selector: 'app-person',
    templateUrl: 'persons.component.html',
    styleUrls: ['persons.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonsComponent implements OnInit {
    conference: Conference = new Conference();
    persons;
    private mutex_box: any;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private encoder: Encoder,
                private  dBPLDataLoaderService: DBLPDataLoaderService,
                private managerRequest: ManagerRequest) {
        this.persons = [];
        this.mutex_box = new Mutex();
    }

    ngOnInit() {
        console.log('Init Persons Comp');
        const that = this;

        that.DaoService.query("getAllPersons", null, (results) => {
            if (results) {
                const nodeId = results['?id'];
                const nodeName = results['?label'];
                const nodeBox = results['?box'];

                if (!nodeId || !nodeName) {
                    return false;
                }

                let id = nodeId.value;
                const name = nodeName.value;

                if (!id || !name) {
                    return false;
                }

                id = that.encoder.encode(id);
                if(!id){
                    return false;
                }

                const person = {
                    id: id,
                    name: name,
                };

                that.persons = that.persons.concat(person);

                if(nodeBox){
                    let boxs = [];
                    const boxs_temp = nodeBox.value;
                    if(boxs_temp){
                        switch(typeof boxs_temp){
                            case "string":
                                boxs = [boxs_temp];
                                break;
                            default:
                                boxs = boxs_temp;
                                break;
                        }
                    }

                    for(const box of boxs){
                        that.mutex_box
                            .acquire()
                            .then((release_mutex_box) => {
                                const p = that.persons.find((p_temp) => {
                                    return p_temp.id ===  id;
                                });

                                if(!p || (p.avatar && p.avatar.length > 0)){
                                    release_mutex_box();
                                    return false;
                                }

                                that.managerRequest.get_safe('http://localhost:3000/user/sha1?email_sha1='+box)
                                    .then((request) => {
                                        if(request && request._body)
                                        {
                                            const user = JSON.parse(request._body);
                                            if(user && user.avatar_view){

                                                if(p){
                                                    p.avatar = 'http://localhost:3000/' + user.avatar_view;
                                                }
                                            }
                                        }
                                    });
                                release_mutex_box();
                            });
                    }
                }

                that.persons.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                });
            }
        });

    }



}

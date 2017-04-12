import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}              from '@angular/common';
import {LocalDAOService} from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'person-by-role',
    templateUrl: './person-by-role.component.html',
    styleUrls: ['./person-by-role.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PersonByRoleComponent implements OnInit {
    persons;
    personRole;

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private DaoService: LocalDAOService,  
        private encoder: Encoder) {
        this.persons = [];
    }

    ngOnInit(): void {
        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['ref'];

            console.log(id);

            this.personRole = decodeURI(name);

            console.log(id);

            if(!id)
            {
                return false;
            }

            let query = { 'key' : this.encoder.decode(id) };
            this.DaoService.query("getPersonsByRole", query, (results) => {
                if(results){
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if(nodeId && nodeLabel){
                        const id = nodeId.value;
                        const label = nodeLabel.value;

                        if(id && label){
                            that.persons.push({
                                id: that.encoder.encode(id),
                                label: label,
                            });

                            that.persons.sort((a, b) => {
                                return a.label > b.label ? 1 : -1;
                            });
                        }
                    }
                }
            });
        });
    }
}


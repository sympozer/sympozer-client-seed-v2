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

    constructor(private location: Location,
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

            if (document.getElementById("page-title-p"))
                document.getElementById("page-title-p").innerHTML = this.personRole;

            if (!id) {
                return false;
            }

            let query = {'key': this.encoder.decode(id)};
            this.DaoService.query("getPersonsByRole", query, (results) => {
                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];
                    const nodeGivenName = results['?givenName'];
                    const nodeFamilyName = results['?familyName'];

                    if (nodeId && nodeLabel) {
                        const id = nodeId.value;
                        const label = nodeLabel.value;
                        const sortName = (nodeGivenName && nodeFamilyName)
                                       ? nodeFamilyName.value + ', ' + nodeGivenName.value
                                       : label;

                        if (id && label) {
                            const idEncoded = that.encoder.encode(id);

                            const find = that.persons.find((p) => {
                                return p.id === idEncoded;
                            });

                            if(find){
                                return false;
                            }

                            that.persons.push({
                                id: idEncoded,
                                label: label,
                                sortName: sortName,
                            });

                            that.persons.sort((a, b) => {
                                return a.sortName > b.sortName ? 1 : -1;
                            });
                        }
                    }
                }
            });
        });
    }
}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Encoder} from "../../lib/encoder";

import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class RolesComponent implements OnInit {
    roles;
    tabRoles: Array<Object> = new Array();
    title: string = "Roles";

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.roles = [];
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;
        that.DaoService.query("getAllRoles", null, (results) => {
            if (results) {
                const nodeId = results['?idRole'];
                const nodeLabel = results['?label'];

                if (!nodeId || !nodeLabel) {
                    return false;
                }

                let id = nodeId.value;
                const label = nodeLabel.value;

                if (!id || !label) {
                    return false;
                }

                id = that.encoder.encode(id);
                if(!id){
                    return false;
                }

                //On regarde si on a pas déjà le rôle
                const find = that.roles.find((r) => {
                    return r.id === id;
                });

                if(find){
                    return false;
                }

                that.roles = that.roles.concat({
                    id: id,
                    label: label,
                });

                that.roles.sort((role, nextRole) => {
                    return role.label > nextRole.label ? 1 : -1;
                });
            }
        });
    }

}

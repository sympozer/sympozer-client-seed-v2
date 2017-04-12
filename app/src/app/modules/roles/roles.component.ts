import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Encoder} from "../../lib/encoder";

import { LocalDAOService } from  '../../localdao.service';
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
  constructor(
      private router: Router,
      private DaoService : LocalDAOService,
      private encoder: Encoder
  ) {
    this.roles = [];
  }

  ngOnInit() {
    const that = this;
    that.DaoService.query("getAllRoles", null, (results) => {
      if (results) {
        const nodeId = results['?idRole'];
        const nodeLabel = results['?label'];

        if (!nodeId || !nodeLabel) {
          return false;
        }

        const id = nodeId.value;
        const label = nodeLabel.value;

        if (!id || !label) {
          return false;
        }

        that.roles = that.roles.concat({
          id: that.encoder.encode(id),
          label: label,
        });

        that.roles.sort((role, nextRole) => {
          return role.label > nextRole.label ? 1 : -1;
        });
      }
    });
  }

}

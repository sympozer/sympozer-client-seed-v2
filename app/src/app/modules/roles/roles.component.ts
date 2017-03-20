import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
      private DaoService : LocalDAOService
  ) { }

  ngOnInit() {
    this.roles = this.DaoService.query("getAllRoles", null);
    console.log(this.roles);
  }

}

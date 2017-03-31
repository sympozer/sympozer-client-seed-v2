import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
  animations: [routerTransition()],
  host: {'[@routerTransition]': ''}
})
export class OrganizationsComponent implements OnInit {
  organizations;
  constructor(
      private DaoService : LocalDAOService,
      private encoder: Encoder
  ) {
    this.organizations = [];
  }

  ngOnInit() {
    //this.organizations = this.DaoService.query("getAllOrganizations", null);
    const that = this;
    that.DaoService.query("getAllOrganizations", null, (results) => {
      console.log(results);
      if(results)
      {
        const nodeId = results['?id'];
        const nodeName = results['?name'];

        if(nodeId && nodeName)
        {
          const id = nodeId.value;
          const name = nodeName.value;

          if(id && name)
          {
            that.organizations.push({
              id: that.encoder.encode(id),
              name: name,
            });
          }
        }
      }
    });
  }

}

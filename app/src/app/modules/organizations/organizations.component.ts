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
      if(results)
      {
        const nodeId = results['?id'];
        const nodeLabel = results['?label'];

        if(nodeId && nodeLabel)
        {
          const id = nodeId.value;
          const label = nodeLabel.value;

          if(id && label)
          {
            that.organizations = that.organizations.concat({
              id: that.encoder.encode(id),
              label: label,
            });

            that.organizations.sort((a, b) => {
              return a.label > b.label ? 1 : -1;
            });
          }
        }
      }
    });
  }

}

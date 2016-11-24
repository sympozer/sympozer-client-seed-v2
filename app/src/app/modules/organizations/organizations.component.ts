import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent implements OnInit {
  organizations;
  constructor(
      private router: Router,
      private DaoService : LocalDAOService
  ) { }

  ngOnInit() {
    this.organizations = this.DaoService.query("getAllOrganizations", null);
    console.log(this.organizations);
  }

}

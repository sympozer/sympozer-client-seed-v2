import { Component, Input, OnInit, OnChanges, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiExternalServer } from '../../services/ApiExternalServer';
import { Config } from "../../app-config";
import { LocalStorageService } from 'ng2-webstorage';
import { AppointmentService } from "../../services/appointment.service";
import { Organization } from '../../model/organization';

@Component({
  selector: 'appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {

  //Input from Publication
  @Input('idTrack') idTrack: Object;
  @Input('publicationName') publicationName: Object;
  @Input('authors') authors: any;
  //Input from person
  @Input('idPerson') idPerson: String;
  @Input('namePerson') namePerson: String;
  //Input from organization
  @Input('membersOrg') membersOrg: Array<String>;
  @Input('organization') organization: any;

  subscription: Subscription;
  hasLogged: any;
  user: any;

  subject: String;
  receivers: any;
  url: any;
  validPage: boolean;
  currentPage: string;

  private key_localstorage_user = 'user_external_ressource_sympozer';

  constructor(private localStoragexx: LocalStorageService,
    private apiExternalServer: ApiExternalServer,
    private appointService: AppointmentService) {
    this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
      this.hasLogged = status;
    });
  }

  ngOnInit() {
    this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
    this.hasLogged = this.apiExternalServer.checkUserLogin();
  }

  ngDoCheck() {
    this.url = window.location.href;
    var personPageRegEx = ".*(\/#\/person\/).*\/.*";
    var orgPageRegEx = ".*(\/#\/organization\/undefined\/).*";
    var publiPageRegEx = ".*(\/#\/publication\/).*\/.*";
    if (this.url.match(personPageRegEx) !== null) {
      this.validPage = true;
      this.currentPage = "person";
    } else if (this.url.match(orgPageRegEx) !== null) {
      this.validPage = true;
      this.currentPage = "organization";
    } else if (this.url.match(publiPageRegEx) !== null) {
      this.validPage = true;
      this.currentPage = "publication";
    } else {
      this.validPage = false;
    }
  }

  setSender(){
    this.appointService.setSender(this.user);
  }
}

import { Component, Input, OnInit } from '@angular/core';
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

  subject: any;
  receivers: any;

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

  makeAppointment() {
    // set subject,receivers for each type
    if (this.publicationName != null) {
      this.appointService.setAppointment(this.publicationName, this.user, this.authors);
    } else if (this.idPerson != null) {
      this.appointService.setAppointment("No Reply", this.user, [{id:this.idPerson,label:this.namePerson}]);
    } else if (this.membersOrg != null && this.organization != null) {
      this.appointService.setAppointment(this.organization.label, this.user, this.membersOrg);
    } else {
      console.log("Not enough information to make an appointment");
    }
  }
}


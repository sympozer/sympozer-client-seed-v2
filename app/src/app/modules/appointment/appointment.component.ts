import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiExternalServer } from '../../services/ApiExternalServer';
import { Config } from "../../app-config";
import { LocalStorageService } from 'ng2-webstorage';
import { AppointmentService } from "../../services/appointment.service";

@Component({
  selector: 'appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {

  //Input from Publication
  @Input('idTrack') idTrack: Object;
  @Input('idPublication') idPublication: Object;
  @Input('authors') receivers: Array<String>;
  //Input from person
  @Input('idPerson') idPerson: String;
  //Input from organization
  @Input('membersOrg') membersOrg: Array<String>;

  subscription: Subscription;
  hasLogged: any;
  hasSetAppoint: any;
  haveNoti: any;
  user: any;

  private key_localstorage_user = 'user_external_ressource_sympozer';

  constructor(private localStoragexx: LocalStorageService,
    private apiExternalServer: ApiExternalServer,
    private appointService: AppointmentService) {
    this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
      this.hasLogged = status;
    });
  }

  ngOnInit() {
    this.hasSetAppoint = false;
    this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
    this.hasLogged = this.apiExternalServer.checkUserLogin();
  }

  makeAppointment() {
    // set appointment
    // for publication
    if (this.idPublication != null && this.idTrack != null) {
      this.appointService.setAppointment(this.idPublication, this.user.email, this.receivers)
        .then(() => {
          alert("Set appointment successfully");
        })
        .catch((err) => {
          console.log(err)
          if (err === 500) {
            alert("Server Error");
          }
        });
    } else if (this.idPerson != null) {
      // put idPerson into an array<string>
      this.appointService.setAppointment(null, this.user.email, [this.idPerson])
        .then(() => {
          alert("Set appointment successfully");
        })
        .catch((err) => {
          console.log(err)
          if (err === 500) {
            alert("Server Error");
          }
        });
    } else if (this.membersOrg != null) {
      console.log(this.membersOrg);
    }
  }
}


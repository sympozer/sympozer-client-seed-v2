import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiExternalServer } from '../../services/ApiExternalServer';
import { Config } from "../../app-config";
import { LocalStorageService } from 'ng2-webstorage';
import { AppointmentService } from "../../services/appointment.service";

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {

  //Input from Publication
  @Input('idTrack') idTrack: Object;
  @Input('idPublication') idPublication: Object;

  subscription: Subscription;
  hasLoged: any;
  hasSetAppoint: any;
  haveNoti: any;

  constructor(private localStoragexx: LocalStorageService,
    private apiExternalServer: ApiExternalServer,
    private appointService: AppointmentService
  ) {
    // this is for the Authenfication??  
    this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
      console.log("Status:" + status);
      this.hasLoged = status;
    });
  }

  ngOnInit() {
    this.hasSetAppoint = false;
  }

  makeAppointment() {
    console.log("Hello world");
    const that = this;
    this.appointService.setAppointment(this.idPublication, "Admin")
      .then(() => {
        console.log("Vote successful");
        that.hasSetAppoint = true;
      })
      .catch((err) => {
        console.log(err)
        if (err === 403) {
          that.hasSetAppoint = true;
        }

      });

    // just to test the display
    //that.hasSetAppoint=true;
  }

  fakelogin() {
    console.log("FakeLogging in as author1");
    const that = this;
    that.haveNoti = this.appointService.fakelogin("author1");
  }

}


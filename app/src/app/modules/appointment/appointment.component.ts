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
  @Input('authors') authors: Array<String>;

  subscription: Subscription;
  hasLoged: any;
  hasSetAppoint: any;
  haveNoti: any;
  user: any;

  private key_localstorage_user = 'user_external_ressource_sympozer';

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
    this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
  }

  makeAppointment() {
    console.log("Hello world");
    console.log(this.authors);
    console.log(this.user);
    const that = this;
    this.appointService.setAppointment(this.idPublication, this.user.email,this.authors)
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

  addUser(){
    const that = this;
    that.appointService.addUser();
  }

  fakelogin() {
    console.log("FakeLogging in as author1");
    const that = this;
    that.haveNoti = this.appointService.fakelogin("author1");
  }

}


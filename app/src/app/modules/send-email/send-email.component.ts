import { Component, OnInit } from '@angular/core';
import { AppointmentService } from "../../services/appointment.service";
import { Subscription } from 'rxjs/Subscription';
import { ApiExternalServer } from '../../services/ApiExternalServer';
import { FormGroup } from '@angular/forms';
import { routerTransition } from '../../app.router.animation';
import { Router, ActivatedRoute, Params } from "@angular/router";

@Component({
  selector: 'send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
  animations: [routerTransition()],
  host: { '[@routerTransition]': '' }
})


export class SendEmailComponent implements OnInit {

  subscription: Subscription;
  hasLogged: any;
  user: any;

  subject: any;
  sender: any;
  receivers: any;
  message: any;

  message_sent: boolean;
  empty_message:boolean

  constructor(
    private apiExternalServer: ApiExternalServer,
    private appointService: AppointmentService) {
    this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
      this.hasLogged = status;
    });
    this.message_sent = false;
    this.empty_message=false;
  }

  ngOnInit() {
    this.hasLogged = this.apiExternalServer.checkUserLogin();
    this.subject = this.appointService.subject;
    this.sender = this.appointService.sender;
    this.receivers = this.appointService.receivers;
    console.log(this.subject);
    console.log(this.sender.email);
    console.log(this.receivers);
  }

  sendEmail() {
    if (this.message != null) {
      this.appointService.sendEmail(this.message,this.subject);
      this.message_sent = true;
    }else{
      this.empty_message=true;
    }
  }
}

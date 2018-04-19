import { Injectable, Component } from '@angular/core';
import { Config } from '../app-config';
import { ManagerRequest } from "./ManagerRequest";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { resolve } from 'url';
import { LocalStorageService } from 'ng2-webstorage';
import { send } from 'q';
import { WSAEWOULDBLOCK } from 'constants';

@Injectable()
export class AppointmentService {

  notiCount: any;
  public subject: any;
  public sender: any;
  public receivers: any;

  constructor(private managerRequest: ManagerRequest,
    private http: Http,
    private localStoragexx: LocalStorageService) {
  }

  setAppointment(subject, sender, receivers) {
    this.subject = subject;
    this.sender = sender;
    this.receivers = receivers;

  }

  setSender(sender) {
    this.sender = sender;
  }

  setSubject(subject) {
    if (subject == null) {
      this.subject = "Message from the app";
    } else {
      this.subject = subject;
    }
    console.log("AppointmentService:subject ");
    console.log(subject);
  }

  setReceivers(receivers) {
    this.receivers = receivers;
    if (receivers == null) {
      console.log("receivers is null");
    }
    //console.log("AppointmentService:receivers ");
    //console.log(receivers);
  }

  sendEmail(message,subject) {
    return new Promise((resolve, reject) => {
      console.log("Setting an Appointment");
      if (this.sender == null || this.receivers == null) {
        return reject('Invalid input for appointment.');
      }
      const that = this;
      let token = this.localStoragexx.retrieve("token_external_ressource_sympozer");
      console.log(token);
      let bodyRequest = {
        subject: "[TheWebConf2018] "+subject,
        email_sender: this.sender.email,
        fname_sender: this.sender.firstname,
        lname_sender: this.sender.lastname,
        receiver: this.receivers,
        message: message,
        token: token
      }
      //have to change the link to an existed api which will handle the appointment service

      that.http.post("http://localhost:8080/Symposer_Serveur/Appointment", bodyRequest)
        .toPromise()
        .then((respone) => {
          console.log(respone);
        });

      this.clear();
    });
  }

  clear() {
    this.subject = null;
    this.sender = null;
    this.receivers = null;
  }
}

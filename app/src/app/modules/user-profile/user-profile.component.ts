import { Component, OnInit, Input } from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  @Input()
  user : Object
  firstname: string
  lastname: string
  constructor(private apiExternalServer: ApiExternalServer,
              private snackBar: MdSnackBar) { }

  ngOnInit() {
    this.user = new Object()

  }

  update(homepage, photo, tweeter, linkedin){
    console.log(homepage + " " + photo + " " + tweeter + " " + linkedin)
    this.apiExternalServer.update(homepage, photo, tweeter, linkedin)
        .then((status)=>{
          this.snackBar.open("Update successful.", "", {
            duration: 2000,
          });
        })
        .catch((err)=>{
          this.snackBar.open(err, "", {
            duration: 2000,
          });
        })
  }

}

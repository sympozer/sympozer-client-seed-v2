import { Component, OnInit, Input } from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {MdSnackBar} from "@angular/material";
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  subscriptionHomepage: Subscription;
  subscriptionPhotoUrl: Subscription;
  subscriptionTwitter: Subscription;
  subscriptionLinkedin: Subscription;



  @Input()
  user : Object
  firstname: string
  lastname: string
  photoUrl: any
  homepage: any
  tweeter: any
  linkedin: any


  constructor(private apiExternalServer: ApiExternalServer,
              private snackBar: MdSnackBar) { 

      this.subscriptionHomepage = this.apiExternalServer.getHomepage().subscribe(homepage => {
            console.log(homepage) 
            this.homepage = homepage; 
        });

      this.subscriptionPhotoUrl = this.apiExternalServer.getAvatar().subscribe(photoUrl => {
            console.log(photoUrl) 
            this.photoUrl = photoUrl; 
        });

      this.subscriptionTwitter = this.apiExternalServer.getTwitter().subscribe(tweeter => {
            console.log(tweeter) 
            this.tweeter = tweeter; 
        });

      this.subscriptionLinkedin = this.apiExternalServer.getLinkedin().subscribe(linkedin => {
            console.log(linkedin) 
            this.linkedin = linkedin; 
        });



  }

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
          window.history.back()
        })
        .catch((err)=>{
          this.snackBar.open(err, "", {
            duration: 2000,
          });
        })
  }

}

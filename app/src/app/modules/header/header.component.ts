import {Component, Input, OnInit} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {Subscription} from 'rxjs/Subscription';
import {LocalStorageService} from 'ng2-webstorage';

@Component({
  selector: 'header-app',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  subscription: Subscription;
  userSubscription: Subscription;
  @Input() sidenav;
  hasLogged : any;
  public username: any
  private key_localstorage_username = "username_external_ressource_sympozer";
  constructor(private apiExternalServer: ApiExternalServer,
              private localStoragexx: LocalStorageService) {
  		this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
  			console.log(status) 
            this.hasLogged = status; 
        });

      this.userSubscription = this.apiExternalServer.getUsername().subscribe(firstname => {
        console.log(firstname)
        this.username = firstname;
      });
  }

  ngOnInit(): void{
  	this.hasLogged = this.apiExternalServer.checkUserLogin()
    if(this.username == undefined || this.username === ""){
      this.username = "User"
    }
  }

  logout(){
  	this.apiExternalServer.logoutUser();
  	this.apiExternalServer.sendLoginStatus(false)
    this.apiExternalServer.sendUsername("User")
  }


}

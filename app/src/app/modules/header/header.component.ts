import {Component, Input, OnInit} from '@angular/core';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'header-app',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  subscription: Subscription;
  @Input() sidenav;
  hasLogged : any;
  constructor(private apiExternalServer: ApiExternalServer) {
  		this.subscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
  			console.log(status) 
            this.hasLogged = status; 
        });
  }

  ngOnInit(): void{
  	this.hasLogged = this.apiExternalServer.checkUserLogin()
  }

  logout(){
  	this.apiExternalServer.logoutUser();
  	this.apiExternalServer.sendLoginStatus(false)
  }


}

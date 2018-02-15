import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';

import { BookmarkService } from '../../services/bookmark.service';
import { ApiExternalServer } from '../../services/ApiExternalServer';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {

  logSubscription: Subscription;
  userSubscription: Subscription;
  hasLogged: any;
  private interested: any;
  private going: any;
  public username: any;

  constructor(private _bookmarkServ: BookmarkService,
    private apiExternalServer: ApiExternalServer,
    private localStoragexx: LocalStorageService) {

    this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
      this.hasLogged = status;
    });
    this.userSubscription = this.apiExternalServer.getUsername().subscribe(firstname => {
      this.username = firstname;
    });
  }

  ngOnInit() {
    this.hasLogged = this.apiExternalServer.checkUserLogin();
    this.interested = 0;
    this.going = 0;
  }

  addInterested() {
    this.interested=this._bookmarkServ.addInterested(this.username);
  }

  addGoing() {
    this.going=this._bookmarkServ.addGoing(this.username);
  }

}

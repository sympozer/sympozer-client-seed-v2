import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {
  private interested;
  private going;
  constructor() { 
    this.interested=0;
    this.going=0;
  }

  ngOnInit() {
  }

  addInterested(){
    this.interested++;
  }

  addGoing(){
    this.going++;
  }

}

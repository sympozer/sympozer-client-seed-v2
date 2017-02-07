import { Component, OnInit}      from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }              from '@angular/common';


@Component({
  selector: 'search',
  template: `
    <h1> Search a {{testId}} </h1>
    <div *ngIf="this.testId == 'person'">
    <ul class="link">
      <li><a [routerLink]="['/persons']">by name </a></li> 
      <li><a [routerLink]="['/roles']">by role </a></li>  
      <li><a [routerLink]="['/organizations']">by organization </a></li> 
    </ul>
    </div>
    <div *ngIf="this.testId == 'publication'">
    <ul class="link">
      <li><a [routerLink]="['/publications']">by title </a> </li> 
      <li><a [routerLink]="['/authors']">by author </a> </li> 
      <li><a [routerLink]="['/categories-for-publications']">by track </a> </li> 
    </ul>
    </div>
    <div *ngIf="this.testId == 'organization'">
    <ul class="link">
      <li><a [routerLink]="['/organizations']">by name </a> </li> 
      <li><a [routerLink]="['/persons']">by person </a> </li> 
    </ul>
    </div>
    <div *ngIf="this.testId == 'event'">
    <ul class="link">
      <li><a [routerLink]="['/events']">by name </a> </li> 
      <li><a [routerLink]="['/categories']">by track </a> </li> 
      <li><a [routerLink]="['/locations']">by location </a> </li> 
    </ul>
    </div>
  `,
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{
  testId: String;

  constructor(
  private location: Location,
  private route: ActivatedRoute) {}

  ngOnInit(): void{
  	this.route.params.forEach((params: Params) => {
      console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
  		let id = params['id'];
  		this.testId = id;
  		//console.log("id : " + id); 
  	});
  }

}

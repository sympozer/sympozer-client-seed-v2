import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }              from '@angular/common';
import { LocalDAOService } from  '../../localdao.service';


@Component({
  selector: 'schedule',
  templateUrl: 'schedule.component.html'
})
export class ScheduleComponent implements OnInit{
  schedule;
  constructor(private location: Location,
  private route : ActivatedRoute,
  private DaoService : LocalDAOService) {
  }

  ngOnInit() {
    this.schedule = this.DaoService.query("getConferenceSchedule", null);
    console.log(this.schedule);


    /*this.route.params.forEach((params: Params) => {
  		let id = params['id'];
  		console.log("id : " + id); 
  	});*/
  }
}

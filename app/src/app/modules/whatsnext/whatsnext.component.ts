import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }              from '@angular/common';
import { LocalDAOService } from  '../../localdao.service';


@Component({
  selector: 'whatsnext',
  templateUrl: 'whatsnext.component.html'
})
export class WhatsNextComponent implements OnInit{
  schedules;
  constructor(private location: Location,
  private route : ActivatedRoute,
  private DaoService : LocalDAOService) {
  }

  ngOnInit() {
    this.schedules = this.DaoService.query("getWhatsNext", null);
    console.log(this.schedules);

  }
}

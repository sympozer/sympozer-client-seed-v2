import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import { Subject } from 'rxjs/Subject';
import {routerTransition} from '../../app.router.animation';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
  animations: [routerTransition()],
  host: {'[@routerTransition]': ''}
})
export class AuthorsComponent implements OnInit {
  authors;
  private searchTerms = new Subject<string>();
  constructor(
      private router: Router,
      private DaoService : LocalDAOService
  ) { }

  ngOnInit() {
    this.authors = this.DaoService.query("getAllAuthors", null);
    console.log(this.authors);

  }

  search(term: string): void {
    //this.searchTerms.next(term);                                                                                                                                                                                                                                                                                                                                                                                                                     rm);
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css']
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

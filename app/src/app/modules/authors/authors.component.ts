import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {Subject} from 'rxjs/Subject';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

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
    title: string = "Authors";

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.authors = [];
    }

    ngOnInit() {
        const that = this;
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        this.DaoService.query("getAllAuthors", null, (results) => {
            if (results) {
                const nodeIdPerson = results['?idPerson'];
                const nodeName = results['?name'];

                if (!nodeIdPerson || !nodeName) {
                    return false;
                }

                let id = nodeIdPerson.value;
                const name = nodeName.value;

                if (!id || !name) {
                    return false;
                }

                id = that.encoder.encode(id);
                if (!id) {
                    return false;
                }

                that.authors = that.authors.concat({
                    id: id,
                    name: name,
                });

                that.authors.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                });
            }
        });
    }

    search(term: string): void {
        //this.searchTerms.next(term);                                                                                                                                                                                                                                                                                                                                                                                                                     rm);
    }

}

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
    tabAuthors: Array<Object> = new Array();
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
        let authorMap = new Map();
        this.DaoService.query("getAllAuthors", null, (result) => {
            if (!result) return;
            const idPerson = result['?idPerson'].value;
            let author = authorMap.get(idPerson);
            if (author === undefined) {
                const fullName = result['?fullName'].value;
                const nodeGivenName = result['?givenName'];
                const nodeFamilyName = result['?familyName'];
                const sortName = (nodeGivenName && nodeFamilyName)
                               ? nodeFamilyName.value + ', ' + nodeGivenName.value
                               : fullName;
                const encodedId = that.encoder.encode(idPerson);
                author = {
                    id: encodedId,
                    name: fullName,
                    sortName: sortName,
                    publications: [],
                };
                authorMap.set(idPerson, author);
                that.authors = that.authors.concat(author);
                that.authors.sort((a, b) => {
                  return a.sortName > b.sortName ? 1 : -1;
                });
            }
            const idPubli = that.encoder.encode(result['?idPubli'].value);
            const title = result['?title'].value;
            author.publications = author.publications.concat({
              id: idPubli,
              label: title,
            });
            author.publications.sort((a,b) => {
              return a.label < b.label ? 1 : -1;
            });
        });
    }
}

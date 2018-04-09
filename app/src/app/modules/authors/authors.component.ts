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
        this.DaoService.query("getAllAuthors", null, (results) => {
            if (results) {
                const nodeIdPerson = results['?idPerson'];
                const nodeFullName = results['?fullName'];
                const nodeGivenName = results['?givenName'];
                const nodeFamilyName = results['?familyName'];

                if (!nodeIdPerson || !nodeFullName) {
                    return false;
                }

                let idBase = nodeIdPerson.value;
                const name = nodeFullName.value;
                const sortName = (nodeGivenName && nodeFamilyName)
                               ? nodeFamilyName.value + ', ' + nodeGivenName.value
                               : nodeFullName;

                if (!idBase || !name) {
                    return false;
                }

                const id = that.encoder.encode(idBase);
                if (!id) {
                    return false;
                }

                let person = {
                    id: id,
                    name: name,
                    sortName: sortName,
                    publications: [],
                };

                const find = that.authors.find((a) => {
                   return a.id === id;
                });

                if(find){
                    return false;
                }

                that.DaoService.query("getPublicationLink", {key: idBase}, (results) => {
                    const nodeLabel = results['?label'];
                    const nodeId = results['?id'];

                    if(nodeLabel && nodeId)
                    {
                        const label = nodeLabel.value;
                        let id = nodeId.value;

                        if(label && id)
                        {
                            id = this.encoder.encode(id);
                            if(!id){
                                return false;
                            }

                            person.publications = person.publications.concat({
                                label: label,
                                id: id,
                            });
                        }
                    }
                });

                that.authors = that.authors.concat(person);

                that.authors.sort((a, b) => {
                  return a.sortName > b.sortName ? 1 : -1;
                });
            }
        });
    }
}

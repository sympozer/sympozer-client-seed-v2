import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";

import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-publications',
    templateUrl: 'publications.component.html',
    styleUrls: ['publications.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsComponent implements OnInit {
    publications;
    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private encoder: Encoder) {
        this.publications = [];
    }

    ngOnInit() {
        const that = this;
        that.DaoService.query("getAllPublications", null, (results) => {
           if(results){
               const nodeId = results['?id'];
               const nodeLabel = results['?label'];

               if(!nodeId || !nodeLabel)
               {
                   return false;
               }

               let id = nodeId.value;
               const label = nodeLabel.value;

               if(!id || !label)
               {
                   return false;
               }

               id = that.encoder.encode(id);
               if(!id)
               {
                   return false;
               }

               that.publications.push({
                   id: id,
                   label: label,
               });
           }
        });
    }

}

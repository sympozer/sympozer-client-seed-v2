import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {routerTransition} from '../../app.router.animation';
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-categories',
    templateUrl: 'categories.component.html',
    styleUrls: ['categories.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class CategoriesComponent implements OnInit {
    public tracks = [];
    public subtracks = [];
    title: string = "Tracks";

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;
        const that = this;
        let seen = new Set();
        let trackMap = new Map();

        this.DaoService.query("getAllCategoriesForEvents", null, (results) => {
            console.log(results);
            if (results) {
                const nodeId= results['?sub'];
                if (!nodeId) {
                    return false;
                }

                let id = that.encoder.encode(nodeId.value);
                if (!id) {
                    return false;
                }
                if (seen.has(id)) {
                    return false;
                }
                seen.add(id);

                const label = results['?subL'].value;
                const superLabel = results['?superL'].value;
                let supertrack = trackMap.get(superLabel);
                if (supertrack === undefined) {
                    supertrack = {
                        label: superLabel,
                        subtracks: [],
                    }
                    that.tracks = that.tracks.concat(supertrack);
                    that.tracks.sort((a, b) => {
                        return a.label > b.label ? 1 : -1;
                    });
                    trackMap.set(superLabel, supertrack);
                }
                const subtrack = {
                  id: id,
                  label: label,
                };
                supertrack.subtracks.push(subtrack);
                supertrack.subtracks.sort((a, b) => {
                    return a.label > b.label ? 1 : -1;
                });
                that.tracks = that.tracks.concat(); // force GUI refresh

                that.subtracks = that.subtracks.concat(subtrack);
                // that.subtracks is only used for the search bar; no sort needed
            }
        });
    }

}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalDAOService} from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-locations',
    templateUrl: 'locations.component.html',
    styleUrls: ['locations.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class LocationsComponent implements OnInit {
    locations = [];

    constructor(private router: Router,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
    }

    ngOnInit() {
        const that = this;
        that.DaoService.query("getAllLocations", null, (results) => {
            if (results) {
                const nodeLocation = results['?location'];

                if (nodeLocation) {
                    const location = nodeLocation.value;

                    if (!location) {
                        return false;
                    }

                    const find = that.locations.find((l) => {
                        return l.location === location;
                    });

                    if (!find) {
                        that.locations = that.locations.concat({
                            location: location
                        });

                        that.locations.sort((a, b) => {
                            return a.location > b.location ? 1 : -1;
                        });
                    }
                }
            }

        });
    }
}

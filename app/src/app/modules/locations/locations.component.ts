import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { LocalDAOService } from  '../../localdao.service';
import {Encoder} from "../../lib/encoder";
@Component({
    selector: 'app-locations',
    templateUrl: 'locations.component.html',
    styleUrls: ['locations.component.css'],
})
export class LocationsComponent implements OnInit {
    locations;
    constructor(private router:Router,
                private DaoService : LocalDAOService,
                private encoder: Encoder) {
    }

    ngOnInit() {
        this.locations = this.DaoService.query("getAllLocations", null);
        for(let i in this.locations){
            this.locations[i].id = this.encoder.encodeForURI(this.locations[i].id);
        }
        console.log(this.locations);
    }

}

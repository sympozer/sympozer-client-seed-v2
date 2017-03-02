import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";

@Component({
    selector: 'app-organization',
    templateUrl: 'organization.component.html',
    styleUrls: ['organization.component.css'],
})
export class OrganizationComponent implements OnInit {
    private organization;
    private members = {};

    constructor(private router:Router,private route: ActivatedRoute,
                private DaoService: LocalDAOService,  private encoder: Encoder) {

    }

    ngOnInit() {
        console.log("Init Organization Component");

        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];
            let query = { 'key' : this.encoder.decodeForURI(id) };
            this.organization = this.DaoService.query("getOrganization", query);
            for(let i in this.organization.members){
                let query = { 'key' : this.organization.members[i] };
                this.members[i] = this.DaoService.query("getPersonLink",query);
            }

            console.log(this.organization);
        });
    }
}

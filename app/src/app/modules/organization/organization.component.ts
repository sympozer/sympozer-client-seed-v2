import { forEach } from "@angular/router/src/utils/collection";
import { Component, OnInit, Injectable } from "@angular/core";
import { Conference } from "../../model/conference";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { DataLoaderService } from "../../data-loader.service";
import { DBLPDataLoaderService } from "../../dblpdata-loader.service";
import { LocalDAOService } from "../../localdao.service";
import { Encoder } from "../../lib/encoder";
import { routerTransition } from '../../app.router.animation';
import { AppointmentService } from "../../services/appointment.service";


@Component({
    selector: 'app-organization',
    templateUrl: 'organization.component.html',
    styleUrls: ['organization.component.css'],
    animations: [routerTransition()],
    host: { '[@routerTransition]': '' }
})
@Injectable()
export class OrganizationComponent implements OnInit {
    public organization;
    public members = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private DaoService: LocalDAOService,
        private encoder: Encoder,
        private appointService: AppointmentService) {
        this.organization = {
            label: undefined,
        }

        this.members = [];
    }

    ngOnInit() {
        console.log("Init Organization Component");

        const that = this;
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            let name = params['name'];

            if (!id || !name) {
                return false;
            }

            id = that.encoder.decode(id);
            if (!id) {
                return false;
            }

            let query = { 'key': id };
            this.DaoService.query("getOrganization", query, (results) => {
                if (results) {
                    const nodeLabel = results['?label'];
                    if (nodeLabel) {
                        const label = nodeLabel.value;
                        if (!label) {
                            return false;
                        }

                        that.organization.label = label;

                        that.appointService.setSubject(label);

                        if (document.getElementById("page-title-p"))
                            document.getElementById("page-title-p").innerHTML = label;
                    }
                }
            });

            this.DaoService.query("getMemberPersonByOrganisation", query, (results) => {
                if (results) {
                    const nodeIdPerson = results['?idPerson'];
                    const nodeName = results['?name'];

                    if (!nodeName || !nodeIdPerson) {
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

                    const find = that.members.find((m) => {
                        return m.id === id;
                    });

                    if (find) {
                        return false;
                    }

                    that.members = that.members.concat({
                        id: id,
                        name: name,
                    });
                }
            });

            this.appointService.setReceivers(that.members);
        });
        // Set attribute for appointment service (User is null because I want to set it later)
        this.appointService.setAppointment(this.organization.label, null, this.members);
    }

}

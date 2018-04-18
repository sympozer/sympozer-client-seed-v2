import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {routerTransition} from '../../app.router.animation';

let cache: Array<Object> = null;

@Component({
    selector: 'app-organizations',
    templateUrl: './organizations.component.html',
    styleUrls: ['./organizations.component.css'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class OrganizationsComponent implements OnInit {
    public organizations;
    public title = 'Organizations';
    public tabOrgas: Array<Object> = [];

    constructor(private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.organizations = [];
    }

    ngOnInit() {
        if (document.getElementById('page-title-p')) {
            document.getElementById('page-title-p').innerHTML = this.title;
        }
        const that = this;

        if (cache) {
            this.organizations = cache;
            //console.log('Retrieved from cache.');
        } else {
            that.DaoService.query('getAllOrganizations', null, (results) => {
                if (results) {
                    const nodeId = results['?id'];
                    const nodeLabel = results['?label'];

                    if (nodeId && nodeLabel) {
                        const id = nodeId.value;
                        const label = nodeLabel.value;

                        if (id && label) {
                            const idEncoded = that.encoder.encode(id);
                            const labelEncoded = this.encoder.encode(label);

                            const find = that.organizations.find((o) => {
                                return o.id === idEncoded;
                            });

                            if (find) {
                                return false;
                            }

                            that.organizations = that.organizations.concat({
                                id: idEncoded,
                                label: label,
                                labelEncoded: labelEncoded
                            });

                            that.organizations.sort((a, b) => {
                                return a.label > b.label ? 1 : -1;
                            });
                        }
                    }
                }
            }, () => {
                cache = this.organizations;
            });
        }
    }
}

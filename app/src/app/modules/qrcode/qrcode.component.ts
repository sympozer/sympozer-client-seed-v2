import { Component } from '@angular/core';
import {LocalStorageService} from 'ng2-webstorage';
import {LocalDAOService} from "../../localdao.service";
import {DataLoaderService} from '../../data-loader.service';
import {Encoder} from "../../lib/encoder";

const sha1 = require('sha-1');

@Component({
    selector: 'app-qrcode',
    templateUrl: 'qrcode.component.html'
})
export class QrcodeComponent {
    elementType: 'url' | 'canvas' | 'img' = 'url';
    private key_localstorage_user = "user_external_ressource_sympozer";
    private id_localstorage_user = "id_external_ressource_sympozer";
    qrValue;
    tmp = false;

    constructor(private localStoragexx: LocalStorageService,
                private dataLoaderService: DataLoaderService,
                private encoder: Encoder,
                private DaoService: LocalDAOService) {
    }

    ngOnInit() {
        const that = this;
        let user = this.localStoragexx.retrieve(this.key_localstorage_user);
        let urlHost = window.location.protocol + '//' + window.location.host + window.location.pathname;
        let email = that.encoder.encode(user.email);
        let emailSha1 = sha1('mailto:' + email);
        that.DaoService.query("getAllPersons", null, (results) => {
            const name = user.firstname + ' ' + user.lastname;
            let encodename = that.encoder.encode(name);
            if (results) {
                const nodeId = results['?id'];
                const nodeFullName = results['?fullName'];

                //user in data set
                if (nodeFullName.value === name){
                    this.tmp = true;
                    let id1 = that.encoder.encode(nodeId.value);
                    let id = that.encoder.encode(id1);
                    this.qrValue = urlHost + '#/person/' + encodename + '/' + id;
                }
            }

            //user not in data set
            if (this.tmp === false){
                this.qrValue = urlHost + '#/participant/' + encodename + '/' + emailSha1;
            }
        });

    }
}
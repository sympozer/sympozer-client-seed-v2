import { Component } from '@angular/core';
import {LocalStorageService} from 'ng2-webstorage';
import {LocalDAOService} from "../../localdao.service";
import {DataLoaderService} from '../../data-loader.service';
import {Encoder} from "../../lib/encoder";

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

        that.DaoService.query("getAllPersons", null, (results) => {

            if (results) {
                const nodeId = results['?id'];
                const nodeName = results['?label'];
                const name = user.firstname + ' ' + user.lastname;
                //user in dataset
                if (nodeName.value === name){
                    this.tmp = true;
                    let id1 = that.encoder.encode(nodeId.value);
                    let id = that.encoder.encode(id1);
                    this.qrValue = 'https://sympozer.liris.cnrs.fr/www2018/#/person/' + user.firstname + '%20' + user.lastname + '/' + id;
                }
            }

            //user not in dataset
            if (this.tmp === false){
                let email = that.encoder.encode(user.email);
                this.qrValue = 'https://sympozer.liris.cnrs.fr/www2018/#/person/' + user.firstname + '%20' + user.lastname + '/' + email;
            }
        });

    }
}
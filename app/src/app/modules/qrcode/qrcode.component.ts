import { Component } from '@angular/core';
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'app-qrcode',
    templateUrl: 'qrcode.component.html'
})
export class QrcodeComponent {
    elementType: 'url' | 'canvas' | 'img' = 'url';
    private key_localstorage_user = "user_external_ressource_sympozer";
    private id_localstorage_user = "id_external_ressource_sympozer";
    qrValue;


    constructor(private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        let user = this.localStoragexx.retrieve(this.key_localstorage_user);
        let id = this.localStoragexx.retrieve(this.id_localstorage_user);
        console.log(user.firstname);
        this.qrValue = 'https://sympozer.liris.cnrs.fr/www2018/#/person/' + user.firstname + '/' + id;
    }

    //value: string = 'https://sympozer.liris.cnrs.fr/www2018/#/person/' + this.user.firstname + '/' + this.key_localstorage_user;

    //value: string = 'https://sympozer.liris.cnrs.fr/www2018/#/'
}
import {Component} from '@angular/core';
import {LocalStorageService} from "ng2-webstorage";

@Component({
    selector: 'app-user-info-component',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.scss']
})

export class UserInfoComponent {
    user;
    private key_localstorage_user = 'user_external_ressource_sympozer';

    constructor(private localStoragexx: LocalStorageService) {
    }

    ngOnInit() {
        this.user = this.localStoragexx.retrieve(this.key_localstorage_user);
    }
}

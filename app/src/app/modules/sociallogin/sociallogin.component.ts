import {Component, Inject, OnInit} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {RequestManager} from '../../services/request-manager.service';

@Component({
    selector: 'app-sociallogin',
    templateUrl: './sociallogin.component.html',
    styleUrls: ['./sociallogin.component.scss']
})
export class SocialloginComponent implements OnInit {

    constructor(private managerRequest: RequestManager,
                public dialogRef: MdDialogRef<SocialloginComponent>,
                @Inject(MD_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        const that = this;
        window.location.replace(that.data);
    }

}

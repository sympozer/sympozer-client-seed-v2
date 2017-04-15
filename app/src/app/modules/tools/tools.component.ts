import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MdSnackBar} from '@angular/material'
import {Location} from "@angular/common";
import {routerTransition} from "../../app.router.animation";
import {LocalDAOService} from "../../localdao.service";
import {isSuccess} from "@angular/http/src/http_utils";

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ToolsComponent implements OnInit {

    constructor(private location: Location,
                private route: ActivatedRoute,
                private localdao: LocalDAOService,
                public snackBar: MdSnackBar) {
    }

    ngOnInit() {
    }


    loadDataset() {
        console.log('load dataset');
        let isSuccess: boolean;
        isSuccess = this.localdao.loadDataset();
        if (isSuccess) {
            this.snackBar.open("Dataset properly loaded =)", "", {
                duration: 2000,
            });
        }
        else {
            this.snackBar.open("Dataset didn't load properly", "", {
                duration: 2000,
            });
        }
    }

    resetDataset() {
        try {
            this.localdao.resetDataset();
            this.snackBar.open("Dataset succesfully reset =)", "", {
                duration: 2000,
            });
        }
        catch (err) {
            console.log(err);
            this.snackBar.open("Reset failed please retry", "", {
                duration: 2000,
            });
        }
    }

    getStatus() {
        return this.isLoading;
    }
}

import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MdSnackBar} from '@angular/material'
import {Location} from "@angular/common";
import {routerTransition} from "../../app.router.animation";
import {LocalDAOService} from "../../localdao.service";
import {LocalStorageService} from 'ng2-webstorage';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class ToolsComponent implements OnInit {

    isLoading: boolean;
    title: string = "Tools";
    fontSize: number = 100;

    constructor(private location: Location,
                private route: ActivatedRoute,
                private localdao: LocalDAOService,
                public snackBar: MdSnackBar,
                private localStoragexx: LocalStorageService) {
        this.isLoading = false;
    }

    ngOnInit() {
        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = this.title;

        let storage = this.localStoragexx.retrieve("zoomLevel");

        if (storage) {
            this.fontSize = storage;
        }
    }


    loadDataset() {
        console.log('load dataset');
        this.isLoading = true;
        this.localdao.loadDataset().then(() => {
            this.snackBar.open("Dataset properly loaded =)", "", {
                duration: 2000,
            });
            console.log("ZEBIIIIII", this.isLoading);
            this.isLoading = false;
        }, () => {
            this.snackBar.open("Dataset didn't load properly", "", {
                duration: 2000,
            });
            this.isLoading = false;
        })
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

    decresaseFontSize() {
        if (this.fontSize > 60) {
            this.fontSize = this.fontSize - 10;
            document.documentElement.style.fontSize = this.fontSize + "%";
            this.localStoragexx.store("zoomLevel", this.fontSize);
        }
        else {
            this.snackBar.open("You reached the minimum zoom level", "", {
                duration: 2000,
            });
        }
    }

    increaseFontSize() {
        if (this.fontSize < 200) {
            this.fontSize = this.fontSize + 10;
            document.documentElement.style.fontSize = this.fontSize + "%";
            this.localStoragexx.store("zoomLevel", this.fontSize);
        }
        else {
            this.snackBar.open("You reached the maximum zoom level", "", {
                duration: 2000,
            });
        }
    }
}

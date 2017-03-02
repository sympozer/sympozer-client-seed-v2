import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';
import {GithubService} from "./services/github.service";
import {HylarManager} from './services/hylar.service';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private DaoService:LocalDAOService, private gitHubService:GithubService, private hylarManager:HylarManager) {

    }

    ngOnInit():void {
        this.DaoService.initialize();
        let persons = this.DaoService.query("getAllPersons", null);

        this.hylarManager.importData((data) => {
            console.log(data);
        });
        this.gitHubService.getDiff();
    }

}

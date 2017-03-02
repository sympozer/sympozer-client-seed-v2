import {Component, OnInit} from '@angular/core';
import {LocalDAOService} from  './localdao.service';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(private DaoService:LocalDAOService) {
    }

    ngOnInit():void {
        this.DaoService.initialize();
        let persons = this.DaoService.query("getAllPersons", null);
    }

}

import {Component, OnInit, Input, Renderer} from '@angular/core';
import {DataLoaderService} from '../../data-loader.service';
import {Router} from '@angular/router';

import {LocalDAOService} from '../../localdao.service';
import {DBLPDataLoaderService} from '../../dblpdata-loader.service';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-autocomplete',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {
    @Input() items: Array<Object>;
    @Input() namespace: String;
    @Input() seachFor: String;
    itemsFound = [];
    searchTerms = new Subject<string>();
    hasItem: boolean;
    hasSearchValue: boolean;
    isBigItems: boolean;

    constructor(private router: Router,
                private dataLoaderService: DataLoaderService,
                private DaoService: LocalDAOService,
                private  dBPLDataLoaderService: DBLPDataLoaderService,
                private renderer: Renderer) {
    }

    ngOnInit() {
        console.log("TrucTrucTruc");
        console.log(this.items);
        console.log(this.namespace);
        console.log(this.seachFor);
        this.searchTerms.debounceTime(300)
            .distinctUntilChanged()
            .switchMap(term => term);
        this.isBigItems = this.items.length > 10;
    }

    ngOnChanges(changes) {
        const items = changes.items;
        if (items){
            const currentValue = items.currentValue;
            if (currentValue){
                this.items = items.currentValue;
                this.isBigItems = this.items.length > 10;
            }
        }
    }

    search(term: string): void {
        this.searchTerms.next(term);
        this.itemsFound.length = 0;
        if (term !== '') {
            this.findItem(term);
        }
    }

    findItem(term: string): void {
        let isMatch = false;
        let match;
        let itemName;
        let itemCloneName;
        for (const key in this.items) {
            itemName = this.items[key][this.seachFor.toString()];
            match = itemName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toUpperCase().match(term.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toUpperCase());
            if (match) {
                isMatch = true;
                this.hasItem = true;
                const itemClone = JSON.parse(JSON.stringify(this.items[key]));
                const lastIndex = match.index + term.length;
                itemCloneName = itemClone[this.seachFor.toString()];
                itemClone.htmlName = itemCloneName.slice(0, match.index) + '<b>' + itemCloneName
                    .slice(match.index, lastIndex) + '</b>' + itemCloneName
                    .slice(lastIndex);
                this.itemsFound.push(itemClone);
            }
        }
        if (term.trim() !== '') {
            this.hasSearchValue = true;
            if (!isMatch) {
                this.hasItem = false;
            }
        } else {
            this.hasSearchValue = false;
        }
    }
}

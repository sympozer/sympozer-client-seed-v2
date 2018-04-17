import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {LocalDAOService} from '../../localdao.service';
import {Encoder} from '../../lib/encoder';
import {routerTransition} from '../../app.router.animation';

let cache: Array<Object> = null;

@Component({
    selector: 'app-publication-by-keywords',
    templateUrl: 'keywords.component.html',
    styleUrls: ['keywords.component.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class KeywordsComponent implements OnInit {
    title = 'Keywords';
    public keywords;
    public publications;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.keywords = new Set();
        this.publications = [];
    }

    ngOnInit() {
        const that = this;
        if (cache) {
            this.keywords = cache;
            console.log('Retrieved from cache.');
        } else {
            that.DaoService.query('getAllKeywords', null, (results) => {
                if (results) {
                    const nodeKeyword = results['?keywords'];

                    if (nodeKeyword) {
                        const value = nodeKeyword.value;

                        if (value && value.length > 0) {
                            if (!that.keywords.has(value)) {
                                that.keywords.add(value);

                                const array = Array.from(that.keywords).sort();
                                that.keywords = new Set(array);
                            }
                        }
                    }
                }
            }, () => {
                cache = this.keywords;
            });
        }
    }
}

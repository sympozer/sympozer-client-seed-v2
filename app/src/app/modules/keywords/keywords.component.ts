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
    tabKeywords: Array<Object> = [];
    keywords;
    public publications;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private DaoService: LocalDAOService,
                private encoder: Encoder) {
        this.keywords = [];
        this.publications = [];
    }

    ngOnInit() {
        const that = this;
        if (cache) {
            this.keywords = cache;
            //console.log('Retrieved from cache.');
        } else {
            that.DaoService.query('getAllKeywords', null, (results) => {
                if (results) {
                    const nodeKeyword = results['?keywords'];

                    if (nodeKeyword) {
                        const id = "";
                        const value = nodeKeyword.value;
                        const valueEncoded = this.encoder.encode(value);
                        

                        const val = {
                            id: id,
                            value : value,
                            valueEncoded : valueEncoded,
                        };

                        if (val && val.value.length > 0) {
                                that.keywords = that.keywords.concat(val);
                        }

                        that.keywords.sort((a, b) => {
                            return a.value > b.value ? 1 : -1;
                        });
                    }
                }
            }, () => {
                cache = this.keywords;
            });
        }
    }
}

import {forEach} from "@angular/router/src/utils/collection";
import {Component, OnInit} from "@angular/core";
import {Conference} from "../../model/conference";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {DataLoaderService} from "../../data-loader.service";
import {DBLPDataLoaderService} from "../../dblpdata-loader.service";
import {LocalDAOService} from "../../localdao.service";
import {Encoder} from "../../lib/encoder";
import {routerTransition} from '../../app.router.animation';

@Component({
    selector: 'app-publication-by-keywords',
    templateUrl: 'publications-by-keywords.html',
    styleUrls: ['publications-by-keywords.scss'],
    animations: [routerTransition()],
    host: {'[@routerTransition]': ''}
})
export class PublicationsByKeywords implements OnInit {
    title: string = "Keywords";
    public keywords;
    public publications;
    public tab : Array<Object> = new Array();

    constructor(private router: Router, private route: ActivatedRoute,
                private DaoService: LocalDAOService, private encoder: Encoder) {
        this.keywords = new Set();
        this.publications = [];
    }

    ngOnInit() {
        const that = this;
        that.DaoService.query("getAllKeywords", null, (results) => {
            if(results){
                const nodeKeyword = results['?keywords'];

                if(nodeKeyword){
                    const value = nodeKeyword.value;
                    const valueEncoded = this.encoder.encode(value);
                    const val = {
                        value : value,
                        valueEncoded : valueEncoded,
                    };

                    if(value && value.length > 0){
                        if(!that.keywords.has(value)){
                            that.keywords.add(val);


                            const array = Array.from(that.keywords).sort(function(a:any, b:any){
                                
                                /*
                                let nameA=a.value.toLowerCase(), nameB=b.value.toLowerCase();
                                if (nameA < nameB) //sort string ascending
                                 return -1;
                                if (nameA > nameB)
                                 return 1;
                                return 0; //default return value (no sorting)
                                */
                               return (a.value).localeCompare(b.value);
                            });
                            that.keywords = new Set(array);

                            
                        }
                    }
                }
            }
        });
    }

    search(keyword){
        const that = this;
        that.publications = [];
        that.DaoService.query("getPublicationsByKeyword", {
            keyword: keyword
        }, (results) => {
           if(results){
               const nodeId = results['?id'];
               const nodeLabel = results['?label'];

               if(nodeId && nodeLabel){
                   let id = nodeId.value;
                   const label = nodeLabel.value;

                   if(id && label){
                       id = that.encoder.encode(id);
                       const labelEncoded = this.encoder.encode(label);
                       if(id){
                           that.publications.push({
                               id: id,
                               label: label,
                               labelEncoded : labelEncoded,
                           });

                           that.publications.sort((a, b) => {
                               return a.label > b.label ? 1 : -1;
                           });
                       }
                   }
               }
           }
        });
    }
}

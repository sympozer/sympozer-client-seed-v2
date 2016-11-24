
import {Person} from "./person";
import {Publication} from "./publication";
import {Organization} from "./organization";
import {Category} from "./category";
export class Conference {
    persons:Person[];
    locations:Location[];
    publications:Publication[];
    organizations:Organization[];
    events:Event[];
    categories:Category[];
}

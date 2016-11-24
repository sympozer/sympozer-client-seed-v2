import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


@Injectable()
export class PersonService {

  constructor(private http: Http) {}

}
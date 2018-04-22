import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {Encoder} from '../../lib/encoder';


@Injectable()
export class ParticipantService {

  constructor(
      private http: Http,
      private encoder: Encoder
  ) {

  }

  defaultPerson = () => {
    return {
      publications: [],
      roles: [],
      publiConf: [],
      orgas: []
    };
  }


}

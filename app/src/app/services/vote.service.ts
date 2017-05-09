import { Component } from '@angular/core';
import {Http} from '@angular/http';
import {Injectable} from "@angular/core";
import {Config} from '../app-config'
import {ManagerRequest} from "./ManagerRequest";
import {LocalStorageService} from 'ng2-webstorage';
import {Encoder} from "../lib/encoder";

@Injectable()
export class VoteService {

  private key_localstorage_token = "token_external_ressource_sympozer";
  private key_localstorage_vote = "hasVoted"

  constructor(private http: Http,
              private managerRequest: ManagerRequest,
              private localStoragexx: LocalStorageService,
              private encoder: Encoder) {

  }

  /**
   * Test if the trackName is a voting type
   * @param trackName
   * @returns {boolean}
   */
  isTrackVotable = (trackName) => {
    for(var i = 0; i < Config.vote.tracks.length; i++) {
      let uri = this.encoder.encode(Config.vote.tracks[i])
      console.log(uri)
      console.log(trackName)
      if(uri === trackName)
        return true;
    }
    return false;
  }


  /**
   * Vote to the track
   * @param id_ressource
   * @returns {Promise<T>}
   */
  vote = (id_ressource) => {
    return new Promise((resolve, reject) => {
      console.log("vote called")
      if (!id_ressource || id_ressource.length === 0) {
        return reject('Erreur lors de la récupération de l\'identifiant de la ressource');
      }

      const that = this;
      const token = that.localStoragexx.retrieve(that.key_localstorage_token);
      if (!token || token.length === 0) {
        return reject('Vous devez vous connectez avant de pouvoir voter');
      }

      that.managerRequest.get_safe(Config.externalServer.url + '/api/vote?token=' + token + '&id_ressource=' + id_ressource)
          .then((request) => {
            if (request && request._body) {
              that.localStoragexx.store(that.key_localstorage_vote, true);
              return resolve(true);
            }

            return reject(null);
          })
          .catch((request) => {
            return reject(request);
          });
    });
  };




};
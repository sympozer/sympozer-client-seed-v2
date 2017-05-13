import { Component } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
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
      let uri = Config.vote.tracks[i]
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
  vote = (id_track, id_publi) => {
    return new Promise((resolve, reject) => {
      console.log("vote called")
      if (!id_publi || id_publi.length === 0) {
        return reject('Erreur lors de la récupération de l\'identifiant de la ressource');
      }

      if (!id_track || id_track.length === 0) {
        return reject('Erreur lors de la récupération de l\'identifiant de la track');
      }

      const that = this;
      const token = that.localStoragexx.retrieve(that.key_localstorage_token);
      if (!token || token.length === 0) {
        return reject('Vous devez vous connectez avant de pouvoir voter');
      }
      let bodyRequest = {
        id_track: id_track,
        id_ressource: id_publi,
        token: token
      }

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      that.managerRequest.post_safe(Config.externalServer.url + '/api/vote', bodyRequest)
          .then((request) => {
            if (request && request._body) {
              console.log(request)
              let votedTracks = JSON.parse(that.localStoragexx.retrieve(that.key_localstorage_vote))
              if(request._body!=="OK"){
                let responseBody = JSON.parse(request._body)
                if(responseBody && responseBody.error){
                  console.log("entered in error response body error")
                  console.log(request.status)
                  if(request.status === 403){
                    console.log(votedTracks[0])
                    if(!this.isTrackVoted(id_publi)){
                      votedTracks.push(id_publi)
                    }
                    that.localStoragexx.store(that.key_localstorage_vote, JSON.stringify(votedTracks));
                    reject(request.status)
                  }
                  reject(responseBody.error) 
                }
              }

              console.log(votedTracks)
              if(!this.isTrackVoted(id_track)){
                votedTracks.push(id_track)
              }
              console.log(votedTracks)
              that.localStoragexx.store(that.key_localstorage_vote, JSON.stringify(votedTracks));
              return resolve(true);
            }

            return reject(null);
          })
          .catch((request) => {
            return reject(request);
          });


    });
  };

  votedPublications(){
    return new Promise((resolve, reject) => {
      const that = this;
      const token = that.localStoragexx.retrieve(that.key_localstorage_token);
      if (!token || token.length === 0) {
        return reject('Vous devez vous connectez avant de pouvoir voter');
      }
      that.managerRequest.get_safe(Config.externalServer.url + '/api/user/vote/information?token=' + token )
          .then((request) => {
            if (request && request._body) {
              that.localStoragexx.store(that.key_localstorage_vote, request._body);
              return resolve(true);
            }

            return reject(null);
          })
          .catch((request) => {
            return reject(request);
          });

    });
  }

  isTrackVoted(idTrack){
    let votedPublications = JSON.parse(this.localStoragexx.retrieve(this.key_localstorage_vote))
    for(var i = 0; i < votedPublications.length; i++){
      if(votedPublications[i] === idTrack){
        return true
      }
    }
    return false
  }




};
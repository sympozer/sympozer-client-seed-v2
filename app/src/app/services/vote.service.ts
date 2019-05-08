
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Config} from '../app-config';
import {RequestManager} from './request-manager.service';
import {LocalStorageService} from 'ngx-webstorage';
import {Encoder} from '../lib/encoder';
import {ApiExternalServer} from './ApiExternalServer';


@Injectable()
export class VoteService {

  private key_localstorage_token = 'token_external_ressource_sympozer';
  private key_localstorage_user = 'user_external_ressource_sympozer';
  private key_localstorage_sessionState = 'sessionstate_external_ressource_sympozer';
  private key_localstorage_election = 'election_external_ressource_sympozer';
  private key_localstorage_vote = 'hasVoted';

  constructor(private http: HttpClient,
              private managerRequest: RequestManager,
              private localStoragexx: LocalStorageService,
              private encoder: Encoder, private apiExternalServer: ApiExternalServer) {

  }

  /**
   * Test if the trackName is a voting type
   * @param trackName
   * @returns {boolean}
   */
  isTrackVotable = (trackName) => {
    for (let i = 0; i < Config.vote.tracks.length; i++) {
      const uri = Config.vote.tracks[i];
      if (uri ===  this.encoder.decode(trackName)) {
          return true;
      }
    }
    return false;
  }


  /**
   * Vote to the track
   * @param id_ressource
   * @returns {Promise<T>}
   */
  vote = (id_track, id_publi) => {
    id_track = this.encoder.decode(id_track)

    let user = this.localStoragexx.retrieve(this.key_localstorage_user);
    let token = this.localStoragexx.retrieve(this.key_localstorage_sessionState);
    let election = this.localStoragexx.retrieve(this.key_localstorage_election);


    this.apiExternalServer.createVote(election.id,user.id,token,id_track);
    /*return new Promise((resolve, reject) => {
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
      console.log(token);
        const bodyRequest = {
            'token': token,
            'id_publication': id_publi,
            'id_track': id_track
        };
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        const options = {
          headers: headers,
          params: new HttpParams()
        };
        that.managerRequest.post(Config.vote.url + '/api/vote', bodyRequest, options)
          .then((response) => {
            if (response && response.toString()) {
              console.log(response.toString());
                const votedTracks = [];
              if (that.localStoragexx.retrieve(that.key_localstorage_vote) !== null ) {
                  votedTracks.push(that.localStoragexx.retrieve(that.key_localstorage_vote));
              }else {
                  that.localStoragexx.store(that.key_localstorage_vote, []);
              }
              console.log(votedTracks);
              if (response.toString() !== 'OK') {
                const responseBody = JSON.parse(response.toString());
                console.log(responseBody);
                console.log(responseBody.err);
                if (responseBody && responseBody.error) {
                  console.log('entered in error response body error');
                  (err : any)=>{
                    console.log(err.status);
                    if (err.status === 403) {
                      if (!this.isTrackVoted(id_track)) {
                        votedTracks.push(id_track);
                      }
                      that.localStoragexx.store(that.key_localstorage_vote, votedTracks);
                      reject(err.status);
                    }
                  }
                  reject(responseBody.error);
                }
              }
              if (!this.isTrackVoted(id_track)) {

                votedTracks.push(id_track);
              }
              console.log(votedTracks.length);
              that.localStoragexx.store(that.key_localstorage_vote, votedTracks);
              return resolve(true);
            }

            return reject(null);
          })
          .catch((request) => {
            return reject(request);
          })
      ;
    });*/
  }

  votedPublications(id_track) {
    return new Promise((resolve, reject) => {
      const that = this;
      const token = that.localStoragexx.retrieve(that.key_localstorage_token);
      if (!token || token.length === 0) {
        return reject('Vous devez vous connectez avant de pouvoir voter');
      }
      id_track = this.encoder.decode(id_track)
        console.log(id_track);
      that.managerRequest.get(Config.vote.url +  '/api/vote/information?token=' + token + '&id_track=' + id_track )
          .then((response) => {
            console.log(response);
            if (response && response) {
              that.localStoragexx.store(that.key_localstorage_vote, response);
              return resolve(true);
            }

            return reject(null);
          })
          .catch((error) => {
            return reject(error);
          });

    });
  }

  isTrackVoted(idTrack) {
    const votedPublications = this.localStoragexx.retrieve(this.key_localstorage_vote);
    console.log(JSON.stringify(votedPublications))
    for (const i in votedPublications) {
      if (votedPublications[i] === this.encoder.decode(idTrack)) {
        return true;
      }
    }
    return false;
  }
}


import {Http, Headers, RequestOptions} from '@angular/http';
import {Injectable} from '@angular/core';
import {Config} from '../app-config';
import {RequestManager} from './request-manager.service';
import {LocalStorageService} from 'ng2-webstorage';
import {Encoder} from '../lib/encoder';

@Injectable()
export class VoteService {

  private key_localstorage_token = 'token_external_ressource_sympozer';
  private key_localstorage_vote = 'hasVoted';

  constructor(private http: Http,
              private managerRequest: RequestManager,
              private localStoragexx: LocalStorageService,
              private encoder: Encoder) {

  }

  /**
   * Test if the trackName is a voting type
   * @param trackName
   * @returns {boolean}
   */
  isTrackVotable = (trackName) => {
    console.log('track---->' + trackName);
    for (let i = 0; i < Config.vote.tracks.length; i++) {
      const uri = Config.vote.tracks[i];
      if (uri ===  this.encoder.decode(trackName))
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
      console.log('vote called');
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
        const bodyRequest = {
            'token': token,
            'id_publication': id_publi,
            'id_track': id_track
        };
        const headers = new Headers({
            'Content-Type': 'application/json',
        });
        const options = new RequestOptions({ headers: headers });
        that.managerRequest.post(Config.vote.url + '/api/vote', bodyRequest, options)
          .then((response) => {
            console.log('la reponse est' + response.text());
            if (response && response.text()) {
              console.log(response.text());
                let votedTracks;
              if (that.localStoragexx.retrieve(that.key_localstorage_vote) == null) {
                   votedTracks = [];
              } else {
                   votedTracks = [that.localStoragexx.retrieve(that.key_localstorage_vote)];
              }
              console.log(votedTracks);
              if (response.text() !== 'OK') {
                const responseBody = JSON.parse(response.text());
                console.log(responseBody);
                console.log(responseBody.err);
                if (responseBody && responseBody.error) {
                  console.log('entered in error response body error');
                  console.log(response.status);
                  if (response.status === 403) {
                    console.log(votedTracks[0]);
                    if (!this.isTrackVoted(id_track)) {
                      votedTracks.push(id_track);
                    }
                    console.log(votedTracks)
                    that.localStoragexx.store(that.key_localstorage_vote, votedTracks);
                    reject(response.status);
                  }
                  reject(responseBody.error);
                }
              }
              console.log('responsebdy ==OK');
              if (!this.isTrackVoted(id_track)) {

                votedTracks.push(id_track);
              }
              console.log(votedTracks);
              that.localStoragexx.store(that.key_localstorage_vote, votedTracks);
              return resolve(true);
            }

            return reject(null);
          })
          .catch((request) => {
            return reject(request);
          })
      ;
    });
  }

  votedPublications() {
    return new Promise((resolve, reject) => {
      const that = this;
      const token = that.localStoragexx.retrieve(that.key_localstorage_token);
      if (!token || token.length === 0) {
        return reject('Vous devez vous connectez avant de pouvoir voter');
      }
      that.managerRequest.get(Config.externalServer.url + '/api/user/vote/information?token=' + token )
          .then((response) => {
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
    console.log('votedPUb' + votedPublications);
    console.log('votedPUb' + idTrack);
    for (const i in votedPublications) {
      if (votedPublications[i] === idTrack) {
        return true;
      }
    }
    return false;
  }
}

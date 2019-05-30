
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Config} from '../app-config';
import {RequestManager} from './request-manager.service';
import {LocalStorageService} from 'ngx-webstorage';
import {Encoder} from '../lib/encoder';
import {ApiExternalServer} from './ApiExternalServer';
import {MdSnackBar} from '@angular/material';
import {LocalDAOService} from '../localdao.service';


@Injectable()
export class VoteService {

  private key_localstorage_token = 'token_external_ressource_sympozer';
  private key_localstorage_user = 'user_external_ressource_sympozer';
  private key_localstorage_sessionState = 'sessionstate_external_ressource_sympozer';
  private key_localstorage_election = 'election_external_ressource_sympozer';
  private key_localstorage_ballotsByElection = 'ballotsbyelection_external_ressource_sympozer';
  private key_localstorage_elections = 'elections_external_ressource_sympozer';

  private key_localstorage_vote = 'hasVoted';

<<<<<<< HEAD
  constructor(private http: HttpClient,
=======
  constructor(private http: Http, private DaoService: LocalDAOService,
>>>>>>> 4d1bf28... vote quasi fini jute resultats
              private managerRequest: RequestManager,
              private localStoragexx: LocalStorageService,
              private encoder: Encoder, private apiExternalServer: ApiExternalServer, private snackBar: MdSnackBar) {

  }

  publications;
  tabPubli: Array<Object> = new Array();

  getElections = (idElections, elec, elections) => {
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});

    this.http.get("./assets/vote.json").map(data => data.json() as Array<string>).subscribe((data) => {
                
      data['elections'].forEach(elem => {
        idElections.push(elem.id);
      });
      if (idElections.length != 0) {
          idElections.forEach(element => {
          this.showElectionById(elec, elections, element);        

        });
      }
      
    }); 
    
  }

  showElectionById = (elec, elections, Id) => {
    let isFinish = false;
    let myDate = new Date();
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});

    this.apiExternalServer.showElectionById(Id).then(() => {      
      elec = this.localStoragexx.retrieve(this.key_localstorage_election);
      let user = this.localStoragexx.retrieve(this.key_localstorage_user);
      let token =  this.localStoragexx.retrieve(this.key_localstorage_sessionState);
      
      
      if (elec) {

        let id = elec['_id'].$id;

        let name = elec['name'];

        id = this.encoder.encode(id);

        let beginDate = elec['dateBegin'].sec;

        let endDate = elec['dateEnd'].sec;

        beginDate = parseFloat(beginDate);
        endDate = parseFloat(endDate);
        
        let newDate = (myDate.valueOf()/1000)-(myDate.getTimezoneOffset()*60);

        if (beginDate <= newDate && endDate <= newDate) {
          isFinish = true;
        }

        let description = elec['description'];   
        let winner = null ;
        let max = 0;        
        
      let publicationsBuffer = [];
        let seen = new Set();
        this.DaoService.query('getAllPublications', null, (results) => {
            if (results) {
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if (!nodeId || !nodeLabel) {
                    return false;
                }

                let id = nodeId.value;
                const label = nodeLabel.value;

                if (!id || !label) {
                    return false;
                }
                
                if (!id) {
                    return false;
                }

                if (seen.has(id)) { return false; }
                seen.add(id);

                publicationsBuffer.push({
                    id: id,
                    label: label,
                });

            }
        });      
        this.apiExternalServer.showBallotsByElection(Id, user.id, token)
        .then(() => {
            let ballots = this.localStoragexx.retrieve(this.key_localstorage_ballotsByElection);
            publicationsBuffer.forEach(function(elem) {          
            
              ballots.forEach(function(element) {              
                  
                    if(element.count > max) {
                      max = element.count;
                      winner = element.idCandidate;                    

                    }
              });
              
              if (elem.id == winner) {
                winner = elem.label;
                console.log("winner :" + winner)
              }
            });

        });        
        console.log("winner :" + winner)

        elections.push({
          id: id,
          name: name,
          description: description,
          isFinish: isFinish,
          winner : winner
        });
      }

      elections.sort((a, b) => {
        return a.label > b.label ? 1 : -1;
      });

      this.localStoragexx.store(this.key_localstorage_elections, elections);

    });
  }


  getElectionsForElectionView = (datas, election) => {   
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});   

    this.http.get("./assets/vote.json").map(data => data.json() as Array<string>).subscribe((data) => {

      let results;
      let elec;

      data['elections'].forEach(element => {
        results = this.showElectionByIdForElectionView(elec,election, element);
        if(results){
          const nodeName = results['name'];
          const nodeDescription = results['description'];
          const nodeCandidates = results['candidates'];
          const nodeIsFinish = results['isFinish'];

          const name = nodeName.value;
          const description = nodeDescription.value;
          const candidates = nodeCandidates.value;
          const isFinish = nodeIsFinish.value;


          election.name = name;
          election.description = description;
          election.candidates = candidates;
          election.isFinish = isFinish;

        }
      });
    });
    
  }

  showElectionByIdForElectionView = (elec, election, Id) => {
    let user = this.localStoragexx.retrieve(this.key_localstorage_user);
    let token = this.localStoragexx.retrieve(this.key_localstorage_sessionState);
    let ballots;
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});


    this.apiExternalServer.showElectionById(Id).then(() => {      
      elec = this.localStoragexx.retrieve(this.key_localstorage_election);
      let isFinish = false;
      let myDate = new Date();
      
      if (elec) {

        let name = elec['name'];
        let description = elec['description'];
        let candidates = [];
        let beginDate = elec['dateBegin'].sec;

        let endDate = elec['dateEnd'].sec;

        beginDate = parseFloat(beginDate);
        endDate = parseFloat(endDate);
        
        let newDate = (myDate.valueOf()/1000)-(myDate.getTimezoneOffset()*60);

        if (beginDate <= newDate && endDate <= newDate) {
          isFinish = true;
        }

        let publicationsBuffer = [];
        let seen = new Set();
        this.DaoService.query('getAllPublications', null, (results) => {
            if (results) {
                const nodeId = results['?id'];
                const nodeLabel = results['?label'];

                if (!nodeId || !nodeLabel) {
                    return false;
                }

                let id = nodeId.value;
                const label = nodeLabel.value;

                if (!id || !label) {
                    return false;
                }
                
                if (!id) {
                    return false;
                }

                if (seen.has(id)) { return false; }
                seen.add(id);

                publicationsBuffer.push({
                    id: id,
                    label: label,
                });

            }
        });

        this.apiExternalServer.showBallotsByElection(Id, user.id, token)
        .then(() => {
            ballots = this.localStoragexx.retrieve(this.key_localstorage_ballotsByElection);
            publicationsBuffer.forEach(function(element) {
                ballots.forEach(function(elem) {

                  if(element.id == elem.idCandidate) {
                    candidates.push({ 
                      id : element.id,
                      label: element.label,
                      nbVote: elem.count
                    });

                  }

                });
            });

            if (!name || !description || !candidates) {
                return false;
            }
      });

        election.name = name;
        election.description = description;
        election.candidates = candidates;
        election.isFinish = isFinish;

        if (document.getElementById("page-title-p"))
            document.getElementById("page-title-p").innerHTML = name;     

      }

    });
  }


  CompareIdShowBallotsByElection = (idElection, ballots, publicationId, ElectionsForPublication) => {
    let user = this.localStoragexx.retrieve(this.key_localstorage_user);
    let token = this.localStoragexx.retrieve(this.key_localstorage_sessionState);
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});

    this.apiExternalServer.showBallotsByElection(idElection,user.id, token)
        .then(() => {
            ballots = this.localStoragexx.retrieve(this.key_localstorage_ballotsByElection);
            let elections = this.localStoragexx.retrieve(this.key_localstorage_elections);

            ballots.forEach(elem => {
               
                if(elem.idCandidate == publicationId) {

                  this.apiExternalServer.showElectionById(elem.idElection).then(() => {      
                   let elec = this.localStoragexx.retrieve(this.key_localstorage_election);

                   if (elec) {
                    elections.forEach(element => {
                      console.log("element: "+ JSON.stringify(element));
                      console.log("elec: "+ JSON.stringify(elec));


                              if(element.id == elec['_id'].$id && !element.isFinish) {
                                console.log("dans if");

                                let name = elec['name'];
                                let id = elec['_id'].$id;
                                ElectionsForPublication.push({
                                  id: id,
                                  name: name
                                });
                                              
                                if (!name) {
                                    return false;
                                }
                                
                              }
            
                      });
                            
                    }
              
                  });                  
                }
            });
        })
        .catch((resp) => {
            console.log(resp);
            this.snackBar.open(JSON.parse(resp._body)['message'], '', {
                duration: 3000,
            });
        });
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

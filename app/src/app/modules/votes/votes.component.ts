import { Component, OnInit, Input } from '@angular/core';
import {VoteService} from '../../services/vote.service';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {LocalStorageService} from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';
import {MdSnackBar} from '@angular/material';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {Config} from '../../app-config';
import {Http, Response, Headers,RequestOptions} from '@angular/http';
import { elementAt } from 'rxjs/operator/elementAt';
import {Encoder} from '../../lib/encoder';

@Component({
  selector: 'votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.scss']
})
export class VotesComponent implements OnInit {
  title = 'Elections';
  token;
  subscription: Subscription;
  logSubscription: Subscription;
  canVote: any;
  testId: string;
  hasLogged: any;
  datas: Array<string>;
  tabElec: Array<Object> = new Array();
  idElections: Array<string> = new Array();
  elections;
  elec;
  electionsBuffer = [];
  myDate = new Date();
  isFinish = false;
 

  /***
   * Retrive the track Id and the event Type from the publication
   */
  @Input('idTrack') idTrack: Object;
  @Input('idPublication') idPublication: Object;
  @Input('typeEvent') typeEvent: String;
  public votable = false;
  public hasVoted = false;
  public justVoted = false;
  private key_localstorage_token = 'token_external_ressource_sympozer';
  private key_localstorage_vote = 'hasVoted';
  private key_localstorage_user = 'user_external_ressource_sympozer';
  private key_localstorage_sessionState= 'sessionstate_external_ressource_sympozer';
  private key_localstorage_election = 'election_external_ressource_sympozer';
  // private key_localstorage_begin_vote = 'beginVote';
  constructor(private voteService: VoteService,
              private localStoragexx: LocalStorageService,
              private snackBar: MdSnackBar,
              private apiExternalServer: ApiExternalServer, private location: Location,
              private route: ActivatedRoute, private encoder:Encoder,
              private http: Http) {

      this.subscription = this.apiExternalServer.getAuthorizationVoteStatus().subscribe(status => {
            console.log(status);
            this.canVote = status;
        });
        this.logSubscription = this.apiExternalServer.getLoginStatus().subscribe(status => {
          this.hasLogged = status;
      });
      this.elections = [];
      
      console.log("date getTime/1000 : " + this.myDate.getTime()/1000);
      
  }


  /**
   * Retrieve login token and all voting credentials on init
   */


   
  ngOnInit() {

    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});
    let options = new RequestOptions({ headers: headers });


    this.http.get(Config.vote.urlVotes).map(data => data.json() as Array<string>).subscribe((data) => {
      console.log("data elections : " + JSON.stringify(data['elections']));
      this.datas = data;
      
      data['elections'].forEach(elem => {
        this.idElections.push(elem.id);
      });
      if (this.idElections.length != 0) {
        this.idElections.forEach(element => {
          console.log("element: " + element);
          this.showElectionById(element);        

        });
      }
      
    });     

    this.route.params.forEach((params: Params) => {
      console.log(this.route); // snapshot -> _urlSegment -> segments (0, 1, etc.)
      let id = params['id'];
      this.testId = id;
    });
    this.token = this.localStoragexx.retrieve(this.key_localstorage_token);
      // let votedPublications = this.localStoragexx.retrieve(this.key_localstorage_vote);
      // votedPublications = JSON.parse(votedPublications);
      console.log('jsute on init' + this.idTrack)
      this.voteService.votedPublications(this.idTrack)
          .then((votedPublications) => {
              console.log(votedPublications);
          })
          .catch((err) => {
              console.log(err);
          })
    this.canVote = true;
  }

  /**
   * Invoke voting service
   */
  vote = () => {
    const that = this;
    this.voteService.vote(this.idTrack, this.idPublication);
        /*.then(() => {
          this.snackBar.open('Vote successful', '', {
              duration: 2000,
          });
          that.hasVoted = true;
          that.justVoted = true;
        })
        .catch((err) => {
          console.log(err);
          if (err === 403) {
            that.hasVoted = true;
            this.snackBar.open('You have already voted', '', {
              duration: 2000,
            });
          }
          if (err.status === 403) {
            this.snackBar.open('Vote has not began try again on Wednesday 25 April', '', {
                duration: 2000,
            });
          }

        });*/
    }

    createElection(name, description, idResource, dateBegin, dateEnd, listCandidates) {
      let user = this.localStoragexx.retrieve(this.key_localstorage_user);
      let token = this.localStoragexx.retrieve(this.key_localstorage_sessionState);
      this.apiExternalServer.createElection(user.id, token, name, description, idResource, dateBegin, dateEnd, ["1","5"])
          .then((user) => {
              this.snackBar.open('Election created', '', {
                  duration: 2000,
              });


          })
          .catch((resp) => {
              console.log(resp);
              this.snackBar.open(JSON.parse(resp._body)['message'], '', {
                  duration: 3000,
              });
          });
  }

  showElectionById(Id) {
    this.isFinish = false;
    this.apiExternalServer.showElectionById(Id).then(() => {      
      this.elec = this.localStoragexx.retrieve(this.key_localstorage_election);
      console.log("aff elec: " + JSON.stringify(this.elec));
      if (this.elec) {

        let id = this.elec['_id'].$id;
        console.log("id: " + id);

        let name = this.elec['name'];

        id = this.encoder.encode(id);
        console.log("idencode: " + id);

        let beginDate = this.elec['dateBegin'].sec;
        console.log("begin date  : " + beginDate);
        console.log("current date  value of: " + this.myDate.valueOf()/1000);

        console.log("getDate: " + this.myDate.getDate()/1000);
        console.log("getTimezoneOffset: " + this.myDate.getTimezoneOffset()*60);

        let endDate = this.elec['dateEnd'].sec;
        console.log("end date  : " + endDate);


        beginDate = parseFloat(beginDate);
        endDate = parseFloat(endDate);

        
        let newDate = (this.myDate.valueOf()/1000)-(this.myDate.getTimezoneOffset()*60);
        console.log("newDate  : " + newDate);

        console.log("beginDate <= newDate  : " + (beginDate <= newDate));
        console.log("endDate >= newDate  : " + (endDate >= newDate));



        if (beginDate <= newDate && endDate >= newDate) {
          this.isFinish = true;
        }

        
        console.log("isFinish : " + this.isFinish);

        let description = this.elec['description'];        

        this.electionsBuffer.push({
          id: id,
          name: name,
          description: description,
          isFinish: this.isFinish,
        });
      }

      this.electionsBuffer.sort((a, b) => {
        return a.label > b.label ? 1 : -1;
      });

      this.elections = this.electionsBuffer; // force GUI refresh

    });
  }


}
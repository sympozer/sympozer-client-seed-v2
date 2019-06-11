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
  idElections: Array<string> = new Array();
  elections : Array<any> = new Array();
  elec;  
 

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
      
      
  }


  /**
   * Retrieve login token and all voting credentials on init
   */


   
  ngOnInit() {
    let headers = new Headers({ 'Access-Control-Allow-Origin': '*'});

    this.voteService.getElections(this.idElections, this.elec, this.elections); 
    
          
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
    //this.voteService.vote(this.idTrack, this.idPublication);
        /*.then(() => {
          this.snackBar.open('Vote successful', '', {
              duration: 2000,
          });
          that.hasVoted = true;
          that.justVoted = true;
        })
        .catch((err) => {
          console.log(err);
          if (err === 40this3) {
            that.hasVoted = true;
            this.snackBar.open('You have already voted', '', {
              duration: 2000,
            });
          }
          if (err.status === 403) {
            this.snackBar.open('Vote has not began try again on Wednesday 25 April', '', {
                duration: 2000,
            });
          }this

        });*/
    }

   
}
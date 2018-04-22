import { Component, OnInit, Input } from '@angular/core';
import {VoteService} from '../../services/vote.service';
import {ApiExternalServer} from '../../services/ApiExternalServer';
import {LocalStorageService} from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';
import {MdSnackBar} from '@angular/material';

@Component({
  selector: 'vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  token;
  subscription: Subscription;
  canVote: any;
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
  // private key_localstorage_begin_vote = 'beginVote';
  constructor(private voteService: VoteService,
              private localStoragexx: LocalStorageService,
              private snackBar: MdSnackBar,
              private apiExternalServer: ApiExternalServer) {

      this.subscription = this.apiExternalServer.getAuthorizationVoteStatus().subscribe(status => {
            console.log(status);
            this.canVote = status;
        });
  }

  /**
   * Retrieve login token and all voting credentials on init
   */
  ngOnInit() {
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
    setTimeout(() => {
      this.votable = this.voteService.isTrackVotable(this.idTrack);
      this.hasVoted = this.voteService.isTrackVoted(this.idTrack);
    }, 1000);
    this.canVote = true;
  }

  /**
   * Invoke voting service
   */
  vote = () => {
    const that = this;
    this.voteService.vote(this.idTrack, this.idPublication)
        .then(() => {
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

        });
    }


}
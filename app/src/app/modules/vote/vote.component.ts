import { Component, OnInit, Input } from '@angular/core';
import {VoteService} from '../../services/vote.service'
import {Config} from "../../app-config";
import {LocalStorageService} from 'ng2-webstorage';
import {MdDialog, MdDialogRef} from '@angular/material';


@Component({
  selector: 'vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  token;

  /***
   * Retrive the track Id and the event Type from the publication
   */
  @Input('idTrack') idTrack: Object;
  @Input('typeEvent') typeEvent: String
  public votable;
  private hasVoted;
  private key_localstorage_token = "token_external_ressource_sympozer";
  private key_localstorage_vote = "hasVoted"
  constructor(private voteService: VoteService,
              private localStoragexx: LocalStorageService) {

  }

  /**
   * Retrieve login token and all voting credentials on init
   */
  ngOnInit() {
    this.token = this.localStoragexx.retrieve(this.key_localstorage_token);
    this.hasVoted = this.localStoragexx.retrieve(this.key_localstorage_vote);
    this.hasVoted = false
    setTimeout(() => {
      this.votable = this.voteService.isTrackVotable(this.typeEvent)
      console.log(this.votable)
      console.log(this.typeEvent)
    }, 1000)

    console.log(this.idTrack)
  }

  /**
   * Invoke voting service with a dialog to confirm
   */
  vote = () => {
    if(this.voteService.vote(this.idTrack)){
        this.hasVoted = true
    }
    else{
       // inserer une alert
    }
  }

}
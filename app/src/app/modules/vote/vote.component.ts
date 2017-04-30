import { Component, OnInit, Input } from '@angular/core';
import {VoteService} from '../../services/vote.service'
import {Config} from "../../app-config";
import {LocalStorageService} from 'ng2-webstorage';


@Component({
  selector: 'vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  token;

  @Input('idTrack') idTrack: Object;
  @Input('typeEvent') typeEvent: String
  private votable;
  private hasVoted;
  private key_localstorage_token = "token_external_ressource_sympozer";
  private key_localstorage_vote = "hasVoted"
  constructor(private voteService: VoteService,
              private localStoragexx: LocalStorageService) {

  }

  ngOnInit() {
    this.token = this.localStoragexx.retrieve(this.key_localstorage_token);
    this.hasVoted = this.localStoragexx.retrieve(this.key_localstorage_vote);
    setTimeout(() => {
      this.votable = this.voteService.isTrackVotable(this.typeEvent)
      console.log(this.votable)
    }, 1000)

    console.log(this.idTrack)
    console.log(this.typeEvent)
  }

  vote = () => {
    if(this.voteService.vote(this.idTrack)){
        this.hasVoted = true
    }
    else{
       // inserer une alert
    }
  }

}
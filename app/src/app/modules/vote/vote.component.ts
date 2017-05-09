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

  /***
   * Retrive the track Id and the event Type from the publication
   */
  @Input('idTrack') idTrack: Object;
  @Input('typeEvent') typeEvent: String
  public votable = false;
  private hasVoted = false;
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
    let votedTracks = this.localStoragexx.retrieve(this.key_localstorage_vote);
    for(var i = 0; i < votedTracks.length; i++){
      if(votedTracks[i] === this.idTrack)
        this.hasVoted = true
    }
    setTimeout(() => {
      this.votable = this.voteService.isTrackVotable(this.typeEvent)
      console.log(this.votable)
      console.log(this.typeEvent)
    }, 1000)

    console.log(this.idTrack)
  }

  /**
   * Invoke voting service
   */
  vote = () => {
    this.voteService.vote(this.idTrack)
        .then(()=>{
          this.hasVoted = true
        })
        .catch((err) =>{
          console.log(err)
        })

    }
  

}
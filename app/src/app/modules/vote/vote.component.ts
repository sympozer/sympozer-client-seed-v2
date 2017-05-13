import { Component, OnInit, Input } from '@angular/core';
import {VoteService} from '../../services/vote.service'
import {Config} from "../../app-config";
import {LocalStorageService} from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  token;
  subscription: Subscription;
  /***
   * Retrive the track Id and the event Type from the publication
   */
  @Input('idTrack') idTrack: Object;
  @Input('idPublication') idPublication: Object;
  @Input('typeEvent') typeEvent: String;
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
    let votedPublications = this.localStoragexx.retrieve(this.key_localstorage_vote);
    //console.log(votedPublications)
    console.log(this.idPublication)
    // for(var i = 0; i < votedPublications.length; i++){
    //   if(votedPublications[i] === this.idPublication)
    //     this.hasVoted = true
    // }
    setTimeout(() => {
      this.votable = this.voteService.isTrackVotable(this.typeEvent)
      //console.log(this.votable)
      //console.log(this.typeEvent)
      console.log(this.idPublication)
    }, 1000)

    
  }

  /**
   * Invoke voting service
   */
  vote = () => {
    this.voteService.vote(this.idTrack, this.idPublication)
        .then(()=>{
          this.hasVoted = true
        })
        .catch((err) =>{
          console.log(err)
        })

    }
  

}
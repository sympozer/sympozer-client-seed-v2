import { Component, Input, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {MatDialogRef} from '@angular/material';
import {VoteService} from '../../services/vote.service';
import { Router, Routes } from '@angular/router';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements OnInit {

  title: string;
  message: string;

  constructor(public thisDialogRef: MatDialogRef<ConfirmationDialogComponent>, 
			  private voteService: VoteService, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router) { }

  ngOnInit() {
    this.title = "Vote for this candidate";
    this.message = "Are you sure you want to vote for this candidate ?"+"\n"+"You will no longer be able to vote for this election.";
  }

  public decline() {
    this.thisDialogRef.close(false);
  }

  public accept() {
    this.voteService.vote(this.data['id'], this.data['publi']);
    this.router.navigate(['/vote/'+ this.data['id']]);

    this.thisDialogRef.close(true);
  }



}

/**
 * Created by nguyenvanthanhtu on 15/02/2018.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class BookmarkService {
  private usersInterested = [];
  private usersGoing = [];
  

  constructor() { }

  /**
   * Add user into interested list
   * @return length of the list
   **/
  addInterested(user){
    this.usersInterested.push(user);
    return this.usersInterested.length;
  }

  /**
   * Add user into going list
   * @return length of the list
   **/
  addGoing(user){
    this.usersGoing.push(user);
    return this.usersGoing.length;
  }

}

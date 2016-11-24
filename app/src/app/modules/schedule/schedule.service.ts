import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Event }           from '../../event';


@Injectable()
export class ScheduleService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private scheduleUrl = 'schedule';  // URL to web api

  constructor(private http: Http) {}

  /*constructEventHierarchy(eventArray: Event[]): Promise<Event[]> {
  	console.log("Oui mon array : " + eventArray);

  	var eventHierarchy = {};
    for(var i in eventArray) {
        var event = eventArray[i];
        if(!event.categories || !event.categories[0]) {
            event.categories = ["none"];
        }

        //retrieve current Start Slot
        if (!eventHierarchy[event.startsAt]) {
            eventHierarchy[event.startsAt] = {};
        }	
        var currentStartSlot = eventHierarchy[event.startsAt];

        //retrieve current End Slot
        if (!currentStartSlot[event.endsAt]) {
            currentStartSlot[event.endsAt] = {
                bigEvents: {},
                events: []
            };
        }
        var currentEndSlot = currentStartSlot[event.endsAt];

        //retrieve current eventType slot
        if (!currentEndSlot.bigEvents[event.categories[0]]) {
            currentEndSlot.bigEvents[event.categories[0]] = [];
        }

        //then push to the correct start/end slot
        currentEndSlot.bigEvents[event.categories[0]].push(event);
    }
    var count = Object.keys(eventHierarchy).length;
  	console.log("taille: " + count);
  	//console.log(eventHierarchy); // liste d'event
  		// passer par data-loader.service parce que le http.get est déjà fait dans le service
  	return this.http.get(this.scheduleUrl)
               .toPromise()
               .then(response => eventHierarchy as Event[])
               .catch(this.handleError); 
    //return eventArray;
    return null;
  }*/

}
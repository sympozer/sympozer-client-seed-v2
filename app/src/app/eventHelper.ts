import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Config } from  './app-config';
import { labels } from  './lib/labels';
import { Encoder } from  './lib/encoder';


import * as moment from 'moment';

import { Observable } from 'rxjs';


@Injectable()
export class eventHelper {

  constructor(private http: Http,  private encoder: Encoder) {}

    sortByDateAsc(lhs, rhs) {
    return lhs > rhs ? 1 : lhs < rhs ? -1 : 0;
  }

  sortMap(unsortedEventMap) {
        //get the unsorted array of formatted dates
        let dateKeys = Object.getOwnPropertyNames(unsortedEventMap);

        //Sort this array
        let momentArray = [];
        for (let i in dateKeys) {
            momentArray.push(moment(dateKeys[i]));
        }

        //Reconstruct the map using the sorted array
        let sortedEventMap = {};
        momentArray.sort(this.sortByDateAsc);
        for (let j in momentArray) {
            sortedEventMap[momentArray[j].format()] = unsortedEventMap[momentArray[j].format()];
        }

        return sortedEventMap;
    }

    constructMap(eventArray, propertyName) {
        let eventMap = {};
        eventArray.forEach(function(event) {
            if(event) {
                let formattedDate = moment(event[propertyName]).format();
                if (!eventMap[formattedDate]) {
                    eventMap[formattedDate] = [];
                }
                eventMap[formattedDate].push(event);
            }
        });
        return eventMap;
    }

  doubleSortEventsInArray(eventArray){
      // console.log("dans doubleSortEventsInArray de EventHelper");
      let doubleSortedEventMap = this.sortMap(this.constructMap(eventArray, "startsAt"));
    let internalArray = [];
    for (let i in doubleSortedEventMap) {
        let internalMap = this.sortMap(this.constructMap(doubleSortedEventMap[i], "endsAt"));
        for (let j in internalMap) {
            for (let k in internalMap[j]) {
                internalArray.push(internalMap[j][k]);
            }
        }
    }
    return internalArray;

    /** LE MODULE MOMENT NE MARCHE PAS
    **/
    // return eventArray;
  }

    constructEventHierarchy(eventArray) {
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
        return eventHierarchy;
    }

    getNextEvents(eventArray, conferenceUri) {
        var earliest = null;
        var now = new Date();

        //First, run through the array to find the first event
        for(var i in eventArray) {
            if(eventArray[i].id !== conferenceUri && moment(now).isBefore(eventArray[i].startsAt) && (!earliest || moment(eventArray[i].startsAt).isBefore(earliest))) {
                earliest = eventArray[i].startsAt;
            }
        }

        //Second, filter out past events and events out of the duration slot defined in the config file
        var result = [];
        for(i in eventArray) {
            var event = eventArray[i];
            if(moment(now).isBefore(event.startsAt) && !moment(earliest).add(Config.app.whatsNextDelay).isBefore(event.startsAt)) {
                result.push(event);
            }
        }
        return result;
    }

    getEventIcsDescription(eventInfo) {
        var homepageText = eventInfo.homepage?(" - More info at: " + eventInfo.homepage):"";

        var categoryText = "";
        for(var i in eventInfo.categories) {
            categoryText += ((i.length>0)?", ":"") + labels[Config.conference.lang].category[eventInfo.categories[i].name];
        }

        var locationText = "";
        for(var j in eventInfo.locations) {
            locationText += ((j.length>0)?", ":"") + eventInfo.locations[j].name;
        }

        var eventStartICS = moment(eventInfo.startsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
        var eventEndICS = moment(eventInfo.endsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");

        return "BEGIN:VCALENDAR\n" +
            "VERSION:2.0\n" +
            'PRODID: //' + eventInfo.name + '//ES//EN\n' +
            "BEGIN:VTIMEZONE\n" +
            "TZID:" + Config.conference.timeZone.name + "\n" +
            "BEGIN:DAYLIGHT\n" +
            "TZOFFSETFROM:" + Config.conference.timeZone.standardOffset + "00\n" +
            "RRULE:FREQ=YEARLY;BYMONTH=" + Config.conference.timeZone.changeToDaylightMonth + ";BYDAY=-1SU\n" +
            "DTSTART:19810329T020000\n" +
            "TZNAME:GMT" + Config.conference.timeZone.daylightOffset + ":00\n" +
            "TZOFFSETTO:" + Config.conference.timeZone.daylightOffset + "00\n" +
            "END:DAYLIGHT\n" +
            "BEGIN:STANDARD\n" +
            "TZOFFSETFROM:" + Config.conference.timeZone.daylightOffset + "00\n" +
            "RRULE:FREQ=YEARLY;BYMONTH=" + Config.conference.timeZone.changeToStandardMonth + ";BYDAY=-1SU\n" +
            "DTSTART:19961027T030000\n" +
            "TZNAME:GMT" + Config.conference.timeZone.standardOffset + ":00\n" +
            "TZOFFSETTO:" + Config.conference.timeZone.standardOffset + "00\n" +
            "END:STANDARD\n" +
            "END:VTIMEZONE\n" +
            "BEGIN:VEVENT\n" +
            "CATEGORIES:" + categoryText + "\n" +
            "DTSTART;TZID=" + Config.conference.timeZone.name + ":" + eventStartICS + "\n" +
            "DTEND;TZID=" + Config.conference.timeZone.name + ":" + eventEndICS + "\n" +
            "SUMMARY:" + eventInfo.name + "\n" +
            "DESCRIPTION:" + eventInfo.description + homepageText + "\n" +
            "LOCATION:" + locationText + "\n" +
            "END:VEVENT\n" +
            "END:VCALENDAR";
    }

}
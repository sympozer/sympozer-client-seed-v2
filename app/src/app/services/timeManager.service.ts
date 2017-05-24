/**
 * Created by pierremarsot on 24/05/2017.
 */
import * as moment from 'moment';
export class TimeManager {

    constructor(){

    }

    static startAndEndTimeToString(startDate, endDate){
        const duration = moment.duration(endDate.diff(startDate));

        var hours = parseInt(duration.asHours().toString());
        var minutes = parseInt(duration.asMinutes().toString()) - hours * 60;

        let strDuration = "";
        if (hours > 0) {
            if(hours < 2){
                strDuration = hours + " hour ";
            }else{
                strDuration = hours + " hours ";
            }
        }

        if(hours > 0 && minutes > 0){
            strDuration += "and ";
        }

        if (minutes > 0) {
            if(minutes < 2){
                strDuration += minutes + " minute";
            }else{
                strDuration += minutes + " minutes";
            }
        }

        return strDuration;
    }
}
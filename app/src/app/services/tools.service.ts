import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';

@Injectable()
export class ToolsService {
	private subjectFullscreen = new Subject<any>();
  	
  	constructor() { }

    /**
     * Send to all subscribers fullscreen status
     * @param status
     */
  	sendFullScreenStatus(status: boolean) {
        this.subjectFullscreen.next(status);
    }

    /**
     * Clear the fullscreen status
     */
    clearFullScreenStatus() {
        this.subjectFullscreen.next();
    }

    /**
     * Retrieve the fullscreen status
     * @returns {Observable<any>}
     */
    getFullScreenStatus(): Observable<any> {
        return this.subjectFullscreen.asObservable();
    }

}

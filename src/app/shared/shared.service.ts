import {EventEmitter, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class SharedService {
    titleChanged = new EventEmitter();

    constructor(public snackBar: MatSnackBar){

    }

    changeTitle(title) {
        this.titleChanged.emit(title);
    }

    sneckBarNotifications(message){
        this.snackBar.open(message, null, {
            duration: 2000
        });
    }
}

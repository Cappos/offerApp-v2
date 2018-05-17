import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material";

@Component({
    selector: 'app-new-user',
    templateUrl: './new-user.component.html',
    styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
    savedUserData;

    constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<NewUserComponent>) {
    }

    ngOnInit() {
    }

    onSave(form: NgForm) {
        this.savedUserData = form.value;
        this.dialogRef.close(this.savedUserData);
    }
}


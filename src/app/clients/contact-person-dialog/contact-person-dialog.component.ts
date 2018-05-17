import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {NgForm} from "@angular/forms";

@Component({
    selector: 'app-contact-person-dialog',
    templateUrl: './contact-person-dialog.component.html',
    styleUrls: ['./contact-person-dialog.component.css']
})
export class ContactPersonDialogComponent implements OnInit {
    savedPersonData;

    constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ContactPersonDialogComponent>) {
    }

    ngOnInit() {

    }

    onSave(form: NgForm) {
        let value = form.value;
        this.savedPersonData = value;
        this.dialogRef.close(this.savedPersonData);
    }
}

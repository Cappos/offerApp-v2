import {Component, Inject, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";

@Component({
    selector: 'app-task-dialog',
    templateUrl: './task-dialog.component.html',
    styleUrls: ['./task-dialog.component.css']
})
export class TaskDialogComponent implements OnInit {

    savedPersonData;
    timelineItem = {title: '', start: '', end: ''};
    edit = false;

    constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<TaskDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, ) {
    }

    ngOnInit() {
        if(this.data){
            this.timelineItem = this.data.task;
            this.edit = true;
        }
    }

    onSave(form: NgForm) {
        this.savedPersonData = form.value;
        this.dialogRef.close(this.savedPersonData);
    }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";

@Component({
    selector: 'app-rte-dialog',
    templateUrl: './rte-dialog.component.html',
    styleUrls: ['./rte-dialog.component.css']
})
export class RteDialogComponent implements OnInit {
    rteData = '';
    itemSaved = false;
    savedRemarksData;

    constructor(public dialog: MatDialog, private _dialogService: TdDialogService, public dialogRef: MatDialogRef<RteDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService) {

        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
    }

    ngOnInit() {
        this.rteData = this.data.rteData;
        this.loadingService.resolveAll('modulesLoader');
    }

    onSave() {
        this.savedRemarksData = this.rteData;
        this.itemSaved = true;
    }

    keyupHandler(ev) {
        this.rteData = ev;
    }

}

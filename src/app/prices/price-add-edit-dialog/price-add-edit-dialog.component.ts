import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {Apollo} from "apollo-angular";
import getPrice from '../../queries/price/fetchPrice';
import getPricesData from '../../queries/price/fetchPrices';
import addPrice from '../../queries/price/createPrice';
import updatePrice from '../../queries/price/editPrice';

@Component({
    selector: 'app-price-add-edit-dialog',
    templateUrl: './price-add-edit-dialog.component.html',
    styleUrls: ['./price-add-edit-dialog.component.css']
})
export class PriceAddEditDialogComponent implements OnInit {

    pageTitle = 'Prices';
    id;
    item;

    constructor(private sharedService: SharedService, public dialog: MatDialog, private _dialogService: TdDialogService, public dialogRef: MatDialogRef<PriceAddEditDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService, private apollo: Apollo) {

        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
        this.sharedService.changeTitle(this.pageTitle);
    }

    ngOnInit() {
        // if edit mode true
        if (this.data.edit) {
            console.log('is in database');
            console.log(this.data);
            this.id = this.data.id;
            this.apollo.watchQuery<any>({
                query: getPrice,
                variables: {
                    id: this.id
                }
            }).valueChanges.subscribe(({data}) => {
                this.item = data.price[0];
                this.loadingService.resolveAll('modulesLoader');
            });
        }
        else {
            this.id = null;
            this.loadingService.resolveAll('modulesLoader');
        }
    }

    onSave(form: NgForm, id) {
        const value = form.value;

        if(id){
            this.apollo.mutate({
                mutation: updatePrice,
                variables: {
                    id: id,
                    value: +value.value
                },
                refetchQueries: [{
                    query: getPricesData
                }]
            }).subscribe((res) => {
                this.sharedService.sneckBarNotifications(`price ${res.data.editPrice.value} updated.`);
                this.dialogRef.close();
            });
        }
        else {
            this.apollo.mutate({
                mutation: addPrice,
                variables: {
                    value: +value.value
                },
                refetchQueries: [{
                    query: getPricesData
                }]
            }).subscribe((res) => {
                this.sharedService.sneckBarNotifications(`price ${res.data.addPrice.value} created.`);
                this.dialogRef.close();
            });
        }

    }

}

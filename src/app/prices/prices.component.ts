import {Component, HostBinding, OnInit, ViewContainerRef} from '@angular/core';
import {slideInDownAnimation} from '../_animations/app.animations';
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {SharedService} from '../shared/shared.service';
import {MatDialog} from '@angular/material';
import {Apollo} from 'apollo-angular';
import  {PriceAddEditDialogComponent} from './price-add-edit-dialog/price-add-edit-dialog.component';
import getPricesData from '../queries/price/fetchPrices';
import removePrice from '../queries/price/deletePrice';

@Component({
    selector: 'app-prices',
    templateUrl: './prices.component.html',
    styleUrls: ['./prices.component.css'],
    animations: [slideInDownAnimation]
})


export class PricesComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('class.td-route-animation') classAnimation = true;

    pageTitle = 'Sellers';
    title = 'List of sellers';
    editMode = false;
    data: any;

    constructor(private loadingService: TdLoadingService, private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private apollo: Apollo) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
        this.sharedService.changeTitle(this.pageTitle);
    }

    ngOnInit(): void {
        this.apollo.watchQuery<any>({
            query: getPricesData
        }).valueChanges.subscribe(({data}) => {
            this.data = data.prices;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    onEdit(id) {
        const dialogRef = this.dialog.open(PriceAddEditDialogComponent, {
            data: {
                edit: true,
                id: id
            }
        });
    }


    newPrice() {
        const dialogRef = this.dialog.open(PriceAddEditDialogComponent, {
            data: {
                edit: false
            }
        });
    }

    onDelete(id) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to Delete this Price?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removePrice,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getPricesData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.deletePrice.value} deleted!!!.`);
                });
            }
        });
    }
}

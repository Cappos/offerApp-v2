import {Component, HostBinding, OnInit, ViewContainerRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {slideInDownAnimation} from '../_animations/app.animations';
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {SharedService} from '../shared/shared.service';
import {NewSellerComponent} from './new-seller/new-seller.component';
import {MatDialog} from '@angular/material';
import {Apollo} from 'apollo-angular';
import getSealerData from '../queries/seller/fetchSealer';
import addSealer from '../queries/seller/createSealer';
import removeSealer from '../queries/seller/deleteSealer';
import updateSealer from '../queries/seller/editSealer';


@Component({
    selector: 'app-sellers',
    templateUrl: './sellers.component.html',
    styleUrls: ['./sellers.component.css'],
    animations: [slideInDownAnimation]
})
export class SellersComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('class.td-route-animation') classAnimation = true;

    pageTitle = 'Sellers';
    title = 'List of sellers';
    titles = ["Herr", "Frau"];
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
            query: getSealerData
        }).valueChanges.subscribe(({data}) => {
            this.data = data.sealers;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    onEdit(uid) {
        this.editMode = true;
    }

    onSave(from: NgForm, userName, userId) {
        const value = from.value;
        this.apollo.mutate({
            mutation: updateSealer,
            variables: {
                id: userId,
                position: value.position,
                title: value.title,
                name: userName,
                email: value.email,
                phone: value.phone,
                mobile: value.mobile
            },
            refetchQueries: [{
                query: getSealerData
            }]
        }).subscribe((res) => {
            this.editMode = false;
            this.sharedService.sneckBarNotifications(`user ${res.data.editSealer.name} updated.`);
        });
    }

    newSeller() {
        const dialogRef = this.dialog.open(NewSellerComponent);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.apollo.mutate({
                    mutation: addSealer,
                    variables: {
                        position: result.position,
                        title: result.title,
                        name: result.name,
                        email: result.email,
                        phone: result.phone,
                        mobile: result.mobile,
                        value: result.value
                    },
                    refetchQueries: [{
                        query: getSealerData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.addSealer.name} created.`);
                });
            }
        });
    }

    onDelete(id: string) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to Delete this Sealer?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeSealer,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getSealerData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.deleteSealer.name} deleted!!!.`);
                });
            }
        });
    }
}
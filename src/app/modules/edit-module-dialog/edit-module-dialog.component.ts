import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from '../../shared/shared.service';
import {NgForm} from '@angular/forms';

import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {Apollo} from 'apollo-angular';
import fetchModule from '../../queries/module/fetchModule';
import getCategoriesPrices from '../../queries/getCategoriesPrices';

@Component({
    selector: 'app-edit-module-dialog',
    templateUrl: './edit-module-dialog.component.html',
    styleUrls: ['./edit-module-dialog.component.css']
})
export class EditModuleDialogComponent implements OnInit {
    pageTitle = 'Modules';
    id: number;
    item;
    rteData = '';
    itemSaved = false;
    selectedChapter;
    categories: any[];
    selectedGroup;
    savedModuleData;
    count;
    selectedPrice;
    prices: any [];
    totalPrice;

    constructor(private sharedService: SharedService, public dialog: MatDialog, private _dialogService: TdDialogService, public dialogRef: MatDialogRef<EditModuleDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService, private apollo: Apollo) {

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
        // if edit module that is in database
        if (this.data.edit && this.data.moduleUid && !this.data.newOffer && !this.data.module) {
            console.log('is in database');
            this.id = this.data.moduleUid;
            const chapterId = this.data.chapterId;
            this.apollo.watchQuery<any>({
                query: fetchModule,
                variables: {
                    id: this.id
                },
                fetchPolicy: 'network-only'
            }).valueChanges.subscribe(({data}) => {
                this.item = data.module;
                this.rteData = this.item.bodytext;
                this.categories = data.categories;
                this.prices = data.prices;
                this.selectedPrice = data.module.pricePerHour;
                this.selectedChapter = chapterId;
                this.totalPrice = data.module.price;
                if (this.item.categoryId.length > 0 ){
                    this.selectedGroup = this.item.categoryId[0].value;
                }
                this.loadingService.resolveAll('modulesLoader');
            });

        }
        // if edit module that is not yet saved
        else if (this.data.edit) {
            console.log('not yet saved');
            if (this.data.moduleUid) {
                this.id = this.data.moduleUid;
            }
            else if (this.data.groupUid) {
                this.id = this.data.groupUid;
            }
            this.apollo.watchQuery<any>({
                query: getCategoriesPrices
            }).valueChanges.subscribe(({data}) => {
                this.categories = data.categories;
                this.item = this.data.moduleNew;
                this.rteData = this.item.bodytext;
                this.prices = data.prices;
                this.selectedPrice = this.data.moduleNew.pricePerHour;
                this.totalPrice = this.data.moduleNew.price;
                if (this.item.categoryId) {
                    this.selectedGroup = this.item.categoryId[0].value;
                }
                this.loadingService.resolveAll('modulesLoader');
            });
        }
        // if this is a new module
        else {
            console.log('new module');
            this.id = Math.random();
            this.apollo.watchQuery<any>({
                query: getCategoriesPrices,
                fetchPolicy: 'network-only'
            }).valueChanges.subscribe(({data}) => {
                this.categories = data.categories;
                this.rteData = ' ';
                this.selectedPrice = 0;
                this.prices = data.prices;
                this.totalPrice = 0;
                this.loadingService.resolveAll('modulesLoader');
            });
        }
    }

    onSave(form: NgForm) {
        const value = form.value;
        const category = this.categories.find(category => category.value == value.categoryId) || null;
        const price =  +value.externalHours * +value.selectedPrice;
        this.totalPrice = price;

        // Make temp id
        this.count = Math.random();

        this.savedModuleData = value;

        if (this.data.edit && this.item._id && !this.item.moduleNew) {
            console.log('1', this.id);
            this.savedModuleData.moduleNew = false;
            this.savedModuleData._id = this.id;
            this.savedModuleData.tstamp = this.item.tstamp;
        }
        else if (this.data.edit) {
            console.log('2');
            this.savedModuleData._id = this.data.moduleNew._id;
            this.savedModuleData.moduleNew = true;
            this.savedModuleData.tstamp = this.item.tstamp;
        }
        else {
            console.log('3');
            this.savedModuleData._id = this.id + this.count;
            this.savedModuleData.moduleNew = true;
        }

        console.log(this.rteData);
        this.savedModuleData.bodytext = this.rteData;
        this.savedModuleData.groupUid = this.data.groupUid;
        this.savedModuleData.price = price;
        this.savedModuleData.pricePerHour = +value.selectedPrice;
        // Set category if is selected
        if (category) {
            this.savedModuleData.categoryId = [category];
        }
        this.itemSaved = true;
    }

    keyupHandler(ev) {
        this.rteData = ev;
    }
}

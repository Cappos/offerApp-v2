import {Component, Inject, OnInit, Output, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {EditModuleDialogComponent} from "../../modules/edit-module-dialog/edit-module-dialog.component";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {ModuleListDialogComponent} from "../../modules/module-list-dialog/module-list-dialog.component";
import {Apollo} from "apollo-angular";
import fetchGroup from "../../queries/group/fetchGroup";

@Component({
    selector: 'app-chapter-dialog',
    templateUrl: './chapter-dialog.component.html',
    styleUrls: ['./chapter-dialog.component.css']
})

export class ChapterDialogComponent implements OnInit {
    pageTitle = 'Chapter';
    id: number;
    item;
    @Output() editMode = false;
    editModuleGroup: number;
    chapterPrice: number = 0;
    chapterSignedPrice: number;
    savedChapterData;
    itemSaved = false;
    chaptersModules = [];
    modulesNew = [];
    modulesUpdate = [];
    modules: any[] = [];


    constructor(private route: ActivatedRoute, private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService, private apollo: Apollo, public dialogRef: MatDialogRef<ChapterDialogComponent>) {
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
        if (this.data.edit && !this.data.newOffer) {
            this.id = this.data.groupUid;

            this.apollo.watchQuery<any>({
                query: fetchGroup,
                variables: {
                    id: this.id
                },
                fetchPolicy: 'network-only'
            }).valueChanges.subscribe(({data}) => {
                this.item = data.groups;
                this.chaptersModules = this.item.modules;
                this.chapterPrice = this.item.subTotal;
                this.loadingService.resolveAll('modulesLoader');
            });
        }
        else if (this.data.edit) {
            this.id = this.data.groupUid;
            this.item = this.data.chapterNew;
            this.chaptersModules = this.item.modules;
            this.chapterPrice = this.item.subTotal;
            this.chapterSignedPrice = this.item.signedPrice;
            this.loadingService.resolveAll('modulesLoader');
        }
        else {
            this.id = Math.random();
            this.chaptersModules = [];
            this.loadingService.resolveAll('modulesLoader');
        }
    }

    onSave(form: NgForm) {
        this.savedChapterData = form.value;
        this.savedChapterData.modules = this.chaptersModules;
        this.savedChapterData.subTotal = this.chapterPrice;
        this.savedChapterData.total = this.chapterSignedPrice;
        this.savedChapterData._id = this.id;
        this.savedChapterData.type = 1;
        if (this.item) {
            this.savedChapterData.groupNew = this.item.groupNew
        }
        else {
            this.savedChapterData.groupNew = true;
        }

        this.itemSaved = true;
    }

    onModuleEdit(moduleUid: number, groupUid: number) {
        this.editModuleGroup = groupUid;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                moduleUid: moduleUid,
                groupUid: groupUid,
                edit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let module = this.chaptersModules.filter(module => module._id === moduleUid)[0];
                let moduleIndex = this.chaptersModules.indexOf(module);
                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                this.chaptersModules[moduleIndex] = result;

                for (let m in this.chaptersModules) {
                    modulePrices.push(this.chaptersModules[m].price);

                    if(this.chaptersModules[m].signed){
                        signedModulePrices.push(this.chaptersModules[m].price);
                    }
                }

                sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                if(signedModulePrices.length > 0){
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                this.chapterPrice = sum;
                this.chapterSignedPrice = signedSum;
            }
        });
    }

    onModuleRemove(moduleUid: number, groupUid: number) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this module?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                let module = this.chaptersModules.filter(module => module.uid === moduleUid)[0];
                let moduleIndex = this.chaptersModules.indexOf(module);

                this.chaptersModules.splice(moduleIndex, 1);

                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                for (let m in this.chaptersModules) {
                    modulePrices.push(this.chaptersModules[m].price);

                    if(this.chaptersModules[m].signed){
                        signedModulePrices.push(this.chaptersModules[m].price);
                    }
                }

                if (modulePrices.length) {
                    sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                else {
                    sum = 0;
                }

                if(signedModulePrices.length > 0){
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                else {
                    signedSum = 0;
                }

                this.chapterPrice = sum;
                this.chapterSignedPrice = signedSum;

            }
        });
    }

    addModule() {
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;
                if (result.moduleNew) {
                    // update modules lis after adding module
                    this.chaptersModules.push(result)
                }

                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                console.log(this.chaptersModules);

                // update chapter price
                for (let m in this.chaptersModules) {
                    modulePrices.push(this.chaptersModules[m].price);

                    if(this.chaptersModules[m].signed){
                        signedModulePrices.push(this.chaptersModules[m].price);
                    }
                }
                sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                if(signedModulePrices.length > 0){
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                this.chapterPrice = sum;
                this.chapterSignedPrice = signedSum;
            }
        });
    }

    addFromModuleList() {
        let dialogRef = this.dialog.open(ModuleListDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let e in result) {
                    // update modules list after adding new
                    this.chaptersModules.push(result[e]);

                    let modulePrices: any[] = [];
                    let signedModulePrices: any[] = [];
                    let sum: number = 0;
                    let signedSum: number = 0;

                    // update chapter price
                    for (let m in this.chaptersModules) {
                        modulePrices.push(this.chaptersModules[m].price);

                        if(this.chaptersModules[m].signed){
                            signedModulePrices.push(this.chaptersModules[m].price);
                        }
                    }

                    sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    if(signedModulePrices.length > 0){
                        signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    }
                    this.chapterPrice = sum;
                    this.chapterSignedPrice = signedSum;
                }
            }
        });
    }

    closeDialog() {
        this._dialogService.closeAll();
    }

}


import {Component, OnInit, Output, ViewContainerRef} from '@angular/core';
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {MatDialog} from "@angular/material";
import {EditModuleDialogComponent} from "../../modules/edit-module-dialog/edit-module-dialog.component";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {Group} from "../../offers/groups.model";
import {ModuleListDialogComponent} from "../../modules/module-list-dialog/module-list-dialog.component";
import {Router} from "@angular/router";
import {Apollo} from "apollo-angular";
import fetchGroups from '../../queries/group/fetchGroups';
import createGroup from '../../queries/group/createGroup';

@Component({
    selector: 'app-new-chapter',
    templateUrl: './new-chapter.component.html',
    styleUrls: ['./new-chapter.component.css']
})

export class NewChapterComponent implements OnInit {
    pageTitle = 'Chapters';
    title = 'New chapter';
    item: Group;
    id: number;
    @Output() editMode = true;
    chaptersModules = [];
    chapterPrice: number = 0;
    chapterSignedPrice: number = 0;
    modulesNew = [];
    modulesUpdate = [];
    modules: any[] = [];

    constructor(private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private apollo: Apollo, private router: Router) {
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
        this.loadingService.resolveAll('modulesLoader');
    }

    onSave(form: NgForm) {
        const value = form.value;
        let subTotal = null;
        let total = null;

        if (value.subTotal) {
            subTotal = value.subTotal.replace(',', '');
        }

        if (value.total) {
            total = value.total.replace(',', '');
        }

        if (!this.chaptersModules.length) {
            console.log('empty');
            this.apollo.mutate({
                mutation: createGroup,
                variables: {
                    name: value.name,
                    subTotal: subTotal,
                    total: total,
                    modules: []
                },
                refetchQueries: [{
                    query: fetchGroups
                }]
            }).subscribe(() => {
                this.editMode = false;
                this.sharedService.sneckBarNotifications(`chapter created.`);
                this.router.navigate(['/chapters']);
            });
        }
        else {
            console.log('not null');
            this.apollo.mutate({
                mutation: createGroup,
                variables: {
                    name: value.name,
                    subTotal: subTotal,
                    total: total,
                    modulesNew: this.chaptersModules
                },
                refetchQueries: [{
                    query: fetchGroups
                }]
            }).subscribe(() => {
                this.editMode = false;
                this.sharedService.sneckBarNotifications(`chapter created.`);
                this.router.navigate(['/chapters']);
            });

        }
    }

    onModuleEdit(moduleUid, moduleNew: boolean, moduleData: any) {
        let moduleNewData = moduleNew ? moduleData : null;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                edit: true,
                moduleNew: moduleNewData,
                module: moduleNew
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;

                let module = this.chaptersModules.filter(module => module.name === result.name)[0];
                let moduleIndex = this.chaptersModules.indexOf(module);

                if (moduleIndex >= 0) {
                    this.chaptersModules[moduleIndex] = result;
                }
                else {
                    this.chaptersModules.push(result);
                }

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
        });
    }

    onModuleRemove(moduleUid: number, moduleData: any) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this module?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.editMode = true;
                let module = this.chaptersModules.filter(module => module._id === moduleUid)[0];
                let moduleIndex = this.chaptersModules.indexOf(module);

                // update modules lis after module delete
                this.chaptersModules.splice(moduleIndex, 1);

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
                if (modulePrices.length) {
                    sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    if(signedModulePrices.length > 0){
                        signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    }
                }
                else {
                    sum = 0;
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
                this.editMode = true
                if (result.moduleNew) {
                    // update modules lis after adding module
                    this.chaptersModules.push(result)
                }

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
        });
    }

    addFromModuleList() {
        let dialogRef = this.dialog.open(ModuleListDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;
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
                this.sharedService.sneckBarNotifications('Modules added!!!');
            }
        });
    }
}
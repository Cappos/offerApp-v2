import {Component, HostBinding, OnInit, Output, ViewContainerRef} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Params} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {MatDialog} from "@angular/material";
import {EditModuleDialogComponent} from "../../modules/edit-module-dialog/edit-module-dialog.component";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {slideInDownAnimation} from "../../_animations/app.animations";
import {ModuleListDialogComponent} from "../../modules/module-list-dialog/module-list-dialog.component";
import {Apollo} from "apollo-angular";
import fetchGroup from '../../queries/group/fetchGroup';
import updateGroup from '../../queries/group/updateGroup';
import * as _ from "lodash";

@Component({
    selector: 'app-chapter',
    templateUrl: './chapter.component.html',
    styleUrls: ['./chapter.component.css'],
    animations: [slideInDownAnimation]
})

export class ChapterComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;

    pageTitle = 'Chapters';
    id;
    item;
    @Output() editMode = false;
    chaptersModules = [];
    editModuleGroup: number;
    chapterPrice: number;
    chapterSignedPrice: number;
    modulesNew = [];
    modulesUpdate = [];
    modules: any[] = [];

    constructor(private route: ActivatedRoute, private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private location: Location, private apollo: Apollo) {
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
        this.route.params.subscribe(
            (params: Params) => {
                this.id = params['id'];
                this.editMode = !!params['edit'];

                this.apollo.watchQuery<any>({
                    query: fetchGroup,
                    variables: {
                        id: this.id
                    },
                    fetchPolicy: 'network-only'
                }).valueChanges.subscribe(({data}) => {
                    this.item = _.cloneDeep(data.group);
                    if (this.item.modules) {
                        this.chaptersModules = this.item.modules;
                    }
                    this.chapterPrice = this.item.subTotal;
                    this.chapterSignedPrice = this.item.total;
                    this.loadingService.resolveAll('modulesLoader');
                });
            }
        );
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

        if (!this.modulesUpdate.length && !this.modulesNew.length) {
            console.log('empty');
            let modules = this.modules.length ? this.modules : [];
            this.apollo.mutate({
                mutation: updateGroup,
                variables: {
                    id: this.id,
                    name: value.name,
                    subTotal: subTotal,
                    total: total,
                    modules: modules
                },
                refetchQueries: [{
                    query: fetchGroup,
                    variables: {
                        id: this.id
                    }
                }]
            }).subscribe(() => {
                this.editMode = false;
                this.sharedService.sneckBarNotifications(`chapter updated.`);
            });
        }
        else {
            console.log('not null');
            let modules = [];
            for (let item in this.modulesNew) {
                modules.push(this.modulesNew[item])
            }

            for (let item in this.modulesUpdate) {
                modules.push(this.modulesUpdate[item])
            }
            this.apollo.mutate({
                mutation: updateGroup,
                variables: {
                    id: this.id,
                    name: value.name,
                    subTotal: subTotal,
                    total: total,
                    modulesNew: modules
                },
                refetchQueries: [{
                    query: fetchGroup,
                    variables: {
                        id: this.id
                    }
                }]
            }).subscribe(() => {
                this.editMode = false;
                this.sharedService.sneckBarNotifications(`chapter updated.`);
            });

        }
    }

    onEdit() {
        console.log('edit');
        this.editMode = true
    }

    onModuleEdit(moduleUid, groupUid, moduleNew: boolean, moduleData: any) {
        this.editModuleGroup = groupUid;
        let moduleNewData = moduleNew ? moduleData : null;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                moduleUid: moduleUid,
                groupUid: groupUid,
                edit: true,
                moduleNew: moduleNewData,
                module: moduleNew
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;

                if (result.moduleNew) {
                    console.log(result);
                    let module = this.modulesNew.filter(module => module._id === result._id)[0];
                    let moduleIndex = this.modulesNew.indexOf(module);
                    if (moduleIndex >= 0) {
                        this.modulesNew[moduleIndex] = result;
                    }
                    else {
                        this.modulesNew.push(result);
                    }
                }
                else {
                    console.log(result);
                    let module = this.modulesUpdate.filter(module => module._id === result._id)[0];
                    let moduleIndex = this.modulesUpdate.indexOf(module);

                    if (moduleIndex >= 0) {
                        this.modulesUpdate[moduleIndex] = result;
                    }
                    else {
                        console.log(moduleIndex, 'else');
                        this.modulesUpdate.push(result);
                    }
                }

                let module = this.chaptersModules.filter(module => module._id === result._id)[0];
                let moduleIndex = this.chaptersModules.indexOf(module);
                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                this.chaptersModules[moduleIndex] = result;

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

    onModuleRemove(moduleUid: number, groupUid: number, moduleData: any) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this module?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.editMode = true;

                if (!moduleUid) {
                    let module = this.modulesNew.filter(module => module._id === moduleData._id)[0];
                    let moduleIndex = this.modulesNew.indexOf(module);
                    this.modulesNew.splice(moduleIndex, 1);
                }
                else {
                    let module = this.chaptersModules.filter(module => module._id === moduleUid)[0];
                    let moduleIndex = this.chaptersModules.indexOf(module);

                    if (moduleIndex >= 0) {
                        module.deleted = true;
                        this.modulesUpdate.push(module);
                        // update modules lis after module delete
                        this.chaptersModules.splice(moduleIndex, 1);
                    }
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

    addModule(chapterId: number) {
        this.editModuleGroup = chapterId;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                groupUid: chapterId,
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;
                if (result.moduleNew) {
                    this.modulesNew.push(result)
                }
                else {
                    this.modulesUpdate.push(result)
                }

                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                // update modules lis after adding module
                this.chaptersModules.push(result);

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

    addFromModuleList(groupUid: number) {
        let dialogRef = this.dialog.open(ModuleListDialogComponent, {
            data: {
                groupUid: groupUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editMode = true;
                for (let e in result) {
                    // update modules list after adding new
                    this.modulesNew.push(result[e]);
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

    goBack() {
        this.location.back();
    }
}
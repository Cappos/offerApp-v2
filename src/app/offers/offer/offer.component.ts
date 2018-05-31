import {
    Component, ElementRef, OnDestroy, OnInit, Output, ViewContainerRef, ViewChildren, QueryList, ViewChild
} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {Location} from '@angular/common';
import {NgForm} from "@angular/forms";
import {MatDialog, DateAdapter} from "@angular/material";
import 'rxjs/Observable';
import 'rxjs/operator/take';

import {EditModuleDialogComponent} from "../../modules/edit-module-dialog/edit-module-dialog.component";
import {
    IUploadOptions, LoadingMode, LoadingType, TdDialogService, TdFileService,
    TdLoadingService
} from "@covalent/core";
import {ChapterDialogComponent} from "../../chapters/chapter-dialog/chapter-dialog.component";
import {ModuleListDialogComponent} from "../../modules/module-list-dialog/module-list-dialog.component";
import {ChapterListDialogComponent} from "../../chapters/chapter-list-dialog/chapter-list-dialog.component";
import {DragulaService} from "ng2-dragula";
import {DataService} from "../../shared/data.service";
import {PageListDialogComponent} from "../../additional-data/page-list-dialog/page-list-dialog.component";
import {PageEditDialogComponent} from "../../additional-data/page-edit-dialog/page-edit-dialog.component";
import {Apollo} from 'apollo-angular';
import getOffer from '../../queries/offer/fetchOffer';
import * as _ from "lodash";
import updateOffer from "../../queries/offer/updateOffer";
import {PdfDialogComponent} from "../../pdf/pdf-dialog/pdf-dialog.component";
import {Lightbox, LightboxConfig} from "angular2-lightbox";
import {RteDialogComponent} from "../../rte/rte-dialog/rte-dialog.component";
import fetchClientContact from "../../queries/offer/fetchClientContacts";
import {TaskDialogComponent} from "../task-dialog/task-dialog.component";

@Component({
    selector: 'app-offer',
    templateUrl: './offer.component.html',
    styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit, OnDestroy {
    pageTitle = 'Offers';
    id: number;
    item;
    @Output() editMode = false;
    selectedSeller;
    selectedClient;
    selectedClientContacts;
    selectedContactPersons;
    offersModules = [];
    offersUpdate = [];
    files: any[] = [];
    file: File;
    editModuleGroup: number;
    dragContainer = 'draggable-bag';
    totalPrice;
    signedPrice;
    @ViewChildren('accordionModule', {read: ElementRef}) accordionModule: QueryList<ElementRef>;
    @ViewChild("fileUpload", {read: ElementRef}) fileUpload: ElementRef;
    @ViewChild('pdfTemplate') pdf;
    @ViewChildren("weekWidth") weekWidth;
    chaptersOrder: any[] = [];
    dropSubscription;
    newDate;
    expDate;
    clients;
    persons;
    sellers;
    oldClient;
    oldSeller;
    offerNumber;
    internalHours;
    externalHours;
    rteData = ' ';
    timeline;
    week = [];

    constructor(private route: ActivatedRoute, private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private location: Location, private dragulaService: DragulaService, private dataService: DataService, private dateAdapter: DateAdapter<Date>, private apollo: Apollo, private fileUploadService: TdFileService, private _lightbox: Lightbox, private _lighboxConfig: LightboxConfig) {

        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
        this.sharedService.changeTitle(this.pageTitle);
        this.dateAdapter.setLocale('de');
    }

    ngOnInit() {
        this.route.params.subscribe(
            (params: Params) => {
                this.id = params['id'];
                this.editMode = !!params['edit'];

                // Get data form server
                this.apollo.watchQuery<any>({
                    query: getOffer,
                    variables: {
                        id: this.id
                    },
                    fetchPolicy: 'network-only'
                }).valueChanges.take(1).subscribe(({data}) => {
                    this.item = _.cloneDeep(data.offer);
                    this.sellers = data.sealers; // Set seller data
                    this.selectedSeller = this.item.sealer ? this.item.sealer[0]._id : '';
                    this.selectedClient = this.item.client[0]._id;
                    this.selectedContactPersons = this.item.contacts;
                    this.oldClient = data.offer.client[0]._id;
                    this.oldSeller = data.offer.sealer ?  data.offer.sealer[0]._id : '';
                    this.offerNumber = data.offer.offerNumber;
                    this.internalHours = this.item.internalHours;
                    this.externalHours = this.item.externalHours;
                    this.clients = data.clients; // Set client data
                    this.files = this.item.files; // Set uploaded files
                    this.rteData = this.item.comments;
                    this.timeline = this.item.timeline;

                    if(!_.isEmpty(this.timeline)){
                        this.week = [];

                        for (let i = 1; i <= this.timeline.week ; i++) {
                            this.week.push(i)
                        }

                        console.log('week', this.week );
                    }

                    this.selectedClientContacts = this.clients.filter(client => client._id === this.selectedClient)[0].contacts;

                    // Set offer chapters and pages
                    for (let g of this.item.groups) {
                        this.offersModules.push(g)
                    }
                    for (let p of this.item.pages) {
                        this.offersModules.push(p)
                    }
                    this.offersModules.sort(function (a, b) {
                        return a.order - b.order;
                    });

                    this.offersUpdate = _.cloneDeep(this.offersModules);

                    // format date for datePicker
                    this.totalPrice = this.item.totalPrice;
                    this.signedPrice = this.item.signedPrice;
                    this.newDate = this.item.tstamp;
                    this.expDate = this.item.expDate;

                    // Enable drag and drop
                    const bag: any = this.dragulaService.find(this.dragContainer);
                    if (bag !== undefined) this.dragulaService.destroy(this.dragContainer);

                    this.dragulaService.setOptions(this.dragContainer, {
                        moves: function (el, container, handle) {
                            return handle.className === 'handle mat-icon material-icons';
                        }
                    });

                    // Enable ordering chapters
                    this.dropSubscription = this.dragulaService.drop.subscribe((value) => {
                        this.accordionModule.changes.subscribe(children => {
                            this.chaptersOrder = [];
                            children.forEach(child => {
                                let index = +child.nativeElement.getAttribute('index') + 1;
                                let id = child.nativeElement.getAttribute('id');
                                let element = {id: id, order: index};
                                let offerData = this.offersUpdate.filter(offerData => offerData._id === id)[0];
                                let group = this.offersModules.filter(group => group._id === id)[0];
                                offerData.order = index;
                                group.order = index;
                                this.chaptersOrder.push(element);
                            });
                        });
                    });
                    console.log(this.offersModules);

                    this.loadingService.resolveAll('modulesLoader');
                });
            }
        );
    }

    onSave(form: NgForm) {
        const value = form.value;
        this.editMode = false;
        const client = this.clients.find(client => client._id == value.client);
        const seller = this.sellers.find(seller => seller._id == value.seller);
        let totalPrice = null;
        let signedPrice = null;


        if (value.totalPrice) {
            totalPrice = value.totalPrice.replace(',', '');
        }

        if (value.signedPrice) {
            signedPrice = value.signedPrice.replace(',', '');
        }

        this.apollo.mutate({
            mutation: updateOffer,
            variables: {
                id: this.id,
                offerNumber: this.offerNumber,
                offerTitle: value.offerTitle,
                totalPrice: totalPrice,
                signedPrice: signedPrice,
                bodytext: value.bodytext,
                client: client._id,
                contacts: this.selectedContactPersons,
                seller: seller._id,
                signed: value.signed,
                groupsNew: !this.offersUpdate.length ? [] : this.offersUpdate,
                files: this.files,
                tstamp: value.tstamp,
                expDate: value.expDate,
                oldClient: this.oldClient,
                oldSeller: this.oldSeller,
                internalHours: value.internalHours,
                externalHours: value.externalHours,
                comments: this.rteData,
                timeline: this.timeline
            },
            refetchQueries: [{
                query: getOffer,
                variables: {
                    id: this.id
                }
            }]
        }).subscribe(() => {
            this.editMode = false;
            console.log(this.offersUpdate, 'saved data');
            this.sharedService.sneckBarNotifications('Offer saved!!!');
        });
    }

    onEdit() {
        this.editMode = true
    }

    onModuleEdit(moduleUid, groupUid, module) {
        this.editModuleGroup = groupUid;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                moduleUid: moduleUid,
                groupUid: groupUid,
                moduleNew: module,
                module: module.moduleNew,
                edit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);
                let moduleData = this.offersUpdate[offerIndex].modules.filter(moduleData => moduleData._id === result._id)[0];
                let moduleDataIndex = this.offersUpdate[offerIndex].modules.indexOf(moduleData);

                this.offersUpdate[offerIndex].modules[moduleDataIndex] = result;

                // View data update
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);
                let module = this.offersModules[groupIndex].modules.filter(module => module._id === result._id)[0];
                let moduleIndex = this.offersModules[groupIndex].modules.indexOf(module);

                this.offersModules[groupIndex].modules[moduleIndex] = result;

                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                // update chapter price
                for (let m in this.offersModules[groupIndex].modules) {
                    modulePrices.push(this.offersModules[groupIndex].modules[m].price);

                    if (this.offersModules[groupIndex].modules[m].signed) {
                        signedModulePrices.push(this.offersModules[groupIndex].modules[m].price);
                    }

                }
                sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));

                if (signedModulePrices.length > 0) {
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.offersUpdate[offerIndex].subTotal = sum;
                this.offersUpdate[offerIndex].total = signedSum;
                this.offersModules[groupIndex].subTotal = sum;
                this.offersModules[groupIndex].total = signedSum;

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];


                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }

                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));

                if (signedModulesPrices.length > 0) {
                    this.signedPrice = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.editMode = true

                console.log(this.offersModules);
            }
        });

    }

    onModuleRemove(moduleUid, groupUid) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this module?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {

                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);
                let moduleData = this.offersUpdate[offerIndex].modules.filter(moduleData => moduleData._id === moduleUid)[0];
                let moduleDataIndex = this.offersUpdate[offerIndex].modules.indexOf(moduleData);

                if (moduleData.moduleNew) {
                    this.offersUpdate[offerIndex].modules.splice(moduleDataIndex, 1);
                }
                else {
                    moduleData.deleted = true;
                    this.offersUpdate[offerIndex].modules[moduleDataIndex] = moduleData;
                }

                // View data update
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);
                let module = this.offersModules[groupIndex].modules.filter(module => module._id === moduleUid)[0];
                let moduleIndex = this.offersModules[groupIndex].modules.indexOf(module);
                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                this.offersModules[groupIndex].modules.splice(moduleIndex, 1);

                // update chapter price
                for (let m in this.offersModules[groupIndex].modules) {
                    modulePrices.push(this.offersModules[groupIndex].modules[m].price);

                    if (this.offersModules[groupIndex].modules[m].signed) {
                        signedModulePrices.push(this.offersModules[groupIndex].modules[m].price);
                    }
                }
                if (modulePrices.length) {
                    sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                else {
                    sum = 0;
                }

                if (signedModulePrices.length > 0) {
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                else {
                    signedSum = 0;
                }

                this.offersUpdate[offerIndex].subTotal = sum;
                this.offersUpdate[offerIndex].total = signedSum;
                this.offersModules[groupIndex].subTotal = sum;
                this.offersModules[groupIndex].total = signedSum;

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];

                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }

                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));

                if (signedModulesPrices.length > 0) {
                    this.signedPrice = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.editMode = true
            }
        });
    }

    addModule(groupUid) {
        this.editModuleGroup = groupUid;
        let dialogRef = this.dialog.open(EditModuleDialogComponent, {
            data: {
                groupUid: groupUid,
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);

                this.offersUpdate[offerIndex].modules.push(result);

                // View data update
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);
                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                // update modules list after adding new
                this.offersModules[groupIndex].modules.push(result);

                // update chapter price
                for (let m in this.offersModules[groupIndex].modules) {
                    modulePrices.push(this.offersModules[groupIndex].modules[m].price);

                    if (this.offersModules[groupIndex].modules[m].signed) {
                        signedModulePrices.push(this.offersModules[groupIndex].modules[m].price);
                    }
                }

                sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));

                if (signedModulePrices.length > 0) {
                    signedSum = signedModulePrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.offersUpdate[offerIndex].subTotal = sum;
                this.offersUpdate[offerIndex].total = signedSum;
                this.offersModules[groupIndex].subTotal = sum;
                this.offersModules[groupIndex].total = signedSum;

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];

                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }

                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));

                if (signedModulesPrices.length > 0) {
                    this.signedPrice = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));

            }
            this.editMode = true;
        });
    }

    addChapter() {
        let dialogRef = this.dialog.open(ChapterDialogComponent, {
            data: {
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // update chapters after adding new
                let orderNo = this.offersModules.length + 1;
                result.order = orderNo;
                result.type = 1;
                result.groupNew = true;

                // Update data
                this.offersUpdate.push(result);

                // View data update
                this.offersModules.push(result);

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let signedSum: number = 0;
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];

                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }
                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        this.offersModules[g].modules[m].moduleNew = true;
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }

                if (signedModulesPrices.length > 0) {
                    signedSum = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.signedPrice = signedSum;
                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                console.log(this.offersModules);
            }
        });
        this.editMode = true;
    }

    addFromChapterList(offerUid) {
        let dialogRef = this.dialog.open(ChapterListDialogComponent, {
            data: {
                offerId: offerUid,
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

                for (let c in result) {

                    // Data update
                    let offerData = this.offersUpdate.filter(offerData => offerData._id === result[c].offerUid)[0];

                    // View data update
                    let group = this.offersModules.filter(group => group._id === result[c].offerUid)[0];
                    let groupIndex = this.offersModules.indexOf(group);

                    if (groupIndex > -1) {
                        this.sharedService.sneckBarNotifications('This chapter is already part of this offer!!!');
                    }
                    else {
                        let orderNo = this.offersModules.length + 1;
                        result[c].order = orderNo;
                        result[c].type = 1;
                        result[c].groupNew = true;

                        for (let m in result[c].modules) {
                            result[c].modules[m].moduleNew = true;
                        }

                        // Data update
                        this.offersUpdate.push(result[c]);

                        // View data update
                        this.offersModules.push(result[c]);
                    }

                    // update total price
                    let modulesPrices: any[] = [];
                    let signedModulesPrices: any[] = [];
                    let signedSum: number = 0;
                    let modulesInternalHours: any[] = [];
                    let modulesExternalHours: any[] = [];

                    for (let g in this.offersModules) {
                        if (this.offersModules[g].subTotal) {
                            modulesPrices.push(this.offersModules[g].subTotal);
                        }
                        if (this.offersModules[g].total) {
                            signedModulesPrices.push(this.offersModules[g].total);
                        }

                        for (let m in this.offersModules[g].modules) {
                            // Update offers hours
                            modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                            modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                        }
                    }

                    if (signedModulesPrices.length > 0) {
                        signedSum = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    }

                    this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    this.signedPrice = signedSum;
                    this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                    this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                }
            }
            this.editMode = true;
            console.log(this.offersModules);
        });
    }

    onChapterEdit(groupUid, chapter) {
        let dialogRef = this.dialog.open(ChapterDialogComponent, {
            data: {
                groupUid: groupUid,
                newOffer: true,
                chapterNew: chapter,
                edit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);

                this.offersUpdate[offerIndex] = result;

                // View data update
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);

                // update chapter after edit
                this.offersModules[groupIndex] = result;

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let signedSum: number = 0;
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];

                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }

                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }

                if (signedModulesPrices.length > 0) {
                    signedSum = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.signedPrice = signedSum;
                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
            }
            this.editMode = true;
        });
    }

    onChapterRemove(groupUid) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this Chapter? If you continue all modules in this chapter will be removed too!!!',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);

                if (offerData.groupeNew) {
                    this.offersUpdate.splice(offerIndex, 1);
                }
                else {
                    offerData.deleted = true;
                    this.offersUpdate[offerIndex] = offerData;
                }

                // View data update
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);

                // remove chapter after delete
                this.offersModules.splice(groupIndex, 1);

                // update total price
                let modulesPrices: any[] = [];

                // check if offers chapters is empty before update count
                if (this.offersModules.length > 0) {
                    // update total price
                    let modulesPrices: any[] = [];
                    let signedModulesPrices: any[] = [];
                    let signedSum: number = 0;
                    let modulesInternalHours: any[] = [];
                    let modulesExternalHours: any[] = [];

                    for (let g in this.offersModules) {
                        if (this.offersModules[g].subTotal) {
                            modulesPrices.push(this.offersModules[g].subTotal);
                        }

                        if (this.offersModules[g].total) {
                            signedModulesPrices.push(this.offersModules[g].total);
                        }

                        for (let m in this.offersModules[g].modules) {
                            // Update offers hours
                            modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                            modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                        }
                    }

                    if (signedModulesPrices.length > 0) {
                        signedSum = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    }

                    this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    this.signedPrice = signedSum;
                    this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                    this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                }
                else {
                    this.totalPrice = 0;
                    this.signedPrice = 0;
                    this.internalHours = 0;
                    this.externalHours = 0;
                }
            }
            this.editMode = true;
        });
    }

    addFromModuleList(groupUid) {
        let dialogRef = this.dialog.open(ModuleListDialogComponent, {
            data: {
                groupUid: groupUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let e in result) {
                    // Data update
                    let offerData = this.offersUpdate.filter(offerData => offerData._id === groupUid)[0];
                    let offerIndex = this.offersUpdate.indexOf(offerData);

                    this.offersUpdate[offerIndex].modules.push(result[e]);

                    // View data update
                    let group = this.offersModules.filter(group => group._id === groupUid)[0];
                    let groupIndex = this.offersModules.indexOf(group);

                    // update modules list after adding new
                    this.offersModules[groupIndex].modules.push(result[e]);
                    let modulePrices: any[] = [];
                    let sum: number = 0;

                    // update chapter price
                    for (let m in this.offersModules[groupIndex].modules) {
                        this.offersModules[groupIndex].modules[m].moduleNew = true
                        modulePrices.push(this.offersModules[groupIndex].modules[m].price);
                    }
                    sum = modulePrices.reduce((a, b) => parseInt(a) + parseInt(b));

                    this.offersUpdate[offerIndex].subTotal = sum;
                    this.offersModules[groupIndex].subTotal = sum;
                }

                // update total price
                let modulesPrices: any[] = [];
                let signedModulesPrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;
                let modulesInternalHours: any[] = [];
                let modulesExternalHours: any[] = [];

                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }

                    if (this.offersModules[g].total) {
                        signedModulesPrices.push(this.offersModules[g].total);
                    }

                    for (let m in this.offersModules[g].modules) {
                        // Update offers hours
                        modulesInternalHours.push(this.offersModules[g].modules[m].internalHours);
                        modulesExternalHours.push(this.offersModules[g].modules[m].externalHours);
                    }
                }

                if (signedModulesPrices.length > 0) {
                    signedSum = signedModulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                }

                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.signedPrice = signedSum;
                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
            }
            this.editMode = true;
        });
    }

    addFromPagesList(offerUid) {
        console.log('addPage from list');
        let dialogRef = this.dialog.open(PageListDialogComponent, {
            data: {
                offerUid: offerUid,
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let c in result) {

                    let orderNo = this.offersModules.length + 1;
                    result[c].order = orderNo;
                    result[c].pageNew = true;
                    result[c].type = 2;
                    // Data update
                    this.offersUpdate.push(result[c]);
                    // View data update
                    this.offersModules.push(result[c]);
                    this.sharedService.sneckBarNotifications('Pages added!!!');

                    // update total price
                    let modulesPrices: any[] = [];
                    for (let g in this.offersModules) {
                        if (this.offersModules[g].subTotal) {
                            modulesPrices.push(this.offersModules[g].subTotal);
                        }
                    }
                    if (modulesPrices.length > 0) {
                        this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                    }

                }
            }
            this.editMode = true;
        });
    }

    addPage(offerUid, pageType) {
        console.log('addPage');
        let dialogRef = this.dialog.open(PageEditDialogComponent, {
            data: {
                offerUid: offerUid,
                pageType: pageType
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // update chapters after adding new
                let orderNo = this.offersModules.length + 1;
                result.order = orderNo;
                result.type = 2;

                // Data update
                this.offersUpdate.push(result);

                // View data update
                this.offersModules.push(result);

                // update total price
                let modulesPrices: any[] = [];
                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.sharedService.sneckBarNotifications('Chapter added!!!');
                this.editMode = true;
            }

        });
    }

    onPageEdit(pageUid, page) {
        let dialogRef = this.dialog.open(PageEditDialogComponent, {
            data: {
                pageNew: page,
                pageUid: pageUid,
                edit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log(result);
                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === pageUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);

                this.offersUpdate[offerIndex] = result;

                let group = this.offersModules.filter(group => group._id === pageUid)[0];
                let groupIndex = this.offersModules.indexOf(group);

                // update chapter after edit
                this.offersModules[groupIndex] = result;

                // update total price
                let modulesPrices: any[] = [];
                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.editMode = true;
            }
        });
    }

    onPageRemove(pageUid) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this Page?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                // Data update
                let offerData = this.offersUpdate.filter(offerData => offerData._id === pageUid)[0];
                let offerIndex = this.offersUpdate.indexOf(offerData);

                if (offerData.groupeNew) {
                    this.offersUpdate.splice(offerIndex, 1);
                }
                else {
                    offerData.deleted = true;
                    this.offersUpdate[offerIndex] = offerData;
                }

                // View data update
                let group = this.offersModules.filter(group => group._id === pageUid)[0];
                let groupIndex = this.offersModules.indexOf(group);

                // remove chapter after delete
                this.offersModules.splice(groupIndex, 1);

                // update total price
                let modulesPrices: any[] = [];
                for (let g in this.offersModules) {
                    if (this.offersModules[g].subTotal) {
                        modulesPrices.push(this.offersModules[g].subTotal);
                    }
                }
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.sharedService.sneckBarNotifications('Page removed!!!');
                this.editMode = true;
            }
        });
    }


    onRemarksEdit(remarks: string) {

        let dialogRef = this.dialog.open(RteDialogComponent, {
            data: {
                rteData: remarks
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.rteData = result;
                this.editMode = true;
            }
        });

    }

    selectEvent(files: FileList | File): void {
        if (files instanceof FileList) {
            console.log(files);
        } else {
            console.log('else');
        }
    }

    uploadEvent(files: FileList | File): void {
        if (files instanceof FileList) {
            console.log(files);
        } else {
            let options: IUploadOptions = {
                url: '/upload',
                method: 'post',
                file: files
            };
            this.fileUploadService.upload(options).subscribe((data) => {
                let file = JSON.parse(data);
                file.tstamp = new Date();
                this.files.push(file);
                console.log(this.files);
                let event = new MouseEvent('click', {bubbles: true});
                this.fileUpload.nativeElement.children[0].children[1].dispatchEvent(event);
            });
            this.editMode = true;
        }
    }

    cancelEvent(): void {
        console.log('cancel');
    }

    goBack() {
        this.location.back();
    }

    onPrint(offer, offersGroups, type) {
        let dialogRef = this.dialog.open(PdfDialogComponent, {
            data: {
                offer: offer,
                groups: offersGroups,
                type: type
            }
        });
    }

    keyupHandler(ev) {
        this.rteData = ev;
    }

    toggleSummary(event, id) {
        console.log('in summary');
        let chapter = this.offersUpdate.find(chapter => chapter._id == id);

        if (event.checked) {
            chapter.summary = true;
        }
        else {
            chapter.summary = false;
        }
    }

    lightbox(filePath, fileName) {
        this._lighboxConfig.centerVertically = true;
        const album = {
            src: filePath,
            caption: fileName,
            thumb: ''
        };
        this._lightbox.open([album], 0);
    }

    onDeleteFile(fileName: string) {
        let file = this.files.filter(file => file.filename === fileName)[0];
        let fileIndex = this.files.indexOf(file);

        this.files[fileIndex].deleted = true;
        this.editMode = true;
        console.log(this.files);
    }

    onSelectChange(id) {
        this.apollo.watchQuery<any>({
            query: fetchClientContact,
            variables: {
                id: id
            },
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.selectedClientContacts = _.cloneDeep(data.client.contacts);
        });
    }

    addWeek(week) {
        this.timeline.week = week.target.value;
        this.week = [];

        for (let i = 1; i <= week.target.value ; i++) {
            this.week.push(i)
        }

        this.editMode = true;
    }

    addTask() {
        let dialogRef = this.dialog.open(TaskDialogComponent);
        let count = Date.now();

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                !this.timeline.tasks ? this.timeline.tasks = [] : this.timeline.tasks;
                result.id = count;

                this.timeline.tasks.push(result);
                this.editMode = true;

            }
        });


    }
    editTask(task){
        let dialogRef = this.dialog.open(TaskDialogComponent, {
            data: {
                task: task,
                edit: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let taskData = this.timeline.tasks.filter(taskData => taskData.id === task.id)[0];
                let taskIndex = this.timeline.tasks.indexOf(taskData);

                this.timeline.tasks[taskIndex] = result;

            }
        });
    }

    removeTask(task) {
        let taskData = this.timeline.tasks.filter(taskData => taskData.id === task)[0];
        let taskIndex = this.timeline.tasks.indexOf(taskData);

        this.timeline.tasks.splice(taskIndex, 1);
        console.log(this.timeline);
    }

    ngOnDestroy() {
        this.dragulaService.destroy(this.dragContainer);
        this.dropSubscription.unsubscribe();
    }
}
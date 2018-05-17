import {
    Component, ElementRef, OnInit, Output, ViewChild,
    ViewContainerRef, QueryList, ViewChildren, OnDestroy,
} from '@angular/core';
import {Router} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {DateAdapter, MatDialog} from "@angular/material";
import {Location} from '@angular/common';
import {Offer} from "../offers.model";
import {EditModuleDialogComponent} from "../../modules/edit-module-dialog/edit-module-dialog.component";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {ChapterDialogComponent} from "../../chapters/chapter-dialog/chapter-dialog.component";
import {ModuleListDialogComponent} from "../../modules/module-list-dialog/module-list-dialog.component";
import {ChapterListDialogComponent} from "../../chapters/chapter-list-dialog/chapter-list-dialog.component";
import {Apollo} from 'apollo-angular';
import createOffer from '../../queries/offer/createOffer';
import getOffers from '../../queries/offer/fetchOffers';
import getSealersClients from '../../queries/getSealersClients';
import {PageEditDialogComponent} from "../../additional-data/page-edit-dialog/page-edit-dialog.component";
import {PageListDialogComponent} from "../../additional-data/page-list-dialog/page-list-dialog.component";
import {TdFileService, IUploadOptions} from '@covalent/core';
import {DragulaService} from "ng2-dragula";
import {Lightbox, LightboxConfig} from "angular2-lightbox";
import fetchClientContact from "../../queries/offer/fetchClientContacts";
import * as _ from "lodash";

@Component({
    selector: 'app-new-offer',
    templateUrl: './new-offer.component.html',
    styleUrls: ['./new-offer.component.css'],
    providers: [TdFileService]
})

export class NewOfferComponent implements OnInit, OnDestroy {
    pageTitle = 'Offers';
    title = 'New offer';
    id: number;
    item: Offer;
    files: any[] = [];
    file: File;
    @Output() editMode = true;
    selectedSeller;
    selectedClient;
    selectedClientContacts = [];
    selectedContactPersons =[];
    sellers;
    clients;
    offersModules = [];
    editModuleGroup: number;
    dragContainer = 'draggable-bagNew';
    totalPrice;
    signedPrice;
    disabled = false;
    dropSubscription;
    @ViewChild("fileUpload", {read: ElementRef}) fileUpload: ElementRef;
    @ViewChildren('accordionModule', {read: ElementRef}) accordionModule: QueryList<ElementRef>;
    chaptersOrder;
    newDate;
    expDate;
    internalHours = 0;
    externalHours = 0;
    rteData = "<h4>Bemerkungen</h4><ul><li>Alle Preise sind in Schweizer Franken exkl. Mehrwertsteuer angegeben.</li><li>Konditionen einmalige Kosten: 50% f&auml;llig nach Abschluss des Vertrags; Restbetrag f&auml;llig 12 Wochen nach Projektstart (Kickoff Meeting).</li><li>Die Nutzungsrechte sind f&uuml;r den Gebrauch der Webl&ouml;sung abgegolten.</li><li>Diese Offerte beh&auml;lt ihre G&uuml;ltigkeit bis zum 31. Juli 2017.</li><li>Alle Inhalte (Texte, Bilder, Logos) werden vom Kunden in digitaler Form sp&auml;testens eine Woche vor der Content-Eingabe geliefert.</li><li>Einmalige Content-Eingabe ist im Preis inbegriffen. Nachtr&auml;gliches Hinzuf&uuml;gen oder &Auml;ndern des Inhaltes wird nach Aufwand verrechnet.</li><li>Erst mit der vollst&auml;ndigen Bezahlung des vertraglich festgesetzten Preises wird das Nutzungsrecht erworben.</li></ul>";


    constructor(private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private router: Router, private loadingService: TdLoadingService, private location: Location, private apollo: Apollo, private fileUploadService: TdFileService, private dateAdapter: DateAdapter<Date>, private dragulaService: DragulaService, private _lightbox: Lightbox, private _lighboxConfig: LightboxConfig) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });

        this.dateAdapter.setLocale('de');
        this.loadingService.register('modulesLoader');
        this.sharedService.changeTitle(this.pageTitle);
    }

    ngOnInit() {
        this.apollo.watchQuery<any>({
            query: getSealersClients
        }).valueChanges.subscribe(({data}) => {
            this.clients = data.clients;
            this.sellers = data.sealers;
            this.newDate = new Date();
            this.totalPrice = 0;
            this.signedPrice = 0;

            // Enable drag and drop
            const bag: any = this.dragulaService.find(this.dragContainer);
            if (bag !== undefined) this.dragulaService.destroy(this.dragContainer);

            this.dragulaService.setOptions(this.dragContainer, {
                moves: function (el, container, handle) {
                    return handle.className === 'handle mat-icon material-icons';
                },
                revertOnSpill: true
            });

            this.loadingService.resolveAll('modulesLoader');
        });

        // Enable ordering chapters
        this.dropSubscription = this.dragulaService.drop.subscribe((value) => {
            this.accordionModule.changes.subscribe(children => {
                this.chaptersOrder = [];
                children.forEach(child => {
                    let index = +child.nativeElement.getAttribute('index') + 1;
                    let id = child.nativeElement.getAttribute('id');
                    let element = {id: id, order: index};
                    let group = this.offersModules.filter(group => group._id === id)[0];
                    group.order = index;
                    this.chaptersOrder.push(element);
                });
            });
        });
    }


    onSave(form: NgForm) {
        const value = form.value;
        const client = this.clients.find(client => client._id == value.client);
        const seller = this.sellers.find(seller => seller.value == value.seller);
        let totalPrice = null;
        let signedPrice = null;

        if (value.totalPrice) {
            totalPrice = value.totalPrice.replace(',', '');
        }

        if (value.signedPrice) {
            signedPrice = value.signedPrice.replace(',', '');
        }

        this.apollo.mutate({
            mutation: createOffer,
            variables: {
                offerNumber: value.offerNumber,
                offerTitle: value.offerTitle,
                totalPrice: totalPrice,
                signedPrice: signedPrice,
                bodytext: value.bodytext,
                client: client._id,
                contacts: this.selectedContactPersons,
                seller: seller._id,
                groupsNew: !this.offersModules.length ? [] : this.offersModules,
                files: this.files,
                expDate: value.expDate,
                internalHours: +value.internalHours,
                externalHours: +value.externalHours,
                comments: this.rteData
            },
            refetchQueries: [{
                query: getOffers
            }],
        }).subscribe(() => {
            this.editMode = false;
            this.sharedService.sneckBarNotifications(`offer created.`);
            this.router.navigate(['/offers']);
        })
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
                newOffer: true,
                moduleNew: module,
                module: module.moduleNew,
                edit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
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
                let group = this.offersModules.filter(group => group._id === groupUid)[0];
                let groupIndex = this.offersModules.indexOf(group);
                let module = this.offersModules[groupIndex].modules.filter(module => module._id === moduleUid)[0];
                let moduleIndex = this.offersModules[groupIndex].modules.indexOf(module);
                let modulePrices: any[] = [];
                let signedModulePrices: any[] = [];
                let sum: number = 0;
                let signedSum: number = 0;

                // remove module after delete
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
                result.type = 1;
                result.order = orderNo;
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
            }
        });
        this.editMode = true;
    }

    addFromChapterList() {
        let dialogRef = this.dialog.open(ChapterListDialogComponent, {
            data: {
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let c in result) {
                    let group = this.offersModules.filter(group => group._id === result[c].offerId)[0];
                    let groupIndex = this.offersModules.indexOf(group);

                    if (groupIndex > -1) {
                        this.sharedService.sneckBarNotifications('This chapter is already part of this offer!!!');
                    }
                    else {
                        let orderNo = this.offersModules.length + 1;
                        result[c].order = orderNo;
                        result[c].type = 1;
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
                this.signedPrice = signedSum;
                this.totalPrice = modulesPrices.reduce((a, b) => parseInt(a) + parseInt(b));
                this.internalHours = modulesInternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
                this.externalHours = modulesExternalHours.reduce((a, b) => parseInt(a) + parseInt(b));
            }
        });
    }

    addFromPagesList() {
        let dialogRef = this.dialog.open(PageListDialogComponent, {
            data: {
                edit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let c in result) {
                    let orderNo = this.offersModules.length + 1;
                    result[c].order = orderNo;
                    result[c].type = 2;
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
        });
    }

    addPage(pageType) {
        let dialogRef = this.dialog.open(PageEditDialogComponent,{
            data: {
                pageType: pageType
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // update chapters after adding new
                let orderNo = this.offersModules.length + 1;
                result.order = orderNo;
                result.type = 2;
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
            }
        });
    }

    onPageRemove(pageUid: number) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this Page?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
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
            console.log('else');
            let options: IUploadOptions = {
                url: 'http://localhost:3000/upload',
                method: 'post',
                file: files
            };
            this.fileUploadService.upload(options).subscribe((data) => {
                let file = JSON.parse(data);
                file.tstamp = new Date();
                this.files.push(file);
                let event = new MouseEvent('click', {bubbles: true});
                this.fileUpload.nativeElement.children[0].children[1].dispatchEvent(event);

            });
        }
    }

    cancelEvent(): void {
        console.log('cancel');
    }

    goBack() {
        this.location.back();
    }

    keyupHandler(ev) {
        this.rteData = ev;
    }

    toggleSummary(event, id) {
        let chapter = this.offersModules.find(chapter => chapter._id == id);

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


    ngOnDestroy() {
        console.log('destroy');
        this.dragulaService.destroy(this.dragContainer);
        this.dropSubscription.unsubscribe();
    }
}


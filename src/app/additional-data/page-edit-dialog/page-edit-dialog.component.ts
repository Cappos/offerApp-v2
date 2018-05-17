import {Component, Inject, OnInit, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService, TdFileService, IUploadOptions} from "@covalent/core";
import {Apollo} from "apollo-angular";
import getPage from '../../queries/page/fetchPage';
import * as _ from "lodash";
import {Lightbox, LightboxConfig} from "angular2-lightbox";

@Component({
    selector: 'app-page-edit-dialog',
    templateUrl: './page-edit-dialog.component.html',
    styleUrls: ['./page-edit-dialog.component.css']
})

export class PageEditDialogComponent implements OnInit {
    id;
    item;
    rteData = '';
    savedPageData;
    itemSaved = false;
    editMode = true;
    order;
    files: any[] = [];
    file: File;
    @ViewChild("fileUpload", {read: ElementRef}) fileUpload: ElementRef;
    pageType;

    constructor(public dialog: MatDialog, private _dialogService: TdDialogService, public dialogRef: MatDialogRef<PageEditDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService, private apollo: Apollo, private fileUploadService: TdFileService, private _lightbox: Lightbox, private _lighboxConfig: LightboxConfig) {

        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
    }

    ngOnInit() {
        if (this.data.edit && !this.data.pageNew) {
            this.id = this.data.pageUid;
            this.apollo.watchQuery<any>({
                query: getPage,
                variables: {
                    id: this.id
                }
            }).valueChanges.subscribe(({data}) => {
                this.item = _.cloneDeep(data.page);
                this.rteData = this.item.bodytext;
                this.order = this.item.order;
                this.pageType = this.item.pageType;
                this.files = this.item.files;
                this.loadingService.resolveAll('modulesLoader');
            });
        }
        else if(this.data.pageUid){
            this.id = this.data.pageUid;
            this.item = this.data.pageNew;
            this.rteData = this.item.bodytext;
            this.order = this.item.order;
            this.pageType = this.item.pageType;
            this.files = this.item.files;
            this.loadingService.resolveAll('modulesLoader');
        }
        else {
            this.id = Math.random();
            this.rteData = ' ';
            this.pageType = this.data.pageType;
            this.loadingService.resolveAll('modulesLoader');
        }

        console.log(this.pageType);
    }

    onSave(form: NgForm) {
        console.log('saved');
        this.savedPageData = form.value;
        this.savedPageData.bodytext = this.rteData;
        this.savedPageData._id = this.id;
        this.savedPageData.type = 2;
        this.savedPageData.order = this.order;
        this.savedPageData.files = this.files;
        this.savedPageData.pageType =this.pageType;
        this.itemSaved = true;
    }

    keyupHandler(ev) {
        this.rteData = ev;
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
                url: '/upload/graph',
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

    onDeleteFile(fileName: string) {
        let file = this.files.filter(file => file.filename === fileName)[0];
        let fileIndex = this.files.indexOf(file);

        this.files.splice(fileIndex, 1);
        this.editMode = true;
        console.log(this.files);
    }

    closeDialog() {
        this._dialogService.closeAll();
    }

}
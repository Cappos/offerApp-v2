import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {TdDialogService} from "@covalent/core";
import {Http} from "@angular/http";
import {Module} from "../modules/modules.model";
import {HttpClient} from "@angular/common/http";

export enum OrderBy {
    ASC = <any>'asc',
    DESC = <any>'desc',
}

export interface IHeaders {
    [key: string]: OrderBy;
}

@Component({
    selector: 'app-media-browser',
    templateUrl: './media-browser.component.html',
    styleUrls: ['./media-browser.component.css']
})
export class MediaBrowserComponent implements OnInit {
    data: any[];
    orgData: any[];
    userFilter: any = {name: ''};
    columnOptions = {
        value: 'name',
    };
    sortKey: string = this.columnOptions.value;
    headers: IHeaders = {};
    breadcrumbs: any[] = [{id: 0, parentName: 'Root'}];
    @ViewChild('actionMenu') actionMenu: ElementRef;
    selectElement;
    folderId;
    hasFolder = true;
    newMedia;
    cutItem;
    cutFolder;
    pasteEnable = false;
    fileSelectMultipleMsg: string;
    fileUploadMultipleMsg: string;
    clickedButton;
    mediaData;

    constructor(private http: Http, public dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, public snackBar: MatSnackBar, private elementRef: ElementRef, public dialogRef: MatDialogRef<MediaBrowserComponent>, private httpClient: HttpClient) {

        this.mediaData = this.httpClient.get<Module>('http://wrenchweb.com/http/mediaData', {
            observe: 'body',
            responseType: 'json'
        });
        this.mediaData.take(1).subscribe((response) => {
            this.data = response;
            this.orgData = this.data;
            this.headers[this.columnOptions.value] = OrderBy.ASC;
        })
    }

    ngOnInit() {

    }

    isASC(sortKey: string): boolean {
        return this.headers[sortKey] === OrderBy.ASC;
    }

    sortBy(sortKey: string): void {
        if (this.headers[sortKey] === OrderBy.ASC) {
            this.headers[sortKey] = OrderBy.DESC;
        } else {
            this.headers[sortKey] = OrderBy.ASC;
        }
        this.data = this.data.sort((rowA: Object, rowB: Object) => {
            let cellA: string = rowA[sortKey];
            let cellB: string = rowB[sortKey];
            let sort: number = 0;
            if (cellA < cellB) {
                sort = -1;
            } else if (cellA > cellB) {
                sort = 1;
            }
            return sort * (this.headers[sortKey] === OrderBy.DESC ? -1 : 1);
        });
    }

    selectItem(id: number) {
        this.folderId = id;
        this.data.filter(element => {
            if (element.id === id) {
                if (element.type === 1) {
                    this.breadcrumbs.push({id: element.id, parentName: element.name});
                    const dataNew = element.files;
                    this.userFilter.name = '';
                    return this.data = dataNew;
                }
            }
        });
    }

    selectedItem(item) {
        this.clickedButton = item
    }

    onStepBack(id: number) {
        this.folderId = id;
        if (typeof this.findById(this.orgData, id) === 'undefined') {
            this.userFilter.name = '';
            this.breadcrumbs.splice(1);
            return this.data = this.orgData;
        }
        if (this.findById(this.orgData, id).id === id) {
            this.breadcrumbs.filter(el => {
                if (el.id === this.findById(this.orgData, id).id) {
                    let index = this.breadcrumbs.indexOf(el) + 1;
                    this.breadcrumbs.splice(index, 1);
                }
            });
            this.userFilter.name = '';
            return this.data = this.findById(this.orgData, id).files;
        }
    }

    onRightClick(ev, id: number) {
        let event = new MouseEvent('click', {bubbles: true});
        this.actionMenu.nativeElement.dispatchEvent(event);
        this.selectElement = id;
        return false;
    }

    onCutFile() {
        this.data.filter(file => {
            if (file.id === this.selectElement) {
                this.cutItem = file;
                this.pasteEnable = true;
                this.cutFolder = this.folderId;
            }
        });
    }

    onRenameFile() {
        this.data.filter(file => {
            if (file.id === this.selectElement) {
                this._dialogService.openPrompt({
                    message: 'Rename ' + file.name + '',
                    disableClose: false,
                    viewContainerRef: this._viewContainerRef,
                    title: 'Prompt',
                    value: '' + file.name + '',
                    cancelButton: 'Cancel',
                    acceptButton: 'Ok'
                }).afterClosed().subscribe((newValue: string) => {
                    if (newValue) {
                        file.name = newValue;
                        this.findById(this.orgData, this.folderId).files = this.data;
                        // this.dataService.storeMediaData(this.orgData);
                        return this.data
                    }
                });
            }
        });
    }

    onDeleteFile() {
        this.data.filter(del => {
            if (del.id === this.selectElement) {
                let index = this.data.indexOf(del);
                this.data.splice(index, 1);
                this.findById(this.orgData, this.folderId).files = this.data;
                // if (del.type !== 1) {
                //     let storageRef = firebase.storage().ref();
                //     let path = `/${this.serverFolder}/${del.orgName}`;
                //     let iRef = storageRef.child(path);
                //     iRef.delete().then(function () {
                //         console.log('File deleted');
                //     }).catch(function (error) {
                //         console.log(error);
                //     });
                // }
                // this.dataService.storeMediaData(this.orgData);
                return this.data
            }
        });
    }

    createFolder() {
        this._dialogService.openPrompt({
            message: '',
            disableClose: false,
            viewContainerRef: this._viewContainerRef,
            title: 'Create folder',
            value: 'New Folder',
            cancelButton: 'Cancel',
            acceptButton: 'Ok'
        }).afterClosed().subscribe((newValue: string) => {
            if (newValue) {
                this.data.filter(name => {
                    if (newValue === name.name) {
                        this.hasFolder = false;
                    }
                });
                this.newMedia = {
                    "id": 12 + Math.floor((Math.random() * 100) + 1),
                    "name": newValue,
                    "created_at": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                    "owner": "Bethany",
                    "icon": "folder",
                    "type": 1,
                    "files": []
                };
                if (this.hasFolder) {
                    this.data.push(this.newMedia);
                    if (this.findById(this.orgData, this.folderId).id === this.folderId) {
                        this.findById(this.orgData, this.folderId).files = this.data;
                        // this.dataService.storeMediaData(this.orgData);
                    }
                    this.hasFolder = true;
                    return this.data;
                }
                else {
                    this.snackBar.open('Folder with the name ' + newValue + ' already exists', null, {
                        duration: 2000
                    });
                }
            }
        });
    }

    onPasteItem() {
        if (this.data.indexOf(this.findById(this.data, this.cutItem.id)) && this.folderId !== this.cutItem.id) {
            let index = this.findById(this.orgData, this.cutFolder).files.findIndex(i => i.id === this.cutItem.id);
            this.findById(this.orgData, this.cutFolder).files.splice(index, 1);
            this.data.push(this.cutItem);
            // this.dataService.storeMediaData(this.orgData);
            return this.data;
        }
        else {
            this.snackBar.open('This folder can\'t be moved', null, {
                duration: 2000
            });
        }
        this.pasteEnable = false;
        this.cutItem = '';
    }

    selectMultipleEvent(files: FileList | File): void {
        if (files instanceof FileList) {
            let names: string[] = [];
            for (let i: number = 0; i < files.length; i++) {
                names.push(files[i].name);
            }
            this.findById(this.orgData, this.folderId).files = this.data;
            this.fileSelectMultipleMsg = names.join(',');
        } else {
            this.fileSelectMultipleMsg = files.name;
        }
    }

    uploadMultipleEvent(files: FileList | File): void {
        if (files instanceof FileList) {
            let names: string[] = [];
            for (let i: number = 0; i < files.length; i++) {
                names.push(files[i].name);
                this.data.filter(data => {
                    if (data.name === files[i].name) {
                        this.hasFolder = false;
                        this.snackBar.open('File already exists', null, {
                            duration: 2000
                        });
                    }
                });
                if (this.hasFolder) {
                    // let storageRef = firebase.storage().ref();
                    // let path = `/${this.serverFolder}/${files[i].name}`;
                    // let iRef = storageRef.child(path);
                    let imgUri = '';
                    // iRef.put(files[i]).then((snapshot) => {
                    //     storageRef.child(path).getDownloadURL().then((url) => {
                    //         imgUri = url;
                    //         let newImage = {
                    //             "id": 12 + Math.floor((Math.random() * 100) + 1),
                    //             "name": files[i].name.replace(/\.[^/.]+$/, ""),
                    //             "orgName": files[i].name,
                    //             "created_at": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                    //             "owner": "Bethany",
                    //             "icon": "" + files[i].type === 'application/pdf' ? 'picture_as_pdf' : 'photo' + "",
                    //             "type": files[i].type === 'application/pdf' ? 3 : 2,
                    //             "src": "" + files[i].type === 'application/pdf' ? '' : imgUri + "",
                    //             "files": []
                    //         };
                    //         this.data.push(newImage);
                    //         this.findById(this.orgData, this.folderId).files = this.data;
                    //         this.dataService.storeMediaData(this.orgData);
                    //     })
                    // });
                    let newImage = {
                        "id": 12 + Math.floor((Math.random() * 100) + 1),
                        "name": files[i].name.replace(/\.[^/.]+$/, ""),
                        "orgName": files[i].name,
                        "created_at": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                        "owner": "Bethany",
                        "icon": "" + files[i].type === 'application/pdf' ? 'picture_as_pdf' : 'photo' + "",
                        "type": files[i].type === 'application/pdf' ? 3 : 2,
                        "src": "" + files[i].type === 'application/pdf' ? '' : imgUri + "",
                        "files": []
                    };
                    this.data.push(newImage);
                }
                this.hasFolder = true;
            }
            this.fileUploadMultipleMsg = names.join(',');
        } else {
            this.data.filter(data => {
                if (data.name === files.name) {
                    this.hasFolder = false;

                    this.snackBar.open('File already exists', null, {
                        duration: 2000
                    });
                }
            });
            if (this.hasFolder) {
                // let storageRef = firebase.storage().ref();
                // let path = `/${this.serverFolder}/${files.name}`;
                // let iRef = storageRef.child(path);
                let imgUri = '';
                // iRef.put(files).then((snapshot) => {
                //     storageRef.child(path).getDownloadURL().then((url) => {
                //         imgUri = url;
                //         this.data.push({
                //             "id": 12 + Math.floor((Math.random() * 100) + 1),
                //             "name": files.name.replace(/\.[^/.]+$/, ""),
                //             "orgName": files.name,
                //             "created_at": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                //             "owner": "Bethany",
                //             "icon": "" + files.type === 'application/pdf' ? 'picture_as_pdf' : 'photo' + "",
                //             "type": files.type === 'application/pdf' ? 3 : 2,
                //             "src": "" + files.type === 'application/pdf' ? '' : imgUri + "",
                //             "files": []
                //         });
                //         this.findById(this.orgData, this.folderId).files = this.data;
                //         this.dataService.storeMediaData(this.orgData);
                //     })
                // });
                this.data.push({
                    "id": 12 + Math.floor((Math.random() * 100) + 1),
                    "name": files.name.replace(/\.[^/.]+$/, ""),
                    "orgName": files.name,
                    "created_at": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                    "owner": "Bethany",
                    "icon": "" + files.type === 'application/pdf' ? 'picture_as_pdf' : 'photo' + "",
                    "type": files.type === 'application/pdf' ? 3 : 2,
                    "src": "" + files.type === 'application/pdf' ? '' : imgUri + "",
                    "files": []
                });
                this.findById(this.orgData, this.folderId).files = this.data;
            }
            this.hasFolder = true;
            this.fileUploadMultipleMsg = files.name;
        }
        let closeButton = this.elementRef.nativeElement.querySelector('.td-file-upload-cancel');
        closeButton.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }

    closeDialog() {
        this._dialogService.closeAll();
    }

    // find in json array recursively
    findById(o, id) {
        if (o.id === id) {
            return o;
        }
        let result, p;
        for (p in o) {
            if (o.hasOwnProperty(p) && typeof o[p] === 'object') {
                result = this.findById(o[p], id);
                if (result) {
                    return result;
                }
            }
        }
        return result;
    }

}

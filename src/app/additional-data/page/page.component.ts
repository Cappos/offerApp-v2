import {Component, OnInit, Output, ElementRef, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {LoadingMode, LoadingType, TdLoadingService, TdFileService, IUploadOptions} from "@covalent/core";
import {SharedService} from "../../shared/shared.service";
import {Apollo} from "apollo-angular";
import fetchPage from '../../queries/page/fetchPage';
import getPagesData from '../../queries/page/fetchPages';
import updatePage from '../../queries/page/updatePage';
import  createPage from '../../queries/page/createPage';
import * as _ from "lodash";
import {Lightbox, LightboxConfig} from "angular2-lightbox";

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {
    title;
    id: number;
    item;
    @Output() editMode = false;
    rteData = '';
    files: any[] = [];
    file: File;
    @ViewChild("fileUpload", {read: ElementRef}) fileUpload: ElementRef;
    pageType;

    constructor(private route: ActivatedRoute, private loadingService: TdLoadingService, private apollo: Apollo, private sharedService: SharedService, private location: Location, private router: Router,
                private fileUploadService: TdFileService, private _lightbox: Lightbox, private _lighboxConfig: LightboxConfig) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
    }

    ngOnInit() {
        this.route.params.subscribe(
            (params: Params) => {
                if(params['id']){
                    this.id = params['id'];
                    this.editMode = !!params['edit'];

                    this.apollo.watchQuery<any>({
                        query: fetchPage,
                        variables: {
                            id: this.id
                        },
                        fetchPolicy: 'network-only'
                    }).valueChanges.subscribe(({data}) => {
                        this.item = _.cloneDeep(data.page);
                        this.pageType = this.item.pageType;
                        this.title = this.item.title;
                        this.rteData = this.item.bodytext;
                        this.files = this.item.files; // Set uploaded files
                        this.loadingService.resolveAll('modulesLoader');
                    });

                } else {
                    this.title = 'New page';
                    this.rteData = ' ';
                    this.editMode = true;
                    this.pageType = params['type'];
                    this.loadingService.resolveAll('modulesLoader');
                }
                console.log(this.pageType)
            }


        );
    }

    onEdit() {
        this.editMode = true;
    }

    onSave(form: NgForm){
        const value = form.value;
        if(this.id){
            this.apollo.mutate({
                mutation: updatePage,
                variables: {
                    id: this.id,
                    title: value.title,
                    pageType: this.pageType,
                    subtitle: value.subtitle,
                    bodytext: this.rteData,
                    files: this.files,
                    legal: value.legal
                },
                refetchQueries: [{
                    query: getPagesData
                }]
            }).subscribe(() => {
                this.sharedService.sneckBarNotifications(`page updated.`);
                this.editMode = false;
            });
        }
        else {
            this.apollo.mutate({
                mutation: createPage,
                variables: {
                    title: value.title,
                    pageType: this.pageType,
                    subtitle: value.subtitle,
                    bodytext: this.rteData,
                    files: this.files,
                    legal: value.legal
                },
                refetchQueries: [{
                    query: getPagesData
                }]
            }).subscribe(() => {
                this.sharedService.sneckBarNotifications(`page created.`);
                this.editMode = false;
                this.router.navigate(['/additionalData']);
            });
        }


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

        // this.files[fileIndex].deleted = true;
        this.files.splice(fileIndex, 1);
        this.editMode = true;
        console.log(this.files);
    }


    goBack(){
        this.location.back();
    }
}

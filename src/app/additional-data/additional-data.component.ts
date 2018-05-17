import {
    Component, HostBinding, OnInit, Output, ElementRef, QueryList, ViewChildren, ViewContainerRef
} from '@angular/core';
import {SharedService} from '../shared/shared.service';
import {
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableSortingOrder,
    TdLoadingService, TdDialogService
} from '@covalent/core';
import 'rxjs';
import {Router} from '@angular/router';
import {slideInDownAnimation} from '../_animations/app.animations';
import {MediaBrowserComponent} from '../media-browser/media-browser.component';
import {MatDialog} from '@angular/material';
import {Apollo} from "apollo-angular";
import getPages from '../queries/page/fetchPages';
import removePage from '../queries/page/deletePage';

@Component({
    selector: 'app-additional-data',
    templateUrl: './additional-data.component.html',
    styleUrls: ['./additional-data.component.css'],
    animations: [slideInDownAnimation]
})
export class AdditionalDataComponent implements OnInit {
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('class.td-route-animation') classAnimation = true;

    pageTitle = 'Default text data';
    title = 'Select option';
    @Output() activeTab = 0;
    @ViewChildren('accordionModule', {read: ElementRef}) accordionModule: QueryList<ElementRef>;
    columns: ITdDataTableColumn[] = [
        {name: 'uid', label: 'No.', tooltip: 'No.'},
        {name: 'title', label: 'Page title', tooltip: 'Page title'},
        {name: 'tstamp', label: 'Date', tooltip: 'Date'},
        {name: 'action', label: 'Actions', tooltip: 'Actions'},
    ];

    data: any[];
    sortBy = 'id';
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    media: any[] = [];

    constructor(private sharedService: SharedService, private router: Router, private loadingService: TdLoadingService, public dialog: MatDialog, private apollo: Apollo, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.sharedService.changeTitle(this.pageTitle);
        this.loadingService.register('modulesLoader');
    }

    ngOnInit() {
        this.apollo.watchQuery<any>({
            query: getPages,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = data.pages;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    sort(sortEvent: ITdDataTableSortChangeEvent, name: string): void {
        this.sortBy = name;
        this.sortOrder = sortEvent.order === TdDataTableSortingOrder.Descending ? TdDataTableSortingOrder.Ascending : TdDataTableSortingOrder.Descending;
    }

    onSelectChange = ($event: any): void => {
        this.activeTab = $event.index;
        this.router.navigate(['/additionalData/']);
    };

    onEdit(row) {
        let id = row['_id'];
        let type = row['pageType'];
        this.router.navigate(['/additionalData/page/' + id + '/edit/' + type]);
    }

    onDelete(row) {
        let id = row['_id'];
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this page?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removePage,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getPages
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`module ${res.data.deletePage.title} deleted!!!.`);
                });
            }
        });
    }

    onSelect(row) {
        let id = row['_id'];
        let type = row['pageType'];
        console.log(type);
        this.router.navigate(['/additionalData/page/' + id + '/' + type]);
    }

    addGraph() {
        const dialogRef = this.dialog.open(MediaBrowserComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log(result);
                this.media.push(result);
            }
        });
    }

    onImgRemove(id: number) {
        this.media.splice(this.media.findIndex(el => el.id === id), 1);
    }
}

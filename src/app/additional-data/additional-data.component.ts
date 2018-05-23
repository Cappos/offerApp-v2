import {
    Component, HostBinding, OnInit, ViewContainerRef, ViewChild
} from '@angular/core';
import {SharedService} from '../shared/shared.service';
import {LoadingMode, LoadingType, TdLoadingService, TdDialogService} from '@covalent/core';
import 'rxjs';
import {Router} from '@angular/router';
import {slideInDownAnimation} from '../_animations/app.animations';
import {MediaBrowserComponent} from '../media-browser/media-browser.component';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
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
    title = ' List of all Pages';
    data: any[];
    media: any[] = [];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: '_id', name: 'No.'},
        {field: 'title', name: 'Title'},
        {field: 'tstamp', name: 'Date'},
        {field: 'actions', name: 'Actions'}
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

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
            this.tableData = this.data;

            // Assign the data to the data source for the table to render
            this.dataSource = new MatTableDataSource(this.tableData);

            for (let item in this.tableHeader) {
                let data;

                // Set dynamic table header data
                this.columns.push(
                    {
                        columnDef: this.tableHeader[item].field,
                        header: this.tableHeader[item].name,
                        cell: (element) => {
                            for (let el in element) {
                                if (el == this.tableHeader[item].field) {
                                    data = element[el]
                                }
                            }
                            return data
                        }
                    }
                );
            }

            this.displayedColumns = this.columns.map(c => c.columnDef);  // Set dynamic table column data
            this.dataSource.paginator = this.paginator; // Set pagination
            this.dataSource.sort = this.sort;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

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
}

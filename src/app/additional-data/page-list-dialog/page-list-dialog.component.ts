import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {
    IPageChangeEvent,
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableService,
    TdDataTableSortingOrder, TdDialogService,
    TdLoadingService
} from "@covalent/core";
import {SharedService} from "../../shared/shared.service";
import {DataService} from "../../shared/data.service";
import {Apollo} from "apollo-angular";
import getPages from "../../queries/page/fetchPages";
import * as _ from "lodash";

@Component({
    selector: 'app-page-list-dialog',
    templateUrl: './page-list-dialog.component.html',
    styleUrls: ['./page-list-dialog.component.css']
})


export class PageListDialogComponent implements OnInit {

    pageTitle = 'Default text data';
    title = 'Select option';
    columns: ITdDataTableColumn[] = [
        {name: 'checked', label: '', tooltip: ''},
        {name: '_id', label: 'No.', tooltip: 'No.'},
        {name: 'title', label: 'Title', tooltip: 'Page title', width: 600},
        {name: 'subtitle', label: 'Subtitle', tooltip: 'Page subtitle', width: 600},
        {name: 'tstamp', label: 'Date', tooltip: 'Date', width: 150},
    ];

    data: any[];
    sortBy = '_id';
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    filteredData;
    filteredTotal: number;
    searchTerm = '';
    fromRow = 1;
    currentPage = 1;
    pageSize = 5;
    selectedPage;
    selectedRows: any[] = [];


    constructor(private sharedService: SharedService, public dialog: MatDialog, private _dialogService: TdDialogService, @Inject(MAT_DIALOG_DATA) private modalData: any, private loadingService: TdLoadingService, private dataService: DataService, private _dataTableService: TdDataTableService, public dialogRef: MatDialogRef<PageListDialogComponent>, private apollo: Apollo) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });

        this.sharedService.changeTitle(this.pageTitle);
    }

    ngOnInit() {
        console.log('init');
        this.apollo.watchQuery<any>({
            query: getPages,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = _.cloneDeep(data.pages);
            this.filteredData = this.data;
            this.filteredTotal = this.data.length;
            console.log(this.data, 'page list');
            this.filter();
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    sort(sortEvent: ITdDataTableSortChangeEvent, name: string): void {
        this.sortBy = name;
        this.sortOrder = sortEvent.order === TdDataTableSortingOrder.Descending ? TdDataTableSortingOrder.Ascending : TdDataTableSortingOrder.Descending;
        this.filter();
    }

    search(searchTerm: string): void {
        this.searchTerm = searchTerm;
        this.filter();
    }

    page(pagingEvent: IPageChangeEvent): void {
        this.fromRow = pagingEvent.fromRow;
        this.currentPage = pagingEvent.page;
        this.pageSize = pagingEvent.pageSize;
        this.filter();
    }

    filter(): void {
        let newData: any[] = this.data;
        const excludedColumns: string[] = this.columns
            .filter((column: ITdDataTableColumn) => {
                return ((column.filter === undefined && column.hidden === true) ||
                    (column.filter !== undefined && column.filter === false));
            }).map((column: ITdDataTableColumn) => {
                return column.name;
            });
        newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
        this.filteredTotal = newData.length;
        newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
        newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
        this.filteredData = newData;
    }

    toggleEditable(event, id) {
        if (event.checked) {
            let page = this.data.find(page => page._id == id);
            this.selectedRows.push(page);
        }
        else {
            let page = this.data.filter(page => page._id == id);
            let pageIndex = this.selectedRows.indexOf(page);
            this.selectedRows.splice(pageIndex, 1)
        }
    }

    isChecked(id): boolean {
        return this.selectedRows.findIndex(page => page._id == id) > -1;
    }

    addPage() {
        console.log(this.selectedRows);
        this.dialogRef.close(this.selectedRows);
    }

}


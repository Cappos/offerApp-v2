import {Component, OnInit} from '@angular/core';
import {
    IPageChangeEvent,
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableService,
    TdDataTableSortingOrder,
    TdLoadingService
} from "@covalent/core";
import {SharedService} from "../../shared/shared.service";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Apollo} from 'apollo-angular';
import getChapters from '../../queries/fetchGroupsModules';
import * as _ from "lodash";

@Component({
    selector: 'app-chapter-list-dialog',
    templateUrl: './chapter-list-dialog.component.html',
    styleUrls: ['./chapter-list-dialog.component.css']
})
export class ChapterListDialogComponent implements OnInit {

    pageTitle = 'Chapters';
    title = 'List of all chapters';
    color = 'grey';
    disabled = false;


    columns: ITdDataTableColumn[] = [
        {name: 'chacked', label: '', tooltip: '', width: 50},
        {name: '_id', label: 'No.', tooltip: 'No.', width: 70},
        {name: 'name', label: 'Name', tooltip: 'Name'},
        {name: 'subTotal', label: 'Price', tooltip: 'Price'},
        {name: 'tstamp', label: 'Date', tooltip: 'Date', width: 150}
    ];

    data: any[];
    filteredData;
    filteredTotal: number;
    searchTerm = '';
    fromRow = 1;
    currentPage = 1;
    pageSize = 5;
    sortBy = '_id';
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    selectedRows: any[] = [];

    constructor(private sharedService: SharedService, private _dataTableService: TdDataTableService, private dialog: MatDialog, private loadingService: TdLoadingService, public dialogRef: MatDialogRef<ChapterListDialogComponent>, private apollo: Apollo) {
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
        this.apollo.watchQuery<any>({
            query: getChapters,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = _.cloneDeep(data.groups);
            this.filteredData = this.data;
            this.filteredTotal = this.data.length;
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
            let group = this.data.find(group => group._id == id);
            for (let m in group.modules) {
                group.modules[m].moduleNew = true
            }
            this.selectedRows.push(group)
        }
        else {
            let group = this.data.filter(group => group._id == id);
            let groupIndex = this.selectedRows.indexOf(group);
            this.selectedRows.splice(groupIndex, 1)
        }
    }

    isChecked(id): boolean {
        return this.selectedRows.findIndex(group => group._id == id) > -1;
    }

    addChapter() {
        console.log(this.selectedRows);
        this.dialogRef.close(this.selectedRows);
    }
}

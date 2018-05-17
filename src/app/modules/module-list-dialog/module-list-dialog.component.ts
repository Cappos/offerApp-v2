import {Component, OnInit} from '@angular/core';
import 'rxjs';
import 'rxjs/add/operator/take';
import {
    IPageChangeEvent,
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableService,
    TdDataTableSortingOrder, TdLoadingService
} from '@covalent/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {SharedService} from "../../shared/shared.service";
import {Apollo} from 'apollo-angular';
import getModulesData from '../../queries/module/fetchModules';
import * as _ from "lodash";

@Component({
    selector: 'app-module-list-dialog',
    templateUrl: './module-list-dialog.component.html',
    styleUrls: ['./module-list-dialog.component.css']
})

export class ModuleListDialogComponent implements OnInit {
    pageTitle = 'Modules';
    title = 'List of all modules';
    color = 'grey';
    columns: ITdDataTableColumn[] = [
        {name: 'chacked', label: '', tooltip: '', width: 50},
        {name: 'uid', label: 'No.', tooltip: 'No.', width: 70},
        {name: 'name', label: 'Name', tooltip: 'Name'},
        {name: 'bodytext', label: 'Description', tooltip: 'Description', width: 400},
        {name: 'category', label: 'Category', tooltip: 'Category', width: 150},
        {name: 'price', label: 'Price', tooltip: 'Price'},
        {name: 'tstamp', label: 'Date', tooltip: 'Date', width: 150}
    ];

    data: any[];
    filteredData;
    filteredTotal: number;
    searchTerm = '';
    fromRow = 1;
    currentPage = 1;
    pageSize = 5;
    sortBy = 'uid';
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    selectedModule: any;
    selectedRows: any[] = [];

    constructor(private sharedService: SharedService, private _dataTableService: TdDataTableService, public dialog: MatDialog, public dialogRef: MatDialogRef<ModuleListDialogComponent>, private loadingService: TdLoadingService, private apollo: Apollo) {

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
            query: getModulesData,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = _.cloneDeep(data.modules);
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
            let module = this.data.find(module => module._id == id);
            this.selectedRows.push(module)
        }
        else {
            let module = this.data.filter(module => module._id == id);
            let moduleIndex = this.selectedRows.indexOf(module);
            this.selectedRows.splice(moduleIndex, 1)
        }
    }

    isChecked(id): boolean {
        return this.selectedRows.findIndex(module => module._id == id) > -1;
    }

    addModule() {
        for (let e in this.selectedRows) {
            // update modules list after adding new
            this.selectedRows[e].moduleNew = true;
        }
        this.dialogRef.close(this.selectedRows);
    }

}
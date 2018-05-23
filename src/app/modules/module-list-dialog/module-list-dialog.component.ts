import {Component, OnInit, ViewChild} from '@angular/core';
import 'rxjs';
import 'rxjs/add/operator/take';
import {
    IPageChangeEvent,
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableService,
    TdDataTableSortingOrder, TdLoadingService
} from '@covalent/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
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
    data: any[];
    selectedModule: any;
    selectedRows: any[] = [];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: 'check', name: 'Select'},
        {field: '_id', name: 'No.'},
        {field: 'name', name: 'Name'},
        {field: 'categoryId', name: 'Category'},
        {field: 'price', name: 'Price'},
        {field: 'tstamp', name: 'Date'}
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

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
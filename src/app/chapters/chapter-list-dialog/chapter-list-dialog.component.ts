import {Component, OnInit, ViewChild} from '@angular/core';
import {LoadingMode, LoadingType, TdLoadingService} from "@covalent/core";
import {SharedService} from "../../shared/shared.service";
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
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
    data: any[];
    pageSize = 5;
    selectedRows: any[] = [];
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: 'check', name: 'Select'},
        {field: '_id', name: 'No.'},
        {field: 'name', name: 'Name'},
        {field: 'subTotal', name: 'Price'},
        {field: 'tstamp', name: 'Date'}
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private sharedService: SharedService, private dialog: MatDialog, private loadingService: TdLoadingService, public dialogRef: MatDialogRef<ChapterListDialogComponent>, private apollo: Apollo) {
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

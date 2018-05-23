import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import { LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
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
    data: any[];
    selectedPage;
    selectedRows: any[] = [];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: 'check', name: 'Select'},
        {field: '_id', name: 'No.'},
        {field: 'title', name: 'Title'},
        {field: 'subtitle', name: 'Subtitle'},
        {field: 'tstamp', name: 'Date'},
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;



    constructor(private sharedService: SharedService, public dialog: MatDialog, private _dialogService: TdDialogService, @Inject(MAT_DIALOG_DATA) private modalData: any, private loadingService: TdLoadingService, private dataService: DataService, public dialogRef: MatDialogRef<PageListDialogComponent>, private apollo: Apollo) {
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


import {Component, HostBinding, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {SharedService} from '../shared/shared.service';
import 'rxjs';
import 'rxjs/add/operator/take';
import getModulesData from '../queries/module/fetchModules';
import { LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {Router} from "@angular/router";
import {Apollo} from 'apollo-angular';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {slideInDownAnimation} from "../_animations/app.animations";
import removeModule from '../queries/module/deleteModule';

@Component({
    selector: 'app-modules',
    templateUrl: './modules.component.html',
    styleUrls: ['./modules.component.css'],
    animations: [slideInDownAnimation]
})
export class ModulesComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;

    pageTitle = 'Modules';
    title = 'List of all modules';
    data: any[];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: '_id', name: 'No.'},
        {field: 'name', name: 'Name'},
        {field: 'bodytext', name: 'Description'},
        {field: 'categoryId', name: 'Category'},
        {field: 'price', name: 'Price'},
        {field: 'tstamp', name: 'Date'},
        {field: 'actions', name: 'Actions'}
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private sharedService: SharedService, private router: Router, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private apollo: Apollo) {

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
            query: getModulesData
        }).valueChanges.subscribe(({data}) => {
            this.data = data.modules;
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

    onEdit(row: any) {
        let id = row['_id'];
        this.router.navigate(['/modules/' + id + '/edit']);
    }

    onDelete(row: any) {
        let id = row['_id'];
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this module?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeModule,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getModulesData
                    }]
                }).subscribe((res) => {
                    console.log(res);
                    this.sharedService.sneckBarNotifications(`module ${res.data.deleteModule.name} deleted!!!.`);
                });

            }
        });

    }

    onSelect(row: any){
        let id = row['_id'];
        this.router.navigate(['/modules/' + id ]);
    }

}

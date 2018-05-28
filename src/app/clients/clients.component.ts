import {Component, HostBinding, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {SharedService} from "../shared/shared.service";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {Router} from "@angular/router";
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {slideInDownAnimation} from "../_animations/app.animations";
import {Apollo} from "apollo-angular";
import fetchClient from '../queries/client/fetchClients';
import removeClient from '../queries/client/deleteClient';


@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.css'],
    animations: [slideInDownAnimation]
})
export class ClientsComponent implements OnInit {
    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;

    pageTitle = 'Clients';
    title = 'List of all clients';
    data: any[];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: '_id', name: 'No.'},
        {field: 'companyName', name: 'Name'},
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
            query: fetchClient,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = data.clients;
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
        this.router.navigate(['/clients/' + id + '/edit']);

    }

    onDelete(row: any) {
        let id = row['_id'];
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this client?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeClient,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: fetchClient
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`client ${res.data.deleteClient.companyName} deleted!!!.`);
                });
            }
        });
    }

    onSelect(row: any) {
        let id = row['_id'];
        this.router.navigate(['/clients/' + id]);
    }
}
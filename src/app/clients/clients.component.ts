import {Component, HostBinding, OnInit, ViewContainerRef} from '@angular/core';
import {SharedService} from "../shared/shared.service";
import {
    IPageChangeEvent,
    ITdDataTableColumn, ITdDataTableSortChangeEvent, LoadingMode, LoadingType, TdDataTableService,
    TdDataTableSortingOrder, TdDialogService, TdLoadingService
} from "@covalent/core";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {slideInDownAnimation} from "../_animations/app.animations";
import {Apollo} from "apollo-angular";
import fatchClient from '../queries/client/fetchClients';
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
    columns: ITdDataTableColumn[] = [
        {name: 'id', label: 'No.', tooltip: 'No.'},
        {name: 'companyName', label: 'Name', tooltip: 'Name'},
        {name: 'address', label: 'Address', tooltip: 'Address'},
        {name: 'tstamp', label: 'Date', tooltip: 'Date'},
        {name: 'action', label: 'Actions', tooltip: 'Actions'},
    ];

    data: any[];
    filteredData;
    filteredTotal: number;
    searchTerm = '';
    fromRow = 1;
    currentPage = 1;
    pageSize = 10;
    sortBy = 'id';
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

    constructor(private sharedService: SharedService, private _dataTableService: TdDataTableService, private router: Router, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private apollo: Apollo) {
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
            query: fatchClient,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.data = data.clients;
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
                        query: fatchClient
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`client ${res.data.deleteClient.companyName} deleted!!!.`);
                });
            }
        });
    }

    onSelect(uid) {
        this.router.navigate(['/clients/' + uid]);
    }


}

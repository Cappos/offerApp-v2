import {Component, HostBinding, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {SharedService} from '../shared/shared.service';
import 'rxjs';
import 'rxjs/add/operator/take';
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {Router} from "@angular/router";
import {slideInDownAnimation} from "../_animations/app.animations";
import {Apollo} from "apollo-angular";
import fetchGroups from '../queries/group/fetchGroups';
import removeGroup from '../queries/group/deleteGroup';
import {MatPaginator, MatSort, MatTableDataSource} from "@angular/material";

@Component({
    selector: 'app-chapters',
    templateUrl: './chapters.component.html',
    styleUrls: ['./chapters.component.css'],
    animations: [slideInDownAnimation]
})

export class ChaptersComponent implements OnInit {
    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;


    pageTitle = 'Chapters';
    title = 'List of all chapters';
    data: any[];
    pageSize = 10;
    columns = [];
    tableData;
    displayedColumns;
    dataSource: MatTableDataSource<Object>;
    tableHeader: any [] = [
        {field: '_id', name: 'No.'},
        {field: 'name', name: 'Name'},
        {field: 'subTotal', name: 'Price'},
        {field: 'tstamp', name: 'Date'},
        {field: 'actions', name: 'Actions'}
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    constructor(private sharedService: SharedService, private router: Router, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private loadingService: TdLoadingService, private apollo: Apollo) {
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
            query: fetchGroups
        }).valueChanges.subscribe(({data}) => {
            this.data = data.groups;
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



    onEdit(row: any) {
        let id = row['_id'];
        this.router.navigate(['/chapters/' + id + '/edit']);

    }

    onDelete(row: any) {
        let id = row['_id'];
        this._dialogService.openConfirm({
            message: 'Are you sure you want to remove this Chapter?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeGroup,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: fetchGroups
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`chapter ${res.data.deleteGroup.name} deleted!!!.`);
                });

            }
        });

    }

    onSelect(row): any {
        let id = row['_id'];
        this.router.navigate(['/chapters/' + id]);
    }

}


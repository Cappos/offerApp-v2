import {Component, HostBinding, OnInit, ViewContainerRef} from '@angular/core';
import {SharedService} from "../shared/shared.service";
import {MatDialog} from "@angular/material";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import {Apollo} from "apollo-angular";
import getCategoriesData from '../queries/category/fetchCategories';
import removeCategory from '../queries/category/deleteCategory';
import {CategoryAddEdiDialogComponent} from "./category-add-edi-dialog/category-add-edi-dialog.component";
import {slideInDownAnimation} from "../_animations/app.animations";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css'],
    animations: [slideInDownAnimation]
})
export class CategoriesComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('class.td-route-animation') classAnimation = true;

    pageTitle = 'Categories';
    title = 'List of categories';
    editMode = false;
    data: any;

    constructor(private loadingService: TdLoadingService, private sharedService: SharedService, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef, private apollo: Apollo) {
        this.loadingService.create({
            name: 'modulesLoader',
            type: LoadingType.Circular,
            mode: LoadingMode.Indeterminate,
            color: 'accent',
        });
        this.loadingService.register('modulesLoader');
        this.sharedService.changeTitle(this.pageTitle);
    }

    ngOnInit(): void {
        this.apollo.watchQuery<any>({
            query: getCategoriesData
        }).valueChanges.subscribe(({data}) => {
            this.data = data.categories;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    onEdit(id) {
        const dialogRef = this.dialog.open(CategoryAddEdiDialogComponent, {
            data: {
                edit: true,
                id: id
            }
        });
    }


    newCategory() {
        const dialogRef = this.dialog.open(CategoryAddEdiDialogComponent, {
            data: {
                edit: false
            }
        });
    }

    onDelete(id) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to Delete this Category?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeCategory,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getCategoriesData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.deleteCategory.name} deleted!!!.`);
                });
            }
        });
    }

}

import {Component, Inject, OnInit} from '@angular/core';
import updateCategory from "../../queries/category/updateCategories";
import getCategory from "../../queries/category/fetchCategory";
import {NgForm} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import getCategoryData from "../../queries/category/fetchCategories";
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from "@covalent/core";
import addCategory from "../../queries/category/createCategory";
import {SharedService} from "../../shared/shared.service";
import {Apollo} from "apollo-angular";

@Component({
  selector: 'app-category-add-edi-dialog',
  templateUrl: './category-add-edi-dialog.component.html',
  styleUrls: ['./category-add-edi-dialog.component.css']
})
export class CategoryAddEdiDialogComponent implements OnInit {

    pageTitle = 'Categories';
    id;
    item;

    constructor(private sharedService: SharedService, public dialog: MatDialog, private _dialogService: TdDialogService, public dialogRef: MatDialogRef<CategoryAddEdiDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private loadingService: TdLoadingService, private apollo: Apollo) {

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
        // if edit mode true
        if (this.data.edit) {
            console.log(this.data);
          this.id = this.data.id;
            this.apollo.watchQuery<any>({
                query: getCategory,
                variables: {
                    id: this.id
                }
            }).valueChanges.subscribe(({data}) => {
                this.item = data.category;
                this.loadingService.resolveAll('modulesLoader');
            });
        }
        else {
            this.id = null;
            this.loadingService.resolveAll('modulesLoader');
        }
    }

    onSave(form: NgForm, id) {
        const value = form.value;

        if(id){
            this.apollo.mutate({
                mutation: updateCategory,
                variables: {
                    id: id,
                    name: value.name
                },
                refetchQueries: [{
                    query: getCategoryData
                }]
            }).subscribe((res) => {
                this.sharedService.sneckBarNotifications(`price ${res.data.editCategory.name} updated.`);
                this.dialogRef.close();
            });
        }
        else {
            this.apollo.mutate({
                mutation: addCategory,
                variables: {
                    name: value.name
                },
                refetchQueries: [{
                    query: getCategoryData
                }]
            }).subscribe((res) => {
                this.sharedService.sneckBarNotifications(`price ${res.data.addCategory.name} created.`);
                this.dialogRef.close();
            });
        }

    }

}

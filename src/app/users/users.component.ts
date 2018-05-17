import {Component, HostBinding, OnInit, ViewContainerRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {slideInDownAnimation} from '../_animations/app.animations';
import {LoadingMode, LoadingType, TdDialogService, TdLoadingService} from '@covalent/core';
import {SharedService} from '../shared/shared.service';
import {MatDialog} from '@angular/material';
import {Apollo} from 'apollo-angular';
import getUserData from '../queries/user/fetchUser';
import addUser from '../queries/user/createUser';
import removeUser from '../queries/user/deleteUser';
import updateUser from '../queries/user/updateUser';
import {NewUserComponent} from "./new-user/new-user.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
    animations: [slideInDownAnimation]
})
export class UsersComponent implements OnInit {

    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('class.td-route-animation') classAnimation = true;

    pageTitle = 'Users';
    title = 'List of users';
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
            query: getUserData
        }).valueChanges.subscribe(({data}) => {
            this.data = data.users;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    onEdit(uid) {
        this.editMode = true;
    }

    onSave(from: NgForm, userName, userId) {
        const value = from.value;
        this.apollo.mutate({
            mutation: updateUser,
            variables: {
                id: userId,
                username: userName,
                email: value.email,
                password: value.password
            },
            refetchQueries: [{
                query: getUserData
            }]
        }).subscribe((res) => {
            this.editMode = false;
            this.sharedService.sneckBarNotifications(`user ${res.data.editUser.name} updated.`);
        });
    }

    newUser() {
        const dialogRef = this.dialog.open(NewUserComponent);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.apollo.mutate({
                    mutation: addUser,
                    variables: {
                        username: result.username,
                        email: result.email,
                        password: result.password
                    },
                    refetchQueries: [{
                        query: getUserData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.addUser.name} created.`);
                });
            }
        });
    }

    onDelete(id: string) {
        this._dialogService.openConfirm({
            message: 'Are you sure you want to Delete this Sealer?',
            viewContainerRef: this._viewContainerRef,
            title: 'Confirm remove',
            cancelButton: 'Cancel',
            acceptButton: 'Remove',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.apollo.mutate({
                    mutation: removeUser,
                    variables: {
                        id: id,
                    },
                    refetchQueries: [{
                        query: getUserData
                    }]
                }).subscribe((res) => {
                    this.sharedService.sneckBarNotifications(`user ${res.data.deleteUser.name} deleted!!!.`);
                });
            }
        });
    }
}

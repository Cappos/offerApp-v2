import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NgForm} from "@angular/forms";
import {SharedService} from "../../shared/shared.service";
import {Router} from "@angular/router";
import {LoadingMode, LoadingType, TdLoadingService, TdDialogService} from "@covalent/core";
import {MatDialog} from '@angular/material';
import createClient from "../../queries/client/createClient";
import fetchClients from "../../queries/client/fetchClients";
import {Apollo} from "apollo-angular";
import {ContactPersonDialogComponent} from '../contact-person-dialog/contact-person-dialog.component';

@Component({
    selector: 'app-new-client',
    templateUrl: './new-client.component.html',
    styleUrls: ['./new-client.component.css']
})
export class NewClientComponent implements OnInit {

    pageTitle = 'Create new client';
    offers: any[] = [];
    persons: any[] = [];
    editMode;

    constructor(private sharedService: SharedService, private router: Router, private loadingService: TdLoadingService, private apollo: Apollo, private dialog: MatDialog, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef,) {
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
        this.loadingService.resolveAll('modulesLoader');
    }

    onSave(form: NgForm) {
        const value = form.value;
        console.log(value);

        this.apollo.mutate({
            mutation: createClient,
            variables: {
                companyName: value.companyName,
                address: value.address,
                webSite: value.webSite,
                contacts: this.persons
            },

            refetchQueries: [{
                query: fetchClients
            }]
        }).subscribe(() => {
            this.sharedService.sneckBarNotifications(`client created.`);
            this.router.navigate(['/clients']);
        });
    }

    addContact() {
        const dialogRef = this.dialog.open(ContactPersonDialogComponent);
        const count = Math.random();

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                result._id = count;
                result.newPerosn = true;
                this.persons.push(result);
            }
        });
    }

    onPersonEdit(){
        this.editMode = true;
    }

    onPersonSave(person, id) {
        let contactPerson = this.persons.filter(contact => contact._id == id)[0];
        let contactIndex = this.persons.indexOf(contactPerson);
        this.persons[contactIndex] = person.value;
        this.editMode = false;
    }

    onPersonDelete(id) {
        let contactPerson = this.persons.filter(contact => contact._id == id)[0];
        let contactIndex = this.persons.indexOf(contactPerson);
        this.persons.splice(contactIndex, 1);
        this.editMode = true;
    }
}

import {Component, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {LoadingMode, LoadingType, TdLoadingService, TdDialogService} from "@covalent/core";
import {Apollo} from "apollo-angular";
import fetchClient from '../../queries/client/fetchClient';
import updateClient from '../../queries/client/updateClient';
import copyOffer from '../../queries/client/offerCopy';
import {MatMenuTrigger} from "@angular/material";
import * as _ from "lodash";
import {MatDialog} from '@angular/material';
import {ContactPersonDialogComponent} from '../contact-person-dialog/contact-person-dialog.component';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
    pageTitle = 'Clients';
    id: number;
    item;
    offers: any[] = [];
    @Output() editMode = false;
    @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
    persons: any[] = [];
    editModeClient = false;

    constructor(private route: ActivatedRoute, private sharedService: SharedService, private router: Router, private loadingService: TdLoadingService, private location: Location, private dialog: MatDialog, private apollo: Apollo, private _dialogService: TdDialogService, private _viewContainerRef: ViewContainerRef) {
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
        this.route.params.subscribe(
            (params: Params) => {
                this.id = params['id'];
                this.editMode = !!params['edit'];

                this.apollo.watchQuery<any>({
                    query: fetchClient,
                    variables: {
                        id: this.id
                    },
                    fetchPolicy: 'network-only'
                }).valueChanges.subscribe(({data}) => {
                    this.item = data.client;
                    this.offers = this.item.offers;
                    this.persons = _.cloneDeep(data.client.contacts);
                    this.loadingService.resolveAll('modulesLoader');
                });
            }
        );
    }

    onSave(form: NgForm) {
        const value = form.value;

        this.apollo.mutate({
            mutation: updateClient,
            variables: {
                id: this.id,
                companyName: value.companyName,
                address: value.address,
                webSite: value.webSite,
                contacts: this.persons
            }
        }).subscribe(() => {
            this.editMode = false;
            this.sharedService.sneckBarNotifications(`client updated.`);
        });
    }

    onEdit() {
        console.log('edit');
        this.editMode = true
    }

    selectOffer(offerId: number) {
        console.log(offerId, 'offer selected');
        this.router.navigate(['/offers/' + offerId]);
    }

    addOffer(clientId: number) {
        console.log(clientId);
        this.router.navigate(['/newOffer/' + clientId]);
    }

    offerCopy(id: string) {
        this.apollo.mutate({
            mutation: copyOffer,
            variables: {
                id: id,
                client: this.id
            },
            refetchQueries: [{
                query: fetchClient,
                variables: {
                    id: this.id
                }
            }]
        }).subscribe(() => {
            this.sharedService.sneckBarNotifications(`offer copied.`);
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
                this.editMode = true;
            }
        });
    }

    onPersonEdit() {
        this.editModeClient = true;
    }

    onPersonSave(person, id) {
        let contactPerson = this.persons.filter(contact => contact._id == id)[0];
        let contactIndex = this.persons.indexOf(contactPerson);
        this.persons[contactIndex] = person.value;
        this.editModeClient = false;
        this.editMode = true;
    }

    onPersonDelete(id) {
        let contactPerson = this.persons.filter(contact => contact._id == id)[0];
        let contactIndex = this.persons.indexOf(contactPerson);

        contactPerson.deleted = true;
        this.editMode = true;
    }

    goBack() {
        this.location.back();
    }
}

import {Component, OnInit, Output} from '@angular/core';
import { Location } from '@angular/common';
import 'rxjs/add/operator/take';
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Params} from "@angular/router";
import {SharedService} from "../../shared/shared.service";
import {LoadingMode, LoadingType, TdLoadingService} from "@covalent/core";
import {Apollo} from 'apollo-angular';
import fetchModule from '../../queries/module/fetchModule';
import updateModule from '../../queries/module/updateModule';
import getModulesData from '../../queries/module/fetchModules';


@Component({
    selector: 'app-module',
    templateUrl: './module.component.html',
    styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {
    pageTitle = 'Modules';
    id: number;
    item;
    @Output() editMode = false;
    rteData;
    selectedGroup;
    selectedPrice;
    prices: any [];
    categories: any[];
    totalPrice;

    constructor(private route: ActivatedRoute, private sharedService: SharedService, private loadingService: TdLoadingService, private location: Location, private apollo: Apollo) {
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
                    query: fetchModule,
                    variables: {
                        id: this.id
                    },
                    fetchPolicy: 'network-only'
                }).valueChanges.subscribe(({data}) => {
                    this.item = data.module;
                    this.categories = data.categories;
                    this.prices = data.prices;
                    this.selectedPrice = data.module.pricePerHour;
                    this.rteData = this.item.bodytext;
                    this.totalPrice = this.item.price;
                    this.selectedGroup = this.item.categoryId[0].value;
                    this.loadingService.resolveAll('modulesLoader');
                });
            }
        );
    }

    onSave(form: NgForm) {
        const value = form.value;
        const category = this.categories.find(category => category.value == value.categoryId);
        const price =  +value.externalHours * +value.selectedPrice;
        this.totalPrice = price;
        const group = null;

        this.apollo.mutate({
            mutation: updateModule,
            variables: {
                id: this.id,
                name: value.name,
                bodytext: this.rteData,
                price: price,
                groupId: group,
                categoryId: category._id,
                internalHours: +value.internalHours,
                externalHours: +value.externalHours,
                pricePerHour: +value.selectedPrice,
                signed: value.signed
            },
            refetchQueries: [{
                query: getModulesData
            }]
        }).subscribe(() => {
            this.editMode = false;
            this.sharedService.sneckBarNotifications(`module updated.`);
            this.editMode = false;
        });
    }

    keyupHandler(ev) {
        this.rteData = ev;
    }

    onEdit() {
        this.editMode = true
    }

    goBack(){
        this.location.back();
    }

}

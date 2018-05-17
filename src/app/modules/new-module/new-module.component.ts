import {Component, OnInit, Output} from '@angular/core';
import {SharedService} from "../../shared/shared.service";
import {NgForm} from "@angular/forms";
import {LoadingMode, LoadingType, TdLoadingService} from "@covalent/core";
import {Apollo} from 'apollo-angular';
import createModule from '../../queries/module/crateModule';
import {Router} from "@angular/router";
import getCategoriesPrices from '../../queries/getCategoriesPrices';
import getModulesData from '../../queries/module/fetchModules';

@Component({
    selector: 'app-new-module',
    templateUrl: './new-module.component.html',
    styleUrls: ['./new-module.component.css']
})
export class NewModuleComponent implements OnInit {
    pageTitle = 'Modules';
    @Output() editMode = true;
    rteData = '';
    categories: any[];
    prices: any[];
    totalPrice;
    selectedPrice = 0;

    constructor(private sharedService: SharedService, private loadingService: TdLoadingService, private apollo: Apollo, private router: Router) {
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
            query: getCategoriesPrices
        }).valueChanges.subscribe(({data}) => {
            this.categories = data.categories;
            this.prices = data.prices;
            this.loadingService.resolveAll('modulesLoader');
        });

    }

    keyupHandler(ev) {
        this.rteData = ev;
    }

    onSave(form: NgForm) {
        const value = form.value;
        const category = this.categories.find(category => category.value == value.categoryId);
        const price = +value.externalHours * +value.selectedPrice;
        this.totalPrice = price;
        const group = null;

        this.apollo.mutate({
            mutation: createModule,
            variables: {
                name: value.name,
                bodytext: this.rteData,
                price: price,
                groupId: group,
                categoryId: category._id,
                defaultModule: true,
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
            this.sharedService.sneckBarNotifications(`module created.`);
            this.router.navigate(['/modules']);
        });
    }
}

import {Component, HostBinding, OnInit} from '@angular/core';
import {SharedService} from "../shared/shared.service";
import {LoadingMode, LoadingType, TdLoadingService} from "@covalent/core";
import {slideInDownAnimation} from "../_animations/app.animations";
import {Router} from "@angular/router";
import {Apollo} from "apollo-angular";
import getDashboardData from '../queries/dashboard/fetchDashboard';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [slideInDownAnimation]
})
export class DashboardComponent implements OnInit {
    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;

    pageTitle = 'Dashboard';
    offersData;
    clientsData;

    constructor(private sharedService: SharedService, private loadingService: TdLoadingService, private router: Router, private apollo: Apollo) {
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
            query: getDashboardData,
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe(({data}) => {
            this.offersData = data.dashboardOffers;
            this.clientsData = data.dashboardClients;
            this.loadingService.resolveAll('modulesLoader');
        });
    }

    selectOffer(offerId) {
        this.router.navigate(['/offers/' + offerId]);
    }

    selectClient(clientId) {
        this.router.navigate(['/clients/' + clientId]);
    }
}

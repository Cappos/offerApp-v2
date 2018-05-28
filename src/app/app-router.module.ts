import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ModulesComponent} from './modules/modules.component';
import {OffersComponent} from './offers/offers.component';
import {ClientsComponent} from './clients/clients.component';
import {ModuleComponent} from "./modules/module/module.component";
import {NewModuleComponent} from "./modules/new-module/new-module.component";
import {ClientComponent} from "./clients/client/client.component";
import {NewClientComponent} from "./clients/new-client/new-client.component";
import {NewOfferComponent} from "./offers/new-offer/new-offer.component";
import {OfferComponent} from "./offers/offer/offer.component";
import {ChaptersComponent} from "./chapters/chapters.component";
import {ChapterComponent} from "./chapters/chapter/chapter.component";
import {NewChapterComponent} from "./chapters/new-chapter/new-chapter.component";
import {AdditionalDataComponent} from "./additional-data/additional-data.component";
import {PageComponent} from "./additional-data/page/page.component";
import {SellersComponent} from "./sellers/sellers.component";
import {PdfComponent} from './pdf/pdf.component';
import {PricesComponent} from "./prices/prices.component";
import {UsersComponent} from "./users/users.component";
import {LoginComponent} from "./auth/login/login.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {NotFoundComponent} from "./error-handling/not-found/not-found.component";
import {CategoriesComponent} from "./categories/categories.component";
import {MediaBrowserComponent} from "./media-browser/media-browser.component";

const appRoutes: Routes = [
    {path: '', component: DashboardComponent, canActivate: [AuthGuard]},
    {path: 'chapters', component: ChaptersComponent, canActivate: [AuthGuard]},
    {path: 'chapters/:id', component: ChapterComponent, canActivate: [AuthGuard]},
    {path: 'chapters/:id/:edit', component: ChapterComponent, canActivate: [AuthGuard]},
    {path: 'newChapter', component: NewChapterComponent, canActivate: [AuthGuard]},
    {path: 'modules', component: ModulesComponent, canActivate: [AuthGuard]},
    {path: 'modules/:id', component: ModuleComponent, canActivate: [AuthGuard]},
    {path: 'modules/:id/:edit', component: ModuleComponent, canActivate: [AuthGuard]},
    {path: 'newModule', component: NewModuleComponent, canActivate: [AuthGuard]},
    {path: 'offers', component: OffersComponent, canActivate: [AuthGuard]},
    {path: 'offers/:id', component: OfferComponent, canActivate: [AuthGuard]},
    {path: 'offers/:id/:edit', component: OfferComponent, canActivate: [AuthGuard]},
    {path: 'newOffer', component: NewOfferComponent, canActivate: [AuthGuard]},
    {path: 'newOffer/:clientId', component: NewOfferComponent, canActivate: [AuthGuard]},
    {path: 'clients', component: ClientsComponent, canActivate: [AuthGuard]},
    {path: 'clients/:id', component: ClientComponent, canActivate: [AuthGuard]},
    {path: 'clients/:id/:edit', component: ClientComponent, canActivate: [AuthGuard]},
    {path: 'newClient', component: NewClientComponent, canActivate: [AuthGuard]},
    {path: 'additionalData', component: AdditionalDataComponent, canActivate: [AuthGuard]},
    {path: 'additionalData/page/:id/:type', component: PageComponent, canActivate: [AuthGuard]},
    {path: 'additionalData/page/:id/:edit/:type', component: PageComponent, canActivate: [AuthGuard]},
    {path: 'additionalData/newPage', component: PageComponent, canActivate: [AuthGuard]},
    {path: 'additionalData/newPage/:type', component: PageComponent, canActivate: [AuthGuard]},
    {path: 'sellers', component: SellersComponent, canActivate: [AuthGuard]},
    {path: 'pdf', component: PdfComponent, canActivate: [AuthGuard]},
    {path: 'prices', component: PricesComponent, canActivate: [AuthGuard]},
    {path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard]},
    {path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
    {path: 'login', component: LoginComponent},
    {path: 'media', component: MediaBrowserComponent},
    {path: '404', component: NotFoundComponent},
    {path: '**', redirectTo: '/404'}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}

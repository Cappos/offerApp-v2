import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-router.module';

import {AppComponent} from './app.component';
import {
    CovalentCommonModule,
    CovalentDataTableModule, CovalentDialogsModule,
    CovalentExpansionPanelModule, CovalentFileModule, CovalentLayoutModule, CovalentLoadingModule, CovalentMediaModule,
    CovalentMenuModule,
    CovalentNotificationsModule, CovalentPagingModule, CovalentSearchModule, CovalentStepsModule, TdLoadingService
} from '@covalent/core';
import {CovalentHttpModule} from '@covalent/http';
import {CovalentHighlightModule} from '@covalent/highlight';
import {CovalentMarkdownModule} from '@covalent/markdown';
import {CovalentDynamicFormsModule} from '@covalent/dynamic-forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule, MatCardModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatOptionModule,
    MatTabsModule,
    MatToolbarModule, MatTooltipModule, MatCheckboxModule, MatSidenavModule, MatSlideToggleModule,
    MatAutocompleteModule, MatSelectModule, MatDialogModule, MatSnackBarModule, MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule, MatExpansionModule, MatChipsModule, MatPaginatorModule, MatSortModule
} from '@angular/material';
import {MatFormFieldModule, MatTableModule} from '@angular/material';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ModulesComponent } from './modules/modules.component';
import { OffersComponent } from './offers/offers.component';
import { ClientsComponent } from './clients/clients.component';
import { SharedService } from './shared/shared.service';
import {Ng2FilterPipeModule} from 'ng2-filter-pipe';
import { ModuleComponent } from './modules/module/module.component';
import {HttpClientModule} from '@angular/common/http';
import {RteComponent} from './modules/module/rte/rte.component';
import { NewModuleComponent } from './modules/new-module/new-module.component';
import { ClientComponent } from './clients/client/client.component';
import { NewClientComponent } from './clients/new-client/new-client.component';
import { NewOfferComponent } from './offers/new-offer/new-offer.component';
import { OfferComponent } from './offers/offer/offer.component';
import { EditModuleDialogComponent } from './modules/edit-module-dialog/edit-module-dialog.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ChapterComponent } from './chapters/chapter/chapter.component';
import { NewChapterComponent } from './chapters/new-chapter/new-chapter.component';
import { ChapterDialogComponent } from './chapters/chapter-dialog/chapter-dialog.component';
import { AdditionalDataComponent } from './additional-data/additional-data.component';
import { PageComponent } from './additional-data/page/page.component';
import { SellersComponent } from './sellers/sellers.component';
import { NewSellerComponent } from './sellers/new-seller/new-seller.component';
import { ModuleListDialogComponent } from './modules/module-list-dialog/module-list-dialog.component';
import { ChapterListDialogComponent } from './chapters/chapter-list-dialog/chapter-list-dialog.component';
import {DragulaModule} from 'ng2-dragula';
import {MediaBrowserComponent} from './media-browser/media-browser.component';
import {DataService} from './shared/data.service';
import { PageListDialogComponent } from './additional-data/page-list-dialog/page-list-dialog.component';
import { PageEditDialogComponent } from './additional-data/page-edit-dialog/page-edit-dialog.component';
import {Apollo, ApolloModule} from 'apollo-angular';
import {DataNodeService} from "./dataNode.service";
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from "apollo-cache-inmemory";
import {NgPipesModule} from 'ngx-pipes';
import { PdfComponent } from './pdf/pdf.component';
import { PricesComponent } from './prices/prices.component';
import { PriceAddEditDialogComponent } from './prices/price-add-edit-dialog/price-add-edit-dialog.component';
import { LoginComponent } from './auth/login/login.component';
import { UsersComponent } from './users/users.component';
import { NewUserComponent } from './users/new-user/new-user.component';
import {AuthService} from "./auth/auth.service";
import {AuthGuard} from "./auth/auth-guard.service";
import { PdfDialogComponent } from './pdf/pdf-dialog/pdf-dialog.component';
import { NotFoundComponent } from './error-handling/not-found/not-found.component';
import {LightboxModule} from "angular2-lightbox";
import { RteDialogComponent } from './rte/rte-dialog/rte-dialog.component';
import { ContactPersonDialogComponent } from './clients/contact-person-dialog/contact-person-dialog.component';
import {StringReplace} from './shared/stringReplace.pipe';
import { TaskDialogComponent } from './offers/task-dialog/task-dialog.component';
import {SafeHtml} from "./pipes/safeHtml.pipe";
import {CdkTableModule} from "@angular/cdk/table";
import { CategoriesComponent } from './categories/categories.component';
import { CategoryAddEdiDialogComponent } from './categories/category-add-edi-dialog/category-add-edi-dialog.component';


@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        ModulesComponent,
        OffersComponent,
        ClientsComponent,
        ModuleComponent,
        RteComponent,
        NewModuleComponent,
        ClientComponent,
        NewClientComponent,
        NewOfferComponent,
        OfferComponent,
        EditModuleDialogComponent,
        ChaptersComponent,
        ChapterComponent,
        NewChapterComponent,
        ChapterDialogComponent,
        AdditionalDataComponent,
        PageComponent,
        SellersComponent,
        NewSellerComponent,
        ModuleListDialogComponent,
        ChapterListDialogComponent,
        MediaBrowserComponent,
        PageListDialogComponent,
        PageEditDialogComponent,
        PdfComponent,
        PricesComponent,
        PriceAddEditDialogComponent,
        LoginComponent,
        UsersComponent,
        NewUserComponent,
        PdfDialogComponent,
        NotFoundComponent,
        RteDialogComponent,
        ContactPersonDialogComponent,
        StringReplace,
        TaskDialogComponent,
        SafeHtml,
        CategoriesComponent,
        CategoryAddEdiDialogComponent
    ],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        AppRoutingModule,
        Ng2FilterPipeModule,
        HttpClientModule,
        DragulaModule,
        NgPipesModule,
        LightboxModule,
        /** Material Modules */
        MatButtonModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSidenavModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatCardModule,
        MatTabsModule,
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatGridListModule,
        MatSelectModule,
        MatDialogModule,
        MatSnackBarModule,
        MatNativeDateModule,
        MatOptionModule,
        MatToolbarModule,
        MatTooltipModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTableModule,
        CdkTableModule,
        MatSortModule,
        /** Covalent Modules */
        CovalentLoadingModule,
        CovalentLayoutModule,
        CovalentStepsModule,
        CovalentHttpModule.forRoot(),
        CovalentHighlightModule,
        CovalentMarkdownModule,
        CovalentDynamicFormsModule,
        CovalentFileModule,
        CovalentSearchModule,
        CovalentDataTableModule,
        CovalentPagingModule,
        CovalentDialogsModule,
        CovalentExpansionPanelModule,
        CovalentMediaModule,
        CovalentMenuModule,
        CovalentNotificationsModule,
        CovalentCommonModule,
        /** Apollo*/
        HttpClientModule,
        ApolloModule,
        HttpLinkModule
    ],
    providers: [SharedService, TdLoadingService, DataService, DataNodeService, NgPipesModule, AuthService, AuthGuard, StringReplace],
    entryComponents: [EditModuleDialogComponent, ChapterDialogComponent, NewSellerComponent, ModuleListDialogComponent, ChapterListDialogComponent, MediaBrowserComponent, PageListDialogComponent, PageEditDialogComponent, PriceAddEditDialogComponent, NewUserComponent, PdfDialogComponent, RteDialogComponent, ContactPersonDialogComponent, TaskDialogComponent, CategoryAddEdiDialogComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(
        apollo: Apollo,
        httpLink: HttpLink
    ) {
        apollo.create({
            // By default, this client will send queries to the
            // `/graphql` endpoint on the same host
            link: httpLink.create({}),
            cache: new InMemoryCache()
        });
    }
}

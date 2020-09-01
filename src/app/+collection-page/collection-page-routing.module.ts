import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CollectionPageComponent } from './collection-page.component';
import { CollectionPageResolver } from './collection-page.resolver';
import { CreateCollectionPageComponent } from './create-collection-page/create-collection-page.component';
import { AuthenticatedGuard } from '../core/auth/authenticated.guard';
import { CreateCollectionPageGuard } from './create-collection-page/create-collection-page.guard';
import { DeleteCollectionPageComponent } from './delete-collection-page/delete-collection-page.component';
import { EditItemTemplatePageComponent } from './edit-item-template-page/edit-item-template-page.component';
import { ItemTemplatePageResolver } from './edit-item-template-page/item-template-page.resolver';
import { CollectionItemMapperComponent } from './collection-item-mapper/collection-item-mapper.component';
import { CollectionBreadcrumbResolver } from '../core/breadcrumbs/collection-breadcrumb.resolver';
import { DSOBreadcrumbsService } from '../core/breadcrumbs/dso-breadcrumbs.service';
import { LinkService } from '../core/cache/builders/link.service';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import {
  ITEMTEMPLATE_PATH,
  COLLECTION_EDIT_PATH,
  COLLECTION_CREATE_PATH
} from './collection-page-routing-paths';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: COLLECTION_CREATE_PATH,
        component: CreateCollectionPageComponent,
        canActivate: [AuthenticatedGuard, CreateCollectionPageGuard]
      },
      {
        path: ':id',
        resolve: {
          dso: CollectionPageResolver,
          breadcrumb: CollectionBreadcrumbResolver
        },
        runGuardsAndResolvers: 'always',
        children: [
          {
            path: COLLECTION_EDIT_PATH,
            loadChildren: './edit-collection-page/edit-collection-page.module#EditCollectionPageModule',
            canActivate: [AuthenticatedGuard]
          },
          {
            path: 'delete',
            pathMatch: 'full',
            component: DeleteCollectionPageComponent,
            canActivate: [AuthenticatedGuard],
          },
          {
            path: ITEMTEMPLATE_PATH,
            component: EditItemTemplatePageComponent,
            canActivate: [AuthenticatedGuard],
            resolve: {
              item: ItemTemplatePageResolver,
              breadcrumb: I18nBreadcrumbResolver
            },
            data: { title: 'collection.edit.template.title', breadcrumbKey: 'collection.edit.template' }
          },
          {
            path: '',
            component: CollectionPageComponent,
            pathMatch: 'full',
          },
          {
            path: '/edit/mapper',
            component: CollectionItemMapperComponent,
            pathMatch: 'full',
            canActivate: [AuthenticatedGuard]
          }
        ]
      },
    ])
  ],
  providers: [
    CollectionPageResolver,
    ItemTemplatePageResolver,
    CollectionBreadcrumbResolver,
    DSOBreadcrumbsService,
    LinkService,
    CreateCollectionPageGuard
  ]
})
export class CollectionPageRoutingModule {

}

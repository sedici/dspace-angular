import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { CollectionPageComponent } from './collection-page.component';
import { CollectionPageRoutingModule } from './collection-page-routing.module';
import { CreateCollectionPageComponent } from './create-collection-page/create-collection-page.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { DeleteCollectionPageComponent } from './delete-collection-page/delete-collection-page.component';
import { CollectionItemMapperComponent } from './collection-item-mapper/collection-item-mapper.component';
import { SearchService } from '../core/shared/search/search.service';
import { StatisticsModule } from '../statistics/statistics.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CollectionPageRoutingModule,
    StatisticsModule.forRoot()
  ],
  declarations: [
    CollectionPageComponent,
    CreateCollectionPageComponent,
    DeleteCollectionPageComponent,
    CollectionFormComponent,
    CollectionItemMapperComponent
  ],
  exports: [
    CollectionFormComponent
  ],
  providers: [
    SearchService,
  ]
})
export class CollectionPageModule {

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ItemPageModule } from '../../+item-page/item-page.module';
import { OrgUnitComponent } from './item-pages/org-unit/org-unit.component';
import { PersonComponent } from './item-pages/person/person.component';
import { ProjectComponent } from './item-pages/project/project.component';
import { OrgUnitListElementComponent } from './item-list-elements/org-unit/org-unit-list-element.component';
import { PersonListElementComponent } from './item-list-elements/person/person-list-element.component';
import { ProjectListElementComponent } from './item-list-elements/project/project-list-element.component';
import { TooltipModule } from 'ngx-bootstrap';
import { PersonGridElementComponent } from './item-grid-elements/person/person-grid-element.component';
import { OrgUnitGridElementComponent } from './item-grid-elements/org-unit/org-unit-grid-element.component';
import { ProjectGridElementComponent } from './item-grid-elements/project/project-grid-element.component';
import { OrgUnitSearchResultListElementComponent } from './item-list-elements/search-result-list-elements/org-unit/org-unit-search-result-list-element.component';
import { PersonSearchResultListElementComponent } from './item-list-elements/search-result-list-elements/person/person-search-result-list-element.component';
import { ProjectSearchResultListElementComponent } from './item-list-elements/search-result-list-elements/project/project-search-result-list-element.component';
import { PersonSearchResultGridElementComponent } from './item-grid-elements/search-result-grid-elements/person/person-search-result-grid-element.component';
import { OrgUnitSearchResultGridElementComponent } from './item-grid-elements/search-result-grid-elements/org-unit/org-unit-search-result-grid-element.component';
import { ProjectSearchResultGridElementComponent } from './item-grid-elements/search-result-grid-elements/project/project-search-result-grid-element.component';
import { PersonItemMetadataListElementComponent } from './metadata-representations/person/person-item-metadata-list-element.component';
import { OrgUnitItemMetadataListElementComponent } from './metadata-representations/org-unit/org-unit-item-metadata-list-element.component';
import { PersonSearchResultListSubmissionElementComponent } from './submission/item-list-elements/person/person-search-result-list-submission-element.component';
import { PersonInputSuggestionsComponent } from './submission/item-list-elements/person/person-suggestions/person-input-suggestions.component';
import { NameVariantModalComponent } from './submission/name-variant-modal/name-variant-modal.component';
import { OrgUnitInputSuggestionsComponent } from './submission/item-list-elements/org-unit/org-unit-suggestions/org-unit-input-suggestions.component';
import { OrgUnitSearchResultListSubmissionElementComponent } from './submission/item-list-elements/org-unit/org-unit-search-result-list-submission-element.component';
import { ExternalSourceEntryListSubmissionElementComponent } from './submission/item-list-elements/external-source-entry/external-source-entry-list-submission-element.component';
import { PersonStatisticsComponent } from './item-pages/person/sedici-services/person-statistics/person-statistics.component';
import { PublicationTypesChartComponent } from './item-pages/person/sedici-services/person-statistics/publication-types-chart/publication-types-chart.component';
import { CoauthorsNetworkComponent } from './item-pages/person/sedici-services/person-statistics/coauthors-network/coauthors-network.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { PublicationsTimeChartComponent } from './item-pages/person/sedici-services/person-statistics/publications-time-chart/publications-time-chart.component';
import { PersonIdentifiersComponent } from './item-pages/person/sedici-services/person-identifiers/person-identifiers.component';
import { QRCodeModule } from 'angularx-qrcode';
import { PersonPageQrComponent } from './item-pages/person/sedici-services/person-page-qr/person-page-qr.component';
import { PersonUsageStatisticsComponent } from './item-pages/person/sedici-services/person-statistics/person-usage-statistics/person-usage-statistics.component';
import { StatisticsPageModule } from '../../statistics-page/statistics-page.module';
import { KeywordsBadgesComponent } from './item-pages/person/sedici-services/keywords-badges/keywords-badges.component';

const ENTRY_COMPONENTS = [
  OrgUnitComponent,
  PersonComponent,
  ProjectComponent,
  OrgUnitListElementComponent,
  OrgUnitItemMetadataListElementComponent,
  PersonListElementComponent,
  PersonItemMetadataListElementComponent,
  ProjectListElementComponent,
  PersonGridElementComponent,
  OrgUnitGridElementComponent,
  ProjectGridElementComponent,
  OrgUnitSearchResultListElementComponent,
  PersonSearchResultListElementComponent,
  ProjectSearchResultListElementComponent,
  PersonSearchResultGridElementComponent,
  OrgUnitSearchResultGridElementComponent,
  ProjectSearchResultGridElementComponent,
  PersonSearchResultListSubmissionElementComponent,
  PersonInputSuggestionsComponent,
  NameVariantModalComponent,
  OrgUnitSearchResultListSubmissionElementComponent,
  OrgUnitInputSuggestionsComponent,
  ExternalSourceEntryListSubmissionElementComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TooltipModule.forRoot(),
    ItemPageModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    QRCodeModule,
    StatisticsPageModule
  ],
  declarations: [
    ...ENTRY_COMPONENTS,
    PersonStatisticsComponent,
    PublicationTypesChartComponent,
    CoauthorsNetworkComponent,
    PublicationsTimeChartComponent,
    PersonIdentifiersComponent,
    PersonPageQrComponent,
    PersonUsageStatisticsComponent,
    KeywordsBadgesComponent,
  ],
  entryComponents: [
    ...ENTRY_COMPONENTS
  ]
})
export class ResearchEntitiesModule {

}

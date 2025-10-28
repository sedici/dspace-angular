import { AsyncPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import {
  fadeIn,
  fadeInOut,
} from '../../../../../../app/shared/animations/fade';
import { ErrorComponent } from '../../../../../../app/shared/error/error.component';
import { ObjectCollectionComponent } from '../../../../../../app/shared/object-collection/object-collection.component';
import { SearchExportCsvComponent } from '../../../../../../app/shared/search/search-export-csv/search-export-csv.component';
import { SearchResultsComponent as BaseComponent } from '../../../../../../app/shared/search/search-results/search-results.component';
import { SearchResultsSkeletonComponent } from '../../../../../../app/shared/search/search-results/search-results-skeleton/search-results-skeleton.component';
import { SidebarDropdownComponent } from '../../../../../../app/shared/sidebar/sidebar-dropdown.component';
import { SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { SearchConfigurationService } from 'src/app/core/shared/search/search-configuration.service';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { SEARCH_CONFIG_SERVICE } from 'src/app/my-dspace-page/my-dspace-configuration.service';
import { SortDirection } from 'src/app/core/cache/models/sort-options.model';
import { SearchDropdownComponent } from './search-dropdown/search-dropdown.component';
import { SearchLabelsComponent } from '../../../../../../app/shared/search/search-labels/search-labels.component';
import { ViewModeSwitchComponent } from 'src/app/shared/view-mode-switch/view-mode-switch.component';
import { ViewMode } from 'src/app/core/shared/view-mode.model';

@Component({
  selector: 'ds-themed-search-results',
  templateUrl: './search-results.component.html',
  // styleUrls: ['../../../../../../app/shared/search/search-results/search-results.component.scss'],
  styleUrls: [ './search-results.component.scss' ],
  animations: [
    fadeIn,
    fadeInOut,
  ],
  standalone: true,
  imports: [
    AsyncPipe,
    ErrorComponent,
    NgxSkeletonLoaderModule,
    ObjectCollectionComponent,
    RouterLink,
    SearchExportCsvComponent,
    SearchResultsSkeletonComponent,
    TranslateModule,
    SearchDropdownComponent,
    SearchLabelsComponent,
    ViewModeSwitchComponent,
  ],
})
export class SearchResultsComponent extends BaseComponent {
  @Input() inPlaceSearch: boolean;
  @Input() showViewModes = true;
  @Input() viewModeList: string[];

  @Output() changeViewMode = new EventEmitter<ViewMode>();


  constructor(
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigurationService: SearchConfigurationService,
    protected searchService: SearchService,
    protected paginationService: PaginationService,
  ) {
    super(searchConfigurationService, searchService);
  }

  /**
   * Method to change the current sort field and direction
   * @param {Event} event Change event containing the sort direction and sort field
   */
  reloadOrder(event: Event) {
    const values = (event.target as HTMLInputElement).value.split(',');
    
    this.paginationService.updateRoute(this.searchConfigurationService.paginationID, {
      sortField: values[0],
      sortDirection: values[1] as SortDirection,
      page: 1,
    });
  }
}
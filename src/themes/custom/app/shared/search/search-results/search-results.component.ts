import { AsyncPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, Inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

import {
  fadeIn,
  fadeInOut,
} from '../../../../../../app/shared/animations/fade';
import { ErrorComponent } from '../../../../../../app/shared/error/error.component';
import { ObjectCollectionComponent } from '../../../../../../app/shared/object-collection/object-collection.component';

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
import { hasValueOperator } from 'src/app/shared/empty.util';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';

interface PaginationDetails {
  range: string;
  total: number;
}

@Component({
  selector: 'ds-themed-search-results',
  templateUrl: './search-results.component.html',
  // styleUrls: ['../../../../../../app/shared/search/search-results/search-results.component.scss'],
  styleUrls: ['./search-results.component.scss'],
  animations: [
    fadeIn,
    fadeInOut,
  ],
  imports: [
    AsyncPipe,
    ErrorComponent,
    NgxSkeletonLoaderModule,
    ObjectCollectionComponent,
    RouterLink,

    SearchResultsSkeletonComponent,
    TranslateModule,
    SearchDropdownComponent,
    SearchLabelsComponent,
    ViewModeSwitchComponent,
  ],
})
export class SearchResultsComponent extends BaseComponent implements OnChanges {
  @Input() inPlaceSearch: boolean;
  @Input() showViewModes = true;
  @Input() viewModeList: string[];

  @Output() changeViewMode = new EventEmitter<ViewMode>();

  /**
   * The total number of results
   */
  public showingDetails$: Observable<PaginationDetails> = of({ range: `${null} - ${null}`, total: null });

  constructor(
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigurationService: SearchConfigurationService,
    protected searchService: SearchService,
    protected paginationService: PaginationService,
  ) {
    super(searchConfigurationService, searchService);
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchResults && changes.searchResults.currentValue) {
      const currentSearchResults: RemoteData<PaginatedList<any>> = changes.searchResults.currentValue;
      if (currentSearchResults.hasSucceeded && currentSearchResults.payload) {
        this.showingDetails$ = this.getShowingDetails(currentSearchResults.payload.totalElements);
      } else {
        // Initialize showingDetails$ to a default if searchResults are not yet available or failed
        this.showingDetails$ = of({ range: `${null} - ${null}`, total: null });
      }
    }
  }

  /**
   * Method to get pagination details of the current viewed page.
   */
  public getShowingDetails(collectionSize: number): Observable<PaginationDetails> {
    return of(collectionSize).pipe(
      hasValueOperator(),
      switchMap(() => this.paginationService.getCurrentPagination(this.searchConfigurationService.paginationID, this.searchConfig.pagination)),
      map((currentPaginationOptions) => {
        let lastItem: number;
        const pageMax = currentPaginationOptions.pageSize * currentPaginationOptions.currentPage;

        const firstItem: number = currentPaginationOptions.pageSize * (currentPaginationOptions.currentPage - 1) + 1;
        if (collectionSize > pageMax) {
          lastItem = pageMax;
        } else {
          lastItem = collectionSize;
        }
        return {
          range: `${firstItem} - ${lastItem}`,
          total: collectionSize,
        };
      }),
      startWith({
        range: `${null} - ${null}`,
        total: null,
      }),
    );
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
import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  Params,
  Router,
  RouterLink,
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';

import { PaginationService } from '../../../../../../core/pagination/pagination.service';
import { SearchService } from '../../../../../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { SearchFilterService } from '../../../../../../core/shared/search/search-filter.service';
import { LiveRegionService } from '../../../../../../shared/live-region/live-region.service';
import { currentPath } from '../../../../../utils/route.utils';
import { ShortNumberPipe } from '../../../../../utils/short-number.pipe';
import { FacetValue } from '../../../../models/facet-value.model';
import { SearchFilterConfig } from '../../../../models/search-filter-config.model';
import { getFacetValueForType } from '../../../../search.utils';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { Community } from 'src/app/core/shared/community.model';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { followLink, FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { RemoteData } from 'src/app/core/data/remote-data';

@Component({
  selector: 'ds-search-facet-option',
  styleUrls: ['./search-facet-option.component.scss'],
  templateUrl: './search-facet-option.component.html',
  imports: [
    AsyncPipe,
    RouterLink,
    ShortNumberPipe,
    TranslateModule,
  ],
})

/**
 * Represents a single option in a filter facet
 */
export class SearchFacetOptionComponent implements OnInit {
  /**
   * A single value for this component
   */
  @Input() filterValue: FacetValue;

  /**
   * The filter configuration for this facet option
   */
  @Input() filterConfig: SearchFilterConfig;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * Emits true when this option should be visible and false when it should be invisible
   */
  isVisible: Observable<boolean>;

  /**
   * UI parameters when this filter is added
   */
  addQueryParams$: Observable<Params>;

  /**
   * Link to the search page
   */
  searchLink: string;

  paginationId: string;

  constructor(protected searchService: SearchService,
              protected filterService: SearchFilterService,
              protected searchConfigService: SearchConfigurationService,
              protected router: Router,
              protected paginationService: PaginationService,
              protected liveRegionService: LiveRegionService,
              private translateService: TranslateService,
              private collectionService: CollectionDataService,
  ) {
  }

  /**
   * Initializes all observable instance variables and starts listening to them
   */
  ngOnInit(): void {
    this.paginationId = this.searchConfigService.paginationID;
    this.searchLink = this.getSearchLink();
    this.isVisible = this.isChecked().pipe(map((checked: boolean) => !checked));
    this.addQueryParams$ = this.updateAddParams();
    if (this.filterConfig.name === 'location.coll') {
      this.getCommunityByCollectionUUID(this.filterValue.authorityKey);
      this.addQueryParams$ = this.updateCollectionParams();
    }
  }

  community: Community;
  collectionRD$: Observable<RemoteData<Collection>>;
  collinksToFollow: FollowLinkConfig<Collection>[] = [
    followLink('parentCommunity'),
  ];

  getCommunityByCollectionUUID(collectionUUID: string): void {
    this.collectionRD$ = this.collectionService.findById(
      collectionUUID,
      true,
      true,
      ...this.collinksToFollow,
      );
    this.collectionRD$.pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((collection: Collection) => {
        return collection.parentCommunity.pipe(
          getFirstSucceededRemoteDataPayload()
        );
      }),
      take(1)
    )
    .subscribe((community: Community) => {
      this.community = community;
    }, (error) => {
      console.error('Error al obtener la comunidad:', error);
    });
  }

  /**
   * Checks if a value for this filter is currently active
   */
  isChecked(): Observable<boolean> {
    return this.filterService.isFilterActiveWithValue(this.filterConfig.paramName, this.getFacetValue());
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * Calculates the parameters that should change if this {@link filterValue} would be added to the active filters
   */
  updateAddParams(): Observable<Params> {
    return this.searchConfigService.selectNewAppliedFilterParams(this.filterConfig.name, this.getFacetValue());
  }

  updateCollectionParams(): Observable<Params> {
    return this.addQueryParams$.pipe(
        map((params: Params) => {
          const newParams = {...params};
          delete newParams[`f.${this.filterConfig.name}`];
          newParams['scope'] = this.filterValue.authorityKey;
          return newParams;
        })
      );
  }

  /**
   * Retrieve facet value related to facet type
   */
  getFacetValue(): string {
    return getFacetValueForType(this.filterValue, this.filterConfig);
  }

  /**
   * Announces to the screen reader that the page will be reloaded, which filter has been selected
   */
  announceFilter() {
    const message = this.translateService.instant('search-facet-option.update.announcement', { filter: this.filterValue.value });
    this.liveRegionService.addMessage(message);
  }
}

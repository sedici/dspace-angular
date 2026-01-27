import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
} from 'rxjs';
import {
  map,
  scan,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../../core/data/collection-data.service';
import { FindListOptions } from '../../../core/data/find-list-options.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { Collection } from '../../../core/shared/collection.model';
import { Item } from '../../../core/shared/item.model';
import {
  getAllCompletedRemoteData,
  getAllSucceededRemoteDataPayload,
  getFirstSucceededRemoteDataPayload,
  getPaginatedListPayload,
} from '../../../core/shared/operators';
import { hasValue } from '../../../shared/empty.util';
import { MetadataFieldWrapperComponent } from '../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { FollowLinkConfig, followLink } from 'src/app/shared/utils/follow-link-config.model';
import { Community } from 'src/app/core/shared/community.model';

/**
 * This component renders the parent collections section of the item
 * inside a 'ds-metadata-field-wrapper' component.
 */

@Component({
  selector: 'ds-item-page-collections',
  styleUrls: ['./collections.component.scss'],
  templateUrl: './collections.component.html',
  imports: [
    AsyncPipe,
    MetadataFieldWrapperComponent,
    RouterLink,
    TranslateModule,
  ],
})
export class CollectionsComponent implements OnInit {

  @Input() item: Item;

  label = 'item.page.collections';

  @Input() separator = '<br/>';

  /**
   * Amount of mapped collections that should be fetched at once.
   */
  pageSize = 5;

  /**
   * Last page of the mapped collections that has been fetched.
   */
  lastPage$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Push an event to this observable to fetch the next page of mapped collections.
   * Because this observable is a behavior subject, the first page will be requested
   * immediately after subscription.
   */
  loadMore$: BehaviorSubject<void> = new BehaviorSubject(undefined);

  /**
   * Whether or not a page of mapped collections is currently being loaded.
   */
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * Whether or not more pages of mapped collections are available.
   */
  hasMore$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * All collections that have been retrieved so far. This includes the owning collection,
   * as well as any number of pages of mapped collections.
   */
  collections$: Observable<Collection[]>;
  collections: { collection: Collection, parentCommunity: Community }[] = [];

  constructor(
    private cds: CollectionDataService,
    public dsoNameService: DSONameService,
    protected cdr: ChangeDetectorRef,
    protected collectionService: CollectionDataService,
  ) {
  }

  collinksToFollow: FollowLinkConfig<Collection>[] = [
    followLink('parentCommunity'),
  ];

  ngOnInit(): void {
    const owningCollection$: Observable<Collection> = this.cds.findOwningCollectionFor(this.item).pipe(
      getFirstSucceededRemoteDataPayload(),
      startWith(null as Collection),
    );

    const mappedCollections$: Observable<Collection[]> = this.loadMore$.pipe(
      // update isLoading$
      tap(() => this.isLoading$.next(true)),

      // request next batch of mapped collections
      withLatestFrom(this.lastPage$),
      switchMap(([_, lastPage]: [void, number]) => {
        return this.cds.findMappedCollectionsFor(this.item, Object.assign(new FindListOptions(), {
          elementsPerPage: this.pageSize,
          currentPage: lastPage + 1,
        }));
      }),

      getAllCompletedRemoteData<PaginatedList<Collection>>(),

      // update isLoading$
      tap(() => this.isLoading$.next(false)),

      getAllSucceededRemoteDataPayload(),

      // update hasMore$
      tap((response: PaginatedList<Collection>) => this.hasMore$.next(response.currentPage < response.totalPages)),

      // update lastPage$
      tap((response: PaginatedList<Collection>) => this.lastPage$.next(response.currentPage)),

      getPaginatedListPayload<Collection>(),

      // add current batch to list of collections
      scan((prev: Collection[], current: Collection[]) => [...prev, ...current], []),

      startWith([]),
    ) as Observable<Collection[]>;

    this.collections$ = combineLatest([owningCollection$, mappedCollections$]).pipe(
      map(([owningCollection, mappedCollections]: [Collection, Collection[]]) => {
        return [owningCollection, ...mappedCollections].filter(collection => hasValue(collection));
      }),
    );
    this.cdr.detectChanges();

    this.collections$.subscribe((collections: Collection[]) => {
      this.collections = [];
      if (collections.length > 0) {
        for (const collection of collections) {
          if (this.collections.find(c => c.collection.id === collection.id)) {
            continue;
          }
          if (!hasValue(collection.parentCommunity)) {
            let fullCollection = this.collectionService.findById(
              collection.id,
              true,
              false,
              ...this.collinksToFollow,
            );
            fullCollection.pipe(
              getFirstSucceededRemoteDataPayload(),
              take(1),
            ).subscribe((collectionWithLink: Collection) => {
              if (hasValue(collectionWithLink.parentCommunity)) {
                collectionWithLink.parentCommunity.pipe(
                  getFirstSucceededRemoteDataPayload(),
                  take(1),
                ).subscribe((parentCommunity: Community) => {
                  if (!this.collections.find(c => c.collection.id === collectionWithLink.id)) {
                    this.collections.push({ collection: collectionWithLink, parentCommunity: parentCommunity });
                    this.cdr.detectChanges();
                  }
                });
              }
            });
          }
        }
      }
    });
  }

  handleLoadMore() {
    this.loadMore$.next();
  }

}

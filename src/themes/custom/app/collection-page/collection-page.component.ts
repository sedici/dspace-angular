import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
} from '@angular/router'
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  filter,
  map,
  take,
  switchMap
} from 'rxjs/operators';

import { CollectionPageComponent as BaseComponent } from '../../../../app/collection-page/collection-page.component';
import {
  fadeIn,
  fadeInOut,
} from '../../../../app/shared/animations/fade';
import { ThemedComcolPageBrowseByComponent } from '../../../../app/shared/comcol/comcol-page-browse-by/themed-comcol-page-browse-by.component';
import { ThemedComcolPageContentComponent } from '../../../../app/shared/comcol/comcol-page-content/themed-comcol-page-content.component';
import { ThemedComcolPageHandleComponent } from '../../../../app/shared/comcol/comcol-page-handle/themed-comcol-page-handle.component';
import { ComcolPageHeaderComponent } from '../../../../app/shared/comcol/comcol-page-header/comcol-page-header.component';
import { ComcolPageLogoComponent } from '../../../../app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { DsoEditMenuComponent } from '../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ErrorComponent } from '../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../app/shared/utils/var.directive';
import { ViewTrackerResolverService } from 'src/app/statistics/angulartics/dspace/view-tracker-resolver.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Collection } from 'src/app/core/shared/collection.model';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { redirectOn4xx } from 'src/app/core/shared/authorized.operators';
import { getAllSucceededRemoteDataPayload, getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { getCollectionPageRoute } from 'src/app/collection-page/collection-page-routing-paths';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { Community } from 'src/app/core/shared/community.model';
import { followLink, FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';

@Component({
  selector: 'ds-themed-collection-page',
  templateUrl: './collection-page.component.html',
  // templateUrl: '../../../../app/collection-page/collection-page.component.html',
  styleUrls: ['./collection-page.component.scss'],
  // styleUrls: ['../../../../app/collection-page/collection-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeIn,
    fadeInOut,
  ],
  imports: [
    AsyncPipe,
    ComcolPageHeaderComponent,
    ComcolPageLogoComponent,
    DsoEditMenuComponent,
    ErrorComponent,
    RouterOutlet,
    ThemedComcolPageBrowseByComponent,
    ThemedComcolPageContentComponent,
    ThemedComcolPageHandleComponent,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
  ],
})
/**
 * This component represents a detail page for a single collection
 */
export class CollectionPageComponent extends BaseComponent implements OnInit {
  collectionRD$: Observable<RemoteData<Collection>>;
  logoRD$: Observable<RemoteData<Bitstream>>;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;

  /**
   * Whether the current user is a Community admin
   */
  isCollectionAdmin$: Observable<boolean>;

  /**
   * Route to the community page
   */
  collectionPageRoute$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
    public authorizationDataService: AuthorizationDataService,
    public dsoNameService: DSONameService,
    private communityService: CommunityDataService,
    private collectionService: CollectionDataService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(route, router, authService, authorizationDataService, dsoNameService);
  }

  collinksToFollow: FollowLinkConfig<Collection>[] = [
    followLink('logo'),
    followLink('parentCommunity'),
  ];
  comlinksToFollow: FollowLinkConfig<Community>[] = [
    followLink('logo'),
    followLink('parentCommunity'),
  ];

  ngOnInit(): void {
    this.collectionRD$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Collection>),
      redirectOn4xx(this.router, this.authService),
    );

    this.collectionPageRoute$ = this.collectionRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((collection) => getCollectionPageRoute(collection.id)),
    );

    this.logoRD$ = this.collectionRD$.pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((collection: Collection) => this.getRecursiveLogoFromCollection(collection))
    );

    this.isCollectionAdmin$ = this.authorizationDataService.isAuthorized(FeatureID.IsCollectionAdmin);
  }

  private getRecursiveLogoFromCollection(collection: Collection): Observable<RemoteData<Bitstream>> {
    return this.collectionService.findById(
      collection.id,
      true,
      false,
      ...this.collinksToFollow
    ).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((fullCollection: Collection) => fullCollection.logo.pipe(
        filter((logoRD: RemoteData<Bitstream>) => 
          logoRD.state !== 'RequestPending' && logoRD.state !== 'ResponsePending'
        ),
        take(1),
        switchMap((logoRD: RemoteData<Bitstream>) => {
          if (logoRD.hasSucceeded && logoRD.payload) {
            return of(logoRD);
          } else {
            return fullCollection.parentCommunity.pipe(
              getFirstSucceededRemoteDataPayload(),
              take(1),
              switchMap((parentCommunity: Community) => {
                if (parentCommunity) {
                  return this.getRecursiveLogoFromCommunity(parentCommunity);
                } else {
                  return of(null);
                }
              })
            );
          }
        })
      ))
    );
  }

  private getRecursiveLogoFromCommunity(community: Community): Observable<RemoteData<Bitstream>> {
    return this.communityService.findById(
      community.id,
      true,
      false,
      ...this.comlinksToFollow
    ).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((fullCommunity: Community) => fullCommunity.logo.pipe(
        filter((logoRD: RemoteData<Bitstream>) => 
          logoRD.state !== 'RequestPending' && logoRD.state !== 'ResponsePending'
        ),
        take(1),
        switchMap((logoRD: RemoteData<Bitstream>) => {
          if (logoRD.hasSucceeded && logoRD.payload) {
            return of(logoRD);
          } else {
            return fullCommunity.parentCommunity.pipe(
              getFirstSucceededRemoteDataPayload(),
              take(1),
              switchMap((parentCommunity: Community) => {
                if (parentCommunity) {
                  return this.getRecursiveLogoFromCommunity(parentCommunity);
                } else {
                  return of(null);
                }
              })
            );
          }
        })
      ))
    );
  }
}

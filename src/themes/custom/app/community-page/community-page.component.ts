import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  take,
  switchMap
} from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth/auth.service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { RemoteData } from 'src/app/core/data/remote-data';
import { redirectOn4xx } from 'src/app/core/shared/authorized.operators';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { Community } from 'src/app/core/shared/community.model';
import { getAllSucceededRemoteDataPayload } from 'src/app/core/shared/operators';

import { CommunityPageComponent as BaseComponent } from '../../../../app/community-page/community-page.component';
import { ThemedCollectionPageSubCollectionListComponent } from '../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/themed-community-page-sub-collection-list.component';
import { ThemedCommunityPageSubCommunityListComponent } from '../../../../app/community-page/sections/sub-com-col-section/sub-community-list/themed-community-page-sub-community-list.component';
import { fadeInOut } from '../../../../app/shared/animations/fade';
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
import { getCommunityPageRoute } from 'src/app/community-page/community-page-routing-paths';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { followLink, FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { CommunityDataService } from 'src/app/core/data/community-data.service';

@Component({
  selector: 'ds-themed-community-page',
  templateUrl: './community-page.component.html',
  // templateUrl: '../../../../app/community-page/community-page.component.html',
  styleUrls: ['./community-page.component.scss'],
  // styleUrls: ['../../../../app/community-page/community-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  standalone: true,
  imports: [
    ThemedComcolPageContentComponent,
    ErrorComponent,
    ThemedLoadingComponent,
    NgIf,
    TranslateModule,
    ThemedCommunityPageSubCommunityListComponent,
    ThemedCollectionPageSubCollectionListComponent,
    ThemedComcolPageBrowseByComponent,
    DsoEditMenuComponent,
    ThemedComcolPageHandleComponent,
    ComcolPageLogoComponent,
    ComcolPageHeaderComponent,
    AsyncPipe,
    VarDirective,
    RouterOutlet,
    RouterModule,
  ],
})
/**
 * This component represents a detail page for a single community
 */
export class CommunityPageComponent extends BaseComponent {
  /**
   * The community displayed on this page
   */
  communityRD$: Observable<RemoteData<Community>>;

  /**
   * Whether the current user is a Community admin
   */
  isCommunityAdmin$: Observable<boolean>;

  /**
   * The logo of this community
   */
  logoRD$: Observable<RemoteData<Bitstream>>;

  /**
   * Route to the community page
   */
  communityPageRoute$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
    public authorizationDataService: AuthorizationDataService,
    public dsoNameService: DSONameService,
    private communityService: CommunityDataService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(route, router, authService, authorizationDataService, dsoNameService);
  }

  logo;
  comlinksToFollow: FollowLinkConfig<Community>[] = [
    followLink('logo'),
    followLink('parentCommunity'),
  ];

  ngOnInit(): void {
    this.communityRD$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Community>),
      redirectOn4xx(this.router, this.authService),
    );

    this.communityPageRoute$ = this.communityRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((community) => getCommunityPageRoute(community.id)),
    );

    this.findLogoRecursively();

    this.isCommunityAdmin$ = this.authorizationDataService.isAuthorized(FeatureID.IsCommunityAdmin);
  }

  private findLogoRecursively(): void {
    this.communityRD$.pipe(
      getFirstSucceededRemoteDataPayload(),
      take(1)
    ).subscribe((community: Community) => {
      this.checkCommunityLogo(community);
    });
  }

  private checkCommunityLogo(community: Community): void {
    let fullCommunityRef: Community;

    this.communityService.findById(
      community.id,
      true,
      false,
      ...this.comlinksToFollow,
    ).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((fullCommunity: Community) => {
        fullCommunityRef = fullCommunity;
        return fullCommunity.logo;
      }),
      filter((logoRD: RemoteData<Bitstream>) => 
        logoRD.state !== 'RequestPending' && logoRD.state !== 'ResponsePending'
      ),
      take(1)
    ).subscribe((logoRD: RemoteData<Bitstream>) => {
      if (logoRD.hasSucceeded && logoRD.payload) {
        this.logo = logoRD;
        this.changeDetectorRef.detectChanges();
      } else {
        fullCommunityRef.parentCommunity.pipe(
          getFirstSucceededRemoteDataPayload(),
          take(1)
        ).subscribe((parentCommunity: Community) => {
          if (parentCommunity) {
            this.checkCommunityLogo(parentCommunity); // Recursión
          } else {
            this.logo = null;
            this.changeDetectorRef.detectChanges();
          }
        }, (error) => {
          this.logo = null;
          this.changeDetectorRef.detectChanges();
        });
      }
    });
  }
}
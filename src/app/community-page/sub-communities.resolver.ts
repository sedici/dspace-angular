import { inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommunityDataService } from '../core/data/community-data.service';
import { RemoteData } from '../core/data/remote-data';
import { PaginatedList } from '../core/data/paginated-list.model';
import { Community } from '../core/shared/community.model';
import { getFirstCompletedRemoteData } from '../core/shared/operators';

/**
 * Resolver to ensure sub-communities are loaded before the route is activated.
 * This prevents flickering on the sub-communities tab.
 */
export const subCommunitiesResolver: ResolveFn<RemoteData<PaginatedList<Community>>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  communityService: CommunityDataService = inject(CommunityDataService),
  platformId: Object = inject(PLATFORM_ID),
): Observable<RemoteData<PaginatedList<Community>>> => {
  const communityId = route.parent?.params.id;
  const isServer = isPlatformServer(platformId);

  console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] SubCommunitiesResolver: Resolving for ${communityId}`);

  const data = communityService.findByParent(communityId).pipe(
    getFirstCompletedRemoteData(),
    tap((rd) => {
      console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] SubCommunitiesResolver: Resolved ${rd?.payload?.page?.length || 0} communities. Success? ${rd.hasSucceeded}`);
    })
  );
  return data;
};

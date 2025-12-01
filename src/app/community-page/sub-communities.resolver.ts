import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CommunityDataService } from '../core/data/community-data.service';
import { RemoteData } from '../core/data/remote-data';
import { PaginatedList } from '../core/data/paginated-list.model';
import { Community } from '../core/shared/community.model';
import { getFirstCompletedRemoteData } from '../core/shared/operators';

/**
 * Resolver to ensure sub-communities are loaded before the route is activated.
 * This prevents flickering on the sub-communities tab.
 */
export const subCommunitiesResolver: ResolveFn<
  RemoteData<PaginatedList<Community>>
> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  communityService: CommunityDataService = inject(CommunityDataService)
): Observable<RemoteData<PaginatedList<Community>>> => {
  const communityId = route.parent?.params.id;
  return communityService
    .findByParent(communityId, { elementsPerPage: 100 })
    .pipe(getFirstCompletedRemoteData());
};

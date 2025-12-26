import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { RemoteData } from '../data/remote-data';
import { PaginatedList } from '../data/paginated-list.model';
import { BrowseDefinition } from '../shared/browse-definition.model';
import { BrowseService } from './browse.service';
import { getFirstCompletedRemoteData } from '../shared/operators';

/**
 * Resolver to ensure browse definitions are loaded before the route is activated.
 * This helps prevent flickering/double-rendering issues caused by hydration mismatches.
 */
export const browseDefinitionsResolver: ResolveFn<RemoteData<PaginatedList<BrowseDefinition>>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  browseService: BrowseService = inject(BrowseService),
): Observable<RemoteData<PaginatedList<BrowseDefinition>>> => {
  return browseService.getBrowseDefinitions().pipe(
    getFirstCompletedRemoteData(),
  );
};

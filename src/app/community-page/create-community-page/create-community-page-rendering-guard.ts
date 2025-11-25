import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrowseService } from 'src/app/core/browse/browse.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { BrowseDefinition } from 'src/app/core/shared/browse-definition.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { hasValue } from 'src/app/shared/empty.util';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { getCollectionPageRoute } from 'src/app/collection-page/collection-page-routing-paths';
import { getCommunityPageRoute } from 'src/app/community-page/community-page-routing-paths';

/**
 * A guard that checks for available browse-by definitions for a DSpace Object.
 * If the current URL is the base URL (e.g., /collections/uuid) and browse definitions exist,
 * it redirects to the default browse tab configured in appConfig.
 * If the URL already contains a browse tab (e.g., /collections/uuid/browse/author),
 * it allows access to the current route.
 */
export const defaultBrowseTabGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {

  const browseService: BrowseService = inject(BrowseService);
  const router: Router = inject(Router);
  const appConfig: AppConfig = inject(APP_CONFIG);

  const routeId = route.params['id'];

  // Determinar el tipo de contenido basado en el tipo del DSO
  const comColType: string = route.data['menuRoute']?.toString().toLowerCase().includes('community') ? 'community' : 'collection';

  // Obtener la ruta base según el tipo de contenido
  const comColRoute: string = comColType === 'collection' 
    ? getCollectionPageRoute(routeId)
    : getCommunityPageRoute(routeId);

  // Verificar si ya estamos en una sub-ruta (browse, search, subcoms-cols, etc.)
  const isInSubRoute = state.url.split('?')[0] !== comColRoute;
  
  // Si ya estamos en una sub-ruta, permitir el acceso
  if (isInSubRoute) {
    return of(true);
  }

  // Estamos en la URL base, necesitamos redirigir al tab por defecto
  const defaultTab = appConfig[comColType]?.defaultBrowseTab;

  // Si el tab por defecto es 'search' o 'comcols', redirigir directamente
  if (defaultTab === 'search') {
    return of(router.createUrlTree([`${comColRoute}/search`]));
  }
  
  if (defaultTab === 'comcols' && comColType === 'community') {
    return of(router.createUrlTree([`${comColRoute}/subcoms-cols`]));
  }

  // Si el tab por defecto es un browse-by, verificar que exista
  return browseService.getBrowseDefinitions().pipe(
    getFirstCompletedRemoteData(),
    map((browseDefsRD: RemoteData<PaginatedList<BrowseDefinition>>) => {
      if (browseDefsRD.hasSucceeded && browseDefsRD.payload?.page?.length > 0) {
        // Buscar la definición que coincida con el defaultTab
        const defaultBrowseDef = browseDefsRD.payload.page.find(def => def.id === defaultTab);
        
        if (defaultBrowseDef) {
          // Redirigir al browse tab por defecto
          return router.createUrlTree([`${comColRoute}/browse/${defaultTab}`]);
        } else {
          // Si no existe el tab configurado, redirigir al primero disponible
          const firstBrowseId = browseDefsRD.payload.page[0].id;
          return router.createUrlTree([`${comColRoute}/browse/${firstBrowseId}`]);
        }
      } else {
        // No hay definiciones de browse-by, redirigir a search
        return router.createUrlTree([`${comColRoute}/search`]);
      }
    })
  );
};
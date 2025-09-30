/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { Injectable } from '@angular/core';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { getDSORoute } from '../../../app-routing-paths';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { URLCombiner } from '../../../core/url-combiner/url-combiner';
import { LinkMenuItemModel } from '../menu-item/models/link.model';
import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { DSpaceObjectPageMenuProvider } from './helper-providers/dso.menu';
import { RoleService } from '../../../core/roles/role.service';

/**
 * Menu provider to create the "Edit" option in the DSO edit menu
 */
@Injectable()
export class DSpaceObjectPrintCertificateMenuProvider extends DSpaceObjectPageMenuProvider {
  constructor(
    protected authorizationDataService: AuthorizationDataService,
    protected roleService: RoleService,
  ) {
    super();
  }

  public getSectionsForContext(dso: DSpaceObject): Observable<PartialMenuSection[]> {
    return combineLatest([
      this.authorizationDataService.isAuthorized(FeatureID.CanEditMetadata, dso.self),
      this.roleService.isSubmitterOfItem(dso),
    ]).pipe(
      map(([canEditItem, isSubmitter]) => {
        return [
          {
            visible: canEditItem || isSubmitter, // Show if user can edit OR is submitter
            model: {
              type: MenuItemType.LINK,
              text: this.getDsoType(dso) + '.page.print',
              link: new URLCombiner(getDSORoute(dso), 'print').toString(),
            } as LinkMenuItemModel,
            icon: 'print',
          },
        ] as PartialMenuSection[];
      }),
    );
  }
}

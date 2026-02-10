/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { Injectable } from '@angular/core';
import {
  Observable,
  of,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractMenuProvider,
  PartialMenuSection,
} from '../menu-provider.model';

/**
 * Menu provider to create the "Communities & Collections" menu section in the public navbar
 * SEDICI: Only visible to authenticated users
 */
@Injectable()
export class CommunityListMenuProvider extends AbstractMenuProvider {
  constructor(private authService: AuthService) {
    super();
  }

  public getSections(): Observable<PartialMenuSection[]> {
    return this.authService.isAuthenticated().pipe(
      map((isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          return [];
        }
        return [
          {
            visible: true,
            model: {
              type: MenuItemType.LINK,
              // text: `menu.section.browse_global_communities_and_collections`,
              text: `home.page.explore`,
              link: `/community-list`,
            },
            icon: 'diagram-project',
          },
        ] as PartialMenuSection[];
      }),
    );
  }
}

import { Injectable } from '@angular/core';
import {
  Observable,
  of,
  combineLatest
} from 'rxjs';
import { distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';

import { CollectionDataService } from '../data/collection-data.service';
import { RoleType } from './role-types';
import { ItemDataService } from '../data/item-data.service';
import { EPerson } from '../eperson/models/eperson.model';
import { AuthService } from '../auth/auth.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { Item } from '../shared/item.model';
import { itemLinksToFollow } from 'src/app/shared/utils/relation-query.utils';
import { LinkService } from '../cache/builders/link.service';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { DSpaceObject } from '../shared/dspace-object.model';
import { HttpClient } from '@angular/common/http';


/**
 * A service that provides methods to identify user role.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {

  /**
   * Initialize instance variables
   *
   * @param {CollectionDataService} collectionService
   */
  constructor(
    private collectionService: CollectionDataService,
    private itemDataService: ItemDataService,
    private auth: AuthService,
    private linkService: LinkService,
    private http: HttpClient,
  ) {
  }

  /**
   * Check if current user is a submitter
   */
  isSubmitter(): Observable<boolean> {
    return this.collectionService.hasAuthorizedCollection().pipe(
      distinctUntilChanged(),
    );
  }

  /**
   * Retrieve the current user
   */
  private getCurrentUser(): Observable<EPerson> {
    return this.auth.isAuthenticated().pipe(
      switchMap((authenticated) => {
        if (authenticated) {
          return this.auth.getAuthenticatedUserFromStore();
        } else {
          return of(undefined);
        }
      }),
    );

  }


  isSubmitterOfItem(dso: DSpaceObject): Observable<boolean> {
    return combineLatest([
      this.itemDataService.findById(dso.id),
      this.getCurrentUser()
    ]).pipe(
      switchMap(([itemRD, currentUser]) => {
        if (!currentUser || !itemRD.hasSucceeded) {
          return of(false);
        }

        // Get the item information
        const item = itemRD.payload;
        // The submitter is not a followLink for Item, so we get it manually
        const submitter_link = item._links.submitter;

        if (submitter_link?.href) {
          // Call to the submitter link to get the EPerson
          return this.http.get<EPerson>(submitter_link.href).pipe(
            map(submitter => {
              
              const isSubmitter = submitter.uuid === currentUser.uuid;
              
              return isSubmitter;
            }),
            catchError(error => {
              return of(false);
            })
          );
        }
        return of(false);
      })
    );
  }


  /**
   * Check if current user is a controller
   */
  isController(): Observable<boolean> {
    // TODO find a way to check if user is a controller
    return of(true);
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): Observable<boolean> {
    // TODO find a way to check if user is an admin
    return of(false);
  }

  /**
   * Check if current user by role type
   *
   * @param {RoleType} role
   *    the role type
   */
  checkRole(role: RoleType): Observable<boolean> {
    let check: Observable<boolean>;
    switch (role) {
      case RoleType.Submitter:
        check = this.isSubmitter();
        break;
      case RoleType.Controller:
        check = this.isController();
        break;
      case RoleType.Admin:
        check = this.isAdmin();
        break;
    }

    return check;
  }
}

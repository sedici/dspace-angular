import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  map,
  Observable,
  of,
  switchMap,
  take,
  filter,
} from 'rxjs';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractMenuProvider,
  PartialMenuSection,
} from '../menu-provider.model';
import { CommunityDataService } from '../../../core/data/community-data.service';

@Injectable()
export class NewItemMenuProvider extends AbstractMenuProvider {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected modalService: NgbModal,
    protected communityDataService: CommunityDataService,
  ) {
    super();
  }

  // TODO: buscar una alternativa menos problemática para dado un handle obtener su uuid
  private getCollectionUuidByHandle(handle: string): Observable<string | undefined> {
    return this.communityDataService.findTop({ elementsPerPage: 15 }).pipe(
      filter((rd: any) => !!rd && rd.hasSucceeded),
      take(1),
      map((rd: any) => {
        const list = rd.payload?.page ?? [];
        return list.find((c: any) => {
          const uri = c?.metadata?.['dc.identifier.uri']?.[0]?.value;
          const communityHandle = this.parseHandleFromHref(uri); 
          return communityHandle === '10915/1';
        }) ?? null;
      }),
      switchMap((parent: any) => {
        if (!parent) {
          return of(null);
        }
        const parentUUID = parent?.uuid ?? parent?.id ?? null;
        if (!parentUUID) {
          return of(null);
        }

        return this.communityDataService.getEndpoint().pipe(
          take(1),
          map((endpoint: string) => `${endpoint}/${parentUUID}/collections`),
          switchMap((href: string) => this.communityDataService.findListByHref(href, { elementsPerPage: 500 }, true, true)),
          filter((rd: any) => !!rd && rd.hasSucceeded),
          take(1),
          map((rd: any) => {
            const collectionsList = rd.payload?._embedded?.collections ?? rd.payload?.page ?? [];
            return collectionsList.find((collection: any) => {
              const uri = collection?.metadata?.['dc.identifier.uri']?.[0]?.value;
              const collectionHandle = this.parseHandleFromHref(uri);
              return collectionHandle === handle;
            }) ?? null;
          })
        );
      }),
      map((foundCollection: any) => {
        return foundCollection?.uuid ?? foundCollection?.id ?? undefined;
      })
    );
  }

  private parseHandleFromHref(href: string): string | null {
    const m = href?.match(/\/handle\/([^\/]+\/[^\/\?]+)/);
    return m ? m[1] : null;
  }

  public getSections(): Observable<PartialMenuSection[]> {
    const collectionHandle = '10915/50';

    return this.getCollectionUuidByHandle(collectionHandle).pipe(
      take(1),
      map((collectionUuid: string | undefined) => {
        return [
          {
            visible: !!collectionUuid,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.new_item_sedici',
              link: '/submit',
              queryParams: {
                collection: collectionUuid
              },
            },
          },
        ] as PartialMenuSection[];
      })
    );
  }
}

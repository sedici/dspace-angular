import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  of as observableOf,
} from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Item } from 'src/app/core/shared/item.model';
import { ITEM } from 'src/app/core/shared/item.resource-type';
import { hasValue } from 'src/app/shared/empty.util';
import { AccessStatusObject } from 'src/app/shared/object-collection/shared/badges/access-status-badge/access-status.model';
import { AccessStatusBadgeComponent as BaseComponent } from 'src/app/shared/object-collection/shared/badges/access-status-badge/access-status-badge.component';
import { RemoteData } from 'src/app/core/data/remote-data';

@Component({
  selector: 'ds-themed-access-status-badge',
  // styleUrls: ['./access-status-badge.component.scss'],
  // templateUrl: './access-status-badge.component.html',
  templateUrl: '../../../../../../../../app/shared/object-collection/shared/badges/access-status-badge/access-status-badge.component.html',
  standalone: true,
  imports: [NgIf, AsyncPipe, TranslateModule],
})
export class AccessStatusBadgeComponent extends BaseComponent {
  
  ngOnInit(): void {
    this.showAccessStatus = environment.item.showAccessStatuses;
    if (this.object.type.toString() !== ITEM.value || !this.showAccessStatus || this.object == null) {
      // Do not show the badge if the feature is inactive or if the item is null.
      return;
    }

    const item = this.object as Item;
    let accessStatus$;

    if (item.accessStatus == null) {
      // In case the access status has not been loaded, do it individually.
      accessStatus$ = this.accessStatusDataService.findAccessStatusFor(item);
    } else {
      accessStatus$ = item.accessStatus;
    }

    this.accessStatus$ = accessStatus$.pipe(
      map((accessStatusRD: RemoteData<AccessStatusObject>) => {
        if (accessStatusRD.statusCode !== 401 && hasValue(accessStatusRD.payload)) {
          return accessStatusRD.payload;
        } else {
          return [];
        }
      }),
      map((accessStatus: AccessStatusObject) => hasValue(accessStatus.status) ? accessStatus.status : 'unknown'),
      map((status: string) => `access-status.${status.toLowerCase()}.listelement.badge`),
      catchError(() => observableOf('access-status.unknown.listelement.badge')),
    );

    // stylesheet based on the access status value
    this.subs.push(
      this.accessStatus$.pipe(
        map((accessStatusClass: string) => accessStatusClass.replace(/\./g, '-')),
      ).subscribe((accessStatusClass: string) => {
        this.accessStatusClass = accessStatusClass;
      }),
    );
  }
}
